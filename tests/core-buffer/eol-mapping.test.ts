// tests/core-buffer/eol-mapping.test.ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type {
  Eol,
  TextBuffer,
  TextBufferErrorCode,
} from '../../src/core-buffer/text-buffer.ts';
import {
  TextBufferError,
  decodeBuffer,
  dominantEol,
  encodeBuffer,
  patchBuffer,
} from '../../src/core-buffer/text-buffer.ts';

const enc = new TextEncoder();
const bytes = (s: string): Uint8Array => enc.encode(s);
const BOM = Uint8Array.of(0xef, 0xbb, 0xbf);

const concat = (...parts: Uint8Array[]): Uint8Array => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
};

const codeOf = (fn: () => unknown): TextBufferErrorCode | 'NO_THROW' => {
  try {
    fn();
  } catch (e) {
    if (e instanceof TextBufferError) return e.code;
    throw e;
  }
  return 'NO_THROW';
};

const roundTrip = (input: Uint8Array): Uint8Array => {
  const buf: TextBuffer = decodeBuffer(input);
  return encodeBuffer(buf);
};

// Índice del primer byte de la línea n (0-based) en un archivo LF puro, calculado aparte del buffer.
const lfLineStart = (data: Uint8Array, n: number): number => {
  let seen = 0;
  for (let i = 0; i < data.length; i++) {
    if (seen === n) return i;
    if (data[i] === 0x0a) seen++;
  }
  return seen === n ? data.length : -1;
};

describe('TextBuffer: EOL por línea, BOM y UTF-8', () => {
  it('CRLF puro: ida y vuelta byte a byte y líneas sin terminador', () => {
    const input = bytes('a\r\nb\r\nc\r\n');
    const buf = decodeBuffer(input);
    expect(buf.lines).toEqual(['a', 'b', 'c']);
    expect(buf.eols).toEqual(['\r\n', '\r\n', '\r\n']);
    expect(roundTrip(input)).toEqual(input);
  });

  it('LF puro: ida y vuelta y parche que conserva LF', () => {
    const input = bytes('a\nb\nc\n');
    const buf = decodeBuffer(input);
    expect(buf.lines).toEqual(['a', 'b', 'c']);
    expect(roundTrip(input)).toEqual(input);
    expect(encodeBuffer(patchBuffer(buf, 1, 2, ['B']))).toEqual(bytes('a\nB\nc\n'));
  });

  it('mixto CRLF/LF/CR: cada línea conserva su propio terminador', () => {
    const input = bytes('a\r\nb\nc\rd\r\n');
    const buf = decodeBuffer(input);
    expect(buf.lines).toEqual(['a', 'b', 'c', 'd']);
    expect(buf.eols).toEqual(['\r\n', '\n', '\r', '\r\n']);
    expect(roundTrip(input)).toEqual(input);
  });

  it('sin salto final: no se inventa y un parche al final tampoco lo añade', () => {
    const input = bytes('a\nb');
    const buf = decodeBuffer(input);
    expect(buf.lines).toEqual(['a', 'b']);
    expect(buf.eols).toEqual(['\n', '']);
    expect(roundTrip(input)).toEqual(input);
    expect(encodeBuffer(patchBuffer(buf, 1, 2, ['B']))).toEqual(bytes('a\nB'));
    expect(encodeBuffer(patchBuffer(buf, 2, 2, ['c']))).toEqual(bytes('a\nb\nc'));
  });

  it('BOM + CRLF: el BOM se conserva y no aparece en la primera línea', () => {
    const input = concat(BOM, bytes('@startuml\r\nclass A\r\n@enduml\r\n'));
    const buf = decodeBuffer(input);
    expect(buf.bom).toBe(true);
    expect(buf.lines[0]).toBe('@startuml');
    expect(roundTrip(input)).toEqual(input);
    const patched = encodeBuffer(patchBuffer(buf, 1, 2, ['class B']));
    expect(patched).toEqual(concat(BOM, bytes('@startuml\r\nclass B\r\n@enduml\r\n')));
  });

  it('inserción en medio de un mixto: los vecinos no cambian y lo nuevo usa el dominante', () => {
    const input = bytes('a\r\nb\nc\r\nd\re\r\n');
    const buf = decodeBuffer(input);
    const patched = encodeBuffer(patchBuffer(buf, 2, 2, ['x', 'y']));
    expect(patched).toEqual(bytes('a\r\nb\nx\r\ny\r\nc\r\nd\re\r\n'));
  });

  it('desempate del EOL dominante: CRLF > LF > CR, y LF si no hay ninguno', () => {
    const d1: Eol = dominantEol(decodeBuffer(bytes('a\r\nb\nc')));
    expect(d1).toBe('\r\n');
    const d2: Eol = dominantEol(decodeBuffer(bytes('a\nb\rc')));
    expect(d2).toBe('\n');
    const d3: Eol = dominantEol(decodeBuffer(bytes('a\rb\rc\nd')));
    expect(d3).toBe('\r');
    const d4: Eol = dominantEol(decodeBuffer(bytes('a\r\nb\r\nc\nd\ne\nf')));
    expect(d4).toBe('\n');
    const d5: Eol = dominantEol(decodeBuffer(bytes('solo')));
    expect(d5).toBe('\n');
  });

  it('rechaza \\r o \\n dentro de newLines con ERR_EMBEDDED_EOL', () => {
    const buf = decodeBuffer(bytes('a\nb\n'));
    expect(codeOf(() => patchBuffer(buf, 0, 1, ['x\ny']))).toBe('ERR_EMBEDDED_EOL');
    expect(codeOf(() => patchBuffer(buf, 0, 1, ['x\r']))).toBe('ERR_EMBEDDED_EOL');
    expect(codeOf(() => patchBuffer(buf, 0, 1, ['ok', '\r\n']))).toBe('ERR_EMBEDDED_EOL');
  });

  it('rango fuera de límites o invertido con ERR_OUT_OF_RANGE', () => {
    const buf = decodeBuffer(bytes('a\nb\n'));
    expect(codeOf(() => patchBuffer(buf, -1, 1, ['x']))).toBe('ERR_OUT_OF_RANGE');
    expect(codeOf(() => patchBuffer(buf, 0, 3, ['x']))).toBe('ERR_OUT_OF_RANGE');
    expect(codeOf(() => patchBuffer(buf, 2, 1, ['x']))).toBe('ERR_OUT_OF_RANGE');
    expect(codeOf(() => patchBuffer(buf, 0.5, 1, ['x']))).toBe('ERR_OUT_OF_RANGE');
    expect(codeOf(() => patchBuffer(buf, 2, 2, ['x']))).toBe('NO_THROW');
  });

  it('bytes no UTF-8 con ERR_NON_UTF8, también tras un BOM', () => {
    expect(codeOf(() => decodeBuffer(Uint8Array.of(0x61, 0xff, 0x0a)))).toBe('ERR_NON_UTF8');
    expect(codeOf(() => decodeBuffer(concat(BOM, Uint8Array.of(0xc3, 0x28))))).toBe('ERR_NON_UTF8');
  });

  it('real-66.puml: parche de las líneas 7 y 14, byte a byte contra el original', () => {
    const original = new Uint8Array(
      readFileSync(new URL('../fixtures/puml/real-66.puml', import.meta.url)),
    );
    expect(original.length).toBe(28671);
    const buf = decodeBuffer(original);
    expect(buf.bom).toBe(false);
    expect(buf.lines.length).toBe(816);
    expect(buf.lines[7]).toBe('  class App {');
    expect(buf.lines[14]).toBe('    «create» -AppScannerCli()');
    expect(roundTrip(original)).toEqual(original);

    const splice = (data: Uint8Array, n: number, text: string): Uint8Array => {
      const start = lfLineStart(data, n);
      const end = lfLineStart(data, n + 1) - 1;
      return concat(data.subarray(0, start), bytes(text), data.subarray(end));
    };

    const p7 = encodeBuffer(patchBuffer(buf, 7, 8, ['  class AppMain {']));
    expect(p7).toEqual(splice(original, 7, '  class AppMain {'));

    const p14 = encodeBuffer(patchBuffer(buf, 14, 15, ['    «create» +AppScannerCli()']));
    expect(p14).toEqual(splice(original, 14, '    «create» +AppScannerCli()'));
    expect(p14.length).toBe(original.length);
  });
});

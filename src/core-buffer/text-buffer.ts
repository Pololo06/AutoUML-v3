// src/core-buffer/text-buffer.ts
export type Eol = '\r\n' | '\n' | '\r' | '';

export type TextBufferErrorCode = 'ERR_NON_UTF8' | 'ERR_EMBEDDED_EOL' | 'ERR_OUT_OF_RANGE';

/** Documento como líneas sin terminador más el terminador original de cada una. Inmutable. */
export type TextBuffer = {
  readonly bom: boolean;
  readonly lines: readonly string[];
  readonly eols: readonly Eol[];
};

export class TextBufferError extends Error {
  readonly code: TextBufferErrorCode;
  constructor(code: TextBufferErrorCode, message: string) {
    super(message);
    this.name = 'TextBufferError';
    this.code = code;
  }
}

const BOM = Uint8Array.of(0xef, 0xbb, 0xbf);

const hasBom = (data: Uint8Array): boolean =>
  data.length >= 3 && data[0] === BOM[0] && data[1] === BOM[1] && data[2] === BOM[2];

/** Decodifica UTF-8 estricto. El BOM se detecta a mano para no depender de TextDecoder. */
export function decodeBuffer(data: Uint8Array): TextBuffer {
  const bom = hasBom(data);
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(
      bom ? data.subarray(3) : data,
    );
  } catch {
    throw new TextBufferError('ERR_NON_UTF8', 'el archivo no es UTF-8 válido');
  }

  const lines: string[] = [];
  const eols: Eol[] = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    if (ch !== 0x0a && ch !== 0x0d) continue;
    const crlf = ch === 0x0d && text.charCodeAt(i + 1) === 0x0a;
    lines.push(text.slice(start, i));
    eols.push(crlf ? '\r\n' : ch === 0x0d ? '\r' : '\n');
    if (crlf) i++;
    start = i + 1;
  }
  // Si el texto acaba en EOL no hay línea vacía final: 816 líneas en real-66, no 817.
  if (start < text.length) {
    lines.push(text.slice(start));
    eols.push('');
  }
  return { bom, lines, eols };
}

export function encodeBuffer(buf: TextBuffer): Uint8Array {
  let text = '';
  for (let i = 0; i < buf.lines.length; i++) {
    const line = buf.lines[i] ?? '';
    const eol = buf.eols[i] ?? '';
    text += line + eol;
  }
  const body = new TextEncoder().encode(text);
  if (!buf.bom) return body;
  const out = new Uint8Array(body.length + 3);
  out.set(BOM, 0);
  out.set(body, 3);
  return out;
}

/** EOL más frecuente; empate CRLF > LF > CR; sin ninguno, LF. */
export function dominantEol(buf: TextBuffer): Exclude<Eol, ''> {
  let crlf = 0;
  let lf = 0;
  let cr = 0;
  for (const e of buf.eols) {
    if (e === '\r\n') crlf++;
    else if (e === '\n') lf++;
    else if (e === '\r') cr++;
  }
  if (crlf >= lf && crlf >= cr && crlf > 0) return '\r\n';
  if (lf >= cr && lf > 0) return '\n';
  if (cr > 0) return '\r';
  return '\n';
}

/**
 * Sustituye las líneas [fromLine, toLine) (0-based) por newLines.
 * Las líneas nuevas usan el EOL dominante; las que no se tocan conservan el suyo.
 * Si el original no tenía salto final, el resultado tampoco lo tiene.
 */
export function patchBuffer(
  buf: TextBuffer,
  fromLine: number,
  toLine: number,
  newLines: readonly string[],
): TextBuffer {
  const n = buf.lines.length;
  if (
    !Number.isInteger(fromLine) ||
    !Number.isInteger(toLine) ||
    fromLine < 0 ||
    toLine < fromLine ||
    toLine > n
  ) {
    throw new TextBufferError('ERR_OUT_OF_RANGE', `rango [${fromLine}, ${toLine}) fuera de 0..${n}`);
  }
  for (const line of newLines) {
    if (line.includes('\n') || line.includes('\r')) {
      throw new TextBufferError('ERR_EMBEDDED_EOL', 'una línea nueva contiene \\r o \\n');
    }
  }

  const eol = dominantEol(buf);
  const openEnd = n > 0 && buf.eols[n - 1] === '';
  const lines = [...buf.lines.slice(0, fromLine), ...newLines, ...buf.lines.slice(toLine)];
  const eols: Eol[] = [
    ...buf.eols.slice(0, fromLine),
    ...newLines.map((): Eol => eol),
    ...buf.eols.slice(toLine),
  ];
  // Solo la última línea puede ir sin terminador: lo que antes era el final y ya no lo es lo recibe.
  const last = eols.length - 1;
  for (let i = 0; i < last; i++) if (eols[i] === '') eols[i] = eol;
  if (last >= 0) {
    const currentLast = eols[last] ?? '';
    eols[last] = openEnd ? '' : currentLast === '' ? eol : currentLast;
  }
  return { bom: buf.bom, lines, eols };
}

#!/usr/bin/env node
// scripts/check-fence.mjs — valla de ESTADO: lo que hoy está mal en el repo, esté o no en el diff.
// Exit 0 limpio · 1 hallazgos · 2 no pudo correr. Umbrales leídos de CONSTRAINTS.md.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const bail = (msg) => { console.error('check-fence: ' + msg); process.exit(2); };

const constraintsPath = join(root, 'CONSTRAINTS.md');
if (!existsSync(constraintsPath)) bail('falta CONSTRAINTS.md');
const constraints = readFileSync(constraintsPath, 'utf8');

const maxLinesMatch = constraints.match(/≤\s*(\d+)\s*líneas por archivo/);
if (!maxLinesMatch) bail('CONSTRAINTS.md no declara "≤ N líneas por archivo"');
const maxLines = Number(maxLinesMatch[1]);

const runtimeMatch = constraints.match(/≤\s*(\d+)\s*dependencias de runtime/);
if (!runtimeMatch) bail('CONSTRAINTS.md no declara "≤ N dependencias de runtime"');
const maxRuntime = Number(runtimeMatch[1]);

const allowedMatch = constraints.match(/^Dependencias permitidas \(dev\):\s*(.+)$/m);
if (!allowedMatch) bail('CONSTRAINTS.md no declara "Dependencias permitidas (dev): ..."');
const allowed = new Set(allowedMatch[1].split(',').map((s) => s.replace(/`/g, '').trim()).filter(Boolean));

// Excepciones vigentes: | ID | Regla | Ruta | Motivo | Responsable | Caduca |
const today = new Date().toISOString().slice(0, 10);
const findings = [];
const flag = (rule, file, text) => findings.push({ rule, file, text: String(text).trim().slice(0, 120) });
const exceptions = [];
for (const line of constraints.split('\n')) {
  const m = line.match(/^\|\s*(E\d+)\s*\|(.*)\|\s*$/);
  if (!m) continue;
  const cells = m[2].split('|').map((c) => c.trim());
  const [rule, path, , , expires] = cells;
  if (!rule || !path || !/^\d{4}-\d{2}-\d{2}$/.test(expires ?? '')) {
    flag('excepcion-invalida', 'CONSTRAINTS.md', line);
    continue;
  }
  if (expires < today) flag('excepcion-caducada', 'CONSTRAINTS.md', line);
  else exceptions.push({ rule, path });
}
const excepted = (rule, file) => exceptions.some((e) => e.rule === rule && e.path === file);

// Patrones por fragmentos: el script está versionado y no debe delatarse a sí mismo.
const ANY = new RegExp('(:\\s*' + 'an' + 'y\\b|\\bas\\s+' + 'an' + 'y\\b|<' + 'an' + 'y>|\\b' + 'an' + 'y\\[\\])');
const SUPPRESS = new RegExp('@ts-' + 'ignore|@ts-' + 'expect-error|@ts-' + 'nocheck');
const FOCUS = new RegExp('\\b(it|test|describe|suite)\\.(' + 'sk' + 'ip|' + 'on' + 'ly|' + 'to' + 'do)\\b|\\bx(it|describe)\\(|\\bf(it|describe)\\(');

const CODE = /\.(ts|mts|cts|js|mjs|cjs)$/;
const SCAN_DIRS = ['src', 'tests', 'scripts'];
const SKIP_DIRS = new Set(['node_modules', 'coverage', 'dist', '.git', 'fixtures']);

const walk = (dir) => {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...walk(join(dir, entry.name)));
    } else if (CODE.test(entry.name)) {
      out.push(join(dir, entry.name));
    }
  }
  return out;
};

const files = [
  ...SCAN_DIRS.flatMap((d) => walk(join(root, d))),
  ...readdirSync(root).filter((f) => CODE.test(f)).map((f) => join(root, f)),
].sort();

for (const abs of files) {
  const file = relative(root, abs).split(sep).join('/');
  const text = readFileSync(abs, 'utf8');
  const lines = text.split('\n');
  const count = text.endsWith('\n') ? lines.length - 1 : lines.length;
  if (count > maxLines && !excepted('tamano', file)) flag('tamano', file, count + ' líneas > ' + maxLines);
  lines.forEach((line, i) => {
    const at = file + ':' + (i + 1);
    if (ANY.test(line) && !excepted('any', file)) flag('any', at, line);
    if (SUPPRESS.test(line) && !excepted('supresion', file)) flag('supresion', at, line);
    if (FOCUS.test(line) && !excepted('skip-only', file)) flag('skip-only', at, line);
  });
}

const pkgPath = join(root, 'package.json');
if (!existsSync(pkgPath)) bail('falta package.json');
let pkg;
try { pkg = JSON.parse(readFileSync(pkgPath, 'utf8')); } catch { bail('package.json no es JSON válido'); }
const runtime = Object.keys({ ...pkg.dependencies, ...pkg.optionalDependencies, ...pkg.peerDependencies });
if (runtime.length > maxRuntime) flag('dependencia-runtime', 'package.json', runtime.join(', '));
for (const dep of Object.keys(pkg.devDependencies ?? {}).sort()) {
  if (!allowed.has(dep)) flag('dependencia-no-permitida', 'package.json', dep);
}

if (findings.length === 0) { console.log('check-fence: limpio (' + files.length + ' archivos)'); process.exit(0); }
console.error('check-fence: ' + findings.length + ' hallazgo(s):');
for (const f of findings) console.error('  [' + f.rule + '] ' + f.file + ': ' + f.text);
process.exit(1);

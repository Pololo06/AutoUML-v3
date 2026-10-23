#!/usr/bin/env node
// floor-guard.mjs — valla del diff: lo que este cambio empeora respecto a la base.
// Uso: node scripts/floor-guard.mjs [--base <ref>]
// Base: --base → origin/main (merge-base) → HEAD → árbol vacío. Exit 0 limpio, 1 hallazgos, 2 no pudo correr.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';

// `git diff --no-index` sale con 1 cuando hay diferencias: es el caso normal de un archivo nuevo.
const git = (args, { diffExit = false } = {}) => {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (e) {
    return diffExit && e.status === 1 && typeof e.stdout === 'string' ? e.stdout : null;
  }
};
const bail = (msg) => {
  console.error('floor-guard: ' + msg);
  process.exit(2);
};

const top = git(['rev-parse', '--show-toplevel'])?.trim();
if (!top) bail('no estoy dentro de un árbol de trabajo git');
process.chdir(top);
if (!existsSync('CONSTRAINTS.md')) bail('falta CONSTRAINTS.md en la raíz');

const resolveBase = () => {
  const i = process.argv.indexOf('--base');
  if (i > -1) {
    const ref = process.argv[i + 1];
    if (!ref) bail('--base necesita una referencia');
    const sha = git(['rev-parse', '--verify', '--quiet', ref + '^{commit}'])?.trim();
    if (!sha) bail('la base ' + ref + ' no existe');
    return { ref: sha, label: ref };
  }
  if (git(['rev-parse', '--verify', '--quiet', 'origin/main^{commit}'])) {
    const mb = git(['merge-base', 'origin/main', 'HEAD'])?.trim();
    if (!mb) bail('origin/main existe pero no hay merge-base con HEAD');
    return { ref: mb, label: 'merge-base(origin/main)' };
  }
  const head = git(['rev-parse', '--verify', '--quiet', 'HEAD^{commit}'])?.trim();
  if (head) return { ref: head, label: 'HEAD' };
  return { ref: EMPTY_TREE, label: 'árbol vacío' };
};
const base = resolveBase();

const tracked = git(['diff', '--unified=0', '--no-color', '--no-ext-diff', base.ref, '--']);
if (tracked === null) bail('no pude hacer diff contra ' + base.label);
const untrackedList = git(['ls-files', '--others', '--exclude-standard']);
if (untrackedList === null) bail('no pude listar archivos sin versionar');
const untracked = untrackedList
  .split('\n')
  .filter(Boolean)
  .map((f) => {
    const d = git(['diff', '--no-index', '--unified=0', '--no-color', '/dev/null', f], { diffExit: true });
    if (d === null) bail('no pude hacer diff del archivo sin versionar ' + f);
    return d;
  })
  .join('\n');
const diff = tracked + '\n' + untracked;

// `---`/`+++` solo son cabeceras entre la línea `diff` y el primer `@@`.
const added = [];
const removed = [];
const deleted = [];
const pathOf = (s) => s.replace(/^[ab]\//, '');
let file = '';
let oldFile = '';
let inHeader = false;
for (const line of diff.split('\n')) {
  if (line.startsWith('diff ')) inHeader = true;
  else if (line.startsWith('@@')) inHeader = false;
  else if (inHeader) {
    if (line.startsWith('--- ')) oldFile = pathOf(line.slice(4));
    else if (line.startsWith('+++ ')) {
      const newFile = pathOf(line.slice(4));
      file = newFile === '/dev/null' ? oldFile : newFile;
      if (newFile === '/dev/null') deleted.push(file);
    }
  } else if (line.startsWith('+')) added.push({ file, text: line.slice(1) });
  else if (line.startsWith('-')) removed.push({ file, text: line.slice(1) });
}

const findings = [];
const flag = (rule, f, text) => findings.push({ rule, file: f, text: text.trim().slice(0, 120) });
const isCode = (f) => /\.(?:[cm]?[jt]s|[jt]sx)$/.test(f);
const isTest = (f) => /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(f);
const isConstraints = (f) => /(?:^|\/)CONSTRAINTS\.md$/.test(f);
const alt = (parts) => new RegExp(parts.join('|'));

// Fragmentos concatenados: el script versionado no debe delatarse a sí mismo.
const SUPPRESSIONS = alt([
  '@ts-' + 'ignore', '@ts-' + 'expect-error', '@ts-' + 'nocheck',
  'eslint-' + 'disable', 'biome-' + 'ignore', 'istanbul ' + 'ignore',
  'c8 ' + 'ignore', 'v8 ' + 'ignore', 'nose' + 'mgrep', 'gitleaks' + ':allow', 'Stryker ' + 'disable',
]);
const STUBS = alt([
  'throw new \\w*Error\\(.*(?:[Nn]ot ' + 'implemented|[Nn]o ' + 'implementado)',
  'catch\\s*(?:\\(\\s*\\w*\\s*\\))?\\s*\\{\\s*' + '\\}',
  '\\b' + 'TO' + 'DO' + '\\b',
  '\\b' + 'FIX' + 'ME' + '\\b',
]);

// 1 y 5: supresiones y trabajo a medias, solo en líneas añadidas de código.
for (const { file: f, text } of added) {
  if (!isCode(f)) continue;
  if (SUPPRESSIONS.test(text)) flag('supresion-nueva', f, text);
  if (STUBS.test(text)) flag('trabajo-a-medias', f, text);
}

// 2 y 3: test borrado; aserción quitada de un test que sigue existiendo.
for (const f of deleted) if (isTest(f)) flag('test-borrado', f, 'archivo borrado');
for (const { file: f, text } of removed) {
  if (isTest(f) && !deleted.includes(f) && /\b(?:expect|assert|should)\b/.test(text)) {
    flag('asercion-quitada', f, text);
  }
}

// 4: umbrales de CONSTRAINTS.md. Regla = primera celda de una fila o texto de viñeta antes de ':'.
const ruleKey = (t) => {
  const s = t.trim();
  if (s.startsWith('|')) {
    const key = s.split('|').map((c) => c.trim()).filter(Boolean)[0] ?? '';
    return /^:?-{3,}:?$/.test(key) ? null : key;
  }
  if (/^[-*] /.test(s)) return s.slice(2).split(':')[0].trim();
  return null;
};
const MIN_BEFORE = /(?:>=|>|≥|\bmin\b|mínimo|al menos|no menos de)\s*$/;
const MAX_BEFORE = /(?:<=|<|≤|\bmax\b|máximo|a lo sumo|no más de|menos de|por debajo de)\s*$/;
const MIN_AFTER = /^\s*\S*\s*(?:o más|no debe bajar)/;
const MAX_AFTER = /^\s*\S*\s*(?:o menos|no debe crecer|no debe subir)/;
const thresholds = (t) => {
  const out = [];
  const re = /\d+(?:[.,]\d+)?/g;
  let m;
  while ((m = re.exec(t))) {
    const before = t.slice(Math.max(0, m.index - 24), m.index).toLowerCase();
    const after = t.slice(m.index + m[0].length, m.index + m[0].length + 40).toLowerCase();
    const dir = MIN_BEFORE.test(before) || MIN_AFTER.test(after) ? 'min'
      : MAX_BEFORE.test(before) || MAX_AFTER.test(after) ? 'max' : null;
    out.push({ n: Number(m[0].replace(',', '.')), dir });
  }
  return out;
};
const removedRules = removed.filter((l) => isConstraints(l.file) && ruleKey(l.text) !== null);
const addedRules = added.filter((l) => isConstraints(l.file) && ruleKey(l.text) !== null);
for (const r of removedRules) {
  const a = addedRules.find((x) => ruleKey(x.text) === ruleKey(r.text));
  if (!a) {
    flag('regla-eliminada', r.file, r.text);
    continue;
  }
  const was = thresholds(r.text);
  const now = thresholds(a.text);
  let verdict = null;
  for (const dir of ['min', 'max', null]) {
    const w = was.filter((x) => x.dir === dir);
    const n = now.filter((x) => x.dir === dir);
    w.forEach((b, i) => {
      if (verdict) return;
      const c = n[i];
      if (!c) verdict = dir ? 'umbral-cambiado' : 'umbral-cambiado';
      else if (c.n === b.n) return;
      else if (dir === 'min' ? c.n < b.n : dir === 'max' ? c.n > b.n : true) {
        verdict = dir ? 'umbral-relajado' : 'umbral-cambiado';
      }
    });
  }
  if (verdict) flag(verdict, r.file, r.text + '  ->  ' + a.text);
}

if (findings.length === 0) {
  console.log('floor-guard: limpio (base: ' + base.label + ')');
  process.exit(0);
}
console.error('floor-guard: ' + findings.length + ' hallazgo(s) (base: ' + base.label + '):');
for (const f of findings) console.error(`  [${f.rule}] ${f.file}: ${f.text}`);
if (findings.some((f) => f.rule.startsWith('umbral') || f.rule === 'regla-eliminada')) {
  console.error('\nSe tocó una regla de CONSTRAINTS.md: cámbiala en un commit propio o con una excepción con fecha de caducidad.');
  console.error('Una regla eliminada también puede ser un renombre: renombra en un commit y cambia el número en otro.');
}
console.error('\nCada hallazgo baja el listón. Arregla el código o regístralo como excepción.');
process.exit(1);

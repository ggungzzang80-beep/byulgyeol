/**
 * 수호별 14마리 고양이 검증 — starPalette.ts 매핑 · 파일 존재 · 이미지 고유성
 * 실행: node scripts/verify-guardians.mjs
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/lib/starPalette.ts'), 'utf8');

/* STAR_VISUAL 항목별로 guardianImage / guardianName 을 뽑습니다. */
const blockRe = /\n  ([가-힣]{2}): \{\n([\s\S]*?)\n  \},/g;
const rows = [];
let m;
while ((m = blockRe.exec(src))) {
  const star = m[1];
  const body = m[2];
  const img = /guardianImage: `\$\{GUARDIAN_ART\}([^`]+)`/.exec(body);
  const name = /guardianName: '([^']+)'/.exec(body);
  const mood = /mood: '([^']+)'/.exec(body);
  if (img) rows.push({ star, file: img[1], name: name?.[1] ?? '', mood: mood?.[1] ?? '' });
}

const expected = ['자미', '천기', '태양', '무곡', '천동', '염정', '천부', '태음', '탐랑', '거문', '천상', '천량', '칠살', '파군'];
const byStar = new Map(rows.map((r) => [r.star, r]));

const lines = [];
const hashes = new Map();
let ok = true;
for (const star of expected) {
  const row = byStar.get(star);
  if (!row) {
    lines.push(`${star}\tMISSING MAPPING`);
    ok = false;
    continue;
  }
  const p = path.join(root, 'public/guardians', row.file);
  if (!fs.existsSync(p)) {
    lines.push(`${star}\t${row.file}\tFILE MISSING\t${row.name}`);
    ok = false;
    continue;
  }
  const buf = fs.readFileSync(p);
  const hash = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);
  hashes.set(hash, (hashes.get(hash) ?? []).concat(star));
  lines.push(`${star}\tpublic/guardians/${row.file}\t${(buf.length / 1024).toFixed(0)}KB\t${hash}\t${row.name}\t${row.mood}`);
}

const duplicates = [...hashes.entries()].filter(([, stars]) => stars.length > 1);
console.log('star\tfile\tsize\tsha256(16)\tguardian\tmood');
console.log(lines.join('\n'));
console.log('\nstars mapped:', rows.length, '/ 14');
console.log('duplicate images:', duplicates.length ? JSON.stringify(duplicates) : 'none');
console.log('unique guardian files:', new Set(rows.map((r) => r.file)).size);
console.log(ok && duplicates.length === 0 && rows.length === 14 ? 'RESULT: PASS (14 distinct cats)' : 'RESULT: FAIL');

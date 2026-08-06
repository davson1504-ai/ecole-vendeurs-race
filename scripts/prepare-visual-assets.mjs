import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const [board, portraitOne, portraitTwo, portraitThree] = process.argv.slice(2);

if (!board || !portraitOne || !portraitTwo || !portraitThree) {
  throw new Error('Usage: node scripts/prepare-visual-assets.mjs <planche> <portrait-1> <portrait-2> <portrait-3>');
}

const root = process.cwd();
const authDir = path.join(root, 'public', 'images', 'auth');
const coursesDir = path.join(root, 'public', 'images', 'formations');
const trainersDir = path.join(root, 'public', 'images', 'formateurs');

await Promise.all([authDir, coursesDir, trainersDir].map((directory) => mkdir(directory, { recursive: true })));

const scenes = [
  { output: path.join(authDir, 'auth-hero.webp'), left: 11, top: 100, width: 746, height: 320 },
  { output: path.join(coursesDir, 'fondamentaux-vente.webp'), left: 769, top: 100, width: 749, height: 320 },
  { output: path.join(coursesDir, 'vente-terrain.webp'), left: 11, top: 516, width: 746, height: 300 },
  { output: path.join(coursesDir, 'excellence-commerciale.webp'), left: 769, top: 516, width: 749, height: 300 },
];

await Promise.all(
  scenes.map(({ output, ...extract }) =>
    sharp(board)
      .extract(extract)
      .resize(1200, 675, { fit: 'cover', position: 'attention' })
      .webp({ quality: 86 })
      .toFile(output),
  ),
);

await Promise.all(
  [portraitOne, portraitTwo, portraitThree].map((input, index) =>
    sharp(input)
      .resize(640, 800, { fit: 'cover', position: 'attention' })
      .webp({ quality: 84 })
      .toFile(path.join(trainersDir, `formateur-${index + 1}.webp`)),
  ),
);

console.log('Actifs WebP générés dans public/images.');

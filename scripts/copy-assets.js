// Copies MathJax (formula display) and MathLive fonts (formula typing) into /public
// so everything works without an internet connection.
import { cpSync, existsSync } from 'node:fs';

const copies = [
  ['node_modules/mathjax/es5', 'public/mathjax'],
  ['node_modules/mathlive/fonts', 'public/mathlive/fonts'],
];
for (const [from, to] of copies) {
  if (existsSync(from)) {
    cpSync(from, to, { recursive: true });
    console.log('Copied', from, '->', to);
  } else {
    console.warn('Missing', from, '- run npm install again.');
  }
}

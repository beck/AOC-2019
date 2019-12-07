#!/usr/bin/env node
require('clear')();
const input = require('readlines').readlinesSync('./3-in.txt').slice(0, -1);

const parse = (d) => [d.charAt(0), Number(d.slice(1))];
const red = input[0].split(',').map(parse);
const blue = input[1].split(',').map(parse);

let x, y, distance;

x = 0;
y = 0;
distance = 0;

const seen = new Map();
const mark = (x, y) => {
  distance += 1;
  const key = `${x}/${y}`;
  if (seen.has(key)) return;
  seen.set(key, distance);
}

const travelred = ({ up, down, left, right }) => {
  while (up--) mark(x, ++y);
  while (down--) mark(x, --y);
  while (left--) mark(--x, y);
  while (right--) mark(++x, y);
}

for (const [dir, num] of red) {
  if (dir === 'U') travelred({ up: num, down: 0, left: 0, right: 0 });
  if (dir === 'D') travelred({ up: 0, down: num, left: 0, right: 0 });
  if (dir === 'L') travelred({ up: 0, down: 0, left: num, right: 0 });
  if (dir === 'R') travelred({ up: 0, down: 0, left: 0, right: num });
}

const founds = new Set();

const found = (x, y) => {
  distance += 1;
  if (seen.has(`${x}/${y}`)) {
    const d1 = seen.get(`${x}/${y}`);
    console.log({ d1, distance });
    founds.add(d1 + distance);
  }
}

const travelblue = ({ up, down, left, right }) => {
  // console.log({ up, down, left, right });
  while (up--) found(x, ++y);
  while (down--) found(x, --y);
  while (left--) found(--x, y);
  while (right--) found(++x, y);
}

x = 0;
y = 0;
distance = 0;

for (const [dir, num] of blue) {
  if (dir === 'U') travelblue({ up: num, down: 0, left: 0, right: 0 });
  if (dir === 'D') travelblue({ up: 0, down: num, left: 0, right: 0 });
  if (dir === 'L') travelblue({ up: 0, down: 0, left: num, right: 0 });
  if (dir === 'R') travelblue({ up: 0, down: 0, left: 0, right: num });
}

console.log(founds);

console.log(Array.from(founds).reduce((acc, v) => Math.min(acc, v)));


/* wrong: 55 */
/* too high: 27375 */
/* sol: 27330 */

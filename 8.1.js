#!/usr/bin/env node
require('clear')();
const rl = require('readlines');
let input = rl.readlinesSync('./8-in.txt').slice(0, -1);
input = input[0].split('');

console.log(input.length / 25 * 6);
let i = 0;
let min = Infinity;
let layer = [];
while (i < input.length) {
  const l = input.slice(i, i + 25 * 6);
  i += (25 * 6);
  const count = l.reduce((acc, c) => c === '0' ? acc + 1 : acc, 0);
  if (count < min) {
    min = count;
    layer = l;
  }
}

const count1 = layer.reduce((acc, c) => c === '1' ? acc + 1 : acc, 0);
const count2 = layer.reduce((acc, c) => c === '2' ? acc + 1 : acc, 0);
console.log(count1 * count2);

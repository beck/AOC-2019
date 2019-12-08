#!/usr/bin/env node
require('clear')();
const rl = require('readlines');
let input = rl.readlinesSync('./8-in.txt').slice(0, -1);
input = input[0].split('');

console.log(input.length / 25 * 6);
let i = 0;
let min = Infinity;
let layer = [];

const res = [];
let end = input.length / 25 * 6
while (i < 150) {
  for (j = i; j < input.length; j += 25 * 6) {
    if (input[j] == '2') continue;
    res.push(input[j]);
    break;
  }
  i += 1;
}
for (let i = 0; i < res.length; i += 25) {
  // DUH `.replace('0', ' ') only does one :{{{{{{{
  console.log(res.slice(i, i + 25).join(''));
}

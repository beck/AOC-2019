#!/usr/bin/env node
require('clear')();
const rl = require('readlines');
let input = rl.readlinesSync('./run-in.txt').slice(0, -1);
input = input[0].split(',').map(Number);
console.log('\n\n\n\n\n\n--------------------');

input[1] = 12
input[2] = 2

let i = 0;
while (i < input.length) {
  console.log(input.join(' '), '\n');
  const ci = i++;
  const cmd = input[ci];
  const li = i++;
  const l = input[li];
  const ri = i++;
  const r = input[ri];
  const ti = i++;
  const t = input[ti];
  console.log({ ci, cmd, li, l, ri, r, ti, t });
  if (ti === 119) {
    console.log('OY!');
    debugger
  }
  if (cmd === 1) {
    console.log('add', l, r, t);
    console.log('before', input[ti]);
    input[t] = input[l] + input[r];
    console.log('after', input[ti]);
    continue;
  }
  if (cmd === 2) {
    console.log('multiply', l, r, t);
    console.log('before', input[ti]);
    input[t] = input[l] * input[r];
    console.log('after', input[ti]);
    continue;
  }
  console.log('break', cmd);
  break;
}

/*
99 - exit
1 - adds (following three)
2 - multiples
*/

console.log(input[0]);





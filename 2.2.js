#!/usr/bin/env node
require('clear')();
const rl = require('readlines');
let input = rl.readlinesSync('./2-in.txt').slice(0, -1);
input = input[0].split(',').map(Number);
console.log('\n\n\n\n\n\n--------------------');

const run = mem => {
  let i = 0;
  while (i < mem.length) {
    const [cmd, l, r, t] = mem.slice(i, i + 4);
    i += 4;
    if (cmd === 1) {
      mem[t] = mem[l] + mem[r];
      continue;
    }
    if (cmd === 2) {
      mem[t] = mem[l] * mem[r];
      continue;
    }
    return mem[0];
  }
}

const main = () => {
  for (let i = 0; i <= 99; i++) {
    for (let j = 0; j <= 99; j++) {
      const mem = [...input];
      mem[1] = i;
      mem[2] = j;
      if (run(mem) === 19690720) {
        console.log(i, j);
        return;
      }
    }
  }
  console.log('nope');

}

main();

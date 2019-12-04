#!/usr/bin/env node
require('clear')();
const rl = require('readlines');
let input = rl.readlinesSync('./run-in.txt').slice(0, -1);
input = input[0].split(',').map(Number);
console.log('\n\n\n\n\n\n--------------------');

/*
six dig
range
two adj are the same
left to right, never decrease
how many diff passwords?
*/

//347312-805915
//347777-799999

function n(ntn, number) {
  return number.toString().charAt(ntn);
}

let count = 0;
const check = num => {
  let ok = false;
  let left = n(0, num);
  let right;
  let seqcount = 1;
  for (let i = 0; i < 5; i++) {
    right = n(i + 1, num);
    if (left > right) return;

    if (left === right) {
      seqcount += 1;
    }

    if (left !== right || i === 4) {
      if (seqcount == 2) {
        ok = true;
        // console.log(num, left, right, seqcount);
      }
      seqcount = 1;
    }
    left = right;
  }
  if (ok) {
    console.log(num);
    count += 1;
  }
}

for (i = 347777; i <= 799999; i++) {
  check(i);
}

console.log(count);

// womps:
// 3246
// 280

// p1 - 594
// p2 - 364

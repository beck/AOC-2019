#!/usr/bin/env node
require('clear')();
const rl = require('readlines');
let input = rl.readlinesSync('./5-in.txt').slice(0, -1);
input = input[0].split(',');

class IntcodeComputer {

  constructor(mem) {
    this.mem = mem;
    this.ip = 0;
    this.halted = false;
    this.io = null;
  }

  readint(addr = null) {
    if (addr !== null) return Number(this.mem[addr]);
    return Number(this.mem[this.ip++]);
  }

  readcmd() {
    const cmd = this.mem[this.ip++];
    return [Number(cmd), 'pos'];
  }

  next() {
    const [cmd, ...modes] = this.readcmd();
    if (cmd === 1) {
      this.add(modes);
      return;
    }
    if (cmd === 2) {
      this.multiply(modes);
      return;
    }
    if (cmd === 3) {
      this.input(modes);
      return;
    }
    if (cmd === 4) {
      this.output(modes);
      return;
    }
    if (cmd !== 99) {
      console.error('bad halt');
    }
    this.halted = true;
  }

  input() {
    const param = this.readint();
    this.mem[param] = this.io;
  }

  output() {
    const param = this.readint();
    this.io = this.readint(param);
  }

  add() {
    const a = this.readint();
    const b = this.readint();
    const c = this.readint();
    this.mem[c] = this.readint(a) + this.readint(b);
  }

  multiply() {
    const a = this.readint();
    const b = this.readint();
    const c = this.readint();
    this.mem[c] = this.readint(a) * this.readint(b);
  }

  run() {
    while (!this.halted) this.next();
    //console.log('result', this.mem[0]);
    return this.mem[0];
  }

}


const main = () => {
  for (let i = 0; i <= 99; i++) {
    for (let j = 0; j <= 99; j++) {
      const mem = [...input];
      mem[1] = i;
      mem[2] = j;
      const computer = new IntcodeComputer(mem);
      if (computer.run() === 19690720) {
        console.log(i, j);
        return;
      }
    }
  }
  console.log('nope');

}

main();

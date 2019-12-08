#!/usr/bin/env node
require('clear')();
const rl = require('readlines');
let input = rl.readlinesSync('./5-in.txt').slice(0, -1);
input = input[0].split(',');

const POSITION = '0';
const IMMEDIATE = '1';

class IntcodeComputer {

  constructor(mem) {
    this.mem = mem;
    this.ip = 0;
    this.halted = false;
  }

  readint(addr = null) {
    if (addr === null) {
      addr = this.ip;
      this.ip += 1;
    }
    return Number(this.mem[addr]);
  }

  readcmd() {
    const inst = String(this.mem[this.ip++]);
    const optc = Number(inst.slice(-2));
    const modes = inst.slice(0, -2).split('').reverse();
    while (modes.length < 3) modes.push('0');
    return [optc, modes];
  }

  write(addr, v) {
    this.mem[addr] = String(v);
  }

  next() {
    const [optc, modes] = this.readcmd();
    if (optc === 1) {
      this.add(modes);
      return;
    }
    if (optc === 2) {
      this.multiply(modes);
      return;
    }
    if (optc === 3) {
      this.input(modes);
      return;
    }
    if (optc === 4) {
      this.output(modes);
      return;
    }
    if (optc !== 99) {
      console.error('bad halt', { optc });
    }
    this.halted = true;
  }

  input() {
    const param = this.readint();
    console.log('input 1!');
    this.write(param, '1');
  }

  output(modes) {
    let output = this.readint();
    if (modes[0] === POSITION) {
      output = this.readint(output);
    }
    console.log({ output })
  }

  add(modes) {
    let a = this.readint();
    if (modes[0] == POSITION) {
      a = this.readint(a);
    }
    let b = this.readint();
    if (modes[1] == POSITION) {
      b = this.readint(b);
    }
    let c = this.readint();
    //console.log('add', a, b);
    this.write(c, a + b);
  }

  multiply(modes) {
    let a = this.readint();
    if (modes[0] == POSITION) {
      a = this.readint(a);
    }
    let b = this.readint();
    if (modes[1] == POSITION) {
      b = this.readint(b);
    }
    const c = this.readint();
    //console.log('multiply', a, b);
    this.write(c, a * b);
  }

  run() {
    while (!this.halted) this.next();
  }

}


const main = () => {
  const computer = new IntcodeComputer(input);
  computer.run();
}

main();

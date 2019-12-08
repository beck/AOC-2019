#!/usr/bin/env node
require('clear')();
const rl = require('readlines');
let input = rl.readlinesSync('./5-in.txt').slice(0, -1);
input = input.join('').split(',');

const POSITION = '0';
const IMMEDIATE = '1';

debug = (...args) => console.log(...args);
debug = () => { }

class IntcodeComputer {

  constructor(mem) {
    this.mem = mem;
    this.ip = 0;
    this.halted = false;
  }

  readint(addr, mode = POSITION) {
    const val = Number(this.mem[addr]);
    let res = val;
    if (mode === POSITION) {
      res = Number(this.mem[val]);
    }
    return res;
  }

  readnext(mode) {
    const addr = this.ip;
    this.ip += 1;
    return this.readint(addr, mode);
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
    if (optc === 5) {
      this.jumpiftrue(modes);
      return;
    }
    if (optc === 6) {
      this.jumpiffalse(modes);
      return;
    }
    if (optc === 7) {
      this.lessthan(modes);
      return;
    }
    if (optc === 8) {
      this.equals(modes);
      return;
    }
    if (optc !== 99) {
      console.error('bad halt', { optc });
    }
    this.halted = true;
  }

  jumpiftrue(modes) {
    const a = this.readnext(modes[0]);
    const b = this.readnext(modes[1]);
    debug('jumpt', a, b, modes);
    if (a !== 0) {
      this.ip = b;
    }
  }

  jumpiffalse(modes) {
    const a = this.readnext(modes[0]);
    const b = this.readnext(modes[1]);
    debug('jumpf', a, b, modes);
    if (a === 0) {
      this.ip = b;
    }
  }

  lessthan(modes) {
    const a = this.readnext(modes[0]);
    const b = this.readnext(modes[1]);
    const c = this.readnext(IMMEDIATE);
    debug('lt', a, b, c, modes);
    if (a < b) {
      this.write(c, 1);
    } else {
      this.write(c, 0);
    }
  }

  equals(modes) {
    const a = this.readnext(modes[0]);
    const b = this.readnext(modes[1]);
    const c = this.readnext(IMMEDIATE);
    debug('equals', a, b, c, modes);
    if (a === b) {
      this.write(c, 1);
    } else {
      this.write(c, 0);
    }
  }

  input() {
    const param = this.readnext(IMMEDIATE);
    this.write(param, '5');
    console.log('input', param);
  }

  output(modes) {
    let output = this.readnext(modes[0]);
    console.log({ output })
  }

  add(modes) {
    const a = this.readnext(modes[0]);
    const b = this.readnext(modes[1]);
    const c = this.readnext(IMMEDIATE);
    debug('add', a, b, c, modes);
    this.write(c, a + b);
  }

  multiply(modes) {
    const a = this.readnext(modes[0]);
    const b = this.readnext(modes[1]);
    const c = this.readnext(IMMEDIATE);
    debug('multiply', a, b, c, modes);
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

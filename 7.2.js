#!/usr/bin/env node
const { Subject } = require('rxjs');
const { take } = require('rxjs/operators');

const rl = require('readlines');
let program = rl.readlinesSync('./7-in.txt').slice(0, -1);
program = program.join('').split(',');

// clear screen
console.log('\033[2J\033[3J\033[1;1H');

const POSITION = '0';
const IMMEDIATE = '1';

debug = (...args) => console.log(...args);
debug = () => { }

class IntcodeComputer {

  constructor(mem, phase, seed) {
    this.mem = mem;
    this.ip = 0;
    this.halted = false;

    this._stdinresolve;
    const stdinprom = new Promise(r => { this._stdinresolve = r });

    this.stdout = new Subject();

    this._stdin = (async function* () {
      debug('yielding', phase);
      yield phase;

      if (seed !== undefined) {
        debug('yielding', seed);
        yield seed;
      }

      const subject = await stdinprom;

      while (true) {
        let val;
        try {
          val = await subject.pipe(take(1)).toPromise();
          debug('yielding', phase);
        } catch (e) {
          console.error(e);
          process.exit();
        }

        yield val;
      }
    })();

  }

  set stdin(observable) {
    this._stdinresolve(observable);
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

  async next() {
    const [optc, modes] = this.readcmd();
    debug({ optc });
    if (optc === 1) {
      this.add(modes);
      return;
    }
    if (optc === 2) {
      this.multiply(modes);
      return;
    }
    if (optc === 3) {
      await this.input(modes);
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
      console.error('-'.repeat(100));
      console.error('bad halt', { optc });
      console.error('-'.repeat(100));
      process.exit();
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

  async input() {
    const param = this.readnext(IMMEDIATE);
    const { value, done } = await this._stdin.next();
    if (done || value === undefined) {
      console.error('iterator broke', done, value);
      process.exit();
    }
    this.write(param, value);
  }

  output(modes) {
    let o = this.readnext(modes[0]);
    debug('output', o);
    this.stdout.next(o);
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

  async run() {
    while (!this.halted) {
      await this.next();
    }
  }

}

const permutations = arr => {
  var results = [];

  if (arr.length === 1) {
    return [arr];
  }

  for (let i = 0; i < arr.length; i++) {
    const copy = [...arr];
    const ci = copy.splice(i, 1);
    var innerPermutations = permutations(copy);
    for (var j = 0; j < innerPermutations.length; j++) {
      results.push(ci.concat(innerPermutations[j]));
    }
  }

  return results;
}


const main = async () => {

  let max = -Infinity;
  for (perm of permutations([5, 6, 7, 8, 9])) {
    const a = new IntcodeComputer([...program], perm[0], 0);
    const b = new IntcodeComputer([...program], perm[1]);
    b.stdin = a.stdout;
    const c = new IntcodeComputer([...program], perm[2]);
    c.stdin = b.stdout;
    const d = new IntcodeComputer([...program], perm[3]);
    d.stdin = c.stdout;
    const e = new IntcodeComputer([...program], perm[4]);
    e.stdin = d.stdout;
    a.stdin = e.stdout;

    e.stdout.subscribe(out => {
      debug('e out', out);
      max = Math.max(out, max);
    });

    await Promise.all([
      a.run(), b.run(), c.run(), d.run(), e.run()
    ]).catch(e => {
      console.error(e);
      process.exit();
    });

  };
  console.log('max', max);
}

main();

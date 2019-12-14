#!/usr/bin/env node
const { Subject } = require('rxjs');
const { take } = require('rxjs/operators');

const rl = require('readlines');
let program = rl.readlinesSync('./10-in.txt').slice(0, -1);
program = program.join('').split(',');

// clear screen
console.log('\033[2J\033[3J\033[1;1H');

const POSITION = '0';
const IMMEDIATE = '1';
const RELATIVE = '2';

debug = (...args) => console.log(...args);
debug = () => { }

class IntcodeComputer {

  constructor(mem, phase, seed) {
    this.mem = mem;
    this.ip = 0;
    this.halted = false;
    this.relbase = 0;

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

  readaddr(addr, mode = POSITION) {
    const str = this.mem[addr];
    if (mode == IMMEDIATE) {
      return str;
    }
    if (mode === POSITION) {
      const res = this.mem[Number(str)];
      if (res === undefined) return 0;
      return res;
    }
    if (mode === RELATIVE) {
      const res = this.mem[Number(str) + this.relbase];
      if (res === undefined) {
        debug('oy', Number(str) + this.relbase);
        return 0;
      }
      return res;
    }
    console.error('unknown mode', mode);
    process.exit();
  }

  readnext(mode) {
    const addr = this.ip;
    this.ip += 1;
    const res = this.readaddr(addr, mode);
    if (res === undefined) {
      console.error('out of bounds');
      console.log({ addr, mode, rel: this.relbase });
      console.log(this.mem);
      process.exit();
    }
    return res;
  }

  readcmd() {
    const inst = String(this.mem[this.ip++]);
    const optc = Number(inst.slice(-2));
    const modes = inst.slice(0, -2).split('').reverse();
    while (modes.length < 3) modes.push('0');
    return [optc, modes];
  }

  write(addr, v) {
    debug('write', String(v), '>', addr);
    this.mem[Number(addr)] = String(v);
  }

  async next() {
    const [optc, modes] = this.readcmd();
    debug({ optc, modes });
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
    if (optc === 9) {
      this.adjrelbase(modes);
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

  adjrelbase(modes) {
    const a = this.readnext(modes[0]);
    debug('adjrel', Number(a));
    this.relbase += Number(a);
  }

  jumpiftrue(modes) {
    const a = this.readnext(modes[0]);
    const b = this.readnext(modes[1]);
    debug('jumpt', a, b, modes);
    if (Number(a) !== 0) {
      this.ip = Number(b);
    }
  }

  jumpiffalse(modes) {
    const a = this.readnext(modes[0]);
    const b = this.readnext(modes[1]);
    debug('jumpf', a, b, modes);
    if (Number(a) === 0) {
      this.ip = Number(b);
    }
  }

  lessthan(modes) {
    const a = this.readnext(modes[0]);
    const b = this.readnext(modes[1]);
    let c = this.readnext(IMMEDIATE);
    if (modes[2] === RELATIVE) {
      c = this.relbase + Number(c);
    }

    debug('lt', a, b, c, modes, BigInt(a) < BigInt(b));
    if (BigInt(a) < BigInt(b)) {
      this.write(c, 1);
    } else {
      this.write(c, 0);
    }
  }

  equals(modes) {
    const a = this.readnext(modes[0]);
    const b = this.readnext(modes[1]);
    let c = this.readnext(IMMEDIATE);
    if (modes[2] === RELATIVE) {
      c = this.relbase + Number(c);
    }
    debug('equals', a, b, c, modes, a === b);
    if (a === b) {
      this.write(c, 1);
    } else {
      this.write(c, 0);
    }
  }

  async input(mode) {
    let param = this.readnext(IMMEDIATE);
    if (mode[0] === RELATIVE) {
      param = this.relbase + Number(param);
    }
    const { value, done } = await this._stdin.next();
    if (done || value === undefined) {
      console.error('iterator broke', done, value);
      process.exit();
    }
    debug('input', value, '>', param, 'mode', mode[0]);
    this.write(param, value);
  }

  output(modes) {
    let o = this.readnext(modes[0]);
    this.stdout.next(String(o));
  }

  add(modes) {
    const a = this.readnext(modes[0]);
    const b = this.readnext(modes[1]);
    let c = this.readnext(IMMEDIATE);
    if (modes[2] === RELATIVE) {
      c = this.relbase + Number(c);
    }

    debug('add', a, b, c, modes);
    this.write(c, BigInt(a) + BigInt(b));
  }

  multiply(modes) {
    const a = this.readnext(modes[0]);
    const b = this.readnext(modes[1]);
    let c = this.readnext(IMMEDIATE);
    if (modes[2] === RELATIVE) {
      c = this.relbase + Number(c);
    }
    const res = BigInt(a) * BigInt(b);
    debug('multiply', a, b, c, modes, res);
    this.write(c, res);
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

  // debug(program);

  const computer = new IntcodeComputer([...program], 2);

  computer.stdout.subscribe(out => {
    console.log('Output:', out);
  });

  computer.run();

}

main();

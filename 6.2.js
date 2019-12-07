#!/usr/bin/env node
require('clear')();
const rl = require('readlines');
let input = rl.readlinesSync('./6-in.txt').slice(0, -1);

let root;

class Node {
  constructor(val) {
    this.val = val;
    this.orbits = [];
    this.parent = null;
  }

  add(n) {
    this.orbits.push(n);
    n.parent = this;
  }

  find(v) {
    if (!this.orbits.length) return null;

    for (const child of this.orbits) {
      if (child.val === v) return child;
      const heyo = child.find(v);
      if (heyo) return heyo;
    }

    return null;
  }
}

const roots = [];

const find = (val) => {
  for (node of roots) {
    if (node.val === val) return node;
    const heyo = node.find(val);
    if (heyo) return heyo;
  }
  const n = new Node(val);
  roots.push(n);
  return n;
}

const seen = new Set();
const travel = (node, target, count) => {
  if (node.val === target.val) return count;
  if (seen.has(node.val)) return Infinity;
  seen.add(node.val);
  let queue = [];
  if (node.parent) queue.push(node.parent);
  queue = queue.concat(node.orbits);
  let min = Infinity;
  for (n of queue) {
    min = Math.min(min, travel(n, target, count + 1));
  }
  return min;
}

let you;
let target;

const main = () => {
  input.forEach(l => {
    const [left, right] = l.split(')');

    let rightn;
    for (root of roots) {
      if (root.val === right) {
        rightn = root;
        roots.splice(roots.indexOf(root), 1);
        break;
      }
    }
    rightn = rightn || new Node(right);

    const lnode = find(left);
    lnode.add(rightn);

    if (right === 'YOU') {
      you = rightn;
      console.log(you);
    }

    if (right === 'SAN') {
      target = rightn;
      console.log(target);
    }
  });

  console.log(travel(you.parent, target.parent, 0));

  // console.log(roots);
  // console.log(count(roots[0], 0));
}

main();

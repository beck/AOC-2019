#!/usr/bin/env node
require('clear')();
const rl = require('readlines');
let input = rl.readlinesSync('./6-in.txt').slice(0, -1);

let root;

class Node {
  constructor(val) {
    this.val = val;
    this.orbits = [];
  }

  add(n) {
    this.orbits.push(n);
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

const count = (node, depth) => {
  if (!node.orbits.length) return depth;

  return node.orbits.reduce(
    (acc, n) => acc + count(n, depth + 1),
    depth
  );
}

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
  });

  console.log(roots);
  console.log(count(roots[0], 0));
}

main();

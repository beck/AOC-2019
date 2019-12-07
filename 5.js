#!/usr/bin/env node
require('clear')();
const rl = require('readlines');
let input = rl.readlinesSync('./run-in.txt').slice(0, -1);
input = input[0].split(',').map(Number);

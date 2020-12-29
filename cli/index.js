#!/usr/bin/env node
const argv = process.argv;
const cmdOptions = argv.slice(2);

// console.log(cmdOptions);

const getTarballs = require('../src/index.js');
getTarballs();
#!/usr/bin/env node
const extract = require('./extract')

const url = process.argv[process.argv.length - 1]
extract(url)

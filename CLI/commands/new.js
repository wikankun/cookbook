#!/usr/bin/env node
const createEmptyRecipe = require('../createEmptyRecipe')

const title = process.argv[process.argv.length - 1]
createEmptyRecipe(title)

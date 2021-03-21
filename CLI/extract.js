const fs = require('fs')
const path = require('path')
const ejs = require('ejs')
const fetch = require('node-fetch')
const sanitize = require("sanitize-filename");

const {
  downloadImage,
  recipeToMarkdown,
  saveRecipeMarkdown,
  simplifyRecipeJSON
} = require('./helpers')

const IMG_OUTPUT_DIR = 'img/'
const MARKDOWN_IMG_PREFIX = `../${IMG_OUTPUT_DIR}`

async function extract(recipeUrl) {
  console.log('Extracting', recipeUrl)

  const query = new URL('https://api.spoonacular.com/recipes/extract')
  query.searchParams.append('apiKey', require('./CREDENTIALS.json').SPOONACULAR_API_KEY)
  query.searchParams.append('url', recipeUrl)

  const response = await fetch(query)
  switch (response.status) {
    case 200:
      // Proceed
      break;

    default:
      console.error(`[${response.status}] Error in request:`, response)
      return false
  }

  // Extract JSON
  const recipeJson = await response.json()
  const safeTitle = sanitize(recipeJson.title)
  // Save JSON for debugging purposes
  await fs.promises.writeFile(`tmp/${safeTitle}.json`, JSON.stringify(recipeJson, null, 2))

  // Save the recipe Image
  const imagePath = await downloadImage(recipeJson.image, safeTitle)
  if (imagePath) { recipeJson.image = path.join(MARKDOWN_IMG_PREFIX, path.basename(imagePath)) }

  // Convert Recipe from JSON to markdown
  const renderedRecipe = await recipeToMarkdown(simplifyRecipeJSON(recipeJson))

  // Save rendered Recipe
  await saveRecipeMarkdown(renderedRecipe, safeTitle)
}

module.exports = extract

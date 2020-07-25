const fs = require('fs')
const path = require('path')
const ejs = require('ejs')
const fetch = require('node-fetch')

const MARKDOWN_TEMPLATE = 'CLI/template.md.ejs'

const OUTPUT_DIR = '_recipes/'
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
  // Save JSON for debugging purposes
  await fs.promises.writeFile(`tmp/${recipeJson.title}.json`, JSON.stringify(recipeJson, null, 2))

  // Save the recipe Image
  const imagePath = await downloadImage(recipeJson.image, `${recipeJson.title}`)
  if (imagePath) { recipeJson.image = path.join(MARKDOWN_IMG_PREFIX, path.basename(imagePath)) }

  // Convert Recipe from JSON to markdown
  const renderedRecipe = await recipeToMarkdown(recipeJson)

  // Save rendered Recipe
  await fs.promises.writeFile(`${OUTPUT_DIR}/${recipeJson.title}.md`, renderedRecipe)
}

async function downloadImage(url, name) {
  if (!url) { return }

  // from https://stackoverflow.com/questions/6997262/how-to-pull-url-file-extension-out-of-url-string-using-javascript
  const fileType = url.split(/\#|\?/)[0].split('.').pop().trim()
  const filename = `${name}.${fileType}`
  const filepath = path.join(IMG_OUTPUT_DIR, filename)

  const response = await fetch(url)

  const stream = fs.createWriteStream(filepath)
  response.body.pipe(stream)

  return filepath
}

async function recipeToMarkdown(recipe) {
  const markdownTemplateString = await fs.promises.readFile(MARKDOWN_TEMPLATE, 'utf8')

  return ejs.render(markdownTemplateString, {
    recipe: recipe,
    ingredients: recipe.extendedIngredients || [],
    instructions: recipe.analyzedInstructions.length > 0 ? recipe.analyzedInstructions[0].steps : [],
    tags: extractTags(recipe),
  })
}

const BINARY_TAGS = ['vegetarian', 'vegan', 'glutenFree', 'dairyFree', 'ketogenic']
function extractTags(recipeJson) {
  let tags = []
  BINARY_TAGS.forEach((val) => {
    if (recipeJson[val]) { tags.push(val) }
  })

  tags = tags.concat(recipeJson.cuisines || [])

  tags = tags.map(x => x.toLowerCase())

  return tags
}

module.exports = extract

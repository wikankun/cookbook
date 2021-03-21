const sanitize = require('sanitize-filename')
const {
  recipeToMarkdown,
  saveRecipeMarkdown
} = require('./helpers')

async function createEmptyRecipe(title) {
  const safeTitle = sanitize(title)

  // Convert Recipe from JSON to markdown
  const renderedRecipe = await recipeToMarkdown({
    recipe: {
      title: safeTitle
    },
    ingredients: ['', ''],
    instructions: ['', ''],
    tags: ['']
  })

  // Save rendered Recipe
  await saveRecipeMarkdown(renderedRecipe, safeTitle)
}

module.exports = createEmptyRecipe

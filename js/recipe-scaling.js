function getIngredients (entries) {
  var ingredients = []

  entries.forEach(function (el) {
    for (var child of el.childNodes) {
      if (child.nodeName.toLowerCase() === 'ul') {
        return
      }
    }

    var text = el.innerHTML
    var numbers = text.match(/^\d+|\d+\b|\d+(?=\w)/g)
    var name, amount
    if (numbers && numbers.length > 0) {
      var amountString = numbers[0]
      name = text.replace(amountString, '')
      amount = parseInt(amountString)
    } else {
      name = text
    }

    ingredients.push({
      el,
      amount,
      name
    })
  })

  return ingredients
}

function renderIngredientsAtScale (scale) {
  var scaleFactor = scale / initialScale

  initialIngredients.forEach((ingredient) => {
    ingredient.el.innerHTML = ingredientToHTML(ingredient, scaleFactor)
  })
}

function ingredientToHTML (ingredient, scaleFactor) {
  if (ingredient.amount) {
    return `<span class="scaled">${ingredient.amount * scaleFactor}</span>${ingredient.name}`
  } else {
    return ingredient.name
  }
}

var initialIngredients = getIngredients(document.querySelectorAll('.recipe ul > li'))

var input = document.querySelector('input[name="recipe_scaling"]')
if (input) {
  var initialScale = input.value
  input.addEventListener('change', function () {
    renderIngredientsAtScale(input.value)
  })
}

function changeValue (direction) {
  var value = input.value
  if (direction == 'up') {
    value++
  } else if (direction == 'down') {
    value--
  } else {
    console.error('Unsupported direction in changeValue')
  }

  input.value = value
  input.dispatchEvent(new Event('change'));
}

var decreaseButton = document.querySelector('.decrease')
if (decreaseButton) {
  decreaseButton.addEventListener('click', () => changeValue('down'))
}
var increaseButton = document.querySelector('.increase')
if (increaseButton) {
  increaseButton.addEventListener('click', () => changeValue('up'))
}

console.log("Hallo?", initialIngredients)

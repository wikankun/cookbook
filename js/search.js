// The search script uses simple jekyll search by Christian Fei: https://github.com/christian-fei/Simple-Jekyll-Search

var sjs = SimpleJekyllSearch({
  searchInput: document.getElementById('search-input'),
  resultsContainer: document.getElementById('search-results-container'),
  json: '/list.json'
})

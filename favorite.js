const BASE_URL = 'https://webdev.alphacamp.io/'
const INDEX_URL = BASE_URL + 'api/movies/'
const POSTER_URL = BASE_URL + 'posters/'

const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

const dataPanel = document.querySelector('#data-panel')

const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

function renderMovieList(data) {
  let htmlContent = ''
  data.forEach((item) => {
    htmlContent += `
      <div class="col-sm-2">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <!-- data-bs-toggle & data-bs-target ⇒ 這兩個 class 加上了 -bs- ，以辨識為 Bootsrap用法。 -->
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = htmlContent
}


function showMovieLModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  const modalImage = document.querySelector('#movie-modal-image')

  axios.get(INDEX_URL + id).then((response) => {
    const movieData = response.data.results
    modalTitle.innerText = movieData.title
    modalDate.innerText = 'Release Date : ' + movieData.release_date
    modalDescription.innerText = movieData.description
    const modalImageHTML = `
      <img src="${POSTER_URL + movieData.image}" alt="movie-poster" id="image-fluid">
    `
    modalImage.innerHTML = modalImageHTML
  })
    .catch((err) => console.log(err))
}

// dataPanel.addEventListener('click', event => {
//   console.error('Error')
//   // 如果在這裡是用匿名函示，當點擊到More時，打開DevTools的Console會顯示“Error (anonymous)”
//   // 但是如果如上，有將函式命名的話，就會顯示“Error (onPanelClicked)”
//   // 因此命名對於將來除錯時，會比較方便好找。
// })



function removeFromFavorite(id) {
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies)
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieLModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})


renderMovieList(movies)

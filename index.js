const BASE_URL = "https://webdev.alphacamp.io/";
const INDEX_URL = BASE_URL + "api/movies/";
const POSTER_URL = BASE_URL + "posters/";

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const cardModeSwitch = document.querySelector("#switch-button");

const modalTitle = document.querySelector("#movie-modal-title");
const modalDate = document.querySelector("#movie-modal-date");
const modalDescription = document.querySelector("#movie-modal-description");
const modalImage = document.querySelector("#movie-modal-image");

const model = {
  MOVIES_PER_PAGE: 15,
  currentPage: 1,
  movies: [],
  showKeywordMovie: []
};

const view = {
  renderMovieList(data) {
    if (dataPanel.dataset.mode === "card-mode") {
      let htmlContent = "";
      data.forEach((item) => {
        htmlContent += `
          <div class="card m-2 col-sm-2 rounded" id="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top mt-3" alt="Movie Poster">
            <div class="card-body d-flex align-items-center text-center text-break">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer d-flex justify-content-around rounded" style="background-color:transparent">
              <!-- data-bs-toggle & data-bs-target ⇒ 這兩個 class 加上了 -bs- ，以辨識為 Bootsrap用法。 -->
              <button id="btn-more" class="btn btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id
          }">More</button>
              <button id="btn-plus" class="btn btn-add-favorite" data-id="${item.id
          }">＋</button>
            </div>
          </div>
    `;
      });
      dataPanel.innerHTML = htmlContent;
    } else if (dataPanel.dataset.mode === "list-mode") {
      let htmlContent = `<ul class="list-group">`;
      data.forEach((item) => {
        htmlContent += `
      <li class="list-group-item">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="card-title m-0">${item.title}</h5>
          <div>
            <button id="btn-more" class="btn btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button id="btn-plus" class="btn btn-add-favorite" data-id="${item.id}">＋</button>
          </div>
        </div>
      </li>
    `;
      });
      htmlContent += `</ul>`;
      dataPanel.innerHTML = htmlContent;
    }
  },

  renderPaginator(amount) {
    // 80部電影 / 每頁12部 ＝ 6頁...餘8部 （無條件進位，所以總共會有七頁）
    const numbersOfPages = Math.ceil(amount / model.MOVIES_PER_PAGE); // Math.ceil() 無條件進位
    let htmlContent = "";
    for (let page = 1; page <= numbersOfPages; page++) {
      htmlContent += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
      // data-page是綁在<a>上面，想像<a>超連結是按鈕
    }
    paginator.innerHTML = htmlContent;
  },

  showMovieLModal(id) {
    axios
      .get(INDEX_URL + id)
      .then((response) => {
        const movieData = response.data.results;
        modalTitle.innerText = movieData.title;
        modalDate.innerText = "Release Date : " + movieData.release_date;
        modalDescription.innerText = movieData.description;
        const modalImageHTML = `
          <img src="${POSTER_URL + movieData.image}" alt="movie-poster" id="image-fluid">
       `;
        modalImage.innerHTML = modalImageHTML;
      })
      .catch((err) => console.log(err));
  }
};

const utility = {
  getMoviesByPage(page) {
    // 當 page = 1 -> return movies 0 - 11
    // page 2 -> movies 12 - 23
    // page 3 -> movies 24 - 35
    // 以此類推...
    const data = model.showKeywordMovie.length
      ? model.showKeywordMovie
      : model.movies;
    const startIndex = (page - 1) * model.MOVIES_PER_PAGE;
    const endIndex = startIndex + model.MOVIES_PER_PAGE; // slice endIndex不會算在內
    return data.slice(startIndex, endIndex);
  }
};

const controller = {
  getMoviesData() {
    axios
      .get(INDEX_URL)
      .then((response) => {
        model.movies.push(...response.data.results);
        view.renderPaginator(model.movies.length);
        view.renderMovieList(utility.getMoviesByPage(model.currentPage));
      })
      .catch((err) => console.log(err));
  },

  addToFavorite(id) {
    const favoriteList =
      JSON.parse(localStorage.getItem("favoriteMovies")) || [];
    const movie = model.movies.find((movie) => movie.id === id);
    if (favoriteList.some((movie) => movie.id === id)) {
      return alert("此電影已加入清單！");
    }
    favoriteList.push(movie);
    localStorage.setItem("favoriteMovies", JSON.stringify(favoriteList));
  },

  changeDisplayMode(displayMode) {
    if (dataPanel.dataset.mode === displayMode) return;
    dataPanel.dataset.mode = displayMode;
  }
};

controller.getMoviesData();

paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;

  const page = Number(event.target.dataset.page);
  model.currentPage = page;
  view.renderMovieList(utility.getMoviesByPage(model.currentPage));
});
// dataPanel.addEventListener('click', event => {
//   console.error('Error')
//   // 如果在這裡是用匿名函示，當點擊到More時，打開DevTools的Console會顯示“Error (anonymous)”
//   // 但是如果如上，有將函式命名的話，就會顯示“Error (onPanelClicked)”
//   // 因此命名對於將來除錯時，會比較方便好找。
// })

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    view.showMovieLModal(Number(event.target.dataset.id))
    console.log(event.target);
  } else if (event.target.matches(".btn-add-favorite")) {
    controller.addToFavorite(Number(event.target.dataset.id));
  }
});

// searchForm如果submit改成input，會變成輸入什麼就搜尋什麼
searchForm.addEventListener("submit", function onSearchFormSubmit(event) {
  // 請瀏覽器不要做預設動作，把控制權交給javascript => submit的預設事件會重新整理頁面
  event.preventDefault();
  const originalKeyword = searchInput.value;
  const keyword = searchInput.value.trim().toLowerCase();
  // trim() => 把字串前後的空白都去掉
  // toLowerCase() => 把所有的字變成小寫

  // 方法一：for迴圈
  // for (const movie of movies)
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     showKeywordMovie.push(movie)
  //   }
  // }

  // 方法二：filter
  model.showKeywordMovie = [];
  // 每次搜尋時就先清空showKeywordMovie，再把下面filter過後的的movie丟進去
  model.currentPage = 1;
  // 重置 currentPage為1，這樣才能確保新的搜索結果會從第一頁開始顯示

  model.showKeywordMovie.push(
    ...model.movies.filter((movie) => {
      return movie.title.toLowerCase().includes(keyword);
    })
  );
  // 如果打空白鍵或是沒有輸入任何字 -> 會跳出警語
  if (!keyword.trim()) {
    return alert("Please enter a valid string.");
  }

  // 如果打空白鍵或是沒有輸入任何字 -> 還是會顯示全部的movie list
  if (!model.showKeywordMovie.length) {
    return alert(`Cannot find any movie with keyword : ${originalKeyword}`);
  }
  view.renderPaginator(model.showKeywordMovie.length);
  view.renderMovieList(utility.getMoviesByPage(model.currentPage));
});

cardModeSwitch.addEventListener("click", function onSwitchClicked(event) {
  if (event.target.matches("#card-mode-button")) {
    controller.changeDisplayMode("card-mode");
    view.renderMovieList(utility.getMoviesByPage(model.currentPage));
  } else {
    controller.changeDisplayMode("list-mode");
    view.renderMovieList(utility.getMoviesByPage(model.currentPage));
  }
});

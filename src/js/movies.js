import axios from 'axios';
import Notiflix from 'notiflix';
import { debounce } from 'lodash';

const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('.search-form__input');
const galleryElement = document.querySelector('.gallery');
const paginationContainer = document.querySelector('.pagination');
const loader = document.getElementById('loader'); // Added loader element

let lastQuery = null;
let page = 1;
let totalPages = 0;
let trendingMovies = [];

const apiKey = 'd1ba1e64f9d6a08c9b908b32af105306';
const baseURL = 'https://api.themoviedb.org/3';
const trendingEndpoint = '/discover/movie';

// Show loader function
function showLoader() {
  loader.classList.remove('loader_ishidden');
}

// Hide loader function
function hideLoader() {
  loader.classList.add('loader_ishidden');
}

async function fetchMovies(query, page) {
  showLoader();

  try {
    const response = await axios.get(`${baseURL}/search/movie`, {
      params: {
        api_key: apiKey,
        query: query,
        page: page,
      },
    });

    totalPages = response.data.total_pages;

    if (response.data.results.length === 0) {
      Notiflix.Notify.failure(
        `Sorry, there are no movies matching your search query. Please try again.`,
        {
          position: 'right-top',
        }
      );

      return fetchSuggestedMovies();
    } else if (page === 1) {
      Notiflix.Notify.success(
        `Hooray! We found ${response.data.total_results} movies.`,
        {
          position: 'right-top',
        }
      );
    }

    return response.data.results.slice(0, 9);
  } catch (error) {
    console.error(error);
    return [];
  } finally {
    hideLoader();
  }
}

async function fetchTrendingMovies(page) {
  showLoader();

  try {
    const response = await axios.get(`${baseURL}${trendingEndpoint}`, {
      params: {
        api_key: apiKey,
        page: page,
      },
    });

    totalPages = response.data.total_pages;

    if (response.data.results.length === 0) {
      Notiflix.Notify.failure(
        `Sorry, there are no trending movies available.`,
        {
          position: 'right-top',
        }
      );
    } else {
      Notiflix.Notify.success(
        `Currently viewing Page no. ${page} of trending.`,
        {
          position: 'right-top',
        }
      );
    }

    return response.data.results.slice(0, 9);
  } catch (error) {
    console.error(error);
    return [];
  } finally {
    hideLoader();
  }
}

async function fetchSuggestedMovies() {
  showLoader();

  const randomPage = Math.floor(Math.random() * 10) + 1;

  try {
    const response = await axios.get(`${baseURL}/movie/popular`, {
      params: {
        api_key: apiKey,
        page: randomPage,
      },
    });

    if (response.data.results.length === 0) {
      Notiflix.Notify.failure(
        `Sorry, there are no suggested movies available.`,
        {
          position: 'right-top',
        }
      );
    } else {
      Notiflix.Notify.success(`Displaying suggested movies.`, {
        position: 'right-top',
      });
    }

    return response.data.results.slice(0, 9);
  } catch (error) {
    console.error(error);
    return [];
  } finally {
    hideLoader();
  }
}

async function updateGallery(movieData) {
  let movieHTML = '';

  for (const movie of movieData) {
    const movieRating = movie.vote_average;
    const posterSrc = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : '';

    const genres = await fetchMovieGenres(movie.id);

    movieHTML += `
      <a class="gallery__item" href="#">
        <div class="gallery__rating" style="background-color: ${getRatingColor(
          movieRating
        )}">${Math.round(Number(movieRating) * 10) / 10}</div>
        <figure class="gallery__figure">
          <div class="gallery__img" style="background-image: url(${posterSrc}); ${
      movie.poster_path
        ? ''
        : 'background-color: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; text-decoration: none;'
    }">
            ${
              movie.poster_path
                ? '' // If there's a poster, show nothing extra
                : 'No poster available'
            }
          </div>
          <figcaption class="gallery__figcaption">
            <div class="gallery__caption">
            ${movie.title.toUpperCase()}<br>
            <span class="gallery__genres">${genres
              .slice(0, 2)
              .join(', ')} | ${movie.release_date.substring(0, 4)}
            </span>
            </div>
          </figcaption>
        </figure>
      </a>`;
  }

  galleryElement.innerHTML = movieHTML;

  if (totalPages > 1) {
    createPagination();
  } else {
    paginationContainer.innerHTML = '';
  }
}

async function fetchMovieGenres(movieId) {
  try {
    const response = await axios.get(`${baseURL}/movie/${movieId}`, {
      params: {
        api_key: apiKey,
      },
    });

    const genres = response.data.genres.map(genre => genre.name);
    return genres;
  } catch (error) {
    console.error(error);
    return [];
  }
}

function createPagination() {
  let paginationHTML = '';

  const maxPages = Math.min(totalPages, 20);

  paginationHTML += `<button class="pagination__button" data-page="${Math.max(
    1,
    page - 1
  )}">&laquo;</button>`;

  if (page <= 3) {
    for (let i = 1; i <= Math.min(maxPages, 5); i++) {
      paginationHTML += `<button class="pagination__button" data-page="${i}">${i}</button>`;
    }
  } else {
    for (
      let i = Math.max(1, page - 2);
      i <= Math.min(page + 2, totalPages);
      i++
    ) {
      paginationHTML += `<button class="pagination__button" data-page="${i}">${i}</button>`;
    }
  }

  paginationHTML += `<button class="pagination__button" data-page="${Math.min(
    totalPages,
    page + 1
  )}">&raquo;</button>`;

  paginationContainer.innerHTML = paginationHTML;

  const paginationButtons = document.querySelectorAll('.pagination__button');

  paginationButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const selectedPage = parseInt(button.getAttribute('data-page'));

      if (isNaN(selectedPage)) {
        page = selectedPage;
      } else {
        page = selectedPage;
      }

      try {
        if (lastQuery === null || lastQuery.trim() === '') {
          trendingMovies = await fetchTrendingMovies(page);
          updateGallery(trendingMovies);
        } else {
          const movieData = await fetchMovies(lastQuery, page);
          updateGallery(movieData);
        }
      } catch (error) {
        console.error(error);
      }
    });
  });

  handlePagination();
}

function handlePagination() {
  paginationContainer
    .querySelectorAll('.pagination__button')
    .forEach(button => {
      const pageNum = parseInt(button.getAttribute('data-page'));
      if (!isNaN(pageNum) && pageNum === page) {
        button.classList.add('active');
        button.setAttribute('disabled', 'true');
      } else {
        button.classList.remove('active');
        button.removeAttribute('disabled');
      }
    });
}

const debouncedSearch = debounce(async function () {
  const query = searchInput.value;

  if (query.trim() === '') {
    Notiflix.Notify.info('Please write a movie name in the search box.', {
      position: 'right-top',
    });
    return;
  }

  if (query === lastQuery) {
    return;
  } else {
    galleryElement.innerHTML = '';
  }

  lastQuery = query;
  page = 1;

  const movieData = await fetchMovies(query, page);
  updateGallery(movieData);
}, 300);

window.addEventListener('load', async () => {
  trendingMovies = await fetchTrendingMovies(page);
  updateGallery(trendingMovies);
});

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  debouncedSearch();
});

function getRatingColor(rating) {
  if (Number(rating) < 5) {
    return '#e64747';
  } else if (Number(rating) < 6.5) {
    return '#e09c3b';
  } else if (Number(rating) < 7.5) {
    return '#e6e22e';
  } else {
    return '#8fb935';
  }
}

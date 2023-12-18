import './js/team-load-to-modal';
import './js/changer-theme';
import axios from 'axios';

document.addEventListener('DOMContentLoaded', async function () {
  const apiKey = 'd1ba1e64f9d6a08c9b908b32af105306';
  const baseURL = 'https://api.themoviedb.org/3';
  const localStorageKeyWatched = 'watched';
  const localStorageKeyQueue = 'queue';

  async function getMovieDetails(movieId) {
    try {
      const response = await axios.get(`${baseURL}/movie/${movieId}`, {
        params: {
          api_key: apiKey,
        },
      });
      return response.data.title;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      return null;
    }
  }

  function removeMovieAndUpdateList(movieId, localStorageKey, containerId) {
    // Remove the movie from local storage
    const storedMovies =
      JSON.parse(localStorage.getItem(localStorageKey)) || [];
    const updatedMovies = storedMovies.filter(id => id !== movieId);
    localStorage.setItem(localStorageKey, JSON.stringify(updatedMovies));

    // Update the movie list on the page based on the active tab
    if (containerId === 'watchedListContainer') {
      generateMovieList(updatedMovies, containerId);
    } else if (containerId === 'queueListContainer') {
      generateMovieList(updatedMovies, containerId);
    }
  }

  async function generateMovieList(movieIds, containerId) {
    const movieListContainer = document.getElementById(containerId);

    if (!movieListContainer) {
      console.error(`Container with id ${containerId} not found.`);
      return;
    }

    // Clear existing list
    const existingList = movieListContainer.querySelector('ol');
    if (existingList) {
      existingList.remove();
    }

    // Use the title from the HTML
    const sectionTitle =
      movieListContainer.querySelector('h2')?.textContent || '';

    if (movieIds.length === 0) {
      // Only add the "No movies found" message if the list is not empty
      if (movieListContainer.querySelector('p') === null) {
        const noMoviesParagraph = document.createElement('p');
        noMoviesParagraph.textContent = `No ${sectionTitle || 'movies'} found.`;
        movieListContainer.appendChild(noMoviesParagraph);
      }
    } else {
      const ol = document.createElement('ol');

      for (let index = 0; index < movieIds.length; index++) {
        const movieId = movieIds[index];
        const movieName = await getMovieDetails(Number(movieId));
        if (movieName) {
          const li = document.createElement('li');
          const span = document.createElement('span');
          span.textContent = movieName;
          li.appendChild(span);

          // Add "x" button for movie removal
          const removeButton = document.createElement('button');
          removeButton.innerHTML = '&#10006;'; // Unicode for "✖"
          removeButton.classList.add('remove-button');

          removeButton.addEventListener('mouseup', event => {
            event.stopPropagation(); // Prevents the button click from propagating to document.body
            const clickedButton = event.target;
            const movieId = clickedButton
              .closest('li')
              .getAttribute('movie-id');
            removeMovieAndUpdateList(
              movieId,
              containerId === 'watchedListContainer'
                ? localStorageKeyWatched
                : localStorageKeyQueue,
              containerId
            );
          });

          li.appendChild(removeButton);

          li.setAttribute('movie-id', movieId);
          ol.appendChild(li);
        }
      }

      movieListContainer.appendChild(ol);
    }
  }

  // Event listener for the "Watched" and "Queue" buttons
  const watchedButton = document.querySelector('[data-watched]');
  const queueButton = document.querySelector('[data-queue]');
  const watchedContainer = document.getElementById('watchedListContainer');
  const queueContainer = document.getElementById('queueListContainer');

  if (watchedButton && queueButton && watchedContainer && queueContainer) {
    // Set initial state (start with Watched container visible)
    watchedButton.classList.add('active');
    watchedContainer.style.display = 'block';
    queueContainer.style.display = 'none';

    // Add event listeners
    watchedButton.addEventListener('click', () => {
      watchedButton.classList.add('active');
      queueButton.classList.remove('active');
      watchedContainer.style.display = 'block';
      queueContainer.style.display = 'none';
      generateMovieList(
        JSON.parse(localStorage.getItem(localStorageKeyWatched)) || [],
        'watchedListContainer'
      );
    });

    queueButton.addEventListener('click', () => {
      queueButton.classList.add('active');
      watchedButton.classList.remove('active');
      queueContainer.style.display = 'block';
      watchedContainer.style.display = 'none';
      generateMovieList(
        JSON.parse(localStorage.getItem(localStorageKeyQueue)) || [],
        'queueListContainer'
      );
    });
  }

  // Set the default view to start with "Watched" movies
  if (watchedButton) {
    watchedButton.click();
  }
});

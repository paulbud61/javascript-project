// Import necessary functions from './movies'
import { fetchMovieDetails, updateModalContent } from './movies';

// Get gallery element
const galleryElement = document.querySelector('.gallery');

// Get modal element
const modal = document.getElementById('info-modal');

// Get the close button element
const closeButton = document.querySelector('.icon-close-1');

// Get the Watched and Queue buttons
const btnWatched = document.getElementById('btnWatched');
const btnQueue = document.getElementById('btnQueue');

// Check if the gallery element exists
if (galleryElement) {
  // Add event listener to the gallery
  galleryElement.addEventListener('click', async function (event) {
    event.preventDefault();

    // Check if the clicked element or its parent has the class 'gallery__item'
    const galleryItem = event.target.closest('.gallery__item');

    if (galleryItem) {
      // Get the movie ID
      const movieId = galleryItem.getAttribute('movie-id');

      // Open the modal with the movie ID
      openModal(movieId);
    }
  });
}

// Add event listener to the close button
closeButton.onclick = function () {
  modal.style.display = 'none';
};

// Add event listener to close the modal when clicking outside of it
window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};

// Function to open the modal and set initial button state
async function openModal(movieId) {
  // Fetch movie details
  const movieDetails = await fetchMovieDetails(movieId);

  // Update the modal content
  await updateModalContent(movieDetails);

  // Set the movieId attribute and display the modal
  modal.setAttribute('data-movie-id', movieId);
  modal.style.display = 'flex';

  // Set the initial state of the buttons based on local storage
  setInitialButtonState();
}

// Function to handle button click events and local storage updates
async function handleButtonClick(buttonType) {
  const currentMovieId = modal.getAttribute('data-movie-id');

  if (!currentMovieId) {
    console.error('Invalid movieId');
    return;
  }

  const key = buttonType === 'watched' ? 'watched' : 'queue';
  const storageData = localStorage.getItem(key);
  const storageArray = storageData ? JSON.parse(storageData) : [];

  if (storageArray.includes(currentMovieId)) {
    // Movie is already in the storage, remove it
    await removeFromLocalStorage(key, currentMovieId);
  } else {
    // Movie is not in the storage, add it
    await addToLocalStorage(key, currentMovieId);
  }

  // Update button text after the action
  setInitialButtonState();
}

// Event listener for the Watched button
btnWatched.addEventListener('click', function () {
  handleButtonClick('watched');
});

// Event listener for the Queue button
btnQueue.addEventListener('click', function () {
  handleButtonClick('queue');
});

// Function to add movie ID to local storage
function addToLocalStorage(key, movieId) {
  const existingData = localStorage.getItem(key);
  const dataArray = existingData ? JSON.parse(existingData) : [];
  dataArray.push(movieId);
  localStorage.setItem(key, JSON.stringify(dataArray));
}

// Function to remove movie ID from local storage
function removeFromLocalStorage(key, movieId) {
  const existingData = localStorage.getItem(key);
  const dataArray = existingData ? JSON.parse(existingData) : [];
  const updatedArray = dataArray.filter(id => id !== movieId);
  localStorage.setItem(key, JSON.stringify(updatedArray));
}

// Function to set the initial state of the buttons based on local storage
function setInitialButtonState() {
  const currentMovieId = modal.getAttribute('data-movie-id');

  // Check if the movie is in the watched list
  const isAlreadyWatched = isMovieInLocalStorage('watched', currentMovieId);

  // Check if the movie is in the queue list
  const isAlreadyInQueue = isMovieInLocalStorage('queue', currentMovieId);

  // Set the initial state of the buttons based on the local storage
  btnWatched.textContent = isAlreadyWatched
    ? 'REMOVE FROM WATCHED'
    : 'ADD TO WATCHED';

  btnQueue.textContent = isAlreadyInQueue
    ? 'REMOVE FROM QUEUE'
    : 'ADD TO QUEUE';
}

// Function to check if a movie ID is in local storage
function isMovieInLocalStorage(key, movieId) {
  const existingData = localStorage.getItem(key);
  const dataArray = existingData ? JSON.parse(existingData) : [];

  // Check if the current movieId is in the local storage array
  const isInLocalStorage = dataArray.includes(movieId);

  return isInLocalStorage;
}

// Initial update of button text based on local storage
setInitialButtonState();

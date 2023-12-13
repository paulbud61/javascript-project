const modal = document.getElementById('info-modal'); // ID-ul modalului
const galleryItems = document.querySelectorAll('.gallery'); // Selectează toate elementele cu clasa "gallery__item"

// Get the <button> element that closes the modal
const closeButton = document.querySelector('.icon-close-1');

// Deschide fereastra modală când se face clic pe orice element cu clasa "gallery__item"
galleryItems.forEach(item => {
  item.addEventListener('click', function () {
    modal.style.display = 'flex';
  });
});
// When the user clicks on the close button, close the modal
closeButton.onclick = function () {
  modal.style.display = 'none';
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};

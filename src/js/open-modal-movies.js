const modal = document.getElementById('info-modal'); // ID-ul modalului

// Get the button that opens the modal
const btn = document.getElementById('myBtn');

// Get the <button> element that closes the modal
const closeButton = document.querySelector('.close-modal-team');

// When the user clicks the button, open the modal
btn.onclick = function () {
  modal.style.display = 'flex';
};

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

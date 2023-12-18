const darkThemeBtn = document.querySelector('.toggle-darktheme-btn');
if (!darkThemeBtn) {
  return;
}
darkThemeBtn.addEventListener('click', () => {
  if (document.body.classList.contains('darkTheme')) {
    onLightTheme();
  } else {
    onDarkTheme();
  }
});

function onLightTheme() {
  document.body.classList.remove('darkTheme');
  darkThemeBtn.textContent = '🌛';
  localStorage.theme = 'light';
}

function onDarkTheme() {
  document.body.classList.add('darkTheme');
  darkThemeBtn.textContent = '☀️';
  localStorage.theme = 'darkTheme';
}

if (localStorage.theme === 'darkTheme') {
  onDarkTheme();
}

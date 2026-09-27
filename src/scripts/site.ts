const search = document.querySelector<HTMLDialogElement>('#search-dialog')!;
const input = document.querySelector<HTMLInputElement>('#search-input')!;
const open = document.querySelector<HTMLButtonElement>('#search-open')!;
// ponytail: four posts fit inline; move to a separate search index if HTML size becomes material.
const rows = [...document.querySelectorAll<HTMLElement>('#search-results li')];
function filter() {
  const query = input.value.trim().toLocaleLowerCase();
  let count = 0;
  for (const row of rows) {
    row.hidden = !row.dataset.search!.includes(query);
    if (!row.hidden) count++;
  }
  document.querySelector('#search-count')!.textContent = `${count} 篇文章`;
  document.querySelector<HTMLElement>('#search-empty')!.hidden = count !== 0;
}
open.hidden = false;
open.addEventListener('click', () => {
  search.showModal();
  input.focus();
  filter();
});
input.addEventListener('input', filter);
const themeButton = document.querySelector<HTMLButtonElement>('#theme-toggle')!;
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
const dark = () =>
  document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === 'dark'
    : systemTheme.matches;
function themeLabel() {
  themeButton.textContent = dark() ? '淺色' : '深色';
  themeButton.setAttribute('aria-label', dark() ? '切換淺色模式' : '切換深色模式');
}
themeButton.hidden = false;
themeLabel();
systemTheme.addEventListener('change', themeLabel);
themeButton.addEventListener('click', () => {
  const theme = dark() ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem('ken-theme', theme);
  } catch {}
  themeLabel();
});
const zoom = document.querySelector<HTMLDialogElement>('#image-dialog')!;
const largeImage = document.querySelector<HTMLImageElement>('#zoom-image')!;
for (const image of document.querySelectorAll<HTMLImageElement>('.prose img')) {
  if (image.closest('a')) continue;
  const button = document.createElement('button');
  button.className = 'image-zoom';
  button.type = 'button';
  button.setAttribute('aria-label', `放大圖片：${image.alt || '文章圖片'}`);
  image.replaceWith(button);
  button.append(image);
  button.addEventListener('click', () => {
    largeImage.src = image.currentSrc || image.src;
    largeImage.alt = image.alt;
    zoom.showModal();
  });
}

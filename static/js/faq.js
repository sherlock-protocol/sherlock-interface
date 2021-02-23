import Collapser from "./class/Collapser.js"
window.addEventListener('DOMContentLoaded', (event) => {
  document.querySelectorAll('[collapsed]').forEach((item, i) => {
    new Collapser(item);
  });
});
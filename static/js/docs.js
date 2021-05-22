window.addEventListener('DOMContentLoaded', () => {
  let els = document.querySelectorAll('[data-docs]');
  els.forEach(item => {
    var btn = document.createElement("A");
    btn.innerHTML = "?";
    btn.classList.add('docs');
    btn.href = window.settings.docsBaseUrl + item.getAttribute('data-docs');
    btn.target = "_blank";
    item.appendChild(btn);
  });

});
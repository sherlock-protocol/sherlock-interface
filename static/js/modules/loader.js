window.app.addLoader = (el, msg, size) => {
  if(!el) return;
  let template = document.createElement('div');
  template.classList.add('loader');
  template.classList.add('loader-' + size);
  template.innerHTML = `
    <img class="moon" src="/static/img/moon.svg"/>
    <img class="doge" src="/static/img/doge.svg"/>
    ${msg ? app.parse`<p>${msg}</p>` : ''}
  `;

  el.oldPos = window.getComputedStyle(el).position;
  el.style.position = "relative";

  el.appendChild(template);
};

window.app.removeLoader = (el) => {
  if(!el) return;
  let template = el.querySelector('.loader');
  el.style.position = el.oldPos;
  if(template) template.remove(template);
};
window.app.addLoader = (el, msg, size) => {
  console.log(msg);
  let template = document.createElement('div');
  template.classList.add('loader');
  template.classList.add('loader-' + size);
  template.innerHTML = `
    <img class="moon" src="/static/img/moon.svg"/>
    <img class="doge" src="/static/img/doge.svg"/>
    <p>${msg}</p>
  `;

  el.oldPos = window.getComputedStyle(el).position;
  el.style.position = "relative";

  el.appendChild(template);
};

window.app.removeLoader = (el) => {
  let template = el.querySelector('.loader');
  el.style.position = el.oldPos;
  if(template) template.remove(template);
};
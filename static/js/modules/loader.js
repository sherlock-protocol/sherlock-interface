window.app.addLoader = (el, msg) => {
  let template = document.createElement('div');
  template.classList.add('loader');
  template.innerHTML = `
    <img class="moon" src="/static/img/moon.svg"/>
    <img class="doge" src="/static/img/doge.svg"/>
    <p>${msg}</p>
  `;
  el.appendChild(template);
};

window.app.removeLoader = (el) => {
  let template = el.querySelector('.loader');
  template.remove(template);
};
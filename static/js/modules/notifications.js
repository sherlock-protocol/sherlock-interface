window.app.notify = (title, msg, type, action) => {
  let template = document.createElement('div');
  template.classList.add('notification');
  template.classList.add(type);
  template.innerHTML = app.parse `
    <div class="notification__meta">
      <h4>${title}</h4>
      <p>${msg}</p>
    </div>
    <div class="notification__meta">
      
    </div>
    <button class="button alt">Close</button>
    <div class="notification__timer">
      
    </div>
  `;

  document.body.appendChild(template);

  template.querySelector('button').addEventListener('click', () => {
    template.classList.remove('in');
    setTimeout(() => {
      template.remove(template);
    }, 1000);
  })

  setTimeout(() => {
    template.classList.add('in');
  }, 10);

  setTimeout(() => {
    template.querySelector('.notification__timer').classList.add('hidden');
    template.classList.remove('in');
    setTimeout(() => {
      template.remove(template);
    }, 1000);
  }, 5000);
};
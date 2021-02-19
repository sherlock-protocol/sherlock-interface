window.app.notify = (title, msg, type, action) => {
  let template = document.createElement('div');
  template.classList.add('notification');
  console.log(msg);
  template.innerHTML = app.parse`
    <div class="notification__meta">
      <h4>${title}</h4>
      <p>${msg}</p>
    </div>
    <div class="notification__meta">
      
    </div>
    <div class="notification__timer">
      
    </div>
  `;

  document.body.appendChild(template);

  setTimeout(() => {
    template.classList.add('in');
  }, 10);

  setTimeout(() => {
    template.querySelector('.notification__timer').classList.add('hidden');
    template.classList.remove('in');
  }, 5000);
};
class NotificationCenter {
  constructor() {
    this.notifications = [];
    this.el = document.querySelector('.notification-center')
    window.app.notify = this.notify;
  }

  notify = (title, msg, type) => {
    let template = document.createElement('div');
    template.classList.add('notification');
    if (type) {
      template.classList.add(type);
    }
    template.innerHTML = app.parse `
        <div class="notification__meta">
          <h4>${title}</h4>
          <p>${msg}</p>
        </div>
        <button class="button purp">Close</button>
        <div class="notification__timer"></div>
      `;

    this.el.appendChild(template);

    template.querySelector('button').addEventListener('click', () => {
      this.delete(template);
    });

    setTimeout(() => {
      template.classList.add('in');
    }, 1);

    setTimeout(() => {
      this.delete(template);
    }, 5000);
  }

  delete = template => {
    template.querySelector('.notification__timer').classList.add('hidden');
    template.classList.remove('in');
    template.classList.add('out');
    setTimeout(() => {
      template.remove(template);
    }, 300);
  }


}

window.notificationCenter = new NotificationCenter;
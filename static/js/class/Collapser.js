export default class Collapser {
  constructor(el) {
    this.el = el;
    el.querySelector('h4').addEventListener('click', () => {
      if(el.getAttribute('collapsed') ==="false") {
        this.close();
      } else {
        this.open();
      }
    })
  }
  open() {
    this.el.setAttribute('collapsed', false);
  }
  close() {
    this.el.setAttribute('collapsed', true);

  }
}
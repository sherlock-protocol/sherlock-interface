export default class Collapser {
  constructor(el) {
    this.el = el;
    el.querySelector('h4').addEventListener('click', () => {
      console.log(el);
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
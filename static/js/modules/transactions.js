class TransactionsCenter {
  constructor(el) {
    this.el = el;
    this.transactions = [];
  }
  
  merge(options) {
    this.el.parentNode.classList.remove('hidden');
    let transaction =  this.el.querySelector(`[data-hash="${options.description}"]`);
    if(!transaction) {
      this.transactions.push(options);
      let template = app.parse`
      <li status="${options.status}" data-hash=${options.description}>
        <p>${options.title}</p>
        <a href="https://${window.settings.network}.etherscan.io/tx/${options.description}" target="_blank">${window.app.formatHash(options.description)}</a>
        <span>${window.app.formatDate(options.timestamp)}</span>
      </li>`;
      this.el.innerHTML += template;
      // this.el.appendChild(template);
    } else {
      let time = '';
      
      transaction.setAttribute('status', options.status);
    }
  }
}
window.transactionCenter = new TransactionsCenter(document.querySelector('#transactionBlock ul'));
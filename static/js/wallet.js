window.addEventListener('DOMContentLoaded', (event) => {
  if (ethereum) {
    var provider = new _ethers.providers.Web3Provider(web3.currentProvider);
  } else {
    app.notify("Error", "MetaMask is not installed");
  }

  let walletButtonEl = document.querySelector('a#walletConnect');
  let walletNameEl = document.querySelector('#walletName');
  let fundsBlock = document.querySelector('#fundsBlock');
  let stakeForm = document.querySelector('#stakeForm');

  let connectWallet = e => {
    e.preventDefault();
    app.addLoader(document.body, "Waiting for wallet");
    let wallet = ethereum.request({
      method: 'eth_requestAccounts'
    }).then(accounts => {
      app.removeLoader(document.body);
      enableWallet(accounts)
    }).catch(err => {
      app.removeLoader(document.body);
      app.notify("Error", err.message);
    })
  }

  let enableWallet = accounts => {
    if (accounts && accounts.length) {
      let wallet = accounts[0];

      window.app.setCookie('wallet', wallet, 60);
      walletButtonEl.classList.add('hidden');
      walletNameEl.innerText = wallet;
      walletNameEl.classList.remove('hidden');
      if (stakeForm && stakeForm.classList.contains('hidden')) {
        stakeForm.classList.remove('hidden');
      }
      if (fundsBlock && fundsBlock.classList.contains('hidden')) {
        fundsBlock.classList.remove('hidden');
        window.helpers.contract.fetchFunds();
      }
    } else {
      app.notify("Error", "No active accounts found.")
    }
  }

  let disableWallet = () => {
    window.app.setCookie('wallet', "None", 60);
    walletButtonEl.classList.remove('hidden');
    walletNameEl.innerText = "";
    walletNameEl.classList.add('hidden');
    if (stakeForm)
      stakeForm.classList.add('hidden');
    if (fundsBlock)
      fundsBlock.classList.add('hidden');
  }

  ethereum.on('accountsChanged', function(accounts) {
    if (accounts && !accounts.length) {
      disableWallet();
    }
  })
  provider.listAccounts().then(accounts => {
    if (accounts && accounts.length)
      enableWallet(accounts)
  });
  walletButtonEl.addEventListener('click', connectWallet)
});
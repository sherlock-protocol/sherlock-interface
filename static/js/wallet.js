window.addEventListener('DOMContentLoaded', (event) => {
  if (ethereum) {
    var provider = new _ethers.providers.Web3Provider(web3.currentProvider);
  } else {
    app.notify("Error", "MetaMask is not installed");
  }

  let walletButtonEl = document.querySelector('a#walletConnect');
  let walletNameEl = document.querySelector('#walletName');

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
    });
  }

  let enableWallet = accounts => {
    if (accounts && accounts.length) {
      let wallet = accounts[0];
      window.app.setCookie('wallet', wallet, 60);

      walletButtonEl.classList.add('hidden');
      walletNameEl.innerText = window.app.formatHash(wallet);
      walletNameEl.classList.remove('hidden');

    } else {
      app.notify("Error", "No active accounts found.")
    }
  }

  let disableWallet = () => {
    window.app.setCookie('wallet', "None", 60);
    walletButtonEl.classList.remove('hidden');
    walletNameEl.innerText = "";
    walletNameEl.classList.add('hidden');
  }

  ethereum.on('accountsChanged', function(accounts) {
    if (accounts && !accounts.length) {
      disableWallet();
    }
  });
  
  provider.listAccounts().then(accounts => {
    if (accounts && accounts.length) {
      enableWallet(accounts)
    } else {
      console.log(window.app.getCookie('wallet'));
      if (window.app.getCookie('wallet') !== "None") {
        console.log('none');
        window.app.setCookie('wallet', 'None', 60);
        location.href = "";
      } else {
        disableWallet();
      }
    }
  });
  if (walletButtonEl)
    walletButtonEl.addEventListener('click', connectWallet)
});
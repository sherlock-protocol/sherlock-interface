window.addEventListener('DOMContentLoaded', (event) => {
  if (typeof web3 !== 'undefined') {
    if (web3.currentProvider.isMetaMask === true) {
      var provider = new _ethers.providers.Web3Provider(window.ethereum);
    } else {
      app.notify("Error", "MetaMask is not installed");
    }
  }

  if (provider) {
    (async () => {
      let chainid = await provider.network;
      provider.ready.then(resp => {
        if (resp.chainId !== window.settings.chainid) {
          app.notify("Network error", `Please connect metamask to the ${window.settings.network} network`);
        }
      })
    })()
  } else {
    app.notify("Please install MetaMask", "If you want to interact with the app, please install metamask and connect your wallet.");
  }


  let walletButtonEl = document.querySelector('a#walletConnect');
  let walletNameEl = document.querySelector('#walletName');

  let connectWallet = e => {
    e.preventDefault();
    app.addLoader(document.body, "Waiting for Wallet");
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

  let enableWallet = (accounts, force) => {
    if (accounts && accounts.length) {
      let wallet = accounts[0];
      window.app.setCookie('wallet', wallet, 60);
      if (force) location.href = location.href;


    } else {
      app.notify("Error", "No active accounts found.")
    }
  }

  let disableWallet = force => {
    window.app.setCookie('wallet', "None", 60);
    if (force) location.href = location.href;
  }

  setTimeout(() => {
    ethereum.on('accountsChanged', function(accounts) {
      if (accounts && !accounts.length) {
        disableWallet(true);
      } else {
        enableWallet(accounts, true);
      }
    });
  }, 1000);

  provider.listAccounts().then(accounts => {
    if (accounts && accounts.length) {
      enableWallet(accounts)
    } else {
      if (window.app.getCookie('wallet') !== "None") {
        window.app.setCookie('wallet', 'None', 60);
        location.href = "";
      } else {
        disableWallet();
      }
    }
  });

  window.ethereum.on('chainChanged', function(networkId) {
    location.href = "";
  });

  if (walletButtonEl)
    walletButtonEl.addEventListener('click', connectWallet)
});
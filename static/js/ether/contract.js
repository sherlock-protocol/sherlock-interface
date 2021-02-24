window.addEventListener('DOMContentLoaded', (event) => {
  let provider = _ethers.getDefaultProvider({
    name: window.settings.network.toLowerCase(),
    chainId: parseInt(window.settings.chainid),
  });

  let status = {
    funds: false,
    withdraw: false,
  };
  
  window.helpers.contract = {
    processFundsBlock: () => {
      if (status.funds && status.withdraw)
        app.removeLoader(document.querySelector("#fundsBlock"), "Waiting for wallet");
    },
    fetchContract: () => {
      let abi = fetch('/static/json/abi/pool.json')
        .then(response => response.json())
        .then(abi => {
          let contract = new _ethers.Contract(window.settings.pool_address, abi, provider);
          let signer = new _ethers.providers.Web3Provider(window.ethereum).getSigner()
          window.contractWithSigner = contract.connect(signer);

          window.contract = contract;
          if (app.getCookie("wallet") !== 'None' && document.querySelector("#fundsBlock")) {
            app.addLoader(document.querySelector("#fundsBlock"), "Loading funds...", "small");
            window.helpers.contract.fetchFunds(window.helpers.contract.processFundsBlock);
            window.helpers.contract.stakesWithdraw(window.helpers.contract.processFundsBlock);
          }
        });
    },
    fetchFunds: (cb) => {
      window.contract.getFunds(app.getCookie('wallet'))
        .then(response => {
          document.querySelector('#fundsTotal').innerHTML = app.parse`$${app.currency(response)}`
          status.funds = true;
          cb();
        })
        .catch(err => {
          console.log(err);
        });
    },
    stakesWithdraw: (cb) => {
      window.contract.stakesWithdraw(app.getCookie('wallet'))
        .then(response => {
          status.withdraw = true;
          document.querySelector('#fundsAvailable').innerHTML = app.parse`$${app.currency(response.stake)}`
          cb();
        })
        .catch(err => {
          console.log(err);
        })
    }
  };

  window.helpers.contract.fetchContract();
});
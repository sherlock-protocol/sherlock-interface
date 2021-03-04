window.addEventListener('DOMContentLoaded', (event) => {
  let provider = _ethers.getDefaultProvider({
    name: window.settings.network.toLowerCase(),
    chainId: parseInt(window.settings.chainid),
  });

  window.insuranceHelpers = {
    fetchContract: (cb) => {
      let abi = fetch('/static/json/abi/Insurance.json')
        .then(response => response.json())
        .then(abi => {
          let insurance = new _ethers.Contract(window.settings.pool_address, abi, provider);
          let signer = new _ethers.providers.Web3Provider(window.ethereum).getSigner()
          window.signedInsurance = insurance.connect(signer);
          cb();
        });
    },
    processFundsBlock: () => {
      if (status.funds && status.withdraw) {
        app.removeLoader(document.querySelector("#fundsBlock"));
        status = {
          funds: false,
          withdraw: false,
        };
      }
    },
    fetchTotalFunds: (cb) => {
      window.signedInsurance.getFunds(app.getCookie('wallet'))
        .then(response => {
          cb(response, "totalFunds");
          let monthly = response.div(100).mul(Math.round(data.apy)).div(12);
          cb(monthly, "monthlyFunds");
        })
        .catch(err => {
          console.log(err);
          notificationCenter.notify("We're deeply sorry.", "Failed to fetch withdrawels, please get in touch if the problem persits!");
        });
    },
    fetchAvailableFunds: (cb) => {
      window.signedInsurance.stakesWithdraw(app.getCookie('wallet'))
        .then(response => {
          cb(response.stake, "availableFunds");
        })
        .catch(err => {
          console.log(err);
          notificationCenter.notify("We're deeply sorry.", "Failed to fetch your stakes, please get in touch if the problem persits!");
        });
    }
  };
});
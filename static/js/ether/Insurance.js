window.addEventListener('DOMContentLoaded', (event) => {
  let provider = _ethers.getDefaultProvider('http://' + window.settings.network.toLowerCase());
  
  window.insuranceHelpers = {
    fetchContract: (cb) => {
      let abi = fetch('/static/json/abi/Insurance.json')
        .then(response => response.json())
        .then(abi => {
          let insurance = new _ethers.Contract(window.settings.pool_address, abi, provider);
          let signer = new _ethers.providers.Web3Provider(window.ethereum).getSigner()
          window.signedInsurance = insurance.connect(signer);
          cb();
        })
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
      window.signedInsurance.getStakerTVL(app.getCookie('wallet'))
        .then(response => {
          cb(response, "totalFunds");
        })
        .catch(err => window.app.catchAll);
    },
    fetchAvailableFunds: (cb) => {
      window.signedInsurance.getWithrawalInitialIndex(app.getCookie('wallet'))
        .then(index => {
          window.signedInsurance.getWithdrawalSize(app.getCookie('wallet'))
          .then(amount => {
            console.log('Start:' + index);
            console.log('Amount:' + amount);
            let withdrawals = [];
            for (var i = parseInt(index); i < amount; i++) {
              let id = i;
              window.signedInsurance.getWithdrawal(app.getCookie('wallet'), i)
              .then(resp => {
                withdrawals.push({
                  id: id,
                  withdrawal: resp
                });
                if(withdrawals.length == amount) {
                  cb(withdrawals);
                }
              });  
            }
            
          });
          // cb(response.stake, "availableFunds");
        })
        .catch(err => {
          console.log(err);
          notificationCenter.notify("We're deeply sorry.", "Failed to fetch your stakes, please get in touch if the problem persits!");
        });
    }
  };
});
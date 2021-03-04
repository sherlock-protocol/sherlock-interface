window.addEventListener('DOMContentLoaded', (event) => {
  let provider = _ethers.getDefaultProvider({
    name: window.settings.network.toLowerCase(),
    chainId: parseInt(window.settings.chainid),
  });

  window.stakeHelpers = {
    fetchContract: (cb) => {
      let abi = fetch('/static/json/abi/Stake.json')
        .then(response => response.json())
        .then(abi => {
          let stake = new _ethers.Contract(window.settings.stake_token, abi, provider);
          let signer = new _ethers.providers.Web3Provider(window.ethereum).getSigner();

          window.signedStake = stake.connect(signer);
          cb();
        });
    },
    allowance: (cb) => {
      window.signedStake.allowance(window.app.getCookie('wallet'), window.settings.pool_address)
        .then(response => {
          cb(response);
        })
        .catch(err => {
          console.log(err);
        });
    },
    approve: (cb) => {
      window.signedStake.approve(settings.pool_address, "0xffffffffffffffffffffffffffffffffffffffffffffffddaf5c3dc719bbfd99")
        .then(pending => {
          cb(pending, 'pending');
          pending.wait()
            .then(response => {
              cb(pending, 'success');
            })
            .catch(err => {
              cb(err, 'failed');
            });
        })
        .catch(err => {
          cb(err, 'failed');
        });
    }
  }
});
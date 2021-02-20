window.addEventListener('DOMContentLoaded', (event) => {
  let setStakeEl = document.querySelector("#setStake");
  let provider = _ethers.getDefaultProvider({
    name: window.settings.network.toLowerCase(),
    chainId: parseInt(window.settings.chainid),
  });

  let contractAddress = window.settings.pool_address;
  let fetchContract = () => {
    let abi = fetch('/static/json/abi/pool.json')
      .then(response => response.json())
      .then(abi => {
        let contract = new _ethers.Contract(window.settings.pool_address, abi, provider);
        window.contract = contract;
      });
  }

  let setStake = () => {
    let form = document.querySelector('form#stakeForm');
    if (form) {
      if (app.validateForm(form)) {
        let amountSmoll = form.querySelector('[name="amount"]').value.toString();
        let amount = _ethers.utils.parseEther(amountSmoll);        
        let provider = new _ethers.providers.Web3Provider(window.ethereum);
        let signer = provider.getSigner()
        let contractWithSigner = contract.connect(signer);
        
        contractWithSigner.stakeFunds(amount)
        .then(pending => {
          app.notify("Your request is pending", "The request was send, it can take some to be processed by the blockchain.")
          pending.wait()
          .then(success => {
            console.log(success);
            app.notify("Your request is processed", "Your stake is processed succesfully")
          })
          .catch(err => {
            app.notify("Your request failed", "The blockchain didnt say aye to your request...", "danger")
            console.log(err);
          })
        })
        .catch(err => {
          app.notify("An error occured", "It seems that you cancelled the MetaMask transaction. Please try again now this time and click the right button fucktard.", "danger")
        })
      } else {
        window.notificationCenter.notify("Warning", "Please fill in the form correctly", "warning");
      }
    }
  }

  fetchContract();
  setStakeEl.addEventListener('click', setStake);
});
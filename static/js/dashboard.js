window.addEventListener('DOMContentLoaded', (event) => {
  let depositEl = document.querySelector("#deposit");
  let withdrawEl = document.querySelector("#withdraw");

  let setStake = () => {
    let form = document.querySelector('form#stakeForm');
    if (form) {
      if (app.validateForm(form)) {
        let amountSmoll = form.querySelector('[name="amount"]').value.toString();
        let amount = _ethers.utils.parseEther(amountSmoll);

        window.contractWithSigner.stakeFunds(amount)
          .then(pending => {
            app.notify("Your request is pending", "The request was send, it can take some to be processed by the blockchain.")
            pending.wait()
              .then(success => {
                window.helpers.contract.fetchFunds(window.helpers.contract.processFundsBlock);
                app.notify("Your request is processed", "Your stake is processed succesfully")
              })
              .catch(err => {
                app.notify("Your request failed", "The blockchain didnt say aye to your request...", "danger")
              })
          })
          .catch(err => {
            app.notify("An error occured", "It seems that you cancelled the MetaMask transaction. Please try again now this time and click the right button fucktard.", "danger")
          })
      } else {
        app.notify("Warning", "Please fill in the form correctly", "warning");
      }
    }
  }
  
  let startWithdraw = () => {
    window.contractWithSigner.claimFunds(app.getCookie('wallet'))
    .then(response => {
      console.log(response);
    })
    .catch(err => console.log)
  }
  
  if (depositEl)
    depositEl.addEventListener('click', setStake);
    
  if (withdrawEl)
    withdrawEl.addEventListener('click', startWithdraw);
});
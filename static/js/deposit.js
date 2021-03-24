import Erc20 from "./ether/Erc20.js"
import Insurance from "./ether/Insurance.js"

window.addEventListener('DOMContentLoaded', () => {
  let tokenErc = null;

  let enableApprove = () => {
    document.querySelector('#approve').classList.remove('hidden');
    document.querySelector('#deposit').classList.add('hidden');
  };

  let enableDeposit = () => {
    document.querySelector('#deposit').classList.remove('hidden');
    document.querySelector('#approve').classList.add('hidden');
  };

  let approveClick = () => {
    app.addLoader(document.body, "Approving, continue in metamask.");
    console.log(tokenErc);
    tokenErc.approve(window.settings.pool_address, _ethers.constants.MaxUint256)
      .then(pending => {
        console.log('pending', pending);
        pending.wait(response => {
          console.log(response);
          enableDeposit();
        });
      });
  }
  
  app.addLoader(document.body, "Checking approval");
  let token = new Erc20(data.token.address, erc => {
    tokenErc = erc;

    erc.allowance(app.getCookie('wallet'), settings.pool_address)
      .then(resp => {
        app.removeLoader(document.body);
        if (resp._hex !== '0x00') {
          enableDeposit();
        } else {
          enableApprove();
        }
      });
  });

  let maxDeposit = () => {
    tokenErc.balanceOf(app.getCookie('wallet'))
      .then(resp => {
        let value = _ethers.utils.formatUnits(resp, data.token.decimals);
        document.querySelector('#deposit input').value = value;
        console.log(value);
      });
  }

  // Approve actions
  document.querySelector('#approve #approveButton').addEventListener('click', approveClick);

  //Deposit actions
  document.querySelector('#deposit #maxButton').addEventListener('click', maxDeposit);
});
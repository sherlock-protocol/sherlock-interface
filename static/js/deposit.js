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
    app.addLoader(document.querySelector('#approve'));
    tokenErc.approve(window.settings.pool_address, _ethers.constants.MaxUint256)
      .then(pending => {
        console.log('pending', pending);
        pending.wait().then(response => {
          app.removeLoader(document.querySelector('#approve'));
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
      .then(balance => {
        let value = _ethers.utils.formatUnits(balance, data.token.decimals);
        document.querySelector('#deposit input').value = parseFloat(value);
      });
  }

  let deposit = () => {
    let value = document.querySelector('#deposit input').value;
    if (!value) {
      app.notify("Fill in a number idiot.", "L2P");
      return;
    }
    app.addLoader(document.querySelector('#deposit'));
    tokenErc.balanceOf(app.getCookie('wallet'))
      .then(balance => {
        let deposit = _ethers.utils.parseUnits(value, data.token.decimals);
        if (deposit.lte(balance)) {
          new Insurance(contract => {
            contract.stake(deposit, app.getCookie('wallet'), data.token.address)
              .then(pending => {
                app.removeLoader(document.querySelector('#deposit'));
                app.addLoader(document.querySelector('#deposit'), 'We will redirect you automatically when the transaction is finished.');

                pending.wait().then(response => {
                  app.removeLoader(document.querySelector('#deposit'));
                  location.href = '/';
                });
              }).catch(err => {
                app.catchAll(err);
                app.removeLoader(document.querySelector('#deposit'));
              });
          })
        } else {
          app.notify('Insufficient funds', 'You a broke person bro, go hard or go home.');
          app.removeLoader(document.querySelector('#deposit'));
        }
      });
  }

  // Approve actions
  document.querySelector('#approve #approveButton').addEventListener('click', approveClick);

  //Deposit actions
  document.querySelector('#deposit #maxButton').addEventListener('click', maxDeposit);
  document.querySelector('#deposit #depositButton').addEventListener('click', deposit);
});
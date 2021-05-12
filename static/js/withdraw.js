import Erc20 from "./ether/Erc20.js"
import Insurance from "./ether/Insurance.js"

window.addEventListener('DOMContentLoaded', () => {
  let tokenErc = null;

  let enableApprove = () => {
    document.querySelector('#approve').classList.remove('hidden');
    document.querySelector('#withdraw').classList.add('hidden');
  };

  let enableDeposit = () => {
    document.querySelector('#withdraw').classList.remove('hidden');
    document.querySelector('#approve').classList.add('hidden');
  };

  let approveClick = () => {
    app.addLoader(document.querySelector('#approve'));
    tokenErc.approve(window.settings.pool_address, _ethers.constants.MaxUint256)
      .then(pending => {
        pending.wait().then(response => {
          app.removeLoader(document.querySelector('#approve'));
          enableDeposit();
        });
      });
  }

  app.addLoader(document.body, "Checking approval");
  let token = new Erc20(data.stake.address, erc => {
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
        let value = _ethers.utils.formatUnits(balance, data.stake.decimals);
        document.querySelector('#withdraw input').value = parseFloat(value);
      });
  }

  let withdraw = () => {
    let value = document.querySelector('#withdraw input').value;
    if(!value) {
      app.notify("In", "Our name is Sherlock. It is our business to know what other people do not know.");
      return;
    }
    
    app.addLoader(document.querySelector('#withdraw'));
    tokenErc.balanceOf(app.getCookie('wallet'))
      .then(balance => {
        let withdraw = _ethers.utils.parseUnits(value, data.stake.decimals);
        if(withdraw.lte(balance)) {
          new Insurance(contract => {
            contract.activateCooldown(withdraw, data.token.address)
            .then(pending => {
              app.removeLoader(document.querySelector('#withdraw'));
              app.addLoader(document.querySelector('#withdraw'), 'We will redirect you automatically when the transaction is finished.');

              pending.wait().then(response => {
                app.removeLoader(document.querySelector('#withdraw'));
                location.href = '/';
              });
            }).catch(err => {
              app.catchAll(err);
              app.removeLoader(document.querySelector('#withdraw'));
            });
          })
        } else {
          app.notify('Insufficient funds', 'You a broke person bro, go hard or go home.');
          app.removeLoader(document.querySelector('#withdraw'));
        }
      });
  }

  // Approve actions
  document.querySelector('#approve #approveButton').addEventListener('click', approveClick);

  //Deposit actions
  document.querySelector('#withdraw #maxButton').addEventListener('click', maxDeposit);
  document.querySelector('#withdraw #withdrawButton').addEventListener('click', withdraw);
});
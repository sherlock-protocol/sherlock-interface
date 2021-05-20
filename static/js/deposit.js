import Erc20 from "./ether/Erc20.js"
import Sherlock from "./ether/Sherlock.js"

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


    tokenErc.balanceOf(app.getCookie('wallet'))
      .then(balance => {
        let value = _ethers.utils.formatUnits(balance, data.token.decimals);
        document.querySelector('#max-available').innerText = parseFloat(value);
      });
  });

  let maxDeposit = () => {
    tokenErc.balanceOf(app.getCookie('wallet'))
      .then(balance => {
        let value = _ethers.utils.formatUnits(balance, data.token.decimals);
        document.querySelector('#deposit input').value = parseFloat(value);
      });
    setTimeout(() => {
      if (data.xrate !== "~")
        calculateEstimate();
    }, 100)
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
          new Sherlock(contract => {
            contract.stake(deposit, app.getCookie('wallet'), data.token.address)
              .then(pending => {

                app.removeLoader(document.querySelector('#deposit'));
                location.href = '/';
              }).catch(err => {
                app.catchAll(err);
                app.removeLoader(document.querySelector('#deposit'));
              });
          })
        } else {
          app.notify('Insufficient funds', 'Our name is Sherlock. It is our business to know what other people do not know.');
          app.removeLoader(document.querySelector('#deposit'));
        }
      });
  }

  let calculateEstimate = () => {
    let amountEl = document.querySelector('[name="amount"]');
    let value = amountEl.value;
    let estimateEl = document.querySelector('#estimate');
    if (!value) {
      estimateEl.innerHTML = '$0,00';
    } else {
      estimateEl.innerHTML = window.app.withdrawalUSD("" + value);
    }
  }

  if(data.xrate && data.xrate !== "~")
    document.querySelector('[name="amount"]').addEventListener('keyup', calculateEstimate);

  // Approve actions
  document.querySelector('#approve #approveButton').addEventListener('click', approveClick);

  //Deposit actions
  document.querySelector('#deposit #maxButton').addEventListener('click', maxDeposit);
  document.querySelector('#deposit #depositButton').addEventListener('click', deposit);
});
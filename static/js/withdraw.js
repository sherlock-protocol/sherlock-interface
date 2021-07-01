import Erc20 from "./ether/Erc20.js"
import Sherlock from "./ether/Sherlock.js"

window.addEventListener('DOMContentLoaded', () => {
  let tokenErc = null;
  let approved = true;

  let enableApprove = () => {
    document.querySelector('#withdraw #type').innerHTML = "Approve";
    document.querySelector('#withdraw #approveButtons').classList.remove('hidden');
    document.querySelector('#withdraw #withdrawButton').classList.add('hidden');
  };

  let enableWithdraw = () => {
    document.querySelector('#withdraw #type').innerHTML = "Stake";
    document.querySelector('#withdraw #withdrawButton').classList.remove('hidden');
    document.querySelector('#withdraw #approveButtons').classList.add('hidden');
  };

  let approveClick = () => {
    let amount = document.querySelector('[name="amount"]').value
    let numb;

    if (amount) {
      numb = _ethers.utils.parseUnits(amount.toString(), data.stake.decimals);
    } else {
      return;
    }
    approve(numb);
  }

  let approveClickMax = () => {
    approve(_ethers.constants.MaxUint256);
  }

  let toggleApproveLoader = state => {
    let loader = document.querySelector("#approval-loader")
    if (state) {
      loader.classList.remove("hidden");
    } else {
      loader.classList.add("hidden");
    }
  }


  app.addLoader(document.body, "Checking approval");
  let token = new Erc20(data.stake.address, erc => {
    tokenErc = erc;

    erc.allowance(app.getCookie('wallet'), settings.pool_address)
      .then(resp => {
        app.removeLoader(document.body);
        if (resp._hex !== '0x00') {
          enableWithdraw();
        } else {
          enableApprove();
        }
      });

    tokenErc.balanceOf(app.getCookie('wallet'))
      .then(balance => {
        let value = _ethers.utils.formatUnits(balance, data.stake.decimals);
        document.querySelector('#max-available').innerText = parseFloat(value);
      });
  });

  let maxDeposit = () => {
    tokenErc.balanceOf(app.getCookie('wallet'))
      .then(balance => {
        let value = _ethers.utils.formatUnits(balance, data.stake.decimals);
        document.querySelector('#withdraw input').value = parseFloat(value);
      });
    setTimeout(() => {
      if (data.xrate !== "~")
        calculateEstimate();
    }, 300);
  }

  let withdraw = () => {
    let value = document.querySelector('#withdraw input').value;
    if (!value) {
      app.notify('Please provide a number.', '');
      return;
    }
    if (!approved) {
      app.notify('The approval is not finished yet.', '');
      return;
    }

    app.addLoader(document.querySelector('#withdraw'));
    tokenErc.balanceOf(app.getCookie('wallet'))
      .then(balance => {
        let withdraw = _ethers.utils.parseUnits(value, data.stake.decimals);
        if (withdraw.lte(balance)) {
          new Sherlock(contract => {
            contract.activateCooldown(withdraw, data.token.address)
              .then(pending => {
                app.removeLoader(document.querySelector('#withdraw'));

                location.href = '/';
              }).catch(err => {
                app.catchAll(err);
                app.removeLoader(document.querySelector('#withdraw'));
              });
          })
        } else {
          app.notify('Insufficient funds', 'Please make sure you have the required funds.');
          app.removeLoader(document.querySelector('#withdraw'));
        }
      });
  }


  let approve = value => {
    tokenErc.approve(window.settings.pool_address, value)
      .then(pending => {
        app.removeLoader(document.querySelector('#approve'));
        toggleApproveLoader(true);
        enableWithdraw();
        approved = false;
        pending.wait().then(response => {
            approved = true;
            toggleApproveLoader(false);
            checkAllowance();
            app.notify("Successful", "Approval ready!", "success");
          })
          .catch(resp => {
            app.removeLoader(document.querySelector('#approve'));
            app.catchAll(resp);
          });
      })
      .catch(resp => {
        app.removeLoader(document.querySelector('#approve'));
        app.catchAll(resp);
      });
  }
  
  let checkAllowance = () => {
    let token = new Erc20(data.stake.address, erc => {
      tokenErc = erc;
      erc.allowance(app.getCookie('wallet'), settings.pool_address)
        .then(resp => {
          let value = _ethers.BigNumber.from(0);
          let amount = document.querySelector('[name="amount"]').value;
          if (amount) {
            let decimals = 0;
            if (amount.split(/[,.]/)[1])
              decimals = amount.split(/[,.]/)[1].length;

            value = _ethers.utils.parseUnits(amount.toString(), data.token.decimals);
          }

          if (resp.gt(_ethers.constants.MaxUint256.div(_ethers.BigNumber.from("2")))) {
            enableWithdraw();
            document.querySelector('#approved').innerHTML = "Unlimited";
            return;
          }
          let approvedAmount = _ethers.utils.formatUnits(resp, data.token.decimals);
          document.querySelector('#approved').innerHTML = parseFloat(approvedAmount);

          if (resp._hex == '0x00' || value.gt(resp)) {
            enableApprove();
          } else {
            enableWithdraw();
          }
        });

      tokenErc.balanceOf(app.getCookie('wallet'))
        .then(balance => {
          let value = _ethers.utils.formatUnits(balance, data.token.decimals);
          document.querySelector('#max-available').innerText = parseFloat(value);
        });
    });
  }

  let calculateEstimate = () => {
    let amountEl = document.querySelector('[name="amount"]');
    let value = amountEl.value;
    let estimateEl = document.querySelector('#estimate');

    if (!value) {
      estimateEl.innerHTML = '$0.00';
    } else {
      estimateEl.innerHTML = window.app.withdrawalUSD("" + value);
    }
    checkAllowance();

  }

  checkAllowance();

  document.querySelector('[name="amount"]').addEventListener('keyup', calculateEstimate);

  // Approve actions
  document.querySelector('#withdraw #approveButton').addEventListener('click', approveClick);
  document.querySelector('#withdraw #approveButtonMax').addEventListener('click', approveClickMax);

  //Deposit actions
  document.querySelector('#withdraw #maxButton').addEventListener('click', maxDeposit);
  document.querySelector('#withdraw #withdrawButton').addEventListener('click', withdraw);
});
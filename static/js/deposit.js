import Erc20 from "./ether/Erc20.js"
import Sherlock from "./ether/Sherlock.js"

window.addEventListener('DOMContentLoaded', () => {
  let tokenErc = null;
  let approved = true;

  let enableApprove = () => {
    document.querySelector('#deposit #type').innerHTML = "Approve";
    document.querySelector('#deposit #approveButton').classList.remove('hidden');
    document.querySelector('#deposit #approveButtonMax').classList.remove('hidden');
    document.querySelector('#deposit #depositButton').classList.add('hidden');
  };

  let enableDeposit = () => {
    document.querySelector('#deposit #type').innerHTML = "Stake";
    document.querySelector('#deposit #depositButton').classList.remove('hidden');
    document.querySelector('#deposit #approveButton').classList.add('hidden');
    document.querySelector('#deposit #approveButtonMax').classList.add('hidden');
  };

  let approveClick = () => {
    let amount = document.querySelector('[name="amount"]').value
    let numb;

    if (amount) {
      numb = _ethers.utils.parseUnits(amount.toString(), data.token.decimals);

    } else {
      return;
    }
    approve(numb);
  }

  let approveClickMax = () => {
    approve(_ethers.constants.MaxUint256);
  }

  let approve = value => {
    tokenErc.approve(window.settings.pool_address, value)
      .then(pending => {
        app.removeLoader(document.querySelector('#approve'));
        toggleApproveLoader(true);
        enableDeposit();
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

  let toggleApproveLoader = state => {
    let loader = document.querySelector("#approval-loader")
    if (state) {
      loader.classList.remove("hidden");
    } else {
      loader.classList.add("hidden");
    }
  }

  let maxDeposit = () => {
    tokenErc.balanceOf(app.getCookie('wallet'))
      .then(balance => {
        let value = _ethers.utils.formatUnits(balance, data.token.decimals);
        document.querySelector('#deposit input').value = parseFloat(value);
      });
    setTimeout(() => {
      calculateEstimate();
      checkAllowance();
    }, 100)
  }

  let deposit = () => {
    let value = document.querySelector('#deposit input').value;
    if (!value) {
      app.notify("Please provide a number.", "");
      return;
    }
    if (!approved) {
      app.notify("The approval is not finished yet.", "");
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
          app.notify('Insufficient funds', 'Please make sure you have the required funds.');
          app.removeLoader(document.querySelector('#deposit'));
        }
      });
  }

  let checkAllowance = () => {
    let token = new Erc20(data.token.address, erc => {
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
          
          if(resp.gt(_ethers.constants.MaxUint256.div(_ethers.BigNumber.from("2")))) {
            enableDeposit();
            document.querySelector('#approved').innerHTML = "Unlimited";
            return;
          }
          let approvedAmount = _ethers.utils.formatUnits(resp, data.token.decimals);
          document.querySelector('#approved').innerHTML = window.app.depositUSD("" + parseFloat(approvedAmount));
          
          if (resp._hex == '0x00' || value.gt(resp)) {
            enableApprove();
          } else {
            enableDeposit();
          }
        });

      tokenErc.balanceOf(app.getCookie('wallet'))
        .then(balance => {
          let value = _ethers.utils.formatUnits(balance, data.token.decimals);
          document.querySelector('#max-available').innerText = window.app.depositUSD("" + parseFloat(value));
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
      estimateEl.innerHTML = window.app.depositUSD("" + value);
    }
    checkAllowance();
  }

  checkAllowance();

  // if (data.xrate && data.xrate !== "~")
    document.querySelector('[name="amount"]').addEventListener('keyup', calculateEstimate);

  // Approve actions
  document.querySelector('#deposit #approveButton').addEventListener('click', approveClick);
  document.querySelector('#deposit #approveButtonMax').addEventListener('click', approveClickMax);

  //Deposit actions
  document.querySelector('#deposit #maxButton').addEventListener('click', maxDeposit);
  document.querySelector('#deposit #depositButton').addEventListener('click', deposit);
});
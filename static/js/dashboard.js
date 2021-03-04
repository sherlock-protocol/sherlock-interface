import erc20 from "./ether/erc20.js"

window.addEventListener('DOMContentLoaded', (event) => {
  let depositEl = document.querySelector("#deposit");
  let withdrawEl = document.querySelector("#withdraw");
  let approveStakeEl = document.querySelector('#approveStake');
  let selectDepositEl = document.querySelector('[name="depositCurrency"]');
  let selectWithdrawEl = document.querySelector('[name="withdrawCurrency"]');
  let approveDepositEl = document.querySelector('#approveDeposit');

  let poolSizeEl = document.querySelector('#poolSize');
  let totalFundsEl = document.querySelector('#totalFunds');

  let activeDepositCoin = null;
  let activeWithdrawCoin = null;

  let depositAmountBlock = document.querySelector('#depositAmountBlock');
  let depositAllowanceBlock = document.querySelector('#allowanceDepositBlock');

  let withdrawAmountBlock = document.querySelector('#depositAmountBlock');
  let withdrawAllowanceBlock = document.querySelector('#allowanceDepositBlock');

  window.dashboard = {
    loadContracts: () => {
      window.insuranceHelpers.fetchContract(window.dashboard.contractsLoaded);
    },
    contractsLoaded: () => {
      if (window.signedInsurance) {
        if (window.app.getCookie('wallet') !== "None") {
          window.dashboard.processStake();
        }
      }
    },
    processStakeAllowance: (response) => {
      if (_ethers.utils.formatEther(response) === "0.0") {
        document.querySelector('#approveStake').classList.remove('hidden');
      } else {
        document.querySelector('#approveStake').classList.add('hidden');
        document.querySelector('#fundsBlock').classList.remove('hidden');
        // document.querySelector('#withdrawForm').classList.remove('hidden');
      }
    },
    allowanceStake: () => {
      window.stakeHelpers.approve(window.dashboard.handleStakeApproval);
    },
    handleStakeApproval: (response, status) => {
      if (status === 'success') {
        app.notify("Note: Great success", "You've succesfully approved us in your Stake wallet");
        window.stakeHelpers.allowance(window.dashboard.processStakeAllowance);
      } else if (status === "failed") {
        app.notify("An error occured", "You denied the approval, this way it just cant work out between us! #TrustIssues", "danger");
      }
      if (response.hash)
        window.transactionCenter.merge({
          title: 'Stake Allowance',
          description: response.hash,
          status: status,
          timestamp: new Date(),
        });
    },
    depositStake: () => {
      let form = document.querySelector('#depositBlock form');
      if (form) {
        if (app.validateForm(form)) {
          let amount = form.querySelector('[name="amount"]').value.toString();
          amount = _ethers.utils.parseUnits(amount);

          window.signedInsurance.stakeFunds(amount)
            .then(pending => {
              window.transactionCenter.merge({
                title: 'Deposit',
                description: pending.hash,
                status: 'pending',
                timestamp: new Date(),
              });
              app.notify("Your request is pending", "The request was send, it can take some to be processed by the blockchain.")
              pending.wait()
                .then(success => {
                  window.dashboard.processStake(success);
                  window.transactionCenter.merge({
                    title: 'Deposit',
                    description: pending.hash,
                    status: 'success',
                    timestamp: new Date(),
                  });
                  app.notify("Your request is processed", "Your stake is processed succesfully")
                })
                .catch(err => {
                  console.log(err);
                  window.transactionCenter.merge({
                    title: 'Deposit',
                    description: pending.hash,
                    status: 'failed',
                    timestamp: new Date(),
                  });
                  app.notify("Your request failed", "The blockchain didnt say aye to your request...", "danger")
                })
            })
            .catch(err => {
              console.log(err);
              app.notify("An error occured", "It seems that you cancelled the MetaMask transaction, do you have the required funds? Or did you cancel the transaction?.", "danger")
            })
        } else {
          app.notify("Warning", "Please fill in the form correctly", "warning");
        }
      }
    },
    processStake: (success) => {
      window.insuranceHelpers.fetchTotalFunds(window.dashboard.renderTotalFunds);
      window.insuranceHelpers.fetchAvailableFunds(window.dashboard.renderFunds);
    },
    renderFunds: (value, elID) => {
      document.querySelector('#fundsBlock').classList.remove('hidden');

      document.querySelector(`#${elID}`).innerHTML = window.app.currency(value, false);
    },
    renderTotalFunds: (value, elID) => {
      let staked = _ethers.BigNumber.from(BigInt(data.staked_funds_big));
      document.querySelector('#fundsBlock').classList.remove('hidden');

      if (elID === 'monthlyFunds') {
        document.querySelector(`#${elID}`).innerHTML = window.app.currency(value, false);
      } else {
        let total = _ethers.BigNumber.from(BigInt(data.staked_funds_big));
        let amount = value;
        console.log("total", total.toString())
        console.log("amount", amount.toString())
        // console.log(userYield);
        let userYield  = amount.mul(data.yield).div(total)
        console.log("total", data.yield.toString());
        console.log("user", userYield.toString());
        setInterval(() => {
          amount = amount.add(userYield)
          // amount =
          // amount = amount.add(amount.mul(percentage+''));
          // console.log(amount);
          totalFundsEl.innerHTML = app.currency(amount);
        }, 50);
      }
    },
    handleDepositTypeSelect: (e) => {
      let value = selectDepositEl.value;
      if (value) {
        selectDepositEl.parentNode.querySelector('img').setAttribute('src', `static/svg/crypto/color/${value}.svg`);
        let erc = new erc20(window.settings.tokens[value], window.dashboard.handleDepositCheckAllowance);
      } else {
        selectDepositEl.parentNode.querySelector('img').setAttribute('src', `static/svg/crypto/color/generic.svg`);
        depositAmountBlock.classList.add('hidden');
        depositAllowanceBlock.classList.add('hidden');
      }
    },
    handleDepositCheckAllowance: (erc20) => {
      depositAmountBlock.classList.add('hidden');
      depositAllowanceBlock.classList.add('hidden');
      activeDepositCoin = erc20;

      erc20.contract.allowance(window.app.getCookie('wallet'), window.settings.pool_address)
        .then(response => {
          if (response._hex === "0x00") {
            window.dashboard.renderAllowanceBlock();
          } else {
            window.dashboard.renderAmountBlock();
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    renderAllowanceBlock: () => {
      depositAllowanceBlock.classList.remove('hidden');
    },
    renderAmountBlock: () => {
      depositAmountBlock.classList.remove('hidden');
    },
    approveDeposit: () => {
      app.addLoader(document.querySelector('#depositBlock'), null, "small");
      activeDepositCoin.contract.approve(settings.pool_address, "0xffffffffffffffffffffffffffffffffffffffffffffffddaf5c3dc719bbfd99")
        .then(pending => {
          window.transactionCenter.merge({
            title: 'Approve',
            description: pending.hash,
            status: 'pending',
            timestamp: new Date(),
          });
          pending.wait()
            .then(response => {
              depositAllowanceBlock.classList.add('hidden');
              depositAmountBlock.classList.remove('hidden');
              app.removeLoader(document.querySelector('#depositBlock'));

              window.transactionCenter.merge({
                title: 'Approve',
                description: response.transactionHash,
                status: 'success',
                timestamp: new Date(),
              });
            })
            .catch(err => {
              app.removeLoader(document.querySelector('#depositBlock'));
              window.transactionCenter.merge({
                title: 'Approve',
                description: err.hash,
                status: 'failed',
                timestamp: new Date(),
              });
            });
        })
        .catch(err => {
          app.removeLoader(document.querySelector('#depositBlock'));
          app.notify("Your request failed", err.message, "danger");
        });
    },
    handleWithdrawTypeSelect: (e) => {
      let value = selectWithdrawEl.value;
      if (value) {
        selectWithdrawEl.parentNode.querySelector('img').setAttribute('src', `static/svg/crypto/color/${value}.svg`);
        let erc = new erc20(window.settings.stake_token, window.dashboard.handleWithdrawCheckAllowance);
      } else {
        selectWithdrawEl.parentNode.querySelector('img').setAttribute('src', `static/svg/crypto/color/generic.svg`);
        depositAmountBlock.classList.add('hidden');
        depositAllowanceBlock.classList.add('hidden');
      }
    },
    handleWithdrawCheckAllowance: (erc20) => {
      depositAmountBlock.classList.add('hidden');
      depositAllowanceBlock.classList.add('hidden');
      activeWithdrawCoin = erc20;

      erc20.contract.allowance(window.app.getCookie('wallet'), settings.pool_address)
        .then(response => {
          if (response._hex === "0x00") {
            window.dashboard.renderAllowanceBlock();
          } else {
            window.dashboard.renderAmountBlock();
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    numbGoUp: () => {
      let staked = _ethers.BigNumber.from(BigInt(data.staked_funds_big));
      setInterval(() => {
        staked = staked.add(_ethers.BigNumber.from(data.yield));
        poolSizeEl.innerHTML = app.currency(staked);
      }, 50);
    }
  };

  window.dashboard.loadContracts();

  if (approveStakeEl)
    approveStakeEl.addEventListener('click', window.dashboard.allowanceStake);

  if (depositEl)
    depositEl.addEventListener('click', window.dashboard.depositStake);

  if (withdrawEl)
    withdrawEl.addEventListener('click', window.dashboard.withdrawStake);

  if (approveDepositEl)
    approveDepositEl.addEventListener('click', window.dashboard.approveDeposit);

  if (selectDepositEl)
    selectDepositEl.addEventListener('change', window.dashboard.handleDepositTypeSelect);

  if (selectWithdrawEl)
    selectWithdrawEl.addEventListener('change', window.dashboard.handleWithdrawTypeSelect);

  if (poolSizeEl)
    window.dashboard.numbGoUp();

});
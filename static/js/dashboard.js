import Table from "./class/Table.js"
import erc20 from "./ether/erc20.js"

window.addEventListener('DOMContentLoaded', (event) => {
  let depositEl = document.querySelector("#deposit");
  let withdrawEl = document.querySelector("#withdraw");
  let approveStakeEl = document.querySelector('#approveStake');
  let selectDepositEl = document.querySelector('[name="depositCurrency"]');
  let selectWithdrawEl = document.querySelector('[name="withdrawCurrency"]');
  let approveDepositEl = document.querySelector('#approveDeposit');
  let depositCalculatedEl =  document.querySelector('#depositCalculated');

  let poolSizeEl = document.querySelector('#poolSize');
  let totalFundsEl = document.querySelector('#totalFunds');
  let monthlyFundsEl = document.querySelector('#monthlyFunds');

  let pendingFundsTable = null;


  let fundsLoop = null;
  let poolLoop = null;
  let activeDepositCoin = null;
  let activeWithdrawCoin = null;
  
  let stakeAmount = null;
  let stakeAmountMinimal = null;

  let depositAmountBlock = document.querySelector('#depositAmountBlock');
  let depositAllowanceBlock = document.querySelector('#allowanceDepositBlock');
  let depositConfirmEl = document.querySelector('#depositConfirm');

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
    calculateStake: () => {
      let form = document.querySelector('#depositBlock form');
      if (app.validateForm(form)) {
        let amount = form.querySelector('[name="amount"]').value.toString();
        amount = _ethers.utils.parseEther(amount);
        let type = settings.tokens[selectDepositEl.value];
        
        window.signedInsurance.stakeFundsCalc(type.address, amount)
        .then(resp => {
          let calculatedStakeEL = document.querySelector('#calculatedStake');
          let minimalStakeEl =  document.querySelector('#minimalStake');
          let calculatedStake  = parseInt(_ethers.utils.formatEther(resp, type.decimals)).toFixed(3);
          let minimalCalculatedStake = (parseInt(calculatedStake) / 100 * 97).toFixed(3);

          stakeAmount = calculatedStake;
          stakeAmountMinimal = minimalCalculatedStake;
          
          calculatedStakeEL.innerHTML = window.app.token(calculatedStake);
          minimalStakeEl.innerHTML = window.app.token(minimalCalculatedStake);
          
          depositAmountBlock.classList.add('hidden');
          depositCalculatedEl.classList.remove('hidden');
        });
      }
    },
    confirmStake: () => {
      let token = settings.tokens[selectDepositEl.value].address;
      let amount = _ethers.BigNumber.from(stakeAmount.split('.')[0]);
      let minOut = _ethers.BigNumber.from(stakeAmountMinimal.split('.')[0]);
      window.signedInsurance.stakeFunds(token, amount, minOut, app.getCookie('wallet'))
      .then(pending => {
        console.log(pending);
        pending.wait(response => {
          console.log(response);
        })
        .catch(err => {
          console.log(err);
        })
      })
      .catch(err => {
        console.log(err);
      })
      
      
          // IERC20 _token,
          // uint256 _amount,
          // uint256 _minOut,
          // address _receiver
    },
    processStake: (success) => {
      window.insuranceHelpers.fetchTotalFunds(window.dashboard.renderTotalFunds);
      window.insuranceHelpers.fetchAvailableFunds(window.dashboard.renderFunds);
    },
    renderFunds: (withdrawals) => {
      console.log('withdraw', withdrawals);
      withdrawals.forEach((item, i) => {
        document.querySelector('#pendingBlock').classList.remove('hidden');
        pendingFundsTable.addRow({
          'countdown': item.withdrawal.blockInitiated,
          'estimatedValue': '"><img src="x">',
          'tokens': item.withdrawal.stake,
        }, item.id);
      });
    },
    renderTotalFunds: (value, elID) => {
      let staked = _ethers.BigNumber.from(BigInt(data.staked_funds_big));
      document.querySelector('#fundsBlock').classList.remove('hidden');

      if (elID === 'monthlyFunds') {
        document.querySelector(`#${elID}`).innerHTML = window.app.currency(value, false);
      } else {
        let total = _ethers.BigNumber.from(BigInt(data.staked_funds_big));
        let amount = value;
        let userYield = amount.mul(data.yield).div(total)

        if (fundsLoop) {
          clearInterval(fundsLoop);
        }

        fundsLoop = setInterval(() => {
          amount = amount.add(userYield)

          totalFundsEl.innerHTML = app.currency(amount);
          monthlyFundsEl.innerHTML = app.currency(amount.div(100).mul(Math.round(data.apy)).div(12));
        }, 50);
      }
    },
    handleDepositTypeSelect: (e) => {
      let value = selectDepositEl.value;
      depositCalculatedEl.classList.add('hidden');
      console.log(value);
      if (value) {
        selectDepositEl.parentNode.querySelector('img').setAttribute('src', `static/svg/crypto/color/${value}.svg`);
        let erc = new erc20(window.settings.tokens[value].address, window.dashboard.handleDepositCheckAllowance);
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
      console.log(erc20);
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
      activeDepositCoin.contract.approve(settings.pool_address, _ethers.constants.MaxUint256)
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
          app.catchAll(err);
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
      if (poolLoop) {
        clearInterval(poolLoop)
      }
      poolLoop = setInterval(() => {
        staked = staked.add(_ethers.BigNumber.from(data.yield));
        poolSizeEl.innerHTML = app.currency(staked);
      }, 50);
    }
  };

  if (approveStakeEl)
    approveStakeEl.addEventListener('click', window.dashboard.allowanceStake);

  if (depositEl)
    depositEl.addEventListener('click', window.dashboard.calculateStake);
    
  if(depositConfirmEl)
    depositConfirmEl.addEventListener('click', window.dashboard.confirmStake);
        
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

  window.dashboard.loadContracts();

  if (document.querySelector('#pendingFundsTable'))
    pendingFundsTable = new Table(document.querySelector('#pendingFundsTable'));

});
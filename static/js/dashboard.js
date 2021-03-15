import Table from "./class/Table.js"
import erc20 from "./ether/erc20.js"
import SafeString from "./modules/helpers.js";

window.addEventListener('DOMContentLoaded', (event) => {
  let depositEl = document.querySelector("#deposit");
  let withdrawEl = document.querySelector("#withdraw");
  let approveStakeEl = document.querySelector('#approveStake');
  let selectDepositEl = document.querySelector('[name="depositCurrency"]');
  let selectWithdrawEl = document.querySelector('[name="withdrawCurrency"]');
  let approveDepositEl = document.querySelector('#approveDeposit');
  let approveWithdrawEl = document.querySelector('#approveWithdraw');
  let depositCalculatedEl = document.querySelector('#depositCalculated');

  let provider = _ethers.getDefaultProvider('http://' + window.settings.network.toLowerCase() + ':8545');
  let poolSizeEl = document.querySelector('#poolSize');
  let totalFundsEl = document.querySelector('#totalFunds');
  let monthlyFundsEl = document.querySelector('#monthlyFunds');

  let pendingFundsTable = null;
  let claimableFundsTable = null;

  let tokenErc = null;

  let fundsLoop = null;
  let poolLoop = null;
  let activeDepositCoin = null;
  let activeWithdrawCoin = null;

  let stakeAmount = null;
  let stakeAmountMinimal = null;

  let depositAmountBlock = document.querySelector('#depositAmountBlock');
  let depositAllowanceBlock = document.querySelector('#allowanceDepositBlock');
  let depositConfirmEl = document.querySelector('#depositConfirm');
  let depositCancelEl = document.querySelector('#depositCancel');
  let withdrawAmountBlock = document.querySelector('#withdrawAmountBlock');
  let withdrawAllowanceBlock = document.querySelector('#allowanceWithdrawBlock');


  window.dashboard = {
    loadContracts: () => {
      window.insuranceHelpers.fetchContract(window.dashboard.contractsLoaded);
    },
    contractsLoaded: () => {
      if (window.signedInsurance) {
        if (window.app.getCookie('wallet') !== "None") {
          window.dashboard.processStake();
          tokenErc = new erc20(window.settings.stake_token, window.dashboard.enableWithdraw);
        }
      }
    },
    processStake: (success) => {
      window.insuranceHelpers.fetchTotalFunds(window.dashboard.renderTotalFunds);
      window.insuranceHelpers.fetchAvailableFunds(window.dashboard.renderFunds);
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
        let token = settings.tokens[selectDepositEl.value];
        amount = _ethers.utils.parseUnits(amount, token.decimals);

        window.signedInsurance.stakeFundsCalc(token.address, amount)
          .then(response => {
            let calculatedStakeEL = document.querySelector('#calculatedStake');
            let minimalStakeEl = document.querySelector('#minimalStake');
            let calculatedStake = parseInt(_ethers.utils.formatEther(response)).toFixed(3);
            let minimalCalculatedStake = (parseInt(calculatedStake) / 100 * 97).toFixed(3);

            stakeAmount = response;
            stakeAmountMinimal = response.mul(3).div(100);

            calculatedStakeEL.innerHTML = window.app.token(calculatedStake);
            minimalStakeEl.innerHTML = window.app.token(minimalCalculatedStake);

            depositAmountBlock.classList.add('hidden');
            depositCalculatedEl.classList.remove('hidden');
          });
      }
    },
    confirmStake: () => {
      let token = settings.tokens[selectDepositEl.value];
      app.addLoader(document.querySelector('#depositBlock'), null, "small");

      window.signedInsurance.stakeFunds(token.address, stakeAmount, stakeAmountMinimal, app.getCookie('wallet'))
        .then(pending => {
          app.removeLoader(document.querySelector('#depositBlock'), null, "small");
          window.dashboard.depositCancel();

          window.transactionCenter.merge({
            title: 'Stake',
            description: pending.hash,
            status: 'pending',
            timestamp: new Date(),
          });
          setTimeout(() => {
            window.insuranceHelpers.fetchTotalFunds(window.dashboard.renderTotalFunds);

          }, 1000)
          pending.wait(response => {
              window.insuranceHelpers.fetchTotalFunds(window.dashboard.renderTotalFunds);

              window.transactionCenter.merge({
                title: 'Stake',
                description: response.transactionHash,
                status: 'success',
                timestamp: new Date(),
              });
            })
            .catch(err => {

              window.transactionCenter.merge({
                title: 'Stake',
                description: err.hash,
                status: 'failed',
                timestamp: new Date(),
              });
            })
        })
        .catch(err => {
          app.removeLoader(document.querySelector('#depositBlock'), null, "small");
          app.catchAll(err);
        })
    },
    renderFunds: (withdrawals) => {
      if (withdrawals && withdrawals.length) {
        provider.getBlockNumber().then(function(blockNumber) {
          console.log('blockNumber', blockNumber);
          withdrawals.forEach((item, i) => {
            let availFrom = parseInt(item.withdrawal.blockInitiated) + data.withdrawInfo[0];
            let availTill = parseInt(item.withdrawal.blockInitiated) + data.withdrawInfo[0] + data.withdrawInfo[1];
            if (blockNumber < availFrom) {
              document.querySelector('#pendingBlock').classList.remove('hidden');
              pendingFundsTable.addRow({
                'countdown': availFrom,
                'estimatedValue': '"><img src="x">',
                'tokens': item.withdrawal.stake,
              }, item.id);
            } else {
              document.querySelector('#claimBlock').classList.remove('hidden');
              claimableFundsTable.addRow({
                'countdown': availTill,
                'estimatedValue': '"><img src="x">',
                'tokens': item.withdrawal.stake,
                'action': new SafeString('<button type="button" name="button">Claim</button>')
              }, item.id);
            }
          });
        });
      }

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
            window.dashboard.renderDepositAllowanceBlock();
          } else {
            window.dashboard.renderDepositAmountBlock();
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    renderDepositAllowanceBlock: () => {
      depositAllowanceBlock.classList.remove('hidden');
    },
    renderDepositAmountBlock: () => {
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
    numbGoUp: () => {
      let staked = _ethers.BigNumber.from(BigInt(data.staked_funds_big));
      if (poolLoop) {
        clearInterval(poolLoop)
      }
      poolLoop = setInterval(() => {
        staked = staked.add(_ethers.BigNumber.from(data.yield));
        poolSizeEl.innerHTML = app.currency(staked);
      }, 50);
    },
    depositCancel: () => {
      depositAmountBlock.classList.remove('hidden');
      depositCalculatedEl.classList.add('hidden');
    },
    enableWithdraw: (erc) => {
      erc.contract.allowance(window.app.getCookie('wallet'), settings.pool_address)
        .then(response => {
          if (response._hex === "0x00") {
            window.dashboard.renderWithdrawAllowanceBlock();
          } else {
            window.dashboard.renderWithdrawAmountBlock();
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    approveWithdraw: () => {
      console.log(tokenErc);
      tokenErc.contract.approve(settings.pool_address, _ethers.constants.MaxUint256)
        .then(pending => {
          window.transactionCenter.merge({
            title: 'Approve Unlocking',
            description: pending.hash,
            status: 'pending',
            timestamp: new Date(),
          });
          pending.wait(response => {
              withdrawAllowanceBlock.classList.add('hidden');
              withdrawAmountBlock.classList.remove('hidden');

              window.transactionCenter.merge({
                title: 'Approve Unlocking',
                description: pending.hash,
                status: 'success',
                timestamp: new Date(),
              });
            })
            .catch(err => {
              window.transactionCenter.merge({
                title: 'Approve Unlocking',
                description: pending.hash,
                status: 'failed',
                timestamp: new Date(),
              });
            })
        })
    },
    renderWithdrawAllowanceBlock: () => {
      withdrawAllowanceBlock.classList.remove('hidden');

    },
    renderWithdrawAmountBlock: () => {
      withdrawAmountBlock.classList.remove('hidden');

    },
    withdrawStake: () => {
      window.signedInsurance.getStakeValue().then(resp => {
        console.log(resp);
        resp.wait(response => {
          console.log(response)
        })
      })
    }
  };

  if (approveStakeEl)
    approveStakeEl.addEventListener('click', window.dashboard.allowanceStake);

  if (depositEl)
    depositEl.addEventListener('click', window.dashboard.calculateStake);

  if (depositConfirmEl)
    depositConfirmEl.addEventListener('click', window.dashboard.confirmStake);

  if (depositCancelEl)
    depositCancelEl.addEventListener('click', window.dashboard.depositCancel);

  if (withdrawEl)
    withdrawEl.addEventListener('click', window.dashboard.withdrawStake);

  if (approveDepositEl)
    approveDepositEl.addEventListener('click', window.dashboard.approveDeposit);

  if (selectDepositEl)
    selectDepositEl.addEventListener('change', window.dashboard.handleDepositTypeSelect);

  if (approveWithdrawEl)
    approveWithdrawEl.addEventListener('click', window.dashboard.approveWithdraw);

  if (poolSizeEl)
    window.dashboard.numbGoUp();


  window.dashboard.loadContracts();

  if (document.querySelector('#pendingFundsTable'))
    pendingFundsTable = new Table(document.querySelector('#pendingFundsTable'));
  if (document.querySelector('#claimableFundsTable'))
    claimableFundsTable = new Table(document.querySelector('#claimableFundsTable'));

});
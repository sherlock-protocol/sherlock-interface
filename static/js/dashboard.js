import Table from "./class/Table.js"
import Erc20 from "./ether/Erc20.js"
import Insurance from "./ether/Insurance.js"
import SafeString from "./modules/helpers.js";

const blockTimeMS = 13325;

window.addEventListener('DOMContentLoaded', () => {
  let provider = _ethers.getDefaultProvider('http://' + window.settings.network.toLowerCase() + ':8545');

  let totalPoolInterval = null;
  let totalAmount = parseFloat(data.pool.usd_total_format, 2);

  let totalPool = () => {
    let total = document.querySelector('#poolsize h2');

    var formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    totalPoolInterval = setInterval(() => {
      totalAmount += parseFloat(data.pool.usd_total_numba_str, 2);
      total.innerHTML = formatter.format(totalAmount / 100000);
    }, 50);

  }
  let populateTokens = (insurance) => {


    let tokenTable = new Table({
      el: document.querySelector('#tokenTable'),
      imagePrefix: "/static/svg/crypto/color/"
    });

    if (app.getCookie('wallet') == 'None') {
      window.data.pool.tokens.forEach((item, i) => {

        tokenTable.addRow({
          icon: item.token.symbol + '.svg',
          protocol: item.token.name,
          poolsize: {
            numba: item.pool.usd_size,
            yield: item.pool.usd_numba
          },
          apy: item.pool.apy
        });
      });
    } else {
      tokenTable.addColumns([{
        index: null,
        name: 'User Stake',
        class: 'fat',
        column: 'userStake',
        type: 'stake'
      }, {
        index: null,
        name: 'Deposit',
        type: "link",
        column: 'deposit',
      }, {
        index: null,
        name: 'Withdraw',
        type: "link",
        column: 'withdraw'
      }]);
      window.data.pool.tokens.forEach((item, i) => {
        tokenTable.addRow({
          icon: item.token.symbol + '.svg',
          protocol: item.token.name,
          poolsize: {
            numba: item.pool.usd_size,
            yield: item.pool.usd_numba
          },
          apy: item.pool.apy + '%',
          withdraw: {
            label: 'Withdraw',
            disabled: true,
            href: '/withdraw/' + item.token.address,
          },
          deposit: {
            label: 'Deposit',
            disabled: false,
            href: '/deposit/' + item.token.address,
          },
          userStake: {
            stake: item.stake,
            token: item.token,
            token_price: data.pool.usd_values[item.token.address],
            pool: item.pool,
            insurance: insurance,
            class: 'userstake',
            cb: row => {
              let withdraw = row.querySelector('.withdraw');
              let value = row.querySelector('.userstake');
              if (value.innerHTML !== "$0.00") {
                withdraw.classList.remove('disabled');
              }
            }
          },
        });
      });
    }
  }

  let withdrawalsTable = new Table({
    el: document.querySelector('#withdrawalsTable'),
    imagePrefix: "/static/svg/crypto/color/"
  });

  let fetchWithdrawals = async (insurance) => {
    let curBlock = await provider.getBlockNumber();
    data.pool.tokens.forEach(async (item, i) => {
      let locali = i;
      let index = await insurance.getWithrawalInitialIndex(app.getCookie('wallet'), item.token.address);
      let size = await insurance.getWithdrawalSize(app.getCookie('wallet'), item.token.address);

      index = parseInt(_ethers.utils.formatUnits(index, 'wei'));
      size = parseInt(_ethers.utils.formatUnits(size, 'wei'));
      for (var i = index; i < size; i++) {
        let withdrawal = await insurance.getWithdrawal(app.getCookie('wallet'), i, item.token.address);
        renderWithdrawalRow(withdrawal, item, curBlock, insurance, locali);

      }
    });
  }

  let renderWithdrawalRow = async (withdrawal, item, curBlock, insurance, locali) => {
    if (!insurance) return;

    let stake = _ethers.utils.formatUnits(withdrawal.stake, item.stake.decimals);
    let block = parseInt(_ethers.utils.formatUnits(withdrawal.blockInitiated, 'wei'));
    let availableFrom = block + data.timperiod;
    let availableTill = block + data.timperiod + data.claimperiod;
    let timeToAvailable = (availableFrom - curBlock) * blockTimeMS;
    let timeToExpire = (availableTill - curBlock) * blockTimeMS;
    let cancelable = false;
    let claimable = false;
    if (timeToAvailable > 0) {
      cancelable = true
    }
    if (timeToAvailable <= 0 && timeToExpire > 0) {
      claimable = true
    }

    // TODO vincent
    // - cancel/claim actions are exclusive (only one can be done at the time), so 1 button could be enough.
    // - addrow is done on callback, which means the order can be mixed up if callbacks are not returnd in order (which is something that will happen)
    // - EXPECTED TOKEN AMOUNT = `insurance.stakeToToken(resp.stake, item.token.address)`
    (async () => {
      let estimate = await insurance.stakeToToken(withdrawal.stake, item.token.address);
      if (timeToExpire > 0) {
        renderWithdrawalRow();
        document.querySelector('#withdrawals').classList.remove('hidden');
        withdrawalsTable.addRow({
          icon: item.token.symbol + '.svg',
          protocol: item.token.name,
          estimate: app.bigNumberToUSD(estimate, item.token.decimals),
          stake: stake,
          availableFrom: {
            ms: timeToAvailable >= 0 ? timeToAvailable : null,
            doneText: "Click n' Claim",
            func: (row) => {
              row.querySelector('td.action button').innerHTML = "Claim";
              row.querySelector('td.action button').setAttribute('action', 'claim');
            }
          },
          availableTill: {
            ms: timeToExpire >= 0 ? timeToExpire : null,
            doneText: "Expired",
            func: (row) => {
              row.classList.add('disabled');
              row.querySelector('td.availableFrom').innerHTML = 'Expired';
              row.querySelector('td.action button').disabled = true;
            }
          },
          action: {
            label: claimable ? "Claim" : "Cancel",
            action: claimable ? "claim" : "cancel",
            func: (el) => {
              let rowEl = el.parentNode.parentNode;

              if (el.getAttribute('action') === "claim") {
                app.addLoader(document.querySelector('#withdrawals'), "", 'small');
                insurance.withdrawClaim(locali, item.token.address)
                  .then(resp => {
                    app.removeLoader(document.querySelector('#withdrawals'));
                    rowEl.classList.add('disabled');
                  })
                  .catch(err => {
                    app.removeLoader(document.querySelector('#withdrawals'));
                    app.catchAll(err);
                  });
              } else if (el.getAttribute('action') === "cancel") {
                console.log('cancel');
                app.addLoader(document.querySelector('#withdrawals'), "", 'small');
                insurance.withdrawCancel(locali, item.token.address)
                  .then(resp => {
                    rowEl.classList.add('disabled');
                    app.removeLoader(document.querySelector('#withdrawals'));
                  })
                  .catch(err => {
                    app.removeLoader(document.querySelector('#withdrawals'));
                    app.catchAll(err);
                  });
              }
            }
          }
        });
      }
    })();
  }

  let main = (insurance) => {
    populateTokens(insurance);
    fetchWithdrawals(insurance);
  }

  let signedInsurance = new Insurance(main);
  totalPool();
});
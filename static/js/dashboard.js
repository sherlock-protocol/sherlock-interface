import Erc20 from "./ether/Erc20.js"
import Table from "./class/Table.js"


window.addEventListener('DOMContentLoaded', () => {
  const blockTimeMS = 13325;

  const withdrawalsTable = new Table({
    el: document.querySelector('#withdrawalsTable'),
    imagePrefix: "/static/svg/crypto/color/"
  });

  let totalFundsNumba = () => {
    let totalPoolInterval = null;
    let totalAmount = data.pool.usd_total;
    let total = document.querySelector('#poolsize h2');

    totalPoolInterval = setInterval(() => {
      totalAmount += parseFloat(data.pool.usd_total_numba_str, 2);
      total.innerHTML = window.app.formatter.format(totalAmount / 100000);
    }, 50);
  }

  let toggleTokenCollapse = item => {
    let id = item.getAttribute('id').replace('token', 'expander');
    let expander = document.querySelector(`#${id}`);
    document.querySelectorAll(".staking-pools .expander").forEach(expanders => {
      if (expander.getAttribute('id') != expanders.getAttribute('id'))
        expanders.classList.add('hidden');
    });
    expander.classList.toggle('hidden');
  }

  let calculateUserBalance = () => {
    window.data.pool.tokens.forEach(pool => {
      (async () => {
        let userSize = await window.app.sherlock.getStakerPoolBalance(app.getCookie('wallet'), pool.token.address)
        let poolSize = _ethers.BigNumber.from(pool.pool.staker_size_str);
        if (userSize._hex === "0x00" || poolSize._hex === "0x00") {
          updateUserBalance(null, pool);
        } else {
          let tokenPrice = _ethers.BigNumber.from(window.data.pool.usd_values[pool.token.address], );
          let balance = userSize.mul(tokenPrice);
          let poolYield = _ethers.BigNumber.from(pool.pool.numba_str);
          let userYield = userSize.mul(poolYield).mul(tokenPrice).div(poolSize);
          let originalUserSize = userSize.mul(tokenPrice);
          await window.app.userExtraAsync(window.app.sherlock, pool.token, originalUserSize, userYield);

          setInterval(() => {
            let userProfit = window.app.userExtra(pool.token);
            updateUserBalance({
              stake: app.bigNumberToUSD(balance, pool.token.decimals),
              profit: app.bigNumberToUSD(userProfit, pool.token.decimals),
              total: app.bigNumberToUSD(originalUserSize.add(userProfit), pool.token.decimals)
            }, pool);
          }, 50);
        }
      })()
    });
  }

  let updateUserBalance = (options, pool) => {
    let balanceCell = document.querySelector(`.staking-pools #token-${pool.token.symbol} .balance`);

    let stakeExpanderCell = document.querySelector(`.staking-pools #expander-${pool.token.symbol} .userstake`);
    let profitExpanderCell = document.querySelector(`.staking-pools #expander-${pool.token.symbol} .profit`);
    let totalExpanderCell = document.querySelector(`.staking-pools #expander-${pool.token.symbol} .total`);

    let cooldownExpanderButton = document.querySelector(`.staking-pools #expander-${pool.token.symbol} .cooldown`);
    let harvestExpanderButton = document.querySelector(`.staking-pools #expander-${pool.token.symbol} .harvest`);

    balanceCell.innerHTML = options && options.total ? options.total : '$0.00';
    if (options && options.stake) {
      stakeExpanderCell.innerHTML = options.stake;
      cooldownExpanderButton.classList.remove('disabled');
      harvestExpanderButton.classList.remove('disabled');
    }
    profitExpanderCell.innerHTML = options && options.profit ? options.profit : '$0.00';
    totalExpanderCell.innerHTML = options && options.total ? options.total : '$0.00';
  }

  let fetchWithdrawals = async (sherlock) => {
    let curBlock = window.settings.state.block
    data.pool.tokens.forEach(async (item, i) => {
      let index = await window.app.sherlock.getInitialUnstakeEntry(app.getCookie('wallet'), item.token.address);
      let size = await window.app.sherlock.getUnstakeEntrySize(app.getCookie('wallet'), item.token.address);

      index = parseInt(_ethers.utils.formatUnits(index, 'wei'));
      size = parseInt(_ethers.utils.formatUnits(size, 'wei'));
      for (var ii = index; ii < size; ii++) {
        let withdrawal = await window.app.sherlock.getUnstakeEntry(app.getCookie('wallet'), ii, item.token.address);
        fetchWithdrawal(withdrawal, item, curBlock, ii);
      }
    });
  }

  let fetchWithdrawal = (withdrawal, pool, curBlock, ii) => {

    let stake = _ethers.utils.formatUnits(withdrawal.lock, pool.stake.decimals);
    let block = parseInt(_ethers.utils.formatUnits(withdrawal.blockInitiated, 'wei'));
    let availableFrom = block + data.cooldown_period;
    let availableTill = block + data.cooldown_period + data.unstake_window;
    let timeToAvailable = (availableFrom - curBlock) * blockTimeMS;
    let timeToExpire = (availableTill - curBlock) * blockTimeMS;
    let claimable = false;
    if (timeToAvailable <= 0 && timeToExpire > 0) {
      claimable = true
    }

    let options = {
      withdrawal: withdrawal,
      pool: pool,
      timeToExpire: timeToExpire,
      stake: stake,
      timeToAvailable: timeToAvailable,
      index: ii,
    }

    renderWithdrawalRow(options);
  }

  let withdrawalAction = (el, options) => {

    let rowEl = el.parentNode.parentNode;

    if (el.getAttribute('action') === "claim") {
      window.app.addLoader(document.querySelector('#withdrawals'), "", 'small');
      window.app.sherlock.unstake(options.index, app.getCookie('wallet'), options.pool.token.address)
        .then(resp => {
          app.removeLoader(document.querySelector('#withdrawals'));
          rowEl.classList.add('disabled');
        })
        .catch(err => {
          app.removeLoader(document.querySelector('#withdrawals'));
          app.catchAll(err);
        });
    } else if (el.getAttribute('action') === "cancel") {
      window.app.addLoader(document.querySelector('#withdrawals'), "", 'small');
      window.app.sherlock.cancelCooldown(options.index, options.pool.token.address)
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

  let renderWithdrawalRow = async (options) => {
    let estimate = await window.app.sherlock.LockToToken(options.withdrawal.lock, options.pool.token.address);
    let claimable = false;
    if (options.timeToAvailable <= 0 && options.timeToExpire > 0) {
      claimable = true
    }
    if (options.timeToExpire > 0) {
      document.querySelector('#withdrawals').classList.remove('hidden');
      withdrawalsTable.addRow({
        row: {
          icon: {
            name: options.pool.token.name,
            file: options.pool.token.symbol.toLowerCase() + '.svg'
          },
          protocol: options.pool.token.name,
          estimate: app.bigNumberToUSD(estimate.mul(window.data.pool.usd_values[options.pool.token.address]), options.pool.token.decimals),
          stake: options.stake,
          availableFrom: {
            ms: options.timeToAvailable >= 0 ? options.timeToAvailable : null,
            doneText: "Unstake Available",
            func: (row) => {
              row.querySelector('td.action button').innerHTML = "Unstake";
              row.querySelector('td.action button').setAttribute('action', 'claim');
            }
          },
          availableTill: {
            ms: options.timeToExpire >= 0 ? options.timeToExpire : null,
            doneText: "Expired",
            func: (row) => {
              row.classList.add('disabled');
              row.querySelector('td.availableFrom').innerHTML = 'Expired';
              row.querySelector('td.action button').disabled = true;
            }
          },
          action: {
            label: claimable ? "Unstake" : "Cancel",
            action: claimable ? "claim" : "cancel",
            func: (el) => {
              withdrawalAction(el, options)
            }
          }
        }
      });
    }
  }

  let main = () => {
    // Global handlers
    totalFundsNumba();

    // Wallet connected specific handlers
    if (app.getCookie('wallet') != 'None') {

      // Staking pool collapsers
      document.querySelectorAll(".staking-pools .token").forEach(item => {
        item.addEventListener("click", () => {
          toggleTokenCollapse(item);
        })
      });

      // Calculate balance in token row
      calculateUserBalance();

      // Fetch user withdrawals
      fetchWithdrawals();
    }
  };

  // Wait for sherlock contract
  let contractPolling = () => {
    if (!window.app.sherlock) {
      setTimeout(() => {
        contractPolling();
      }, 10);
    } else {
      main();
    }
  }
  contractPolling();
});
import Table from "./class/Table.js"
import Erc20 from "./ether/Erc20.js"
import Sherlock from "./ether/Sherlock.js"
import SafeString from "./modules/helpers.js";

const blockTimeMS = 13325;

window.addEventListener('DOMContentLoaded', () => {
  let provider = _ethers.getDefaultProvider('http://' + window.settings.network.toLowerCase() + ':8545');
  let totalPoolInterval = null;
  let totalAmount = data.pool.usd_total;
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

  let populateTokens = (sherlock) => {
    let tokenTable = new Table({
      el: document.querySelector('#tokenTable'),
      imagePrefix: "/static/svg/crypto/color/"
    });

    if (app.getCookie('wallet') == 'None') {
      window.data.pool.tokens.forEach((item, i) => {
        tokenTable.addRow({
          position: item.token.symbol === "sherx" ? "-1" : null,
          highlighted: item.token.symbol === "sherx" ? true : false,
          row: {
            apy: item.pool.apy + '%',
            protocol: {
              file: item.token.symbol.toLowerCase() + '.svg',
              name: item.token.name
            },
            poolsize: {
              numba: item.pool.usd_size,
              yield: item.pool.usd_numba
            }
          }
        });
      });
    } else {
      tokenTable.addColumns([{
        index: null,
        name: 'Balance',
        class: 'fat',
        column: 'userStake',
        type: 'stake'
      }]);
      window.data.pool.tokens.forEach((item, i) => {
        tokenTable.addRow({
          position: item.token.symbol === "sherx" ? "0" : null,
          highlighted: item.token.symbol === "sherx" ? true : false,
          collapse: {
            closeOther: true,
            template: `
              <h2>${item.token.name}</h2>
              <div class="hbox">
                <div class="flex">
                  <h4>Actions</h4>
                  <div class="actions">
                    <a class="button stake" href="/stake/${item.token.address}">Stake</a>
                    <a class="button cooldown" href="/cooldown/${item.token.address}">Cooldown</a>
                    <a class="button harvest" href="/harvest/${item.token.address}">Harvest</a>
                  </div>
                </div>
                <div class="balance-breakdown flex">
                  <table class="smoking-kills">
                    <thead>
                      <tr>
                        <th>Balance Breakdown</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Balance</td>
                        <td class="balance"><img class="loader-mini" src="static/img/mini-loader.svg"></td>
                      </tr>
                      <tr>
                        <td>Profit</td>
                        <td class="profit"><img class="loader-mini" src="static/img/mini-loader.svg"></td>
                      </tr>
                      <tr>
                        <td class="fat">Total</td>
                        <td class="total"><img class="loader-mini" src="static/img/mini-loader.svg"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              `,
            collapseFunc: (expander, row) => {
              let cooldown = expander.querySelector('.cooldown');
              let harvest = expander.querySelector('.harvest');
              let value = row.querySelector('.userstake');
              let balance = expander.querySelector('.balance');
              let profit = expander.querySelector('.profit');
              let total = expander.querySelector('.total');
              if (value.innerHTML !== "$0.00") {
                cooldown.classList.remove('disabled');
                harvest.classList.remove('disabled');
              } else {
                cooldown.classList.add('disabled');
                harvest.classList.add('disabled');
              }

              (async () => {
                let userSize = await sherlock.getStakerPoolBalance(app.getCookie('wallet'), item.token.address)
                let balanceInt = parseInt(_ethers.utils.formatUnits(userSize, item.token.decimals));

                if (!balanceInt) {
                  balance.innerHTML = '$0.00';
                  profit.innerHTML = '$0.00';
                  total.innerHTML = '$0.00';
                } else {
                  let tokenPrice = _ethers.BigNumber.from(data.pool.usd_values[item.token.address]);
                  let poolSize = _ethers.BigNumber.from(item.pool.size_str);
                  let poolYield = _ethers.BigNumber.from(item.pool.numba_str);
                  let userYield = userSize.mul(poolYield).mul(tokenPrice).div(poolSize);
                  // @todo vincent, do 50ms useryield increment on profit and total
                  userSize = userSize.mul(tokenPrice);
                  let userProfit = await window.app.userExtra(sherlock, item.token, userYield)

                  balance.innerHTML = app.bigNumberToUSD(userSize, item.token.decimals);
                  profit.innerHTML = app.bigNumberToUSD(userProfit, item.token.decimals);
                  total.innerHTML = app.bigNumberToUSD(userSize.add(userProfit), item.token.decimals);
                }
              })()
            }
          },
          row: {
            protocol: {
              file: item.token.symbol.toLowerCase() + '.svg',
              name: item.token.name
            },
            poolsize: {
              numba: item.pool.usd_size,
              yield: item.pool.usd_numba
            },
            apy: item.pool.apy + '%',
            name: item.token.name,
            userStake: {
              stake: item.stake,
              token: item.token,
              token_price: data.pool.usd_values[item.token.address],
              pool: item.pool,
              sherlock: sherlock,
              class: 'userstake',
            }
          }
        });
      });
    }
  }

  let withdrawalsTable = new Table({
    el: document.querySelector('#withdrawalsTable'),
    imagePrefix: "/static/svg/crypto/color/"
  });

  let fetchWithdrawals = async (sherlock) => {
    let curBlock = await provider.getBlockNumber();
    data.pool.tokens.forEach(async (item, i) => {
      let index = await sherlock.getInitialUnstakeEntry(app.getCookie('wallet'), item.token.address);
      let size = await sherlock.getUnstakeEntrySize(app.getCookie('wallet'), item.token.address);

      index = parseInt(_ethers.utils.formatUnits(index, 'wei'));
      size = parseInt(_ethers.utils.formatUnits(size, 'wei'));
      for (var ii = index; ii < size; ii++) {
        let withdrawal = await sherlock.getUnstakeEntry(app.getCookie('wallet'), ii, item.token.address);
        renderWithdrawalRow(withdrawal, item, curBlock, sherlock, ii, data.pool.usd_values);
      }
    });
  }

  let renderWithdrawalRow = async (withdrawal, item, curBlock, sherlock, i, usd_values) => {
    if (!sherlock) return;

    let stake = _ethers.utils.formatUnits(withdrawal.lock, item.stake.decimals);
    let block = parseInt(_ethers.utils.formatUnits(withdrawal.blockInitiated, 'wei'));
    let availableFrom = block + data.cooldown_period;
    let availableTill = block + data.cooldown_period + data.unstake_window;
    let timeToAvailable = (availableFrom - curBlock) * blockTimeMS;
    let timeToExpire = (availableTill - curBlock) * blockTimeMS;
    let claimable = false;
    if (timeToAvailable <= 0 && timeToExpire > 0) {
      claimable = true
    }

    // TODO vincent
    // - addrow is done on callback, which means the order can be mixed up if callbacks are not returnd in order (which is something that will happen)

    (async () => {
      let estimate = await sherlock.LockToToken(withdrawal.lock, item.token.address);
      if (timeToExpire > 0) {
        renderWithdrawalRow();
        document.querySelector('#withdrawals').classList.remove('hidden');
        withdrawalsTable.addRow({
          row: {
            icon: {
              name: item.token.name,
              file: item.token.symbol.toLowerCase() + '.svg'
            },
            protocol: item.token.name,
            estimate: app.bigNumberToUSD(estimate.mul(usd_values[item.token.address]), item.token.decimals),
            stake: stake,
            availableFrom: {
              ms: timeToAvailable >= 0 ? timeToAvailable : null,
              doneText: "Unstake Available",
              func: (row) => {
                row.querySelector('td.action button').innerHTML = "Unstake";
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
              label: claimable ? "Unstake" : "Cancel",
              action: claimable ? "claim" : "cancel",
              func: (el) => {
                let rowEl = el.parentNode.parentNode;

                if (el.getAttribute('action') === "claim") {
                  app.addLoader(document.querySelector('#withdrawals'), "", 'small');
                  sherlock.unstake(i, item.token.address, app.getCookie('wallet'))
                    .then(resp => {
                      app.removeLoader(document.querySelector('#withdrawals'));
                      rowEl.classList.add('disabled');
                    })
                    .catch(err => {
                      app.removeLoader(document.querySelector('#withdrawals'));
                      app.catchAll(err);
                    });
                } else if (el.getAttribute('action') === "cancel") {
                  app.addLoader(document.querySelector('#withdrawals'), "", 'small');
                  sherlock.cancelCooldown(i, item.token.address)
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
          }
        });
      }
    })();
  }

  let main = (sherlock) => {
    populateTokens(sherlock);

    if (app.getCookie('wallet') !== "None") {
      fetchWithdrawals(sherlock);
    }
  }

  let signedsherlock = new Sherlock(main);
  totalPool();
});
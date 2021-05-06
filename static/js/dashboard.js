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
          row: {
            apy: item.pool.apy + '%',
            protocol: {
              file: item.token.symbol + '.svg',
              name: item.token.name
            },
            poolsize: {
              numba: item.pool.usd_size,
              yield: item.pool.usd_numba
            }
          },
            collapse: {
              closeOther: true,
              template: tokenCollapse.template(item),
              collapseFunc: (template) => {
                tokenCollapse.collapseFunc(template);
              }
            },
        });
      });
    } else {
      tokenTable.addColumns([{
        index: null,
        name: 'Balance',
        class: 'fat',
        column: 'userStake',
        type: 'stake'
      }, {
        index: null,
        name: '',
        type: "link",
        column: 'deposit',
      }, {
        index: null,
        class: 'withdraw',
        name: '',
        type: "link",
        column: 'withdraw'
      }]);
      window.data.pool.tokens.forEach((item, i) => {
        tokenTable.addRow({
          collapse: {
            closeOther: true,
            template: tokenCollapse.template(item),
            collapseFunc: (template) => {
              tokenCollapse.collapseFunc(template);
            }
          },
          row: {
            protocol: {
              file: item.token.symbol + '.svg',
              name: item.token.name
            },
            poolsize: {
              numba: item.pool.usd_size,
              yield: item.pool.usd_numba
            },
            apy: item.pool.apy + '%',
            withdraw: {
              label: 'Activate Cooldown',
              disabled: true,
              href: '/withdraw/' + item.token.address,
            },
            deposit: {
              label: 'Stake',
              disabled: false,
              href: '/deposit/' + item.token.address,
            },
            payout: [{
              file: 'dai.svg',
              name: 'DAI'
            }, {
              file: 'usdc.svg',
              name: 'USDC'
            }, {
              file: 'weth.svg',
              name: 'Wrapped ETH'
            }],
            userStake: {
              stake: item.stake,
              token: item.token,
              token_price: data.pool.usd_values[item.token.address],
              pool: item.pool,
              insurance: insurance,
              class: 'userstake',
              cb: row => {
                let withdraw = row.querySelector('.withdraw a');
                let value = row.querySelector('.userstake');
                if (value.innerHTML !== "$0.00") {
                  withdraw.classList.remove('disabled');
                }
              }
            },
          }
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
      let index = await insurance.getWithrawalInitialIndex(app.getCookie('wallet'), item.token.address);
      let size = await insurance.getWithdrawalSize(app.getCookie('wallet'), item.token.address);

      index = parseInt(_ethers.utils.formatUnits(index, 'wei'));
      size = parseInt(_ethers.utils.formatUnits(size, 'wei'));
      for (var ii = index; ii < size; ii++) {
        let withdrawal = await insurance.getWithdrawal(app.getCookie('wallet'), ii, item.token.address);
        renderWithdrawalRow(withdrawal, item, curBlock, insurance, ii, data.pool.usd_values);
      }
    });
  }

  let tokenCollapse = {
    func: () => {

    },
    collapseFunc: (template) => {
      let chartEl = template.querySelector('.chart');
      let piedata = {
        labels: [],
        series: [[]]
      };

      data.pool.fee_token_history.forEach((item, i) => {
        piedata.labels.push(i);
        piedata.series[0].push(item.count);
      });

      let uniqueChart = new Chartist.Line(chartEl, piedata, {
        fullWidth: false,
        showPoint: false,

        chartPadding: 0,
        axisX: {
          showLabel: false,
          showGrid: false
        },
        axisY: {
          showLabel: false,
          showGrid: false
        }
      });
    },
    template: (item) => `
      <h2>${item.token.name}</h2>
      <div class="hbox token-split">
        <div class="flex vbox payout">
          <h4>Interest paid in SherX</h4>
          <p>Current composition of SherX token</p>
          <div class="flex"></div>
          ${data.pool.fee_token.map(token => `
            <div class="expected">
              <img src="/static/svg/crypto/color/${token.token.symbol}.svg">
              <span>${token.token.name}</span>
              <span class="fat">${token.percentage}%</span>
            </div>
          `).join("") }
        </div>
        <div class="flex vbox">
          <h4>Rewards</h4>
          <p>APY paid to ${item.token.name} stakers over the last 30 days</p>
          <div class="flex"></div>
          <div class="chart"></div>
        </div>
      </div>
      `
  }

  let renderWithdrawalRow = async (withdrawal, item, curBlock, insurance, i, usd_values) => {
    if (!insurance) return;

    let stake = _ethers.utils.formatUnits(withdrawal.stake, item.stake.decimals);
    let block = parseInt(_ethers.utils.formatUnits(withdrawal.blockInitiated, 'wei'));
    let availableFrom = block + data.timperiod;
    let availableTill = block + data.timperiod + data.claimperiod;
    let timeToAvailable = (availableFrom - curBlock) * blockTimeMS;
    let timeToExpire = (availableTill - curBlock) * blockTimeMS;
    let claimable = false;
    if (timeToAvailable <= 0 && timeToExpire > 0) {
      claimable = true
    }

    // TODO vincent
    // - addrow is done on callback, which means the order can be mixed up if callbacks are not returnd in order (which is something that will happen)
    // - EXPECTED TOKEN AMOUNT = `insurance.stakeToToken(resp.stake, item.token.address)`

    // TODO evert
    // -
    (async () => {
      let estimate = await insurance.stakeToToken(withdrawal.stake, item.token.address);
      if (timeToExpire > 0) {
        renderWithdrawalRow();
        document.querySelector('#withdrawals').classList.remove('hidden');
        withdrawalsTable.addRow({
          row: {
            icon: {
              name: item.token.name,
              file: item.token.symbol + '.svg'
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
                  insurance.withdrawClaim(i, item.token.address)
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
                  insurance.withdrawCancel(i, item.token.address)
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

  let main = (insurance) => {
    populateTokens(insurance);

    if (app.getCookie('wallet') !== "None") {
      fetchWithdrawals(insurance);
    }
  }

  let signedInsurance = new Insurance(main);
  totalPool();
});

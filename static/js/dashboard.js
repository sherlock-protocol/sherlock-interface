import Table from "./class/Table.js"
import Erc20 from "./ether/Erc20.js"
import Insurance from "./ether/Insurance.js"
import SafeString from "./modules/helpers.js";

const blockTimeMS = 13325;

window.addEventListener('DOMContentLoaded', () => {

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

  let populateWithdrawals = insurance => {
    let withdrawalsTable = new Table({
      el: document.querySelector('#withdrawalsTable'),
      imagePrefix: "/static/svg/crypto/color/"
    });

    data.pool.tokens.forEach((item, i) => {
      insurance.getWithrawalInitialIndex(app.getCookie('wallet'), item.token.address)
        .then(index => {
          console.log('index', index);
          insurance.getWithdrawalSize(app.getCookie('wallet'), item.token.address)
            .then(size => {
              console.log('size', size);
              index = parseInt(_ethers.utils.formatUnits(index, 'wei'));
              size = parseInt(_ethers.utils.formatUnits(size, 'wei'));
              for (var i = 0; i < size; i++) {
                insurance.getWithdrawal(app.getCookie('wallet'), index + i, item.token.address)
                  .then(resp => {
                    let stake = _ethers.utils.formatUnits(resp.stake, item.token.decimals);
                    let block = parseInt(_ethers.utils.formatUnits(resp.blockInitiated, 'wei'));
                    let provider = _ethers.getDefaultProvider('http://' + window.settings.network.toLowerCase() + ':8545');

                    console.log(resp);

                    provider.getBlockNumber().then(function(curBlock) {
                      let availableFrom = block + data.timperiod;
                      let availableTill = block + data.timperiod + data.claimperiod;
                      let availableFromMs = (availableFrom - curBlock) * blockTimeMS;
                      let availableTillMs = (availableTill - curBlock) * blockTimeMS;
                      let claimable = true;
                      
                      if (availableFromMs <= 0 && availableTillMs > 0) {
                        claimable = false;
                      }
                      
                      if (availableTillMs > 0) {
                        document.querySelector('#withdrawals').classList.remove('hidden');
                        // TODO: 
                        // stake: stake,
                        // should be formatted to something readable
                        //
                        //Double check if availablefrom/till are correct
                        withdrawalsTable.addRow({
                          icon: item.token.symbol + '.svg',
                          protocol: item.token.name,
                          stake: stake,
                          availableFrom: {
                            ms: availableFromMs >= 0 ? availableFromMs : null,
                            doneText: "Click n' Claim",
                            func: (row) => {
                              row.querySelector('td button').disabled = false;
                            }
                          },
                          availableTill: {
                            ms: availableTillMs >= 0 ? availableTillMs : null,
                            func: (row) => {
                              row.clasSList.add('disabled');
                            }
                          },
                          cancel: {
                            label: "Cancel",
                            disabled: false,
                            func: () => {
                              console.log('bla');
                            }
                          },
                          claim: {
                            label: "Claim Funds",
                            disabled: claimable,
                            func: () => {
                              console.log('bla');
                            }
                          }
                        });
                      }
                    });
                  })
              }
            })

        })
    });

  }

  let main = (insurance) => {
    populateTokens(insurance);
    populateWithdrawals(insurance);
  }

  let signedInsurance = new Insurance(main);
  totalPool();
});
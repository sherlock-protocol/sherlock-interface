import Table from "./class/Table.js"
import Erc20 from "./ether/Erc20.js"
import Insurance from "./ether/Insurance.js"
import SafeString from "./modules/helpers.js";

window.addEventListener('DOMContentLoaded', () => {
  let tokenTable = new Table({
    el: document.querySelector('#tokenTable'),
    imagePrefix: "/static/svg/crypto/color/"
  });

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
      total.innerHTML = formatter.format(totalAmount);
    }, 50);

  }

  let main = (insurance) => {
    if (app.getCookie('wallet') == 'None') {
      window.data.pool.tokens.forEach((item, i) => {

        tokenTable.addRow({
          icon: item.token.symbol + '.svg',
          protocol: item.token.name,
          poolsize: item.pool.size,
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
          userStake: {
            stake: item.stake,
            token: item.token,
            pool: item.pool,
            insurance: insurance
          },
          withdraw: {
            label: 'Withdraw',
            disabled: true,
            href: '/withdraw/' + item.stake.address,
            class: 'button'
          },
          deposit: {
            label: 'Deposit',
            disabled: true,
            href: '/deposit/' + item.token.address,
            class: 'button'
          },
        });
      });
    }
  }

  let signedInsurance = new Insurance(main);
  totalPool();
});
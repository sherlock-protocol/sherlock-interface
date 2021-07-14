export default class WithdrawalController {
  constructor(sherlock, callback) {
    this.withdrawals = [];
    this.expiredIndexStart = {};
    this.callback = callback;
    this.preFetcher();
  }

  preFetcher() {
    let curBlock = window.settings.state.block;
    let fetchCount = 0;
    data.pool.tokens.forEach(async (item, i) => {
      this.expiredIndexStart[item.token.address] = null;

      let index = await window.app.sherlock.getInitialUnstakeEntry(app.getCookie('wallet'), item.token.address);
      let size = await window.app.sherlock.getUnstakeEntrySize(app.getCookie('wallet'), item.token.address);

      index = parseInt(_ethers.utils.formatUnits(index, 'wei'));
      size = parseInt(_ethers.utils.formatUnits(size, 'wei'));

      for (var ii = index; ii < size; ii++) {
        let withdrawal = this.withdrawals.push({
          index: ii,
          pool: item,
          address: item.token.address,
          result: null,
          hidden: false
        });
      }

      if (!this.expiredIndexStart[item.token.address] || this.expiredIndexStart[item.token.address] > index)
        this.expiredIndexStart[item.token.address] = index;

      let expiredStart = (index <= this.expiredIndexStart[item.token.address] ? 0 : index - this.expiredIndexStart[item.token.address])
      for (var ii = expiredStart; ii < index; ii++) {
        let withdrawal = this.withdrawals.push({
          index: ii,
          pool: item,
          address: item.token.address,
          result: null,
          hidden: false
        });
      }

      fetchCount++;
      if (fetchCount === data.pool.tokens.length) {
        this.fetchAll();
      }
    });
  }

  fetchAll() {
    this.withdrawals.forEach(async (item, index) => {
      item.result = await window.app.sherlock.getUnstakeEntry(app.getCookie('wallet'), item.index, item.address);
      if (item.result.lock._hex === "0x00") {
        item.hidden = true;
      }
    });

    this.sortPolling();
  }

  sortPolling() {
    let valid = true;
    this.withdrawals.forEach(item => {
      if (!item.result) valid = false;
    });
    if (valid) {
      this.sort();

    } else {
      setTimeout(() => {
        this.sortPolling();
      }, 100);
    }
  }

  sort() {
    let expiredBlock = window.settings.state.block - window.data.cooldown_period - window.data.unstake_window;

    this.withdrawals = this.withdrawals.filter(item => {
      if (item.hidden === true) return false;
      return true;
    });

    this.withdrawals = this.withdrawals.sort((a, b) => {
      let aa = parseInt(_ethers.utils.formatUnits(a.result.blockInitiated, 'wei'));
      let bb = parseInt(_ethers.utils.formatUnits(b.result.blockInitiated, 'wei'));

      if (aa > bb) {
        return -1;
      } else {
        return 1;
      }
    });
    
    this.withdrawals = this.withdrawals.sort((a, b) => {
      let aa = parseInt(_ethers.utils.formatUnits(a.result.blockInitiated, 'wei'));
      if (aa < expiredBlock) {
        return 1;
      } else {
        return -1;
      }
    });

    this.callback(this.withdrawals);
  }
}
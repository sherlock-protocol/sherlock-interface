import moment from "../ext/moment.js";
import Sherlock from "../ether/Sherlock.js"

window.app = {};

if (typeof web3 != 'undefined') {
  new Sherlock(sherlock => {
    window.app.sherlock = sherlock;
  });
}


if (window.settings.network == "KOVAN") {
  window.app.provider = new _ethers.providers.AlchemyProvider("kovan", window.settings.infura);
} else {
  window.app.provider = _ethers.getDefaultProvider(window.settings.endpoint);
}

window.app.escape = (str = "") => {
  let r = /[&<>"'\/]/g;
  return '' + str.replace(r, m => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "/": "&#x2F;"
    } [m];
  });
}

window.app.domify = (str) => {
  const dom = new DOMParser();
  return dom.parseFromString(str, 'text/html').querySelector('body').firstChild;
}

window.app.formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

window.app.withdrawalUSD = (lockAmount) => {
  let xRate = _ethers.BigNumber.from(parseInt(window.data.xrate).toString())
  lockAmount = _ethers.utils.parseUnits(lockAmount, data.stake.decimals);

  // div by 10**18 because lock has 18 decimals
  let tokenAmount = lockAmount.mul(xRate).div(_ethers.utils.parseEther("1"))
  let tokenAmountFormatted = _ethers.utils.formatUnits(tokenAmount, data.token.decimals)

  let usd = tokenAmountFormatted * window.data.usd
  usd = window.app.formatter.format(usd / 100000);
  return usd.toString();
}

window.app.depositUSD = (deposit) => {
  let tokenAmount = _ethers.utils.parseUnits(deposit, data.token.decimals);
  let tokenAmountFormatted = _ethers.utils.formatUnits(tokenAmount, data.token.decimals)

  let usd = tokenAmountFormatted * window.data.usd
  usd = window.app.formatter.format(usd / 100000);
  return usd.toString();
}


window.app.parse = (tmpl, ...vs) => {
  let result = '';
  for (let i = 0; i < vs.length; i++) {
    if (vs[i] instanceof SafeString)
      result += tmpl[i] + vs[i].toString();
    else
      result += tmpl[i] + window.app.escape(String(vs[i]));
  }
  return new SafeString(result + tmpl[vs.length]);
}

export default class SafeString {
  constructor(s) {
    this.s = s;
  }
  toString() {
    return this.s;
  }
}

window.app.setCookie = (cname, cvalue, exdays) => {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

window.app.getCookie = cname => {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

window.app.token = (value) => {
  value = (value + ' Tokens').replace('.', ',');
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

window.app.currency = (value, abbreviate) => {
  value = _ethers.utils.formatUnits(value, 18);
  if (value === "0.0") return "$0.00"

  let split = value.split('.');
  if (split[1].length !== 18) {
    for (var i = 0; 18 - split[1].length; i++) {
      split[1] += '0';
    }
  }

  if (abbreviate) {
    value = split[0] + '.' + split[1];
    return '$' + window.app.abbreviateNumber(value.substring(0, value.length - 16));
  } else {
    value = parseInt(split[0]).toLocaleString() + '.' + split[1];
    return '$' + value.substring(0, value.length - 16);
  }
}

window.app.bigNumberToUSD = (bigNumber, decimals) => {
  let value = _ethers.utils.formatUnits(bigNumber, decimals);
  value = value / 100000;
  return window.app.formatter.format(value);
}

window.app.numberToUSD = (value) => {
  value = value / 100000;
  return window.app.abbreviateNumber(value);
}

window.app.abbreviateNumber = value => {
  let decPlaces = Math.pow(10, 2)
  for (var i = ['k', 'm', 'b', 't'].length - 1; i >= 0; i--) {
    var size = Math.pow(10, (i + 1) * 3)
    if (size <= value) {
      value = Math.round(value * decPlaces / size) / decPlaces
      if ((value === 1000) && (i < ['k', 'm', 'b', 't'].length - 1)) {
        value = 1
        i++
      }
      value += ['k', 'm', 'b', 't'][i]
      break
    }
  }
  if (value < 1000) {
    return window.app.formatter.format(value);
  }
  return '$' + value
}

window.app.validateForm = form => {
  let inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  let valid = true;

  inputs.forEach(item => {
    if (!item.value || item.value === "") {
      if (valid) item.focus();
      valid = false;
    }
  });

  return valid;
}
window.app.timeConversion = (milliseconds) => {

  var hours = milliseconds / (1000 * 60 * 60);
  var absoluteHours = Math.floor(hours);
  var h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours;

  var minutes = (hours - absoluteHours) * 60;
  var absoluteMinutes = Math.floor(minutes);
  var m = absoluteMinutes > 9 ? absoluteMinutes : '0' + absoluteMinutes;

  var seconds = (minutes - absoluteMinutes) * 60;
  var absoluteSeconds = Math.floor(seconds);
  var s = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds;


  return h + ':' + m + ':' + s;
}

window.app.formatDate = date => {
  return new moment(date).format('DD-MM-YYYY HH:MM')
}

window.app.formatHash = hash => {
  hash = hash.substring(0, 6) + '...' + hash.substring(hash.length - 4, hash.length);
  return hash;
}

window.app.catchAll = err => {
  notificationCenter.notify("We're deeply sorry.", err.message, 'danger');
}

window.app.timeSince = date => {
  var seconds = Math.floor((new Date() - date) / 1000);
  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}

let userExtraCache = {};

window.app.userExtra = function(key, token) {
  if (userExtraCache[key+token.symbol]) {
    const entry = userExtraCache[key+token.symbol];
    const diff = _ethers.BigNumber.from(((Date.now() - entry.time) * 1000 / 50).toString())
    return entry.value.add(diff.mul(entry.userYield).div(1000));
  }
  return false
}

window.app.userExtraAsync = async function(sherlock, key, token, userYield) {
  const cache = window.app.userExtra(key, token);
  if (cache) {
    return cache;
  }

  let unallocSherxPremium = _ethers.BigNumber.from("0")
  try{
    let unallocSherxPremium = await sherlock.getUnallocatedSherXFor(app.getCookie('wallet'), token.address)
  }catch(error) {
  }

  // calculate unharvested SHERX
  const decimals = _ethers.BigNumber.from("10").pow(_ethers.BigNumber.from(token.decimals.toString()))
  const sherX = window.settings.pool_address
  const sherXUSD = _ethers.BigNumber.from(window.data.pool.usd_values[sherX].toString())
  const unallocSherXUSD = unallocSherxPremium.mul(sherXUSD).div(_ethers.utils.parseEther("1"))
  const unallocSherXUSDTokenFormat = unallocSherXUSD.mul(decimals)

  // calculate diff in blocktime with useryield

  let curBlockTimestamp = window.settings.state.timestamp * 1000;
  let currentTimeStamp = Date.now();
  let multiplier = Math.round((currentTimeStamp - curBlockTimestamp) / 50)
  let increment = _ethers.BigNumber.from(multiplier.toString()).mul(userYield);

  let value = increment;
  if(key == "premium" || key == "total") {
    value = increment.add(unallocSherXUSDTokenFormat);
  }

  userExtraCache[key+token.symbol] = {
    value,
    time: Date.now(),
    userYield
  }
  return value
}

window.app.addLoader = (el, msg, size) => {
  if (!el) return;
  let template = document.createElement('div');
  template.classList.add('loader');
  template.classList.add('loader-' + size);
  template.innerHTML = `
    <svg width="248px" height="189px" viewBox="0 0 248 189" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="Group" fill="#FFFFFF">
                <path d="M241.159061,37 L204.284104,37 L204.284104,37.0741374 C197.229166,37.385074 190.469351,39.9884763 185.034095,44.4878779 L158.9124,64.3103664 C158.773109,64.4030382 158.624532,64.4586412 158.494527,64.5605802 L87.0475565,118.847695 L87.0475565,88.7201069 C87.0475565,85.0606513 84.0749353,82.0940763 80.4080213,82.0940763 L6.63953519,82.0940763 C2.97262116,82.0940763 0,85.0606513 0,88.7201069 L0,148.224641 L0,149.095756 C0,149.77226 0,150.810183 0.092860632,151.996382 C0.092860632,152.246595 0.139290948,152.487542 0.157863074,152.719221 C0.176435201,152.950901 0.157863074,153.201115 0.213579454,153.451328 C0.272613489,154.484619 0.40292705,155.512621 0.603594108,156.528031 C0.771329102,157.666384 0.997588511,158.79538 1.28147672,159.91055 C1.88629116,162.384693 2.84319186,164.759596 4.12301206,166.96287 C4.97412177,168.571933 5.93598763,170.120174 7.00169165,171.596458 C9.14005226,174.719564 11.8192102,177.437207 14.9134175,179.621832 C21.74796,185.182137 32.4269327,188.75 44.4802427,188.75 C56.5335528,188.75 67.4261049,185.089466 74.2513614,179.482824 C75.0563451,178.93678 75.8227091,178.336083 76.545019,177.684992 C79.7765756,175.060729 82.8552776,172.254381 85.7660797,169.279664 C88.4218938,166.629252 90.7619817,164.136382 92.4799034,162.153206 L159.144551,93.4092977 C159.512063,93.0213712 159.841663,92.5993484 160.128874,92.1489618 L174.271548,77.5716947 L190.522159,60.8259084 L193.930144,57.3136489 C199.898534,51.9364681 207.655927,48.9640049 215.696676,48.9731908 L241.159061,48.9731908 C244.45672,48.9731908 247.13,46.3053479 247.13,43.0143969 C247.13,39.723446 244.45672,37.0556031 241.159061,37.0556031 L241.159061,37 Z" id="Path"></path>
                <rect class="out" x="7" y="52" width="74" height="11" rx="5.5"></rect>
                <rect class="out" x="16" y="26" width="56" height="11" rx="5.5"></rect>
                <rect class="out" x="25" y="0" width="38" height="11" rx="5.5"></rect>
            </g>
        </g>
    </svg>
    ${msg ? app.parse`<p>${msg}</p>` : ''}
  `;

  el.oldPos = window.getComputedStyle(el).position;
  el.style.position = "relative";

  let bars = template.querySelectorAll('rect');
  let index = 0;
  el.interval = setInterval(() => {
    if (index === 5) {
      index = 0;
      bars.forEach(item => {
        item.classList.add('out');
      });
    }
    if (bars[index - 1])
      bars[index - 1].classList.remove('out');
    index++;
  }, 200);

  el.appendChild(template);
};

window.app.removeLoader = (el) => {
  if (!el) return;
  clearInterval(el.interval);

  let template = el.querySelector('.loader');
  el.style.position = el.oldPos;
  if (template) template.remove(template);
};

window.app.expectedBlockTime = function(blockNumber) {
  let curBlockTimestamp = window.settings.state.timestamp * 1000;
  let currTimeStamp = Date.now();
  // If positive, the block was mined `difference` amount of miliseconds ago
  // Could be negative, meaning a block was mined in the future (wrong data input)
  let milisMinedAgo = (currTimeStamp - curBlockTimestamp);
  if (milisMinedAgo < 0) {
    console.log("Error in timestamp difference calculation, negative value:", milisMinedAgo)
  }

  let amountBlockDiff = blockNumber - window.settings.state.block
  return amountBlockDiff * window.settings.blocktime - milisMinedAgo
}
import moment from '../ext/moment.js';

window.app = {};

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
  value = value / 100000
  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return formatter.format(value);
}

window.app.numberToUSD = (value) => {
  value = value / 100000
  value = Math.floor(value);
  return '$' + window.app.abbreviateNumber(value);
}

window.app.abbreviateNumber = value => {
  if (!value) return value;
  let newValue = parseInt(value);
  const suffixes = ["", "K", "M", "B", "T"];
  let suffixNum = 0;
  while (newValue >= 1000) {
    newValue /= 1000;
    suffixNum++;
  }

  newValue = newValue.toPrecision(3);

  newValue += suffixes[suffixNum];
  // let split = newValue.split('.');
  // console.log(split);
  // if (split[1].length !== 2) {
  //   for (var i = 0; 2 - split[1].length; i++) {
  //     split[1] += '0';
  //   }
  // }
  // newValue = split[0] + '.' + split[1];
  return newValue;
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

window.app.provider = _ethers.getDefaultProvider('http://' + window.settings.network.toLowerCase() + ':8545');

let userExtraCache = {};

window.app.userExtra = async function(sherlock, token, userYield) {
  if(userExtraCache[token]) return userExtraCache[token];

  const unallocSherxPremium = await sherlock.getUnallocatedSherXFor(app.getCookie('wallet'), token.address)
  // calculate unharvested SHERX
  const decimals = _ethers.BigNumber.from("10").pow(_ethers.BigNumber.from(token.decimals.toString()))
  const sherX = window.settings.pool_address
  const sherXUSD = _ethers.BigNumber.from(window.data.pool.usd_values[sherX].toString())
  const unallocSherXUSD = unallocSherxPremium.mul(sherXUSD).div(_ethers.utils.parseEther("1"))
  const unallocSherXUSDTokenFormat = unallocSherXUSD.mul(decimals)

  // calculate diff in blocktime with useryield

  let curBlock = await window.app.provider.getBlockNumber();
  let curBlockTimestamp = ((await window.app.provider.getBlock(curBlock)).timestamp + window.settings.time_error) * 1000 ;
  let currentTimeStamp = Date.now();
  let multiplier = Math.round((currentTimeStamp - curBlockTimestamp) / 50)
  let increment = _ethers.BigNumber.from(multiplier.toString()).mul(userYield);
  userExtraCache[token] = (increment).add(unallocSherXUSDTokenFormat);
  return (increment).add(unallocSherXUSDTokenFormat)
}
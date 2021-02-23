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
    }[m];
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

export class SafeString {
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
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

window.app.getCookie = cname => {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
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

window.app.currency = value => {
  value = _ethers.utils.formatUnits (value, 18);
  console.log(value);
  
  if(value === "0.0") return "0.00"
  console.log("Dont show");

  let split = value.split('.');
  if(split[1].length !== 18) {
    for (var i = 0; 18 - split[1].length; i++) {
      split[1] += '0';
    }
  }
  value = split[0] + '.' + split[1];
  return window.app.abbreviateNumber(value.substring(0, value.length - 16));
}

window.app.abbreviateNumber = value => {
  let newValue = value;
  const suffixes = ["", "K", "M", "B","T"];
  let suffixNum = 0;
  while (newValue >= 1000) {
    newValue /= 1000;
    suffixNum++;
  }

  newValue = newValue.toPrecision(3);

  newValue += suffixes[suffixNum];
  return newValue;
}

window.app.validateForm = form => {
  let inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  let valid = true;

  inputs.forEach(item => {
    if(!item.value || item.value === "") {
      if(valid)item.focus();
      valid = false;
    }
  });
  
  return valid;
}
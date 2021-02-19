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
  console.log(tmpl);
  let result = '';
  for (let i = 0; i < vs.length; i++) {
    console.log(tmpl[i]);
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
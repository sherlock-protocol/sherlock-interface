import SafeString from "../modules/helpers.js"
import Erc20 from "../ether/Erc20.js"


export default class Table {

  constructor(options) {
    this.el = options.el;
    this.imagePrefix = options.imagePrefix;
    this.thead = this.el.querySelector('thead');
    this.tbody = this.el.querySelector('tbody');
    this.headers = [];
    this.rows = [];

    //Fetch all headers
    this.thead.querySelectorAll('th').forEach((item, i) => {
      if (item.hasAttribute('data-column')) {
        this.headers.push({
          el: item,
          index: i,
          name: item.getAttribute('data-column'),
          type: item.getAttribute('data-column-type'),
          class: item.getAttribute('data-column-class'),
          intervals: {}
        });
      } else {
        console.error('Table couldnt fetch table headers', item);
      }
    });
  }

  addRow(data, id, position) {
    let sorted = [];
    let template = document.createElement("TR");
    let cbs = [];

    if (!position) {
      position = this.tbody.children.length;
    }
    this.headers.forEach(header => {
      let found = false;
      Object.entries(data).forEach(entry => {
        if (entry[0] === header.name) {
          found = true;
          let cellData = entry[1];
          let cell = document.createElement("TD");
          if (header.class) cell.classList.add(header.class);
          if (!header.type) {
            cell.innerHTML = app.parse `${cellData}`;
          } else if (header.type === "image") {
            cell.innerHTML = app.parse `<img src="${this.imagePrefix}${app.parse`${cellData}`}">`;
          } else if (header.type === "button") {
            let button = document.createElement("button");
            button.innerHTML = app.parse `${cellData.label}`;
            button.addEventListener('click', cellData.func);
            button.disabled = cellData.disabled;
            cell.appendChild(button);
          } else if (header.type === "link") {
            let a = document.createElement("a");
            a.innerHTML = app.parse `${cellData.label}`;
            a.setAttribute('href', cellData.href);
            a.classList.add(cellData.label.toLowerCase());
            a.classList.add('button');
            cell.appendChild(a);
            if (cellData.disabled) {
              a.classList.add('disabled');
            }
          } else if (header.type === "stake") {
            let img = document.createElement("img");
            img.setAttribute("src", "static/img/mini-loader.svg");
            img.classList.add('loader-mini');
            cell.appendChild(img);
            new Erc20(cellData.stake.address, (erc) => {
              cellData.insurance.getStakerTVL(app.getCookie('wallet'), cellData.token.address)
                .then(userSize => {
                  let balanceInt = parseInt(_ethers.utils.formatUnits(userSize, cellData.token.decimals));
                  if (!balanceInt) {
                    cell.innerHTML = '$0.00';
                  } else {
                    let poolSize = _ethers.BigNumber.from(cellData.pool.size_str);
                    let poolYield = _ethers.BigNumber.from(cellData.pool.numba_str);
                    let userYield = userSize.mul(poolYield).div(poolSize);
                    header.intervals[position] = setInterval(() => {
                      userSize = userSize.add(userYield);
                      cell.innerHTML = app.bigNumberToUSD(userSize, cellData.token.decimals);
                    }, 50);
                  }
                  cbs.forEach(cb => {
                    cb(template);
                  });
                });
            });
          } else if (header.type === "numba") {
            let amount = cellData.numba;
            cell.innerHTML = cellData.numba;
            clearInterval(header.intervals[position]);

            header.intervals[position] = setInterval(() => {
              amount += cellData.yield;
              cell.innerHTML = app.numberToUSD(amount);
            }, 50);
          }
          if (cellData.class)
            cell.classList.add(cellData.class);

          if (cellData.cb)
            cbs.push(cellData.cb);


          template.appendChild(cell);

        }
      });
      if (!found) {
        template.innerHTML += `<td></td>`;
      }
    });

    this.tbody.insertBefore(template, this.tbody.children[position]);

    this.rows.push({
      el: template,
      index: position,
      id: id,
      data: data
    });

    return template;
  }

  addColumns(columns) {
    columns.forEach((item, i) => {
      let template = document.createElement("TH");
      let position = this.headers.length;
      if (item.index) position = item.index;
      template.innerHTML = item.name;
      this.thead.querySelector('tr').insertBefore(template, this.thead.children[position]);

      this.headers.push({
        el: template,
        index: position,
        name: item.column,
        type: item.type,
        class: item.class,
        intervals: {},
      });
    });
  }

  getRow() {

  }

  removeRow() {

  }
  updateRow() {

  }
}
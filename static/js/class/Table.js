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

  addRow(options) {
    let id = options && options.id ? options.id : null;
    let position = options && options.position ? options.position : null;
    let disabled = options && options.disabled ? options.disabled : null;
    let sorted = [];
    let template = document.createElement("TR");
    let cbs = [];

    if (options.highlighted) {
      template.classList.add('highlighted');
    }
    if (!position) {
      position = this.tbody.children.length;
    }
    
    this.headers.forEach(header => {
      let found = false;
      Object.entries(options.row).forEach(entry => {
        if (entry[0] === header.name) {
          found = true;
          let cellData = entry[1];
          let cell = this.renderCell(cellData, header, position, cbs, template);
          if (cellData && cellData.class)
            cell.classList.add(cellData.class);

          if (cellData && cellData.cb)
            cbs.push(cellData.cb);

          template.appendChild(cell);
        }
      });
      if (!found) {
        template.innerHTML += `<td></td>`;
      }
    });
    this.tbody.insertBefore(template, this.tbody.children[position]);

    if (options.collapse) {
      let collapser = this.renderCollapse(options.collapse, template);
      template.style.cursor = 'pointer';
      if (options.highlighted) {
        collapser.classList.add('highlighted');
      }
      this.tbody.insertBefore(collapser, template.nextSibling);
    }

    this.rows.push({
      el: template,
      index: position,
      id: position,
      data: data
    });

    return template;
  }

  renderCell(cellData, header, position, cbs, template) {
    let cell = document.createElement("TD");

    if (header.class) cell.classList.add(header.class);
    if (!header.type) {
      cell.innerHTML = app.parse `${cellData}`;
    } else if (header.type === "image") {
      if (cellData.name) {
        cell.innerHTML = app.parse `<img src="${this.imagePrefix}${app.parse`${cellData.file}`}" title="${cellData.name}">`;
      } else {
        cellData.forEach(item => {
          cell.innerHTML += app.parse `<img src="${this.imagePrefix}${app.parse`${item.file}`}" title="${item.name}">`;
        });
      }
    } else if (header.type === "button") {
      let button = document.createElement("button");
      button.innerHTML = app.parse `${cellData.label}`;
      button.addEventListener('click', () => {
        cellData.func(button);
      });
      button.setAttribute('action', cellData.action);
      button.disabled = cellData.disabled;
      cell.appendChild(button);
    } else if (header.type === "link") {
      let a = document.createElement("a");
      a.innerHTML = app.parse `${cellData.label}`;
      a.setAttribute('href', cellData.href);
      a.classList.add('button');
      cell.appendChild(a);
      if (cellData.disabled) {
        a.classList.add('disabled');
      }
    } else if (header.type === "docs") {
      let a = document.createElement("a");
      a.innerHTML = '?';
      a.setAttribute('href', settings.docsBaseUrl + cellData);
      a.classList.add('docs');
      a.setAttribute('target', '_blank');
      cell.setAttribute('data-docs', cellData);
      cell.appendChild(a);
      if (cellData.disabled) {
        a.classList.add('disabled');
      }
    } else if (header.type === "numba") {
      let amount = cellData.numba;
      cell.innerHTML = app.numberToUSD(amount);

      clearInterval(header.intervals[position]);
      header.intervals[position] = setInterval(() => {
        amount += cellData.yield;
        cell.innerHTML = app.numberToUSD(amount);
      }, 50);
    } else if (header.type === "countdown") {
      if (cellData && cellData.ms) {
        clearInterval(header.intervals[position]);
        let amount = cellData.ms;
        cell.innerHTML = window.app.timeConversion(cellData.ms);
        header.intervals[position] = setInterval((i) => {
          amount -= 1000;
          if (amount <= 0 && cellData && cellData.func) {
            cell.innerHTML = cellData.doneText ? cellData.doneText : '-';

            cellData.func(template);
            clearInterval(header.intervals[position]);
          } else {
            cell.innerHTML = window.app.timeConversion(amount);

          }
        }, 1000);
      } else {
        cell.innerHTML = cellData.doneText ? cellData.doneText : '-';
        cellData.func(template);
      }
    }
    return cell;
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
}
import SafeString from "../modules/helpers.js"


export default class Table {

  constructor(el) {
    this.el = el;
    this.thead = el.querySelector('thead');
    this.tbody = el.querySelector('tbody');
    this.headers = [];
    this.rows = [];

    //Fetch all headers
    this.thead.querySelectorAll('th').forEach((item, i) => {
      if (item.hasAttribute('data-column')) {
        this.headers.push({
          el: item,
          index: i,
          name: item.getAttribute('data-column'),
          class: item.getAttribute('data-class')
        });
      } else {
        console.error('Table couldnt fetch table headers', item);
      }
    });

    this.el.querySelectorAll('tbody tr').forEach((item, i) => {
      this.rows.push({
        el: item,
        index: i
      });
    });
  }

  addRow(row, id, position) {
    let sorted = [];
    let template = document.createElement("TR");
    if (!position) {
      position = this.tbody.children.length;
    }

    this.headers.forEach(header => {
      let found = false;
      Object.entries(row).forEach(entry => {
        if (entry[0] === header.name) {
          found = true;
          template.innerHTML += `
            <td class="${header.class ? header.class : ""}">
                  ${app.parse`${entry[1]}`}
            </td>
          `;
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
      id:id
    });

    return template;
  }
  
  getRow() {
    
  }
  
  removeRow() {

  }
  updateRow() {

  }
}
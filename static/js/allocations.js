import Chartist from "/static/js/ext/chartist.min.js";
import Table from "./class/Table.js"

window.addEventListener('DOMContentLoaded', (event) => {

  let formatTokenData = tokenData => {
    let formatted = {
      series: [],
      labels: [],
    }

    Object.entries(tokenData).forEach(entry => {
      let address = entry[0];
      let token = data.tokens[entry[0]];
      let premium = entry[1].premium;
      let usd = data.usd[address];
      
      formatted.labels.push({
        image: token.symbol,
        name: token.name
      });
      formatted.series.push(premium * usd / token.decimals);
    });
    
    return formatted;
  }

  Object.entries(data.protocols).forEach(entry => {
    let protocol = entry[0];
    let tokens = entry[1];
    let el = document.querySelector(`#a${protocol}`);
    let pieEl = el.querySelector('.pie');
    let data = formatTokenData(tokens);
    let options = {
      labelInterpolationFnc: function(value) {
        return value[0]
      }
    };

    let responsiveOptions = [
      ['screen and (min-width: 640px)', {
        chartPadding: 20,
        labelOffset: 0,
        labelInterpolationFnc: function(value) {
          return value;
        }
      }],
      ['screen and (min-width: 1024px)', {
        labelOffset: 10,
        chartPadding: 20
      }]
    ];
    
    let chart = new Chartist.Pie(pieEl, data, options, responsiveOptions)
      .on('draw', context => {
        let label = data.labels[context.index];
        if (context.type === 'label') {
          let group = new Chartist.Svg('g');

          group.append(
            new Chartist.Svg('image', {
              'xlink:href': `/static/svg/crypto/color/${label.image}.svg`,
              width: '60px',
              height: '60px',
              title: 'nla',
              x: context.x - 30,
              y: context.y - 30
            })
          );
          context.element.replace(group);
        }
      });
  });

});
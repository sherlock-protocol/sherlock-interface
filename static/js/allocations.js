window.addEventListener('DOMContentLoaded', (event) => {
  let imageMap = {
    Maker: "mkr",
    Yearn: "yfi",
    PieDao: "generic",
  };
  let poolNameMap = {
    ATokenV2StrategyToAave: "Aave V2",
    AaveStrategyToUniswap: "Aave Gov",
  };

  let processCoveredProtocols = data => {
    let processed = {
      labels: [],
      values: [],
      total: _ethers.BigNumber.from(0)
    };
    data.forEach(item => {
      processed.labels.push({
        label: item.name,
        image: imageMap[item.name]
      });
      
      let covered = _ethers.BigNumber.from(item.covered);
      processed.values.push(item.covered);
      processed.total = processed.total.add(covered)
    });

    return processed;
  }

  let processPoolStrategies = data => {
    let processed = {
      labels: [],
      values: [],
      total: _ethers.BigNumber.from(0)
    };
    
    data.forEach(item => {
      processed.labels.push({
        label: poolNameMap[item.name],
        image: 'aave'
      });
      
      let balance = _ethers.BigNumber.from(item.balance);
      processed.values.push(item.balance);
      processed.total = processed.total.add(balance)
    });
    return processed;
  }

  let drawChart = (processed, el) => {
    new Chartist.Pie(el, {
      series: processed.values,
      labels: processed.labels
    }, {
      donut: true,
      donutWidth: 50,
      donutSolid: true,
      startAngle: 270,
      showLabel: true,
      labelColor: "#FFF",
      labelDirection: 'explode',
      labelOffset: 60,
      chartPadding: 40
    }).on('draw', function(context) {
      if (context.type === 'label') {
        let label = processed.labels[context.index]
        var group = new Chartist.Svg('g');
        if (!context.group._node.parentElement.querySelector('#total')) {
          group.append(
            new Chartist.Svg('text', {
              width: '30px',
              height: '200px',
              x: '50%',
              y: '50%',
              'font-weight': '600',
              'font-size': '18px',
              'text-anchor': 'middle',
              'alignment-baseline': 'start',
              'fill': '#006FE7',
              'id': 'total',
              'style': 'transform:translate(0px, -25px);'
            })
            .text('Total')
          );
          group.append(
            new Chartist.Svg('text', {
              width: '30px',
              height: '30px',
              x: '50%',
              y: '50%',
              'font-weight': '600',
              'font-size': '36px',
              'text-anchor': 'middle',
              'alignment-baseline': 'middle',
              'fill': '#006FE7',
              'id': 'total',
              'style': 'transform:translate(0px, 5px);'
            })
            .text(app.currency(processed.total))
          );
        }
        if (label.image)
          group.append(
            new Chartist.Svg('image', {
              'xlink:href': `/static/svg/crypto/color/${label.image}.svg`,
              width: '30px',
              height: '30px',
              x: context.x - 40,
              y: context.y - 3
            })
          );

        group.append(
          new Chartist.Svg('text', {
            width: '300px',
            height: '30px',
            x: context.x,
            y: context.y + 5,
            'font-weight': '600',
            'text-anchor': 'start',
            'alignment-baseline': 'hanging',
            // 'fill': '#FFF'
          })
          .text(label.label)
        );

        context.element.replace(group);
      }
    });
  }


  drawChart(processCoveredProtocols(window.data.covered_protocols), '#coveredProtocolsChart')
  drawChart(processPoolStrategies(window.data.pool_strategies), '#poolStrategiesChart');
});
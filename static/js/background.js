window.addEventListener('DOMContentLoaded', (event) => {
  let background = document.querySelector('.background svg');

  let getMatrix = el => {

    let linesEls = background.querySelectorAll('path');
    let circlesEls = background.querySelectorAll('circle');
    let matrix = [];

    circlesEls.forEach(circle => {
      let cy = Math.round(parseInt(circle.getAttribute('cy')));
      let cx = Math.round(parseInt(circle.getAttribute('cx')));
      let linesStart = [];
      let linesEnd = [];

      linesEls.forEach((line, i) => {
        let start = line.getAttribute('d').split(' ')[0].substring(1, line.getAttribute('d').split(' ')[0].length);
        let end = line.getAttribute('d').split(' ')[1].substring(1, line.getAttribute('d').split(' ')[1].length);
        start = {
          x: Math.round(parseInt(start.split(',')[0])),
          y: Math.round(parseInt(start.split(',')[1]))
        }
        end = {
          x: Math.round(parseInt(end.split(',')[0])),
          y: Math.round(parseInt(end.split(',')[1]))
        }

        if (cy === start.y && cx === start.x) {
          linesStart.push({
            x: start.x,
            y: start.y,
            el: line
          });
        }
        if (cy === end.y && cx === end.x) {
          linesEnd.push({
            x: end.x,
            y: end.y,
            el: line
          });
        }
      });
      matrix.push({
        el: circle,
        x: cx,
        y: cy,
        origin: {
          x: cx,
          y: cy,
        },
        linesStart: linesStart,
        linesEnd: linesEnd
      });
    });
    return matrix;
  }

  let animationController = matrix => {
    console.log(matrix);
    let stepper = setInterval(() => {
      matrix.forEach(node => {
        if (node.el.getAttribute('r') === '22') {
          let newPos = {
            x: node.x + (Math.random() * 2) - 1,
            y: node.y + (Math.random() * 2) - 1,
          };
          
          node.el.setAttribute('cy', newPos.y);
          node.el.setAttribute('cx', newPos.x);
        }
      });

    }, 100);
  }

  animationController(getMatrix(background));
});
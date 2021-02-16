// fill in surrounding, like-coloured grid units
'use strict';

module.exports = function (replace, startX, startY) {
  const colour = this.colour;
  startX = typeof startX !== 'undefined' ? startX : this.cursor.x;
  startY = typeof startY !== 'undefined' ? startY : this.cursor.y;
  replace = typeof replace !== 'undefined' ? replace : this.painting[startY][startX];
  if (replace === colour) {
    return;
  }

  const stack = [
    [startX, startY]
  ];

  while (stack.length > 0) {
    const [ x, y ] = stack.pop();
    if (this.painting[y][x] !== replace) {
      continue;
    }
    this.painting[y][x] = colour;

    if ((y + 1) < this.height) {
      stack.push([x, y + 1]);
    }

    if ((y - 1) > -1) {
      stack.push([x, y - 1]);
    }

    if ((x + 1) < this.width) {
      stack.push([x + 1, y]);
    }

    if ((x - 1) > -1) {
      stack.push([x - 1, y]);
    }
  };
};

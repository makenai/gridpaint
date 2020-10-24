'use strict';

exports.distance = function(x1, y1, x2, y2) {
  const a = x1 - x2;
  const b = y1 - y2;
  return Math.sqrt(a*a + b*b);
};

function getLinePixels(x0, y0, x1, y1) {
  const pixels = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = (x0 < x1) ? 1 : -1;
  const sy = (y0 < y1) ? 1 : -1;
  let err = dx - dy;
  let [ x, y ] = [ x0, y0 ];
  while(true) {
    pixels.push({ x, y });
    if ((x === x1) && (y === y1)) break;
    let e2 = 2*err;
    if (e2 > -dy) { 
      err -= dy; 
      x += sx; 
    }
    if (e2 < dx) {
      err += dx; 
      y += sy; 
    }
  }
  return pixels;
};
exports.getLinePixels = getLinePixels;

exports.getCirclePixels = function(startX, startY, radius) {
  const pixels = [];
  let lastX, lastY;
  for (let i = 0; i <= 720; i++) {
    const x = parseInt(startX+(radius*Math.sin(i*2*(Math.PI/720)))+0.5)
    const y = parseInt(startY+(radius*Math.cos(i*2*(Math.PI/720)))+0.5)
    if (lastX != x || lastY != y) {
      lastX = x;
      lastY = y;
      pixels.push({ x, y });
    }
  }
  return pixels;
}

exports.getSquarePixels = function(x0, y0, x1, y1) {
  return [
    ...getLinePixels(x0,y0,x1,y0),
    ...getLinePixels(x1,y0,x1,y1),
    ...getLinePixels(x1,y1,x0,y1),
    ...getLinePixels(x0,y1,x0,y0)
  ];
}
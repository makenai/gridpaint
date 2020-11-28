// draw the checkered pattern to indicate transparency
'use strict';

const geometry = require('./geometry');

exports.background = function () {
    let odd = false;
    let cw = this.cellWidth;
    let ch = this.cellHeight;
    let i, j;

    for (i = 0; i < this.width * 2; i += 1) {
        for (j = 0; j < this.height * 2; j += 1) {
            this.ctx.fillStyle = odd ? '#999999' : '#666666';
            this.ctx.fillRect(i * (cw / 2), j * (ch / 2), cw / 2, ch / 2);
            odd = !odd;
        }
        odd = !odd;
    }
};

// overlap the current colour as a crosshair over the position it will be
// applied to
exports.cursor = function () {
    let cw, ch, x, y;

    if (this.cursor.x < 0 || this.cursor.y < 0) {
        return;
    }

    cw = this.cellWidth;
    ch = this.cellHeight;
    x = this.cursor.x;
    y = this.cursor.y;

    this.ctx.globalAlpha = 0.8;
    this.ctx.fillStyle = this.palette[this.colour];
    this.ctx.fillRect(x * cw + cw / 4, y * ch, cw / 2, ch);
    this.ctx.fillRect(x * cw, y * ch + ch / 4, cw, ch / 2);
    this.ctx.globalAlpha = 1;
};

// draw contrasting grid units
exports.grid = function () {
    let cw = this.cellWidth;
    let ch = this.cellHeight;
    let i;

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = this.gridColour;

    for (i = 0; i < this.width; i += 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(i * cw + 0.5, 0);
        this.ctx.lineTo(i * cw + 0.5, ch * this.height);
        this.ctx.stroke();
    }

    for (i = 0; i < this.height; i += 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, i * ch + 0.5);
        this.ctx.lineTo(cw * this.width, i * ch + 0.5);
        this.ctx.stroke();
    }
};

exports.toolState = function() {
  if (this.toolStartPoint) {
    const { x: startX, y: startY } = this.toolStartPoint;
    const { x: endX, y: endY } = this.cursor;
    switch(this.tool) {
      case 'line': {
        const linePixels = geometry.getLinePixels(startX, startY, endX, endY);
        this.drawPixelOverlay(linePixels);
        break;
      }
      case 'circle': {
        const radius = geometry.distance(startX, startY, endX, endY);
        const circlePixels = geometry.getCirclePixels(startX, startY, radius);
        this.drawPixelOverlay(circlePixels);
        break;
      }
      case 'square': {
        const squarePixels = geometry.getSquarePixels(startX, startY, endX, endY);
        this.drawPixelOverlay(squarePixels);
        break;
      }
      default:
        break;
    }
  }
}

exports.pixelOverlay = function(pixels) {
  this.ctx.globalAlpha = 0.8;
  this.ctx.fillStyle = this.palette[this.colour];
  for (const {x,y} of pixels) {
    this.ctx.fillRect(x * this.cellWidth, y * this.cellHeight, this.cellWidth, this.cellHeight);
  }
};

// draw the grid units onto a canvas
exports.painting = function (ctx, scale) {
    let cw = this.cellWidth;
    let ch = this.cellHeight;
    let i, j;

    // this is just so we can re-use this function on the export
    ctx = ctx || this.ctx;
    scale = scale || 1;

    for (i = 0; i < this.height; i += 1) {
        for (j = 0; j < this.width; j += 1) {
            ctx.fillStyle =
                this.palette[this.painting[i][j]] || 'rgba(0,0,0,0)';

            ctx.fillRect(
                Math.floor(j * cw * scale), Math.floor(i * ch * scale), 
                Math.ceil(cw * scale), Math.ceil(ch * scale)
            );
        }
    }
};

exports.tick = function () {
    if (this.background) {
        this.drawBackground();
    }
    else {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.drawPainting();
    this.drawToolState();
    
    if (this.showCursor) {
      this.drawCursor();
    }

    if (this.grid) {
        this.drawGrid();
    }

    if (this.drawing) {
        window.requestAnimationFrame(this.boundDraw);
    }
};

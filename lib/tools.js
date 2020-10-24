'use strict';

const deepDiff = require('deep-diff');
const geometry = require('./geometry');

const bucket = require('./bucket');
const clear = require('./clear');
const replace = require('./replace');

const MAX_HISTORY = 99;

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function rotateArray(array, num) {
  num = (num || 0) % array.length;
  if (num < 0) {
      num += array.length;
  }
  var removed = array.splice(0, num);
  array.push.apply(array, removed);
  return array;
}

function pushHistory(top, bottom, doChange) {
    let that;
    let changes;

    if (!top.length) {
        return;
    }

    that = this;
    changes = top.pop();

    bottom.push(clone(changes));

    if (!changes) {
        return;
    }

    changes.forEach(function (change) {
        doChange(that.painting, that.painting, change);
    });
}

// activated when the user's finger or mouse is pressed
exports.apply = function (isApplied) {
    if (typeof isApplied !== 'undefined') {
        this.isApplied = isApplied;
    }
    else {
        this.isApplied = !this.isApplied;
    }

    // activate the tool for initial mouse press
    if (this.isApplied) {
        this.action();
    }

    this.emit('applyTool', this.isApplied);
};

exports.startDrag = function() {
  this.setToolStartPoint();
}

exports.endDrag = function() {
  this.action();
  this.resetToolState();
  this.emit('applyTool', true);
}

exports.isDraggable = function () {
  return [ 'circle', 'line', 'square' ].includes(this.tool);
}

exports.bucket = bucket;
exports.clear = clear;

// compared oldPainting to painting & push the changes to history
exports.compare = function () {
    let changes = deepDiff.diff(this.oldPainting, this.painting);

    if (!changes) {
        return;
    }

    changes = changes.filter(function (change) {
        return change.kind === 'E';
    });

    if (changes.length) {
        this.undoHistory.push(changes);
        this.undoHistory.splice(0, this.undoHistory.length - MAX_HISTORY);
        this.redoHistory.length = 0;
    }
};

// fill in grid units one by one
exports.pencil = function () {
    let x = this.cursor.x;
    let y = this.cursor.y;

    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        this.painting[y][x] = this.colour;
    }
};

exports.line = function (apply) {
    if (!this.toolStartPoint) return;
    const { x: startX, y: startY } = this.toolStartPoint;
    const { x: endX, y: endY } = this.cursor;
    const linePixels = geometry.getLinePixels(startX, startY, endX, endY);
    for (const {x,y} of linePixels) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.painting[y][x] = this.colour;
        }
    }
};

exports.circle = function () {
    if (!this.toolStartPoint) return;
    const { x: startX, y: startY } = this.toolStartPoint;
    const { x: endX, y: endY } = this.cursor;
    const radius = geometry.distance(startX, startY, endX, endY);
    const circlePixels = geometry.getCirclePixels(startX, startY, radius);
    for (const {x,y} of circlePixels) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        this.painting[y][x] = this.colour;
        }
    }
};

exports.square = function () {
    if (!this.toolStartPoint) return;
    const { x: startX, y: startY } = this.toolStartPoint;
    const { x: endX, y: endY } = this.cursor;
    const squarePixels = geometry.getSquarePixels(startX, startY, endX, endY);
    for (const {x,y} of squarePixels) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.painting[y][x] = this.colour;
        }
    }
};

exports.setToolStartPoint = function(x,y) {
  this.toolStartPoint = { x: x || this.cursor.x, y: y || this.cursor.y };
}

exports.resetToolState = function() {
  this.toolStartPoint = null;
}

// redo the last painting action performed (if any)
exports.redo = function () {
    pushHistory.bind(
        this,
        this.redoHistory,
        this.undoHistory,
        deepDiff.applyChange,
    )();
    this.emit('redo');
};

exports.replace = replace;

// undo the last painting action performed (if any)
exports.undo = function () {
    pushHistory.bind(
        this,
        this.undoHistory,
        this.redoHistory,
        deepDiff.revertChange,
    )();
    this.emit('undo');
};

exports.shift = function (rows=0, cols=0) {
  this.oldPainting = clone(this.painting);

  // Shift rows
  this.painting = rotateArray(this.painting, rows);
  // Shift cols
  for (let i=0;i<this.painting.length;i++) {
    this.painting[i] = rotateArray(this.painting[i], cols);
  }

  this.compareChanges();
  this.emit('shift', [rows, cols]);
};
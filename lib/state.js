'use strict';

function cloneDeep(obj) {
  return JSON.parse(JSON.stringify(obj));
};

exports.freeze = function () {
  return {
    width: this.width,
    height: this.height,
    painting: cloneDeep(this.painting)
  };
};

exports.thaw = function (frozen) {
  this.width = frozen.width;
  this.height = frozen.height;
  this.painting = cloneDeep(frozen.painting);
  this.undoHistory = [];
  this.redoHistory = [];
}
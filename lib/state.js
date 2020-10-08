'use strict';

exports.freeze = function () {
  return {
    width: this.width,
    height: this.height,
    painting: this.painting
  };
};

exports.thaw = function (frozen) {
  this.width = frozen.width;
  this.height = frozen.height;
  this.painting = frozen.painting;
  this.undoHistory = [];
  this.redoHistory = [];
}
'use strict';
const tools = require('./tools');

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// special event listener for window object
function mouseout(e) {
    if (this.canvas === null) return;
    const canvasRect = this.canvas.getBoundingClientRect();

    if (e.clientX > canvasRect.left &&
        e.clientX < canvasRect.right &&
        e.clientY > canvasRect.top &&
        e.clientY < canvasRect.bottom
    ) {
        if (this.drawing) return;
        this.drawing = true;
        this.draw();
    }
    else {
        this.drawing = false;
    }
}

const handlers = {
    mousemove(e) {
        this.updateCursorPosition(e);
        if (this.isApplied) {
            this.action();
        }
        this.emit('move');
    },
    mousedown(e) {
        if (e.type !== 'mousedown' ||e.button !== 0) return;
        if (this.isDraggableTool()) {
            this.startToolDrag();
        } else {
            // create a clone to compare changes for undo history
            this.oldPainting = clone(this.painting);
            this.applyTool(true);
        }
    },
    mouseup(e) {
        if (e.type !== 'mouseup' || e.button !== 0) return;
        if (this.isDraggableTool()) {
            // create a clone to compare changes for undo history
            this.oldPainting = clone(this.painting);
            this.endToolDrag();
            this.compareChanges();
        } else if (this.isApplied) {
            this.applyTool(false);
            this.compareChanges();
        }
    },
    touchmove(e) {
        this.updateCursorPosition(e.touches[0]);
        if (this.isApplied) {
            this.action();
        }
        this.draw();
        this.emit('move');
    },
    touchstart(e) {
        this.updateCursorPosition(e.touches[0]);
        if (this.isDraggableTool()) {
            this.startToolDrag();
        } else {
            // create a clone to compare changes for undo history
            this.oldPainting = clone(this.painting);
            this.applyTool(true);
        }
    },
    touchend(e) {
        if (this.isDraggableTool()) {
            // create a clone to compare changes for undo history
            this.oldPainting = clone(this.painting);
            this.endToolDrag();
            this.compareChanges();
        } else if (this.isApplied) {
            this.applyTool(false);
            this.compareChanges();
        }
    }
};

// Does the calculations for cursor position when passed an event (mouse*) or touch (touch*) object with pageX/pageY
module.exports.updateCursorPosition = function(e) {
    const w = this.width;
    const h = this.height;
    const cw = this.cellWidth;
    const ch = this.cellHeight;
    let rect = this.canvas.getBoundingClientRect();
    let x = e.pageX - rect.left - window.scrollX;
    let y = e.pageY - rect.top - window.scrollY;

    this.cursor.x = Math.floor(x / w * (w / cw));
    this.cursor.y = Math.floor(y / h * (h / ch));
};

// activate event handlers
module.exports.attach = function () {
    let that;

    if (!process.browser) {
        return;
    }

    that = this;
    this.events = {};
    this.globalEvent = mouseout.bind(that);

    Object.keys(handlers).forEach(function (e) {
        that.events[e] = handlers[e].bind(that);
        that.canvas.addEventListener(e, that.events[e], false);
    });

    // in case the user drags away from the canvas element
    window.addEventListener('mouseup', that.events.mouseup, false);
    // disable drawing when mouse is out of the bounding rectangle
    if (this.autoStopDrawing)
        window.addEventListener('mousemove', mouseout.bind(that), false);
};

// remove all the event listeners & cease the draw loop
module.exports.detach = function () {
    let that;

    if (!process.browser) {
        return;
    }

    that = this;

    Object.keys(handlers).forEach(function (e) {
        that.canvas.removeEventListener(e, that.events[e], false);
    });

    window.removeEventListener('mouseup', that.events.mouseup, false);
    if (this.autoStopDrawing)
        window.removeEventListener('mousemove', that.globalEvent, false);
};

#!/usr/bin/env node
// This module is in many ways a rip-off from https://github.com/TooTallNate/node-drone-video
var jsfeat = require('jsfeat');
var _ = require('underscore');
var Stream  = require('stream');
var util   = require('util');

module.exports = Features2DStream;
util.inherits(Features2DStream, Stream);

var h = 180;
var w = 320;
var nrOfPixels = w*h;

var cornerDetection = function (rgbaImage) {
    jsfeat.imgproc.grayscale(rgbaImage, this.gray_img.data);
    var count = jsfeat.fast_corners.detect(gray_img, this.corners, this.border);
    var non_null_corners = [];
    for (var i = 0; i < count; i++) {
        non_null_corners.push(this.corners[i]);
    }
    return non_null_corners;
}

function Features2DStream() {
   Stream.call(this);
   this.writable = true;
   this.readable = true;
   this.corners = [];
   this.border = 3;
   this.gray_img = new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);

   for (var i = 0; i < nrOfPixels; ++i) {
      this.corners[i] = new jsfeat.point2d_t(0,0,0,0);
   }
}

Features2DStream.prototype.write = function (rgbaImage) {
    this.emit('data', JSON.stringify(cornerDetection(rgbaImage)));
}

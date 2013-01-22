var net = require('net');
// It's not in npm, so just clone RGBAStream into a subdir and reference
var RGBAStream = require('./RGBAStream/RGBAStream.js');
var PaVEParser = require('./RGBAStream/node_modules/ar-drone/lib/video/PaVEParser');

var Features2DStream = require('./Features2DStream.js');

var parser = new PaVEParser();
var feature = new Features2DStream();
var RGBA = new RGBAStream();

var socket = net.connect({ host: '192.168.1.1', port: 5555});
socket.pipe(parser).pipe(RGBA).pipe(feature).pipe(process.stdout);

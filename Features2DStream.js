#!/usr/bin/env node
// This module is in many ways a rip-off from https://github.com/TooTallNate/node-drone-video
var jsfeat = require('jsfeat');
var _ = require('underscore');

// Do a clean shutdown upon Ctrl+C.

process.on('SIGINT', shutdown);

function shutdown () {
  if (shutdown.called) return;
  shutdown.called = true;

  console.log('\nshutting down...');

  // close the socket
  socket.destroy();

  ffplay.stdin.end();
  videoEncoder.stdin.end();
}

/**
 * Connect to drone's video stream port.
 */

socket.on('connect', function () {
  console.error('connected to drone video');
});

socket.on('error', function (err) {
  console.error('socket "error" event:', err.stack);
  shutdown();
});

// Consider making a stream that just takes the payload

var parser = new PaVEParser();
parser.on('data', function (frame) {
  ffplay.stdin.write(frame.payload);
  videoEncoder.stdin.write(frame.payload);
});


var ffplay = spawn('ffplay', [
    '-f', 'h264',
    '-analyzeduration', '0',
    '-autoexit',
    '-' ]
);

ffplay.on('exit', function (code, signal) {
  if (0 == code) shutdown();
});

var videoEncoder = spawn('ffmpeg', [
    '-i', 'pipe:0',
    '-f', 'rawvideo',
    '-analyzeduration', '0',
    '-s', '320x180',
    '-pix_fmt', 'rgba',
    '-r', '29.97', // force 30fps?
    'pipe:1'
  ]
);
//videoEncoder.stdout.pipe(process.stdout);

var h = 180;
var w = 320;
var nrOfPixels = w*h;
var corners = [];
var border = 3;
var gray_img = new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);
for (var i = 0; i < nrOfPixels; ++i) {
   corners[i] = new jsfeat.point2d_t(0,0,0,0);
}
var cornerDetection = function (rgba) {
    jsfeat.imgproc.grayscale(rgba, gray_img.data);
    var count = jsfeat.fast_corners.detect(gray_img, corners, border);
    var non_null_corners = [];
    for (var i = 0; i < count; i++) {
        non_null_corners.push(corners[i]);
    }
    var sorted = _.sortBy(non_null_corners, function (corner) {return 1/corner.score;});
//    console.log(sorted[0]);
    if (sorted[0] && sorted[0].score > 75 && sorted[1].score > 75 && sorted[2].score>75) {
            console.log('');
        } else {
            if (Date.now()%2 == 0) {
                console.log('HAHAHAHAH!!!');
                console.log('Hihihihihihi...');
            } else {
                console.log('HOHOHOHO!!');
                console.log('heheheeh...');
            }
        }
}
var _buf = new Buffer(0);
var nrOfBytesPrImage = nrOfPixels*4; 
var rgba = [];
videoEncoder.stdout.on('data', function (buffer) {
    _buf = Buffer.concat([_buf, buffer]);
    if (_buf.length > nrOfBytesPrImage) {
            for (var i = 0; i < nrOfPixels-3; i+=4) {
                rgba[i] = _buf.readUInt8(i); 
                rgba[i+1] = _buf.readUInt8(i+1); 
                rgba[i+2] = _buf.readUInt8(i+2); 
                rgba[i+3] = 0; 
           }
           cornerDetection(rgba);
       _buf = _buf.slice(nrOfBytesPrImage);
    };
});
var port = 5555;
var socket = net.connect({ host: '192.168.1.1', port: port });

socket.pipe(parser);

/**
 * Created by futuc on 30.10.2016.
 */
var static = require('node-static');
var file = new static.Server();
require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(process.env.PORT || 3000);var static = require('node-static');
var file = new static.Server();
require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(process.env.PORT || 3000);
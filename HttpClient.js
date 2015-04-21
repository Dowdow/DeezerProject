
var http = require('http');
var URL  = require('url');

var HttpClient = module.exports = function () {

    this.GET = function(url, callback) {
        this.doRequest('GET', url, null, callback);
    }; // method

    this.PUT = function (url, data, callback) {
        this.doRequest('PUT', url, data, callback);
    }; // method

    this.DELETE = function (url, callback) {
        this.doRequest('DELETE', url, null, callback);
    }; // method

    this.doRequest = function(verb, url, data, callback) {

        var options = {
            hostname: URL.parse(url).hostname,
            port:     URL.parse(url).port,
            path:     URL.parse(url).path,
            method:   verb,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': (data)? data.length: 0
            }
        };

        var req = http.request(options, function(res) {

            var data = "";
            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                data += chunk;
            });

            res.on('end', function () {
                res.body = data;
                callback(res);
            });

        }); // async

        req.write( (data)? data: '');
        req.end();

    }; // method

};
var express = require('express');
var HttpClient = require('./HttpClient')

var app = express();
var http = new HttpClient();

app.get('/', function (request, response) {
    var tracks = [];
    http.GET('http://localhost:5984/deezer', function(resp) {
        tracks = resp.body;
    });
    response.json(tracks);
});

app.get('/tracks', function (request, response) {
    response.json('OK');
});

app.get('/tracks/:id', function (request, response) {
    response.json('OK');
});

app.put('/tracks/:id', function (request, response) {
    response.json('OK');
});

app.delete('/tracks/:id', function (request, response) {
    response.json('OK');
});

var server = app.listen(3000, function () {
    console.log('Listening at http://localhost:%s', server.address().port);
});

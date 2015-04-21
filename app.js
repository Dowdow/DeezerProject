var express = require('express');
var HttpClient = require('./HttpClient')

var app = express();
var http = new HttpClient();

app.get('/', function (request, response) {
    response.json('OK');
});

app.get('/search/:q', function (request, response) {
    http.GET('http://api.deezer.com/search?q=' + request.params.q, function(resp) {
        response.json(JSON.parse(resp.body).data);
    });
});

app.get('/tracks', function (request, response) {
    http.GET('http://localhost:5984/tracks', function(resp) {
        response.json(JSON.parse(resp.body));
    });
});

app.get('/tracks/:id', function (request, response) {
    http.GET('http://localhost:5984/tracks', function(resp) {
        response.json(JSON.parse(resp.body));
    });
});

app.put('/tracks/:id', function (request, response) {
    http.GET('http://api.deezer.com/track/' + request.params.id, function(resp) {
        var track = JSON.parse(resp.body);
        if(track.error) {
            response.json('Track ' + request.params.id + ' does not exist');
            return;
        }
        http.PUT('http://localhost:5984/tracks/' + request.params.id, resp.body, function(resp) {
            response.json('OK');
        });
    });
});

app.delete('/tracks/:id', function (request, response) {
    http.GET('http://localhost:5984/tracks', function(resp) {
        response.json(JSON.parse(resp.body));
    });
});

var server = app.listen(3000, function () {
    console.log('Listening at http://localhost:%s', server.address().port);
});

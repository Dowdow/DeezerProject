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
    http.GET('http://localhost:5984/tracks/_all_docs', function(resp) {
        if(JSON.parse(resp.body).rows) {
            response.json(JSON.parse(resp.body).rows).status(200).end();
        } else {
            response.json('Error when retrieving tracks').status(500).end();
        }
    });
});

app.get('/tracks/:id', function (request, response) {
    http.GET('http://localhost:5984/tracks/' + request.params.id, function(resp) {
        if(JSON.parse(resp.body).id) {
            response.json(JSON.parse(resp.body)).status(200).end();
        } else {
            response.json('Error when retrieving the track').status(500).end();
        }
    });
});

app.put('/tracks/:id', function (request, response) {
    http.GET('http://api.deezer.com/track/' + request.params.id, function(resp) {
        if(JSON.parse(resp.body).error) {
            response.json('Track ' + request.params.id + ' does not exist').status(404).end();
            return;
        }
        http.PUT('http://localhost:5984/tracks/' + request.params.id, resp.body, function(resp) {
            if(JSON.parse(resp.body).ok) {
                response.json('OK').status(201).end();
            } else {
                response.json('Error when adding / updating the track').status(500).end();
            }
        });
    });
});

app.delete('/tracks/:id', function (request, response) {
    http.GET('http://localhost:5984/tracks/3135556', function(resp) {
        if(!JSON.parse(resp.body).id) {
            response.json('Error when retrieving tracks to delete').status(500).end();
            return;
        }
        http.DELETE('http://localhost:5984/tracks/' + request.params.id + '?rev=' + JSON.parse(resp.body)._rev, function(resp) {
            if(JSON.parse(resp.body).ok) {
                response.json('OK').status(200).end();
            } else {
                response.json('Error when deleting the track').status(500).end();
            }
        });
    });
});

var server = app.listen(3000, function () {
    console.log('Listening at http://localhost:%s', server.address().port);
});

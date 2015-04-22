var express = require('express');
var HttpClient = require('./HttpClient')

var app = express();
var http = new HttpClient();

var current = '';
var time = 0;
var vote = 0;

app.get('/', function (request, response) {
    response.json('OK');
});

app.get('/search/:q', function (request, response) {
    http.GET('http://api.deezer.com/search?q=' + request.params.q, function(res) {
        response.json(JSON.parse(res.body).data);
    });
});

app.get('/tracks', function (request, response) {
    http.GET('http://localhost:5984/tracks/_all_docs', function(res) {
        if(JSON.parse(res.body).rows) {
            response.json(JSON.parse(res.body).rows).status(200).end();
        } else {
            response.json('Error when retrieving tracks').status(500).end();
        }
    });
});

app.get('/tracks/:id', function (request, response) {
    http.GET('http://localhost:5984/tracks/' + request.params.id, function(res) {
        if(JSON.parse(res.body).id) {
            response.json(JSON.parse(res.body)).status(200).end();
        } else {
            response.json('Error when retrieving the track').status(500).end();
        }
    });
});

app.put('/tracks/:id', function (request, response) {
    http.GET('http://api.deezer.com/track/' + request.params.id, function(res) {
        if(JSON.parse(res.body).error) {
            response.json('Track ' + request.params.id + ' does not exist').status(404).end();
            return;
        }
        http.PUT('http://localhost:5984/tracks/' + request.params.id, res.body, function(res) {
            if(JSON.parse(res.body).ok) {
                response.json('OK').status(201).end();
            } else {
                response.json('Error when adding / updating the track').status(500).end();
            }
        });
    });
});

app.delete('/tracks/:id', function (request, response) {
    http.GET('http://localhost:5984/tracks/3135556', function(res) {
        if(!JSON.parse(res.body).id) {
            response.json('Error when retrieving tracks to delete').status(500).end();
            return;
        }
        http.DELETE('http://localhost:5984/tracks/' + request.params.id + '?rev=' + JSON.parse(res.body)._rev, function(res) {
            if(JSON.parse(res.body).ok) {
                response.json('OK').status(200).end();
            } else {
                response.json('Error when deleting the track').status(500).end();
            }
        });
    });
});

app.get('/votes', function (request, response) {
    http.GET('http://localhost:5984/votes/' + vote, function(res) {
        if(JSON.parse(res.body).votes) {
            response.json(JSON.parse(res.body).votes).status(200).end();
        } else {
            response.json([]).status(200).end();
        }
    });
});

app.put('/votes/:id', function (request, response) {
    http.GET('http://localhost:5984/votes/' + vote, function(res) {
        if(JSON.parse(res.body).votes) {
            var votes = JSON.parse(res.body);
            for(var v in votes.votes) {
                if(votes.votes[v].id == request.params.id) {
                    votes.votes[v].vote++;
                }
            }
            http.PUT('http://localhost:5984/votes/' + vote, JSON.stringify(votes), function(res) {
                if(JSON.parse(res.body).ok) {
                    response.json('OK').status(201).end();
                } else {
                    response.json('Error when adding the vote').status(500).end();
                }
            });
        }
    });
});

function createVote() {
    http.GET('http://localhost:5984/tracks/_all_docs', function(res) {
        if(JSON.parse(res.body).rows) {
            var tracks = JSON.parse(res.body).rows;
            var votes = { 'id': vote, 'votes': [] };
            for(var t in tracks) {
                votes.votes.push({ 'id': tracks[t].id, 'vote': 0 });
            }
            http.PUT('http://localhost:5984/votes/' + vote, JSON.stringify(votes), function(res) {});
        }
    });
}

function purgeVotes() {
    http.GET('http://localhost:5984/votes/_all_docs', function(res) {
        if(JSON.parse(res.body).rows) {
            var votes = JSON.parse(res.body).rows;
            for (var v in votes) {
                http.DELETE('http://localhost:5984/votes/' + votes[v].id + '?rev=' + votes[v].value.rev, function(res) {});
            }
        }
    });
}

var server = app.listen(3000, function () {
    console.log('Listening at http://localhost:%s', server.address().port);
    console.log('Purging votes ...');
    purgeVotes();
    console.log('OK');
    console.log('Initializing votes ...');
    createVote();
    console.log('OK');
    // Lancer une musique au pif
    /*for(var i = 0; i <  20; i++) {
     time = 0;
     setInterval(function() {
     time++;
     }, 1000);
     vote++;
     createVote();
     }*/
});

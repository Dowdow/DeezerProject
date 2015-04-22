var express = require('express');
var HttpClient = require('./HttpClient');
var path = require('path');

var app = express();
var http = new HttpClient();

var COUCHDB_SERVER = 'http://localhost:5984';

var current = '';
var time = 0;
var duration = 0;
var vote = 0;

app.use('/style', express.static(__dirname + '/style'));
app.use('/script', express.static(__dirname + '/script'));
app.use('/images', express.static(__dirname + '/images'));

app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/search/:q', function (request, response) {
    http.GET('http://api.deezer.com/search?q=' + request.params.q, function(res) {
        response.json(JSON.parse(res.body).data);
    });
});

app.get('/tracks', function (request, response) {
    http.GET(COUCHDB_SERVER + '/tracks/_all_docs', function(res) {
        if(JSON.parse(res.body).rows) {
            response.json(JSON.parse(res.body).rows).status(200).end();
        } else {
            response.json('Error when retrieving tracks').status(500).end();
        }
    });
});

app.get('/tracks/:id', function (request, response) {
    http.GET(COUCHDB_SERVER + '/tracks/' + request.params.id, function(res) {
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
        http.PUT(COUCHDB_SERVER + '/tracks/' + request.params.id, res.body, function(res) {
            if(JSON.parse(res.body).ok) {
                response.json('OK').status(201).end();
            } else {
                response.json('Error when adding / updating the track').status(500).end();
            }
        });
    });
});

app.delete('/tracks/:id', function (request, response) {
    http.GET(COUCHDB_SERVER + '/tracks/3135556', function(res) {
        if(!JSON.parse(res.body).id) {
            response.json('Error when retrieving tracks to delete').status(500).end();
            return;
        }
        http.DELETE(COUCHDB_SERVER + '/tracks/' + request.params.id + '?rev=' + JSON.parse(res.body)._rev, function(res) {
            if(JSON.parse(res.body).ok) {
                response.json('OK').status(200).end();
            } else {
                response.json('Error when deleting the track').status(500).end();
            }
        });
    });
});

app.get('/current', function (request, response) {
    console.log(current);
    http.GET(COUCHDB_SERVER + '/tracks/' + current, function(res) {
        if(JSON.parse(res.body).id) {
            var track = JSON.parse(res.body);
            track.currentduration = (time / track.duration) * 100 ;
            response.json(track).status(200).end();
        } else {
            response.json('Error when retrieving the track').status(500).end();
        }
    });
});


app.get('/votes', function (request, response) {
    http.GET(COUCHDB_SERVER + '/votes/' + vote, function(res) {
        if(JSON.parse(res.body).votes) {
            response.json(JSON.parse(res.body).votes).status(200).end();
        } else {
            response.json([]).status(200).end();
        }
    });
});

app.put('/votes/:id', function (request, response) {
    http.GET(COUCHDB_SERVER + '/votes/' + vote, function(res) {
        if(JSON.parse(res.body).votes) {
            var votes = JSON.parse(res.body);
            for(var v in votes.votes) {
                if(votes.votes[v].id == request.params.id) {
                    votes.votes[v].vote++;
                    break;
                }
            }
            http.PUT(COUCHDB_SERVER + '/votes/' + vote, JSON.stringify(votes), function(res) {
                if(JSON.parse(res.body).ok) {
                    response.json('OK').status(201).end();
                } else {
                    response.json('Error when adding the vote').status(500).end();
                }
            });
        }
    });
});

function createVotes() {
    http.GET(COUCHDB_SERVER + '/tracks/_all_docs', function(res) {
        if(JSON.parse(res.body).rows) {
            var tracks = JSON.parse(res.body).rows;
            var votes = { 'id': vote, 'votes': [] };
            for(var t in tracks) {
                votes.votes.push({ 'id': tracks[t].id, 'vote': 0 });
            }
            http.PUT(COUCHDB_SERVER + '/votes/' + vote, JSON.stringify(votes), function(res) {});
        }
    });
}

function purgeVotes() {
    http.GET(COUCHDB_SERVER + '/votes/_all_docs', function(res) {
        if(JSON.parse(res.body).rows) {
            var votes = JSON.parse(res.body).rows;
            for (var v in votes) {
                http.DELETE(COUCHDB_SERVER + '/votes/' + votes[v].id + '?rev=' + votes[v].value.rev, function(res) {});
            }
        }
    });
}

function initialiseTrack() {
    http.GET(COUCHDB_SERVER + '/tracks/_all_docs', function(res) {
        if(JSON.parse(res.body).rows) {
            current = JSON.parse(res.body).rows[0].id;
            http.GET(COUCHDB_SERVER + '/tracks/' + current, function(res) {
                if(JSON.parse(res.body).id) {
                    duration = JSON.parse(res.body).duration;
                }
            });
        }
    });
}

function change() {
    http.GET(COUCHDB_SERVER + '/votes/' + vote, function(res) {
        if(JSON.parse(res.body).votes) {
            var votes = JSON.parse(res.body).votes;
            var id  = votes[0].id, nb = votes[0].vote;
            for(var v in votes) {
                if(votes[v].vote > nb) {
                    id = votes[v].id;
                    nb = votes[v].vote;
                }
            }
            current = id;
            http.GET(COUCHDB_SERVER + '/tracks/' + current, function(res) {
                if(JSON.parse(res.body).id) {
                    duration = JSON.parse(res.body).duration;
                }
            });
        }
    });
}

function core() {
    time = 0;
    console.log(current);
    var interval = setInterval(function() {
        if(time == duration) {
            console.log('Timer fini');
            clearInterval(interval);
        }
        time++;
        console.log(time);
    }, 1000);
    setTimeout(function() {
        console.log('Musique finie');
        change();
        vote++;
        createVotes();
        setTimeout(core, 3000);
    }, duration * 1000);
}

var server = app.listen(3000, function () {
    console.log('Listening at http://localhost:%s', server.address().port);
    console.log('Purging votes ...');
    purgeVotes();
    console.log('OK');
    console.log('Initializing votes ...');
    createVotes();
    console.log('OK');
    initialiseTrack();
    setTimeout(core, 3000);
});
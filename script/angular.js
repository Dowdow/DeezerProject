var app = angular.module('app', []);

app.factory('factory', function($http, $q) {
    var factory = {
        getSearch: function(query) {
            var deferred = $q.defer();
            $http.get('http://localhost:3000/search/' + query)
                .success(function (response) {
                    deferred.resolve(response);
                })
                .error(function (response){console.log("PAS OK")});
            return deferred.promise;
        },
        getTracks: function() {
            var deferred = $q.defer();
            $http.get('http://localhost:3000/tracks')
                .success(function (response) {
                    var tracks = {};
                    angular.forEach(response, function(value, key) {
                        factory.getTrack(value.id).then(function(track) {
                            tracks[track.id] = track;
                        });
                    });
                    factory.getVotes().then(function(votes) {
                        angular.forEach(votes, function(value, key) {
                            if(tracks[value.id]) {
                                tracks[value.id].vote = value.vote;
                            }
                        });
                    });
                    deferred.resolve(tracks);
                })
                .error(function (response){console.log("PAS OK")});
            return deferred.promise;
        },
        getTrack: function(id) {
            var deferred = $q.defer();
            $http.get('http://localhost:3000/tracks/' + id)
                .success(function (response) {
                    deferred.resolve(response);
                })
                .error(function (response){console.log("PAS OK")});
            return deferred.promise;
        },
        getVotes: function() {
            var deferred = $q.defer();
            $http.get('http://localhost:3000/votes')
                .success(function (response) {
                    deferred.resolve(response);
                })
                .error(function (response){console.log("PAS OK")});
            return deferred.promise;
        },
        getCurrent: function() {
            var deferred = $q.defer();
            $http.get('http://localhost:3000/current')
                .success(function (response) {
                    deferred.resolve(response);
                })
                .error(function (response){console.log("PAS OK")});
            return deferred.promise;
        },
        putTrack: function(id) {
            $http.put('http://localhost:3000/tracks/' + id)
                .success(function (response) {
                    console.log('OK');
                })
                .error(function (response){console.log("PAS OK")});
        },
        putVote: function(id) {
            $http.put('http://localhost:3000/votes/' + id)
                .success(function (response) {
                    console.log('OK');
                })
                .error(function (response){console.log("PAS OK")});
        }
    };
    return factory;
});

app.controller('tracksCtrl', function($scope, factory) {
    factory.getTracks().then(function(tracks) {
        $scope.tracks = tracks;
    });
    $scope.onTracks = function() {
        factory.getTracks().then(function(tracks) {
            $scope.tracks = tracks;
        });
    };
    $scope.onAddVote = function(id) {
        factory.putVote(id);
    };
});

app.controller('currentCtrl', function($scope, factory) {
    factory.getCurrent().then(function(current) {
        $scope.current = current;
    });
    $scope.onCurrent = function() {
        factory.getCurrent().then(function(current) {
            $scope.current = current;
        });
    };
});

app.controller('searchCtrl', function($scope, factory) {
    $scope.onSearch = function(query) {
        $scope.search = factory.getSearch(query).then(function(tracks) {
            $scope.search = tracks;
        });
    };
    $scope.onAddTrack = function(id) {
        factory.putTrack(id);
    };
});
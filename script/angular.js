var app = angular.module('app', []);

app.factory('factory', function($http, $q) {
    var factory = {
        search: function() {

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
                            tracks[value.id].vote = value.vote;
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
        }
    };
    return factory;
});

app.controller('tracksCtrl', function($scope, factory) {
    $scope.tracks = factory.getTracks().then(function(tracks) {
        $scope.tracks = tracks;
    });
});

app.controller('currentCtrl', function($scope, $http) {
    $scope.current = factory.getCurrent().then(function(current) {
        $scope.current = current;
    });
});
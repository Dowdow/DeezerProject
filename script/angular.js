var app = angular.module('myApp', []);
app.controller('tracksCtrl', function($scope, $http) {
    $http.get("http://localhost:3000/tracks")
        .success(function (response) {$scope.tracks = response; console.log(response)})
        .error(function (response){console.log("PAS OK")});
});

app.controller('trackCtrl', function($scope, $http) {
    $http.get("http://localhost:3000/tracks/3135556")
        .success(function (response) {$scope.tracks2 = response; console.log(response)})
        .error(function (response){console.log("PAS OK")});
});

app.controller('voteCtrl', function($scope, $http) {
    $http.get("http://localhost:3000/votes")
        .success(function (response) {$scope.votes = response; console.log(response)})
        .error(function (response){console.log("PAS OK")});
});
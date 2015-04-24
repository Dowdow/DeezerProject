/* Initialisation Deezer */
$(document).ready(function() {
    DZ.init({
        appId  : '155951',
        channelUrl : 'http://localhost:3000',
        player : {
            onload : function(){
            }
        }
    });

    $('.pause').hide();
    $('.play').hide();
    $('.logout').hide();

    /* Deezer login */
    $('.connection-btn').click(function() {
        DZ.login(function(response) {
            if (response.authResponse) {
                DZ.api('/user/me', function(response) {
                    $('#username').html(response.name);
                    $('.connection-btn').hide();
                    $('.play').show();
                    $('.logout').show();
                });
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        }, {perms: 'basic_access,email'});
    });

    /* Deezer logout */
    $('.logout').click(function() {
        DZ.player.pause();
        DZ.logout(function() {
            $('.pause').hide();
            $('.play').hide();
            $('.logout').hide();
            $('.connection-btn').show();
        });
    });

    /* Radio play */
    $('.play').click(function() {
        angular.element($('.player')).scope().onCurrent();
        var track = angular.element($('.player')).scope().current;
        DZ.player.playTracks([track.id]);
        setTimeout(function() {
            DZ.player.seek(parseInt(track.currentduration));
        },1000);
        $( ".play" ).hide();
        $( ".pause" ).show();
    });

    /* Radio pause */
    $('.pause').click(function() {
        DZ.player.pause();
        $( ".pause" ).hide();
        $( ".play" ).show();
    });

    /* Switch track */
    DZ.Event.subscribe('track_end', function(duration, evt_name){
        angular.element($('.player')).scope().onCurrent();
        setTimeout(function() {
            var track = angular.element($('.player')).scope().current;
            DZ.player.playTracks([track.id]);
        },1000);
        $('.addVote').show();
    });

    /* Refresh loop */
    var loop = setInterval(function() {
        console.log('Refreshing ...');
        angular.element($('#playlist')).scope().onTracks();
        angular.element($('.player')).scope().onCurrent();
    }, 10000);

    /* Switch theme */
    function appendStyleSheet() {
        $('head').append('<link rel="stylesheet" href="style/style2.css" id="hc_stylesheet">');
    }

    function appendStyleSheet2() {
        $('head').append('<link rel="stylesheet" href="style/style.css" id="lc_stylesheet">');
    }
    if ($.cookie('high_contrast') == 'true') {
        appendStyleSheet();
    }

    $(".changer").click(function () {
        console.log('Test');

        // append the style sheet on load if the cookie is set to true
        if ($.cookie('high_contrast') != 'true') {
            appendStyleSheet();
            $.cookie('high_contrast', 'true'); // set the cookie to true
            $("#lc_stylesheet").remove();
        }
        else {
            // remove the high-contrast style
            appendStyleSheet2();
            $("#hc_stylesheet").remove();
            $.cookie('high_contrast', 'false');
        }
    });

    /* Search Deezer */
    $('.butAdd').click(function(){
        $('.butAdd').hide();
        $('.search').show();
    });

    $('.searchStart').click(function(){
        angular.element($('.searchResults')).scope().onSearch($('#search').val());
        $('table#playlist').hide();
        $('.searchStart').hide();
        $('table.searchResults').show();
        $('.searchReturn').show();
    });

    $('.searchReturn').click(function(){
        $('table.searchResults').hide();
        $('.searchReturn').hide();
        $('table#playlist').show();
        $('.searchStart').show();
        $('.search').hide();
        $('.butAdd').show();
    });

});

function addTrack(event) {
    angular.element($('.searchResults')).scope().onAddTrack(event.target.attributes['track'].nodeValue);
    $('table.searchResults').hide();
    $('.searchReturn').hide();
    $('table#playlist').show();
    $('.searchStart').show();
    $('.search').hide();
    $('.butAdd').show();
}

function addVote(event) {
    $('.addVote').hide();
    angular.element($('#playlist')).scope().onAddVote(event.target.attributes['track'].nodeValue);
}
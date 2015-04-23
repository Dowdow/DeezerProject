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
        DZ.player.playTracks([3135563]);
        $( ".play" ).hide();
        $( ".pause" ).show();
    });

    /* Radio pause */
    $('.pause').click(function() {
        DZ.player.pause();
        $( ".pause" ).hide();
        $( ".play" ).show();
    });

    /* Music Add */
    $('.butAdd').click(function(){
        $('.butAdd').hide();
        $('.search').show();
    });

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
});
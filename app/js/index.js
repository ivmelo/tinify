// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var spotify = require('spotify-node-applescript');
var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi();

var nowPlaying = null;

$(document).ready(function(){
    console.log('hello');

    $('.button-playpause').on('click', function(){
        console.log('pressed');
        spotify.playPause();
    });

    spotify.getTrack(function(err, track){
        updateDisplay(track);

        nowPlaying = track;
    });

    (function(){
        spotify.getTrack(function(err, track){
            if (track != nowPlaying) {
                nowPlaying = track;
                updateDisplay(track);
            }
        });

        // Repeat every minute.
        setTimeout(arguments.callee, 1000);
    })();
});

function updateDisplay(track) {
    $('h1').html(track.name);
    $('h2').html(track.artist);
    $('h3').html(track.album);

    // Split to get the track alphanumeric ID.
    var trackId = track.id.split(':')[2];

    spotifyApi.getTrack(trackId)
    .then(function(data) {
        var album_cover = data.body.album.images[0].url;
        $('.album-cover').attr('src', album_cover);

        $('body').css('background-image', 'url("' + album_cover + '")');


        console.log('NEW SONG');
    }, function(err) {
        console.error(err);
    });

    console.log(track);
}

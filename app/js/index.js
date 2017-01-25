// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var ipc = require('electron').ipcRenderer;
var spotify = require('spotify-node-applescript');
var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi();
var nowPlayingTrackId = null;

$(document).ready(function(){
    console.log('hello');

    $('.button-playpause').on('click', function(){
        console.log('play-pause');
        $(this).children().first().toggleClass('fa-play');
        $(this).children().first().toggleClass('fa-pause');
        spotify.playPause();
    });

    $('.button-next').on('click', function(){
        console.log('next');
        spotify.next();
        ipc.send('song-changed', 'track');
    });

    $('.button-previous').on('click', function(){
        console.log('previous');
        spotify.previous();
    });

    spotify.getTrack(function(err, track){
        updateDisplay(track);

        nowPlayingTrackId = track.id;
    });

    // Monitor track names and metadata.
    (function(){
        spotify.getTrack(function(err, track){
            if (nowPlayingTrackId != track.id) {
                nowPlayingTrackId = track.id;
                updateDisplay(track);
            }
        });

        // Repeat every minute.
        setTimeout(arguments.callee, 1000);
    })();

});

function updateDisplay(track) {
    $('.info-song').html(track.name);
    $('.info-artist').html(track.artist);
    $('.info-album').html(track.album);

    // Split to get the track alphanumeric ID.
    var trackId = track.id.split(':')[2];

    spotifyApi.getTrack(trackId)
    .then(function(data) {
        var album_cover = data.body.album.images[0].url;
        $('.cover-image').attr('src', album_cover);
        $('body').css('background-image', 'url("' + album_cover + '")');
        console.log('NEW SONG');
    }, function(err) {
        console.error(err);
    });

    console.log(track);
}

function getMinSecDuration() {
    var curMin = Math.floor(state.position / 60);
    var curSec = state.position % 60;

    return curMin + ':' + curSec;
}

console.log(ipc);

ipc.on('song-changed', function(event, args){
    console.log('IPC-SONG-CHANGED');
});

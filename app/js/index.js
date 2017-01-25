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

// Updates the music metadata being displayed on the screen.
function updateDisplay(track) {
    $('.info-song').html(track.name);
    $('.info-artist').html(track.artist);
    $('.info-album').html(track.album);

    // Split to get the track alphanumeric ID.
    var trackId = track.id.split(':')[2];

    // Api call to get cover album from WEB Api.
    spotifyApi.getTrack(trackId)
    .then(function(data) {
        var album_cover = data.body.album.images[0].url;
        $('.cover-image').attr('src', album_cover);
        $('body').css('background-image', 'url("' + album_cover + '")');
        ipc.send('song-changed', data); // Notify main proccess.

        console.log(data);
    }, function(err) {
        console.error(err);
    });

    console.log(track);
}

// Returns a readable song duration.
function getMinSecDuration() {
    var curMin = Math.floor(state.position / 60);
    var curSec = state.position % 60;
    return curMin + ':' + curSec;
}

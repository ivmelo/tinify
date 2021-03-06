var ipc = require('electron').ipcRenderer;
var spotify = require('spotify-node-applescript');
var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi();
var nowPlayingTrackId = null;
var nowPlayingTrackDuration = null;

$(document).ready(function(){

    // Player actions.
    $('.button-playpause').on('click', function(){
        console.log('play-pause');
        $(this).children().first().toggleClass('fa-play');
        $(this).children().first().toggleClass('fa-pause');
        spotify.playPause();
        ipc.send('resize-player');

    });

    $('.button-next').on('click', function(){
        spotify.next();
        console.log('next');
        spotify.getTrack(function(err, track){
            if (nowPlayingTrackId != track.id) {
                nowPlayingTrackId = track.id;
                updateDisplay(track);
            }
        });
    });

    $('.button-previous').on('click', function(){
        spotify.previous();
        console.log('previous');
        spotify.getTrack(function(err, track){
            if (nowPlayingTrackId != track.id) {
                nowPlayingTrackId = track.id;
                updateDisplay(track);
            }
        });
    });

    // UI.
    $('.player-info').mouseover(function(){
        $('.track-info').hide();
    }).mouseout(function(){
        $('.track-info').show();
    });

    // Backend...

    spotify.getTrack(function(err, track){
        updateDisplay(track);

        nowPlayingTrackId = track.id;
    });

    // Monitor track names and metadata.
    (function(){
        spotify.getTrack(function(err, track){
            if (nowPlayingTrackId != track.id) {
                updateDisplay(track);
            }
        });

        // Repeat every minute.
        setTimeout(arguments.callee, 1000);
    })();

    (function(){
        spotify.getState(function(err, state){
            /*
            state = {
                volume: 99,
                position: 232,
                state: 'playing'
            }
            */

            // var progress = (state.position / nowPlayingTrackDuration) * 100;

            var progress = ((state.position * 1000) / nowPlayingTrackDuration) * 100;

            console.log(state.position * 1000 + ' - ' + nowPlayingTrackDuration + ' - ' + progress.toFixed(2));

            $('.progress-bar').css('width', progress + '%');
        });

        // Repeat every minute.
        setTimeout(arguments.callee, 1000);
    })();

});

// Updates the music metadata being displayed on the screen.
function updateDisplay(track) {
    nowPlayingTrackId = track.id;
    nowPlayingTrackDuration = track.duration;

    $('.info-song').html(track.name);
    // $('.info-artist').html(track.artist);
    // $('.info-album').html(track.album);
    $('.info-artist-album').html(track.artist + ' - ' + track.album);


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

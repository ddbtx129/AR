
window.addEventListener('DOMContentLoaded', function () {

    var arg = {};
    var pair = location.search.substring(1).split('&');

    for (var i = 0; pair[i]; i++) {
        var kv = pair[i].split('=');
        arg[kv[0]] = decodeURIComponent(kv[1]);
    }

    var isMp4 = !!(dataObj.path || '').match(/\.mp4$/i);

    var btn = document.getElementById('player');


    if (isMp4) {

        var videoinfo = document.createElement("div");
        videoinfo.setAttribute('id', 'info1');
        videoinfo.setAttribute('info1', 'info1');

        var videotag = document.createElement("a");
        videotag.setAttribute('id', 'swPlay');
        videotag.setAttribute('info1', 'InfoItem');

        var videotext = document.createElement("p");
        videotext.setAttribute('id', 'p1');
        var pbr = document.createElement('br')
        var ptext1 = document.createTextNode('画面をタップすると、再生が開始されます。\n\n音声が流れますのでご注意下さい。');

        var play = document.createElement("img");
        play.setAttribute('id', 'player');
        play.setAttribute('class', 'playbutton');
        play.setAttribute('src', 'asset/play.png');
        play.style.display = 'inline';

        videotext.appendChild(ptext1);
        videotag.appendChild(videotext);
        videoinfo.appendChild(videotag);

        document.body.appendChild(videoinfo);
        document.body.appendChild(play);
    }
});

(function () {

    var arg = {};
    var pair = location.search.substring(1).split('&');

    for (var i = 0; pair[i]; i++) {
        var kv = pair[i].split('=');
        arg[kv[0]] = decodeURIComponent(kv[1]);
    }

    var dataObj = {
        path: (!(arg.ObjectList) ?
            (arg.ObjectList1 + '/' + arg.ObjectList2)
            :
            (!(arg.ObjectList) ? '' : arg.ObjectList))
    };

    var isMp4 = !!(dataObj.path || '').match(/\.mp4$/i);
    window.alert(dataObj.path);
    window.alert(!!isMp4);

    window.alert(110);
    if (isMp4) {
        window.alert(111);

        var divEl = document.createElement("div");
        divEl.setAttribute('id', 'info1');
        divEl.setAttribute('info1', 'info1');
        window.alert(112);

        var aEl = document.createElement("a");
        aEl.setAttribute('id', 'swPlay');
        aEl.setAttribute('info1', 'InfoItem');
        window.alert(113);

        var pEl = document.createElement("p");
        pEl.setAttribute('id', 'p1');
        var pbr = document.createElement('br')
        var pText1 = document.createTextNode('画面をタップすると、再生が開始されます。\n\n音声が流れますのでご注意下さい。');
        window.alert(114);

        var bPlay = document.createElement("img");
        bPlay.setAttribute('id', 'player');
        bPlay.setAttribute('class', 'playbutton');
        bPlay.setAttribute('src', 'asset/play.png');
        bPlay.style.display = 'inline';
        window.alert(115);

        pEl.appendChild(pText1);
        aEl.appendChild(videotext);
        divEl.appendChild(aEl);
        window.alert(116);

        document.body.appendChild(divEl);
        document.body.appendChild(plbPlayay);
        window.alert(117);
    }

}());
﻿var videostate = 0;

//AFRAME.registerComponent('markerhandler', {
//    init: function () {

//        // ビデオ格納用の変数定義を追加
//        var video = document.querySelector('#source1');
//        var marker = this.el;

//        // マーカーを検出したイベントの登録
//        marker.addEventListener('markerFound', function (e) {
            
//            if (objecttype == "mp4") {
//                if (videostate == 0) {
//                    document.getElementById("player").style.display = 'inline';
//                }
//                // マーカー認識したら、ビデオ再生
//                video.play();
//                videostate = 1
//            };
//        });

//        // マーカーを見失ったイベントの登録
//        marker.addEventListener('markerLost', function () {

//            if (objecttype == "mp4") {
//                // マーカー認識が外れたら、、ビデオ停止
//                video.pause();
//                videostate = 2;
//            }
//        });
//    }
//});

//AFRAME.registerComponent('videohandler', {
//    init: function () {

//    }
//});

window.addEventListener('DOMContentLoaded', function () {

    var btn = document.getElementById('player');

    btn.addEventListener('click', function () {

        //if (objecttype == "mp4") {

        //    if (videostate >= 1 && videostate < 2) {

        //        var video = document.querySelectorAll('#source');
        //        for (var i = 0; i < video.length; i++) {
        //            video[i].play();
        //        }

        //        videostate = 1;

        //        // プレインボタン 非表示
        //        document.getElementById("player").style.display = 'none';

        //        p1.style.display = "none";
        //        info1.style.display = "none";
        //    }
        //}
    })

    //if (objecttype == "mp4") {

    //    var v = document.querySelector('#source1');

    //    //再生可能
    //    v.addEventListener('canplay', function (e) {

    //        //if (viewmode == 'pv') {
    //        //    var video = document.querySelector('#source1');
    //        //    document.getElementById("player").style.display = 'inline';

    //        //    videostate = 1;
    //        //}

    //        //videocanplayInvalid(e);
    //    })

    //    v.load();

    //    function videocanplayInvalid(e) {
    //        e.preventDefault();
    //    }
    //}
});

var videostate = 0;

AFRAME.registerComponent('videohandler', {
    init: function () {

        // ビデオ格納用の変数定義を追加
        var video = document.querySelector('#ar-video');
        //var marker = this.el;
        var marker = document.querySelector('#arMarker');
        //video = document.querySelector('#ar-video');

        // マーカーを検出したイベントの登録
        marker.addEventListener('markerFound', function () {

            if (videostate == 0) {
                document.getElementById("player").style.display = 'inline';
            }

            // マーカー認識したら、ビデオ再生
            video.play();
            videostate = 1;
        });

        // マーカーを見失ったイベントの登録
        marker.addEventListener('markerLost', function () {

            // マーカー認識が外れたら、、ビデオ停止
            video.pause();
            videostate = 2;
        });
    }
});

window.addEventListener('DOMContentLoaded', function () {

    var btn = document.getElementById('player');

    btn.addEventListener('click', function () {

        if (videostate >= 1 && videostate < 2) {

            var video = document.querySelector('#ar-video');
            video.play();

            videostate = 1;

            // プレインボタン 非表示
            document.getElementById("player").style.display = 'none';

            p1.style.display = "none";
            info1.style.display = "none";
        }
    });
});




var videostate = 0;

AFRAME.registerComponent('markerhandler', {
    init: function () {

        // ビデオ格納用の変数定義を追加
        var video = document.querySelector('#source');
        var marker = this.el;

        // マーカーを検出したイベントの登録
        marker.addEventListener('markerFound', function () {

            if (objecttype == "video") {
                if (videostate == 0) {
                    document.getElementById("player").style.display = 'inline';
                }
                // マーカー認識したら、ビデオ再生
                video.play();
                videostate = 1
            };
        });

        // マーカーを見失ったイベントの登録
        marker.addEventListener('markerLost', function () {
            if (objecttype == "video") {

                // マーカー認識が外れたら、、ビデオ停止
                video.pause();
                videostate = 2;
            }
        });
    }
});


AFRAME.registerComponent('videohandler', {
    init: function () {

    }
});

window.addEventListener('DOMContentLoaded', function () {

    var btn = document.getElementById('player');

    btn.addEventListener('click', function () {

        if (objecttype == "video") {

            if (videostate >= 1 && videostate < 2) {

                var video = document.querySelector('#source');
                video.play();

                videostate = 1;

                // プレインボタン 非表示
                document.getElementById("player").style.display = 'none';

                p1.style.display = "none";
                info1.style.display = "none";
            }
        }
    })

    var v = document.querySelector('#main');

    //ロード開始
    v.addEventListener('loadedmetadata', function () {

    })
    //読み込み完了
    v.addEventListener('loadeddata', function () {
        if (objecttype == "video") {
            window.alert("読み込み完了");
        }
    })
    //再生可能
    v.addEventListener('canplay', function () {
        if (objecttype == "video") {
            window.alert("再生可能");
        }
    })
    //再生中
    v.addEventListener('playing', function () {

    })
});




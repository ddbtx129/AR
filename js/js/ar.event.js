var videostate = 0;

AFRAME.registerComponent('videohandler', {
    init: function () {

        // ビデオ格納用の変数定義を追加
        var video = null;
        var marker = this.el;

        video = document.querySelector('#ar-video');

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

//AFRAME.registerComponent('move-object', {
//    init: function () {
//        document.addEventListener('click', (e) => {
//            let rect = document.querySelector('body').getBoundingClientRect();

//            // カメラに写る幅とスクリーン幅の比
//            const d = a / rect.width;
//            const x = (e.clientX - rect.width / 2) * d;
//            const y = -(e.clientY - rect.height / 2) * d;

//            // オブジェクトを配置
//            const obj = document.querySelector("a-sphere");
//            obj.object3D.position.set(x, y, -z);
//        })
//    }
//});

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

var cameraFacing = false;

window.addEventListener('DOMContentLoaded', function () {

    var change_btn = document.querySelector('#swCamera');

    // clickイベントリスナーで、切り替えボタンがタップされた時に切り替えを行う。
    change_btn.addEventListener("click", function (e) {

        e.preventDefault();

        var vi = document.querySelector('video');
        const mode = cameraFacing ? "environment" : "user";

        // フロントカメラをそのまま使うと、左右反転してしまうので、activeクラスとcssでミラー処理
        cameraFacing ? document.querySelector('video').classList.remove("active") : document.querySelector('video').classList.add("active");
        // canvasはAR.jsを使っている時
        cameraFacing ? document.querySelector('canvas').classList.remove("active") : document.querySelector('canvas').classList.add("active");

        // Android Chromeでは、セッションを一時停止しないとエラーが出ることがある
        stopStreamedVideo(vi);

        // カメラ切り替え
        navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } })
            .then(stream => vi.srcObject = stream)
            .catch(err => alert(`${err.name} ${err.message}`));

        cameraFacing = !cameraFacing;

    })
});

// videoセッション一時停止
function stopStreamedVideo(videoElem) {

    let stream = videoElem.srcObject;
    let tracks = stream.getTracks();

    tracks.forEach(function (track) {
        track.stop();
    });

    videoElem.srcObject = null;
}
var warningmsg;

(function () {

    var msg = document.getElementById('warningmsg');

    if (msg != null) {
        mloader.innerHTML = warningmsg + "<br/>" + '※ 画面をタップすると表示を開始します。';
    }

}());
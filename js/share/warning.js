var warningmsg = '';

(function (global) {

    var msg = document.getElementById('warningmsg');

    if (msg != null) {
        msg.innerHTML = warningmsg + "<br/>" + '※ 画面をタップすると表示を開始します。';
    }

}());
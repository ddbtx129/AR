var warningmsg;


(function () {

    var self = this;

    var arg = {};
    var viewIdx = {};

    var pair = location.search.substring(1).split('&');

    for (var i = 0; pair[i]; i++) {
        var kv = pair[i].split('=');
        arg[kv[0]] = decodeURIComponent(kv[1]);
    }

    if (!!(arg[0].msg)) {
        msg.innerHTML = (arg[0].msg) + "<br/>" + '※ 画面をタップすると表示を開始します。';
    }

});

function warningmessage(msg) {
    warningmsg = msg;
};
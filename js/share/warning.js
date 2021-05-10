var warningmsg;

(function () {

    var arg = {};

    var pair = location.search.substring(1).split('&');

    for (var i = 0; pair[i]; i++) {
        var kv = pair[i].split('=');
        arg[kv[0]] = decodeURIComponent(kv[1]);
    }

    if (!!(arg.msg)) {
        var maginfo = document.getElementById('warningmsg');
        if (maginfo != null) {
            console.log('2.' + arg.msg);
            maginfo.innerHTML = atob(arg.msg) + '<br/><br/>' + 'ＡＲを表示できませんでした。';
        }
    }

}());
var warningmsg;

(function () {

    console.log(0);
    var arg = {};
    console.log(0);
    var pair = location.search.substring(1).split('&');
    console.log(0);
    for (var i = 0; pair[i]; i++) {
        var kv = pair[i].split('=');
        arg[kv[0]] = decodeURIComponent(kv[1]);
    }
    console.log(0);
    if (!!(arg.msg)) {
        var maginfo = document.getElementById('warningmsg');
        console.log('1.' + arg.msg);
        if (maginfo != null) {
            console.log('2.' + arg.msg);
            maginfo.innerHTML = (arg.msg) + '<br/><br/>' + 'ＡＲを表示できませんでした。';
        }
    }

}());
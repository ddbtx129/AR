
(function () {

    if (navigator.userAgent.indexOf('iPhone') > 0 || navigator.userAgent.indexOf('Android') > 0
        && navigator.userAgent.indexOf('Mobile') > 0 || navigator.userAgent.indexOf('iPad') > 0 || navigator.userAgent.indexOf('Android') > 0) {

        if (navigator.userAgent.indexOf('iPhone') > 0 || navigator.userAgent.indexOf('iPad') > 0) {

            if (iosVersion() >= 11) {

                // TODO: iOS 11.0以上の場合
                if (navigator.userAgent.indexOf('Safari') == -1) {
                    //window.alert('【Safari】をご使用下さい。')
                    //location.href = "https://www.aoshima-bk.co.jp/special/webar/warning.php"
                    Err_Exit('【Safari】をご使用下さい。');
                }

            } else {
                //window.alert('このバージョンのiOSは対応していません。iOS11以上をご使用下さい。')
                //location.href = "https://www.aoshima-bk.co.jp/special/webar/warning.php"
                Err_Exit('このバージョンのiOSは対応していません。iOS11以上をご使用下さい。');
            }

        } else if (navigator.userAgent.indexOf('Android') > 0 && navigator.userAgent.indexOf('Chrome') == -1) {
            //window.alert('【Chrome】をご使用下さい。')
            //location.href = "https://www.aoshima-bk.co.jp/special/webar/warning.php"
            Err_Exit('【Chrome】をご使用下さい。');
        }

        var param = GetQueryString();

        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        month = ('0' + month).slice(-2);
        day = ('0' + day).slice(-2);

        if (param['ed'] != null) {

            if (parseInt(param['ed'].toString(), 16).toString(10) < (year + month + day).toString()) {
                //window.alert('表示期限が終了しているため、表示することができません。')
                //location.href = "https://www.aoshima-bk.co.jp/special/webar/warning.php"
                Err_Exit('表示期限が終了しているため、表示することができません。');
            }
        }

    } else {
        //window.alert('パソコンで表示することはできません。')
        //location.href = "https://www.aoshima-bk.co.jp/special/webar/warning.php"
            Err_Exit('パソコンで表示することはできません。');
    }

    function iosVersion() {
        var v, versions;
        if (/iP(hone|od|ad)/.test(navigator.platform)) {
            // supports iOS 2.0 and later: &lt;http://bit.ly/TJjs1V&gt;
            v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
            versions = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
            return versions[0];
        }

        return versions;
    }
}());

function GetQueryString() {

    if (1 < document.location.search.length) {

        // 最初の1文字 (?記号) を除いた文字列を取得する
        var query = document.location.search.substring(1);

        // クエリの区切り記号 (&) で文字列を配列に分割する
        var parameters = query.split('&');

        var result = new Object();
        for (var i = 0; i < parameters.length; i++) {
            // パラメータ名とパラメータ値に分割する
            var element = parameters[i].split('=');

            var paramName = decodeURIComponent(element[0]);
            var paramValue = decodeURIComponent(element[1]);

            // パラメータ名をキーとして連想配列に追加する
            result[paramName] = decodeURIComponent(paramValue);
        }

        return result;
    }

    return null;
};

window.addEventListener('DOMContentLoaded', function () {

    document.addEventListener("touchmove",
       function (e) {
           e.preventDefault();
       }, { passive: false });
});

function Err_Exit(msg) {
    window.alert(msg);
    location.href = "warning.html";
};

function IsFile(fp) {
window.alert("0");
    var flg = null;
window.alert("1");
    $.ajax({
        url: fp,
        cache: false,
        async: false
    }).done(function (data) {
	    window.alert("2");
        flg = true;
    })
	.fail(function (jqXHR, textStatus, errorThrown) {
	    window.alert("3");
	    flg = false;
	});

    return flg;

};

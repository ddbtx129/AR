var rootPath = "https://ddbtx129.github.io/AR/";
var arType = 1;

(function () {

    document.addEventListener("touchmove",
        function (e) {
            e.preventDefault();
        }, { passive: false });

    var param = GetQueryString();
    
    if (navigator.userAgent.indexOf('iPhone') > 0 || navigator.userAgent.indexOf('Android') > 0
        && navigator.userAgent.indexOf('Mobile') > 0 || navigator.userAgent.indexOf('iPad') > 0 || navigator.userAgent.indexOf('Android') > 0) {

        if (navigator.userAgent.indexOf('iPhone') > 0) {

            if (iosVersion() >= 11) {

                // TODO: iOS 11.0以上の場合
                if (navigator.userAgent.indexOf('Safari') == -1) {
                    Err_Exit('【Safari】をご使用下さい。');
                }

            } else {
                Err_Exit('このバージョンのiOSは対応していません。iOS11以上をご使用下さい。');
            }

        } else if (navigator.userAgent.indexOf('iPad') > 0) {

            if (iosVersion() >= 13) {

                // TODO: iOS 13.0以上の場合
                if (navigator.userAgent.indexOf('Safari') == -1) {
                    Err_Exit('【Safari】をご使用下さい。');
                }

            } else {
                Err_Exit('このバージョンのiOSは対応していません。iOS11以上をご使用下さい。');
            }

        } else if (navigator.userAgent.indexOf('Android') > 0 && navigator.userAgent.indexOf('Chrome') == -1) {
            Err_Exit('【Chrome】をご使用下さい。');
        }


        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        month = ('0' + month).slice(-2);
        day = ('0' + day).slice(-2);

        if (param['ed'] != null) {

            if (parseInt(param['ed'].toString(), 16).toString(10) < (year + month + day).toString()) {
                Err_Exit('表示期限が終了しているため、表示することができません。');
                return;
            }
        }
    }
    //} else {
    //        Err_Exit('パソコンで表示することはできません。');
    //        retuern;
    //}

    var aframeminjs = 'js/ar/aframe.min.js';
    var aframearjs = 'js/ar/aframe-ar.js';

    if (param['t'] != null) {

        arType = parseInt(param['t'].toString(), 10);

        if (arType == 2) {
            aframeminjs = 'js/nft/aframe-master.min.js';
            aframearjs = 'js/nft/aframe-ar-nft.js';

        } else if (arType == 1) {
            aframeminjs = 'js/ar/aframe.min.js';
            aframearjs = 'js/ar/aframe-ar.js';
        }
    }

    loadscriptheader(aframeminjs, 'aframe-animation-js');
    loadscriptheader(aframearjs, 'aframe-animation-js');

    window.alert("追加終了");

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
    }

    function LockScroll() {
        document.addEventListener("mousewheel", handleMouseWheel, { passive: false });
        document.addEventListener("touchmove", handleTouchMove, { passive: false });
        document.addEventListener("keydown", handleKeyDown, { passive: false });
        document.body.style.overflow = "hidden";
    }

    function UnLockScroll() {
        document.removeEventListener("mousewheel", handleMouseWheel, { passive: false });
        document.removeEventListener("touchmove", handleTouchMove, { passive: false });
        document.removeEventListener("keydown", handleKeyDown, { passive: false });
        document.body.style.overflow = "visible";
    }

    function handleMouseWheel(e) {
        e.preventDefault();
    }

    function handleTouchMove(e) {
        e.preventDefault();
    }

    function handleKeyDown(e) {
        switch (e.keyCode) {
            case 0x25:
            case 0x26:
            case 0x27:
            case 0x28:
                e.preventDefault();
                break;
        }
    }

    function onResize() {
        // サイズを取得
        const width = window.innerWidth;
        const height = window.innerHeight;

        // レンダラーのサイズを調整する
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);

        // カメラのアスペクト比を正す
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    function Err_Exit(msg) {
        window.alert(msg);
        location.href = "warning.html";
    }

}());

function loadscriptheader(src) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;

    document.head.appendChild(script);
    window.alert(src + "完了");
}

function loadscriptbody(src) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;

    document.body.appendChild(script);
    window.alert(src + "完了");
}

function loadscript(src, before) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;

    var s = document.getElementById(before);
    s.parentNode.insertBefore(script, s);
    window.alert(src + "完了");
}

function bobyInit(){
    LockScroll();

    // 初期化のために実行
    onResize();
    // リサイズイベント発生時に実行
    window.addEventListener('resize', onResize);
}

function loadARScript() {

    var objscriptjs = 'js/ar-view1.js';

    if (arType == 2) {
        objscriptjs = 'js/nft-view.js';
    } else if (arType == 1) {
        objscriptjs = 'js/ar-view1.js';
    }

    loadscriptbody(objscriptjs, 'version');
    window.alert(objscriptjs + "追加終了");
}

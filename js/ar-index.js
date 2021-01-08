var rootPath = "https://ddbtx129.github.io/AR/";
var arType = 1;

(function () {

    document.addEventListener("touchmove",
        function (e) {
            e.preventDefault();
        }, { passive: false });

    //// 初期化のために実行
    //onResize();
    //// リサイズイベント発生時に実行
    //window.addEventListener('resize', onResize);

    var param = GetParam();

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

        if (!!(param.ed)) {

            if (parseInt(param.ed.toString(), 16).toString(10) < (year + month + day).toString()) {
                Err_Exit('表示期限が終了しているため、表示することができません。');
                return;
            }
        }
    } else {
            Err_Exit('パソコンで表示することはできません。');
            retuern;
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

    function GetParam() {
        // URLのパラメータを取得
        var urlParam = location.search.substring(1);

        // パラメータを格納する用の配列を用意
        var paramArray = [];

        // URLにパラメータが存在する場合
        if (urlParam) {
            // 「&」が含まれている場合は「&」で分割
            var param = urlParam.split('&');

            // 用意した配列にパラメータを格納
            for (i = 0; i < param.length; i++) {
                var paramItem = param[i].split('=');
                paramArray[paramItem[0]] = paramItem[1];
            }
        }

        return paramArray;
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

function GetFileType(arg) {
    var exct = 'png';

    switch (arg) {

        case 'g':
            exct = 'gif';
            break;
        case 'v':
            exct = 'mp4';
            break;
        case 'd':
            exct = 'gltf';
            break;
        case 'p':
        default:
            exct = 'png';
            break;
    }

    return exct;
}

function loadscriptheader(src) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;

    document.head.appendChild(script);
}

function loadscriptbody(src) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;

    document.body.appendChild(script);
}

function loadscript(src, before) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;

    var s = document.getElementById(before);
    s.parentNode.insertBefore(script, s);}

function loadARScript() {

    var objscriptjs = 'js/ar-view1.js';

    if (arType == 2) {
        objscriptjs = 'js/nft-view.js';
    } else if (arType == 1) {
        objscriptjs = 'js/ar-view1.js';
    }

    loadscriptbody(objscriptjs, 'version');
}

function getObject() {

    param = GetQueryString();

    var video = document.getElementById("ar-video");
    var vObj = param["o"] != '' ? "article/" + param["o"] + ".mp4" : 'article/notfound_video.mp4';

    if (IsFile(vObj)) {
        widnow.alert("ファイル有り");
        video.setAttribute("src", vObj);
    } else {
        widnow.alert("ファイル無し");
        Err_Exit('対象動画が見つかりません。');
    }

    var marker = document.getElementById("ar-video");
    var mObj = (param["m"] != '') ? "pattern/pattern-" + param["m"] + ".patt" : "pattern/pattern-0.patt";

    if (IsFile(mObj)) {
        marker.getElementById("ar-marker").setAttribute("url", mObj);
    } else {
        Err_Exit('対象追跡データが見つかりません。');
    }
};

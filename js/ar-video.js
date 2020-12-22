
function getObject() {

    param = GetQueryString();

    var video = document.getElementById("ar-video");
    var vObj = param["o"] != '' ? "article/" + param["o"] + ".mp4" : 'article/notfound_video.mp4';

    video.setAttribute("src", vObj);

    //if (IsFile(vObj)) {
    //    widnow.alert("ファイル有り");
    //    video.setAttribute("src", vObj);
    //} else {
    //    Err_Exit('対象動画が見つかりません。');
    //}

    var marker = document.getElementById("ar-marker");
    var mObj = (param["m"] != '') ? "pattern/pattern-" + param["m"] + ".patt" : "pattern/pattern-0.patt";

    marker.setAttribute("url", mObj);

    //if (IsFile(mObj)) {
    //    marker.getElementById("ar-marker").setAttribute("url", mObj);
    //} else {
    //    Err_Exit('対象追跡データが見つかりません。');
    //}
};

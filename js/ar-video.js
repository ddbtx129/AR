function getObject() {

    param = GetQueryString();

    var video = document.getElementById("ar-video");
    var vObj = param["o"] != '' ? "article/" + param["o"] + ".mp4" : 'article/notfound_video.mp4';
    
    var file;

    IsFile(vObj, file);

    if (file) {
        video.setAttribute("src", vObj);
    } else {
        Err_Exit('対象動画が見つかりません。');
    }

    var marker = document.getElementById("ar-video");
    var mObj = (param["m"] != '') ? "pattern/pattern-" + param["m"] + ".patt" : "pattern/pattern-0.patt";

    IsFile(mObj, file);

    if (IsFile(mObj)) {
        marker.getElementById("ar-marker").setAttribute("url", mObj);
    } else {
        Err_Exit('対象追跡データが見つかりません。');
    }

};

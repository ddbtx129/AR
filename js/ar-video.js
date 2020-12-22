
function getObject() {
window.alert('0');
    param = GetQueryString();
window.alert('1');
    var video = param["o"] != '' ? "article/" + param["o"] + ".mp4" : 'article/notfound_video.mp4';
    window.alert(video);
    if (IsFile(video)) {
        document.getElementById("ar-video").setAttribute("src", video);
    } else {
        Err_Exit('対象動画が見つかりません。');
    }

    var marker = (param["m"] != '') ? "pattern/pattern-" + param["m"] + ".patt" : "pattern/pattern-0.patt";

    if (IsFile(marker)) {
        document.getElementById("ar-marker").setAttribute("url", marker);
    } else {
        Err_Exit('対象追跡データが見つかりません。');
    }

};

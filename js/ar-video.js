
function getObject() {
window.alert('0');
    param = GetQueryString();
window.alert(param["o"]);
    var video = param["o"] != '' ? "article/" + param["o"] + ".mp4" : 'article/notfound_video.mp4';
    
    if (IsFile(video)) {
        window.alert(video);
        document.getElementById("ar-video").setAttribute("src", video);
        window.alert(video);
    } else {
        Err_Exit('対象動画が見つかりません。');
    }
    window.alert('marker0');
    var marker = (param["m"] != '') ? "pattern/pattern-" + param["m"] + ".patt" : "pattern/pattern-0.patt";
    window.alert('marker1');
    if (IsFile(marker)) {
        window.alert(marker);
        document.getElementById("ar-marker").setAttribute("url", marker);
    } else {
        Err_Exit('対象追跡データが見つかりません。');
    }

};

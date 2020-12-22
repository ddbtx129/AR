
function getVideo() {
    param = GetQueryString();


    var video = article / notfound_video.mp4;

    if (param["o"] != '' && IsFile("article/" + param["o"] + ".mp4")) {
        //document.getElementById("ar-video").setAttribute("src", "article/" + param["o"] + ".mp4");
        video = "article/" + param["o"] + ".mp4";
    } else {
        Err_Exit('対象動画が見つかりません。');
    }

    return video;

    //var marker = (param["m"] != '') ? "pattern/pattern-" + param["m"] + ".patt" : "pattern/pattern-0.patt";

    //if (IsFile(marker)) {
    //    document.getElementById("ar-marker").setAttribute("url", marker);
    //} else {
    //    Err_Exit('対象追跡データが見つかりません。');
    //}

};

function getMarker() {

    param = GetQueryString();

    var marker = (param["m"] != '') ? "pattern/pattern-" + param["m"] + ".patt" : "pattern/pattern-0.patt";

    if (IsFile(marker)) {
        //document.getElementById("ar-marker").setAttribute("url", marker);
    } else {
        Err_Exit('対象追跡データが見つかりません。');
    }

    return marker;
};
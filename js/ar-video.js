
function getObject() {
    window.alert('-11');
    var arg = GetQueryString();

    var video = document.getElementById("ar-video");
    var vObj = !(arg['o']) ? 'article/notfound_video.mp4' : 'article/' + arg['o'] + '.mp4';

    window.alert('10');
    video.setAttribute("src", vObj);
    window.alert(vObj);
    //if (IsFile(vObj)) {
    //    widnow.alert("ファイル有り");
    //    video.setAttribute("src", vObj);
    //} else {
    //    Err_Exit('対象動画が見つかりません。');
    //}

    var marker = document.getElementById("ar-marker");
    var mObj = !(arg['m']) ? pattern/pattern-0.patt' : 'pattern/pattern-' + arg['m'] + '.patt';
    window.alert('11');
    marker.setAttribute("url", mObj);
    window.alert(mObj);

    //if (IsFile(mObj)) {
    //    marker.getElementById("ar-marker").setAttribute("url", mObj);
    //} else {
    //    Err_Exit('対象追跡データが見つかりません。');
    //}
};

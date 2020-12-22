
function getArVideo() {

    var arg = GetQueryString();

    var video = document.getElementById("ar-video");
    var vObj = !(arg["o"]) ? 'article/notfound_video.mp4' : 'article/' + arg["o"] + '.mp4';

    video.setAttribute("src", vObj);
    
    var marker = document.getElementById("ar-marker");
    var mObj = !(arg["m"]) ? 'pattern/pattern-0.patt' : 'pattern/pattern-' + arg["m"] + '.patt';

    marker.setAttribute("url", mObj);

};

funcrion getNftVideo() {
    
    var arg = GetQueryString();

    var video = document.getElementById("ar-video");
    var audio = document.getElementById("ar-audio");
    
    var vObj = !(arg["o"]) ? 'article/notfound_video.mp4' : 'article/' + arg["o"] + '.mp4';

    video.setAttribute("src", vObj);
    audio.setAttribute("src", vObj);
}



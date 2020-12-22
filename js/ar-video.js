var urlpath = "https://ddbtx129.github.io/AR/";

function getArVideo() {

    var arg = GetQueryString();

    var video = document.getElementById("ar-video");
    var vObj = !(arg["o"]) ? 'article/notfound_video.mp4' : 'article/' + arg["o"] + '.mp4';

    video.setAttribute("src", vObj);
    
    var marker = document.getElementById("ar-marker");
    var mObj = !(arg["m"]) ? 'pattern/pattern-0.patt' : 'pattern/pattern-' + arg["m"] + '.patt';

    marker.setAttribute("url", mObj);

};

function getNftVideo() {

    var arg = GetQueryString();

    var video = document.getElementById("ar-video");
    var audio = document.getElementById("ar-audio");
    
    var vObj = !(arg["o"]) ? urlpath + 'article/notfound_video.mp4' : urlpath + 'article/' + arg["o"] + '.mp4';

    video.setAttribute("src", vObj);
    audio.setAttribute("src", vObj);
};

function getNftImage() {
    
    var arg = GetQueryString();

    var nft = document.getElementById("ar-nft");
    var nObj = !(arg["m"]) ? '' : urlpath + 'ImageDescriptors/' + arg["m"] + '/' + arg["m"];

    nft.setAttribute("url", nObj);
};

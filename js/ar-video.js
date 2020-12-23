var path = "https://ddbtx129.github.io/AR/";

function getArVideo() {

    var arg = GetQueryString();

    var video = document.getElementById("ar-video");
    var vObj = !(arg["o"]) ? 'article/video/notfound_video.mp4' : 'article/video/' + arg["o"] + '.mp4';

    video.setAttribute("src", vObj);
    
    var marker = document.getElementById("ar-marker");
    var mObj = !(arg["m"]) ? 'pattern/pattern-def.patt' : 'pattern/pattern-' + arg["m"] + '.patt';

    marker.setAttribute("url", mObj);
};

function getNftVideo() {
    
    var arg = GetQueryString();

    var video = document.getElementById("ar-video");
    var audio = document.getElementById("ar-audio");
    
    var vObj = !(arg["o"]) ? path + 'article/video/notfound_video.mp4' : path + 'article/video/' + arg["o"] + '.mp4';
    window.alert(String(vObj));
    video.setAttribute("src", vObj);
    audio.setAttribute("src", vObj);
};

function getNftObject() {
    window.alert("21");
    var arg = GetQueryString();

    var nft = document.getElementById("ar-gltf");
    var nObj = !(arg["o"]) ? '' : path + 'article/nftobject/' + arg["o"] + ".gltf";
    window.alert(nObj);
    window.alert("22");
    nft.setAttribute("gltf-model", nObj);
    nft.setAttribute("scale", "10 10 10");
    nft.setAttribute("position", "0 0 0");
    //nft.setAttribute("rotation", "-45 0 0");
    window.alert("23")
};

function getNftImage() {
    window.alert("11");
    var arg = GetQueryString();
    var nft = document.getElementById("ar-nft");

    var nObj = !(arg["m"]) ? '' : path + 'ImageDescriptors/' + arg["m"] + '/' + arg["m"];
    window.alert(nObj);
    window.alert("12");
    nft.setAttribute("url", nObj);
};

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

    video.setAttribute("src", vObj);
    audio.setAttribute("src", vObj);
};

function getNftObject() {

    var arg = GetQueryString();

    var nft = document.getElementById("ar-gltf");

    var nObj = !(arg["o"]) ? '' : path + 'article/nftobject/' + arg["o"] + ".gltf";

    var nSclale = !(arg["wh"]) ? "20 20 20" : arg["wh"] + " " + arg["wh"] + " " + arg["wh"];

    var nX = !(arg["x"]) ? 0 : arg["x"];
    var nY = !(arg["y"]) ? 0 : arg["y"];
    var nZ = !(arg["z"]) ? 0 : arg["z"];

    nft.setAttribute("gltf-model", nObj);
    nft.setAttribute("scale", nSclale);
    nft.setAttribute("position", { x: nX, y: nY, z: nX }); //nX + ' ' + nY + ' ' + nZ );
    nft.setAttribute("rotation", "-30 0 0");
};

function getNftImage() {
    
    var arg = GetQueryString();

    var nft = document.getElementById("ar-nft");
    var nObj;

    if ((arg["m1"]) && (arg["m2"])) {
        nObj = path + 'ImageDescriptors/' + arg["m1"] + '/' + arg["m2"];
    } else {
        nObj = !(arg["m"]) ? '' : path + 'ImageDescriptors/' + arg["m"] + '/' + arg["m"];
    }

    nft.setAttribute("url", nObj);
};
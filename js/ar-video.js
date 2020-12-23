var path = "https://ddbtx129.github.io/AR/";

function getArVideo() {

    var arg = GetQueryString();

    var video = document.getElementById("ar-video");
    var vObj = !(arg["o"]) ? 'article/notfound_video.mp4' : 'article/' + arg["o"] + '.mp4';

    video.setAttribute("src", vObj);
    
    var marker = document.getElementById("ar-marker");
    var mObj = !(arg["m"]) ? 'pattern/pattern-def.patt' : 'pattern/pattern-' + arg["m"] + '.patt';

    marker.setAttribute("url", mObj);
};

function getNftVideo() {
    
    var arg = GetQueryString();

    var video = document.getElementById("ar-video");
    var audio = document.getElementById("ar-audio");
    
    var vObj = !(arg["o"]) ? path + 'article/notfound_video.mp4' : path + 'article/' + arg["o"] + '.mp4';

    video.setAttribute("src", vObj);
    audio.setAttribute("src", vObj);
};

function getNftObject() {

    var arg = GetQueryString();

    var nft = document.getElementById("ar-gltf");
    var nObj = !(arg["o"]) ? '' : path + 'article/gltf/' + arg["o"] + + ".gltf";

    nft.setAttribute("gltf-model", nObj);
    nft.setAttribute("scale", "10 10 10");
    nft.setAttribute("position", "0 0 0");
    nft.setAttribute("rotation", "-45 0 0");
    
    window.alert(nObj);
};

function getNftImage() {
    
    var arg = GetQueryString();
    var nft = document.getElementById("ar-nft");

    var nObj;

    if ((arg["m1"]) && (arg["m2"])) {
            window.alert("1");
        nObj = path + 'ImageDescriptors/' + arg["m1"] + '/' + arg["m2"];
    } else {
                    window.alert("1");
        nObj = !(arg["m"]) ? '' : path + 'ImageDescriptors/' + arg["m"] + '/' + arg["m"];
    }
    
    window.alert(nObj);
    
    nft.setAttribute("url", nObj);
};

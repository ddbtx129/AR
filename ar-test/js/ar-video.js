var path = "https://ddbtx129.github.io/ARar-test/";

function getArVideo() {

    var arg = GetQueryString();

    var video = document.getElementById("ar-video");
    //var vObj = !(arg["o"]) ? 'article/video/notfound_video.mp4' : 'article/video/' + arg["o"] + '.mp4';
    var vObj;

    if ((arg["o1"]) && (arg["o2"])) {
        vObj = 'article/video/' + arg["o1"] + '/' + arg["o2"] + '.mp4';
    } else {
        vObj = !(arg["o"]) ? 'article/video/notfound_video.mp4' : 'article/video/' + arg["o"] + '.mp4';
    }

    video.setAttribute("src", vObj);
    
    var marker = document.getElementById("ar-marker");
    //var mObj = !(arg["m"]) ? 'pattern/pattern-def.patt' : 'pattern/pattern-' + arg["m"] + '.patt';
    var mObj;

    if ((arg["m1"]) && (arg["m2"])) {
        mObj = path + 'pattern/' + arg["m1"] + '/pattern-' + arg["m2"] + '.patt';
    } else {
        mObj = !(arg["m"]) ? 'pattern/pattern-def.patt' : 'pattern/pattern-' + arg["m"] + '.patt';
    }

    marker.setAttribute("url", mObj);
};

function getNftVideo() {
    
    var arg = GetQueryString();

    var video = document.getElementById("ar-video");
    var audio = document.getElementById("ar-audio");
    
    //var vObj = !(arg["o"]) ? path + 'article/video/notfound_video.mp4' : path + 'article/video/' + arg["o"] + '.mp4';
    var vObj;

    if ((arg["o1"]) && (arg["o2"])) {
        vObj = path + 'article/video/' + arg["o1"] + '/' + arg["o2"] + '.mp4';
    } else {
        vObj = !(arg["o"]) ? path + 'article/video/notfound_video.mp4' : path + 'article/video/' + arg["o"] + '.mp4';
    }

    video.setAttribute("src", vObj);
    audio.setAttribute("src", vObj);
};

function getNftObject() {

    var arg = GetQueryString();

    var nft = document.getElementById('ar-gltf-main');

    if ((arg["o1"]) && (arg["o2"])) {
        nObj = path + 'article/nftobject/' + arg["o1"] + '/' + arg["o2"] + '.gltf';
    } else {
        nObj = !(arg["o"]) ? '' : path + 'article/nftobject/' + arg["o"] + '.gltf';
    }

    nft.setAttribute('gltf-model', nObj);

    if(!!(arg["xs"]))
    {
        var shodow = document.getElementById('ar-gltf-shadow');
        var sObj;

        if ((arg["o1"]) && (arg["o2"])) {
            sObj = path + 'article/nftobject/' + arg["o1"] + '/' + arg["o2"] + '-hs.gltf';;
        } else {
            sObj = !(arg["o"]) ? '' : path + 'article/nftobject/' + arg["o"] + '-hs.gltf';
        }

        shodow.setAttribute('gltf-model-shadow', sObj);
        shodow.style.visibility = 'visible';
    }
};

function getNftMarker() {
    
    var arg = GetQueryString();

    var nft = document.getElementById('ar-nft');
    var nObj;

    if ((arg["m1"]) && (arg["m2"])) {
        nObj = path + 'ImageDescriptors/' + arg["m1"] + '/' + arg["m2"];
    } else {
        nObj = !(arg["m"]) ? '' : path + 'ImageDescriptors/' + arg["m"] + '/' + arg["m"];
    }

    nft.setAttribute('url', nObj);
};

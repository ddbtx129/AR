var arg = getid();

var nfturl = getnft();
var gltfurl = getgltf();

function getid() {
    var urlPrm0 = new Object;
    var urlSearch0 = location.search.substring(1).split('&');
    for (i = 0; urlSearch[i]; i++) {
        var kv = urlSearch0[i].split('=');
        urlPrm0[kv[0]] = kv[1];
    }

    return urlPrm0[kv[0]]
}

function getnft() {
    //window.confirm("https://www.aoshima-bk.co.jp/special/webar/ImageDescriptors/" + arg + "/" + arg);
    return "https://www.aoshima-bk.co.jp/special/webar/ImageDescriptors/" + arg + "/" + arg;
}

function getgltf() {
    //window.confirm("https://www.aoshima-bk.co.jp/special/webar/article/" + arg + ".gltf");
    return "https://www.aoshima-bk.co.jp/special/webar/article/" + arg + ".gltf";
}

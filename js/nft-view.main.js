
(function () {
    window.alert('-1');

    var rootPath = "https://ddbtx129.github.io/AR/";

    var scene = document.getElementById('ar-scene');
    var marker = document.getElementById('ar-nft');
    var nft = document.getElementById("ar-gltf-main");

    //var wrapPos = nft.getAttribute('position');
    //var arPosX = !(arg["x"]) ? 0 : arg["x"];
    //var arPosY = !(arg["y"]) ? 0 : arg["y"];
    //var arPosZ = !(arg["z"]) ? 0 : arg["z"];
    //var arRotation = { x: 0, y: 0, z: 0 };
    //var shadowRotation = 0;

    //var shodow = document.getElementById("ar-gltf-shadow");
    //var isShadow = !!(arg["xs"]);

    //var arScale = !(arg["wh"]) ? 44 : (parseInt(arg["wh"], 16));

    ////nft.size = !(arg["wh"]) ? {
    ////    w: parseInt(Number(self.arg.sizeList / 10), 10),
    ////    h: Number(self.arg.sizeList) - parseInt(Number(self.arg.sizeList / 10), 10) * 10
    ////} : {
    ////        w: 2,
    ////        h: 2
    ////};

    ////var arScale = (function () {
    ////    if (!(arg["wh"])) {
    ////        return { x: 20, y: 20, z: 0 }
    ////    } else {
    ////        return (parseInt(arg["wh"], 16))
    ////    }
    ////});

    //var zoomRate = nft.size.h;

    window.alert('0');
    //nftarView.ar = ar;
    ar.init();
    window.alert('1');

    var ar = {
        
        init: function () {
            window.alert('2');
            this.setArg();
            
            //if (setArData()) {
            //    window.alert('2');
            //    var deviceEvents = {
            //        Touch: typeof document.ontouchstart !== 'undefined',
            //        Pointer: window.navigator.pointerEnabled,
            //        MSPointer: window.navigator.msPointerEnabled
            //    };
            //    window.alert('3');
            //    this.eventNames = {
            //        start: deviceEvents.Pointer ? 'pointerdown' : deviceEvents.MSPointer ? 'MSPointerDown' : deviceEvents.Touch ? 'touchstart' : 'mousedown',
            //        move: deviceEvents.Pointer ? 'pointermove' : deviceEvents.MSPointer ? 'MSPointerMove' : deviceEvents.Touch ? 'touchmove' : 'mousemove',
            //        end: deviceEvents.Pointer ? 'pointerup' : deviceEvents.MSPointer ? 'MSPointerUp' : deviceEvents.Touch ? 'touchend' : 'mouseup'
            //    };
            //    //window.alert('4');
            //}

            //this.setSwitcher();
            window.alert('5');
        },

        setArg : function () {

            var self = this;

            var arg = {};
            var pair = location.search.substring(1).split('&');

            for (var i = 0; pair[i]; i++) {
                var kv = pair[i].split('=');
                arg[kv[0]] = decodeURIComponent(kv[1]);
            }

            // 影
            arg.shodowList = arg.xs && (parseInt(arg.xs, 16).toString(2));
            // サイズ
            arg.sizeList = arg.wh && (parseInt(arg.wh, 16).toString(10)).match(/.{2}/g);
            // マーカー
            arg.markerList = arg.m;
            arg.markerList12 = arg.m1 && arg.m2;
            // ar-gltf-main
            arg.ObjectList = arg.o;
            arg.ObjectList12 = arg.o1 && arg.o2;

            self.arg = arg;
        }

        //setArData: function () {

        //    var self = this;

        //    var arData = null;

        //    dataObj.isObject = !self.arg.ObjectList && self.arg.ObjectList12;

        //    // データの準備
        //    var dataObj = {
        //        path: function () {
        //            if (dataObj.isObject) {
        //                return rootPath + 'article/nftobject/' + self.arg.o1 + '/' + s.arg.o2 + '-hs.gltf';
        //            } else {
        //                return (!(arg["o"]) ? '' : path + 'article/nftobject/' + self.arg.o + '-hs.gltf');
        //            }
        //        }
        //    };

        //    if (!arData.path) {
        //        // 画像なかった
        //        Err_Exit('画像情報が取得できませんでした。');
        //        return false;
        //    } else {
        //        nft.setAttribute('gltf-model', AFRAME.utils.coordinates.stringify(dataObj.path));

        //        dataObj.isMarker = !!self.arg.markerList;
        //        dataObj.isMarker12 = !!self.arg.markerList12;

        //        if (dataObj.isMarker12) {
        //            nObj = path + 'ImageDescriptors/' + arg["m1"] + '/' + arg["m2"];
        //            marker.setAttribute('url', AFRAME.utils.coordinates.stringify(dataObj.path));
        //        } else {
        //            nObj = !(arg["m"]) ? '' : path + 'ImageDescriptors/' + arg["m"] + '/' + arg["m"];
        //            marker.setAttribute('url', AFRAME.utils.coordinates.stringify(!(sel.arg.isMarker) ? '' : path + 'ImageDescriptors/' + self.arg.m + '/' + self.arg.m));
        //        }

        //        dataObj.isShadow = self.arg.shodowList && !!Number(self.arg.shodowList);

        //        dataObj.size = self.arg.sizeList ? {
        //            w: parseInt(Number(self.arg.sizeList / 10), 10),
        //            h: Number(self.arg.sizeList) - parseInt(Number(self.arg.sizeList / 10), 10) * 10,
        //            z: 1
        //        } : {
        //                w: 4,
        //                h: 4,
        //                z: 1
        //            };

        //        dataObj.posVec3 = self.positionVec3('main');

        //        nft.setAttribute('scale', AFRAME.utils.coordinates.stringify(dataObj.size));
        //        nft.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3));
        //        nft.setAttribute('rotation', '0 0 0');
        //    }

        //    arData = dataObj;

        //    self.arData = arData;

        //    return true;
        //},

        //setSwitcher: function () {

        //    var self = this;

        //    var prevPageY;
        //    var prevPageX;

        //    var zoomRate = self.arData.si.h;

        //    // 拡大・縮小
        //    scene.addEventListener(deviceEvents.start, function (e) {
        //        var event = e.changedTouches ? e.changedTouches[0] : e;
        //        prevPageY = event.pageY;    // 縦軸
        //        prevPageX = event.pageX;    // 横軸
        //    })

        //    scene.addEventListener(deviceEvents.move, function (e) {
        //        var event = e.changedTouches ? e.changedTouches[0] : e;
        //        if (prevPageY) {
        //            if ((zoomRate + ((prevPageY - event.pageY) / scene.clientHeight / 5)) > 0.1) {
        //                zoomRate += ((prevPageY - event.pageY) / scene.clientHeight / 5);
        //                AFRAME.utils.entity.setComponentProperty(nft, 'animation__scale', {
        //                    property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRate + ' ' + zoomRate + ' ' + zoomRate
        //                });
        //            }
        //        }
        //    })

        //    scene.addEventListener(deviceEvents.end, function (e) {
        //        prevPageY = null;
        //    })

        //    var anglebtn = document.querySelector('#swAngle');
        //    var parallelbtn = document.querySelector('#swParallel');

        //    // ↓ rotation 切替
        //    parallelbtn.classList.add('current');

        //    anglebtn.addEventListener('click', function () {
        //        if (!anglebtn.classList.contains('current')) {
        //            nft.setAttribute('rotation', AFRAME.utils.coordinates.stringify('90 0 0'));
        //            anglebtn.classList.add('current');
        //            parallelbtn.classList.remove('current');
        //        }
        //    })

        //    parallelbtn.addEventListener('click', function () {
        //        if (!parallelbtn.classList.contains('current')) {
        //            nft.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));
        //            parallelbtn.classList.add('current');
        //            anglebtn.classList.remove('current');
        //        }
        //    })

        //    // ↓ 上下移動ボタン押下
        //    var bUP = document.querySelector('#swUp');
        //    var bDOWN = document.querySelector('#swDown');

        //    bUP.addEventListener('click', function (e) {
        //        window.alert(arPosY);
        //        self.arData..posVec3.y += 0.2;
        //        window.alert(arPosY);
        //        nft.setAttribute('position', AFRAME.utils.coordinates.stringify(self.arData.posVec3));
        //    })

        //    bDOWN.addEventListener('click', function (e) {
        //        window.alert(arPosY);
        //        self.arData.posVec3.y -= 0.2;
        //        window.alert(arPosY);
        //        nft.setAttribute('position', AFRAME.utils.coordinates.stringify(self.arData.posVec3));
        //    })



        //},

    };

    //window.addEventListener('DOMContentLoaded', function () {

    //    nft.setAttribute('scale', AFRAME.utils.coordinates.stringify(nft.size));
    //    nft.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3));
    //    //nft.setAttribute('position', { x: arPosX, y: arPosY, z: arPosZ });
    //    //nft.setAttribute('rotation', String(arRotation) + ' 0 0');
    //    nft.setAttribute('rotation', '0 0 0');

    //    var prevPageY;
    //    var prevPageX;

    //    if (isShadow) {
    //        shodow.setAttribute('scale', zoomRate + " " + zoomRate + " " + zoomRate);
    //        shodow.setAttribute('position', { x: arPosX, y: arPosY, z: arPosZ });
    //        shodow.setAttribute('rotation', '-90 0 0');
    //    }

    //    var anglebtn = document.querySelector('#swAngle');
    //    var parallelbtn = document.querySelector('#swParallel');

    //    // ↓ rotation 切替
    //    parallelbtn.classList.add('current');

    //    anglebtn.addEventListener('click', function () {
    //        if (!anglebtn.classList.contains('current')) {
    //            nft.setAttribute('rotation', AFRAME.utils.coordinates.stringify('90 0 0'));
    //            anglebtn.classList.add('current');
    //            parallelbtn.classList.remove('current');
    //        }
    //    })

    //    parallelbtn.addEventListener('click', function () {
    //        if (!parallelbtn.classList.contains('current')) {
    //            nft.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));
    //            parallelbtn.classList.add('current');
    //            anglebtn.classList.remove('current');
    //        }
    //    })
    //    // ↑
    //});

////window.addEventListener('DOMContentLoaded', function () {

//    // 拡大・縮小
//    scene.addEventListener(_start, function (e) {
//        var event = e.changedTouches ? e.changedTouches[0] : e;
//        prevPageY = event.pageY;    // 縦軸
//        prevPageX = event.pageX;    // 横軸
//    })

//    scene.addEventListener(_move, function (e) {
//        var event = e.changedTouches ? e.changedTouches[0] : e;
//        if (prevPageY) {
//            if ((zoomRate + ((prevPageY - event.pageY) / scene.clientHeight / 5)) > 0.1) {
//                zoomRate += ((prevPageY - event.pageY) / scene.clientHeight / 5);
//                AFRAME.utils.entity.setComponentProperty(nft, 'animation__scale', {
//                    property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRate + ' ' + zoomRate + ' ' + zoomRate
//                });
//            }
//        }
//    });

//    scene.addEventListener(_end, function (e) {
//        prevPageY = null;
//    })
//    // ↑
////});

//window.addEventListener('DOMContentLoaded', function () {

//    // ↓ 上下移動ボタン押下
//    var bUP = document.querySelector('#swUp');
//    var bDOWN = document.querySelector('#swDown');

//    bUP.addEventListener('click', function (e) {
//        window.alert(arPosY);
//        arPosY += 2;
//        window.alert(arPosY);
//        //nft.setAttribute('position', AFRAME.utils.coordinates.stringify(arPosX + ' ' + arPosY + ' ' + arPosZ));
//    });

//    bDOWN.addEventListener('click', function (e) {
//        window.alert(arPosY);
//        arPosY -= 2;
//        window.alert(arPosY);
//        //nft.setAttribute('position', AFRAME.utils.coordinates.stringify(arPosX + ' ' + arPosY + ' ' + arPosZ));
//    });
//    // ↑ 
//});

window.addEventListener('DOMContentLoaded', function () {

    //var bUP = document.querySelector('#swUp');
    //var bDOWN = document.querySelector('#swDown');
    //var timer;

    // ↓ UPボタン長押し
    //bUP.addEventListener(_start, e => {
    //    e.preventDefault();
    //    bUP.classList.add('active');
    //    timer = setInterval(() => {
    //        arPosY += 0.2;
    //        nft.setAttribute('position', AFRAME.utils.coordinates.stringify(arPosX + ' ' + arPosY + ' ' + arPosZ));
    //    }, 10);
    //})

    //bUP.addEventListener(_end, e => {
    //    e.preventDefault();
    //    bUP.classList.remove('active');
    //    clearInterval(timer);
    //});

    //bUP.addEventListener(_move, e => {
    //    e.preventDefault();
    //    bUP.classList.remove('active');
    //    clearInterval(timer);
    //});
    //// ↑ 

    //// ↓ DOWNボタン長押し
    //bDOWN.addEventListener(_start, e => {
    //    e.preventDefault();
    //    bDOWN.classList.add('active');
    //    timer = setInterval(() => {
    //        arPosY -= 0.2;
    //        nft.setAttribute('position', AFRAME.utils.coordinates.stringify(arPosX + ' ' + arPosY + ' ' + arPosZ));
    //    }, 10);
    //})

    //bDOWN.addEventListener(_end, e => {
    //    e.preventDefault();
    //    bDOWN.classList.remove('active');
    //    clearInterval(timer);
    //});

    //bDOWN.addEventListener(_move, e => {
    //    e.preventDefault();
    //    bDOWN.classList.remove('active');
    //    clearInterval(timer);
    //});
    // ↑
});

    //var _ua = (function () {
    //return {
    //    Touch: typeof document.ontouchstart != "undefined",
    //    Pointer: window.navigator.pointerEnabled,
    //    MSPoniter: window.navigator.msPointerEnabled
    //}
    //})();

    //nftarView.ar.init();
}());
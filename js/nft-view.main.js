var scene = document.getElementById('ar-scene');
var nft = document.getElementById("ar-gltf-main");
var shodow = document.getElementById("ar-gltf-shadow");

var arg = GetQueryString();

window.addEventListener('DOMContentLoaded', function () {

    var _start = _ua.Pointer ? 'pointerdown' : _ua.MSPointer ? 'MSPointerDown' : _ua.Touch ? 'touchstart' : 'mousedown';
    var _move = _ua.Pointer ? 'pointermove' : _ua.MSPointer ? 'MSPointerMove' : _ua.Touch ? 'touchmove' : 'mousemove';
    var _end = _ua.Pointer ? 'pointerup' : _ua.MSPointer ? 'MSPointerUp' : _ua.Touch ? 'touchend' : 'mouseup';

    var wrapPos = nft.getAttribute('position');
    var zoomRate = !(arg["wh"]) ? 20 : arg["wh"];;
    var prevPageY;
    var prevPageX;

    var arPosX = !(arg["x"]) ? 0 : arg["x"];
    var arPosY = !(arg["y"]) ? 0 : arg["y"];
    var arPosZ = !(arg["z"]) ? 0 : arg["z"];
    var arRotation = 0;
    var shadowRotation = 0;

    var isShadow = !!(arg["xs"]);

    nft.setAttribute('scale', zoomRate + " " + zoomRate + " " + zoomRate);
    nft.setAttribute('position', { x: arPosX, y: arPosY + (zoomRate / 2), z: arPosZ });
    nft.setAttribute('rotation', String(arRotation) + ' 0 0');

    if (isShadow) {
        shodow.setAttribute('scale', zoomRate + " " + zoomRate + " " + zoomRate);
        shodow.setAttribute('position', { x: arPosX, y: arPosY, z: arPosZ });
        shodow.setAttribute('rotation', String(shadowRotation) + ' 0 0');
    }

    var anglebtn = document.querySelector('#swAngle');
    var parallelbtn = document.querySelector('#swParallel');
    var bUP = document.querySelector('#swUp');
    var bDOWN = document.querySelector('#swDown');

    // ↓ rotation 切替
    anglebtn.classList.add('current');

    anglebtn.addEventListener('click', function () {
        if (!anglebtn.classList.contains('current')) {
            nft.setAttribute('rotation', AFRAME.utils.coordinates.stringify(String(arRotation) + ' 0 0'));
            anglebtn.classList.add('current');
            parallelbtn.classList.remove('current');
        }
    })

    parallelbtn.addEventListener('click', function () {
        if (!parallelbtn.classList.contains('current')) {
            nft.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));
            parallelbtn.classList.add('current');
            anglebtn.classList.remove('current');
        }
    })
    // ↑

    // 拡大・縮小
    //window.alert('3');
    //scene.addEventListener(_start, function (e) {
    //    var event = e.changedTouches ? e.changedTouches[0] : e;
    //    prevPageY = event.pageY;    // 縦軸
    //    prevPageX = event.pageX;    // 横軸
    //})

    //scene.addEventListener(_move, function (e) {
    //    var event = e.changedTouches ? e.changedTouches[0] : e;
    //    if (prevPageY) {

    //        AFRAME.utils.entity.getAttribut
    //        if ((zoomRate + ((prevPageY - event.pageY) / scene.clientHeight / 5)) > 0.1) {

    //            zoomRate += ((prevPageY - event.pageY) / scene.clientHeight / 5);

    //            AFRAME.utils.entity.setComponentProperty(nft, 'animation__scale', {
    //                property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRate + ' ' + zoomRate + ' ' + zoomRate
    //            });
    //        }
    //    }
    //});

    //scene.addEventListener(_end, function (e) {
    //    prevPageY = null;
    //})
    // ↑

    // ↓ 上下移動ボタン押下

    bUP.addEventListener('click', function () {
        y += 0.2;
        nft.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
    });

    bDOWN.addEventListener('click', function () {
        wrapPos.y -= 0.2;
        nft.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
    });
    // ↑ 

    // ↓ UPボタン長押し

    bUP.addEventListener(eventStart, e => {
        e.preventDefault();
        bUP.classList.add('active');
        timer = setInterval(() => {
            wrapPos.y += 0.02;
            nft.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
        }, 10);
    })

    bUP.addEventListener(eventEnd, e => {
        e.preventDefault();
        bUP.classList.remove('active');
        clearInterval(timer);
    });

    bUP.addEventListener(eventLeave, e => {
        e.preventDefault();
        bUP.classList.remove('active');
        clearInterval(timer);
    });
    // ↑ 

    // ↓ DOWNボタン長押し
    bDOWN.addEventListener(_start, e => {
        e.preventDefault();
        bDOWN.classList.add('active');
        timer = setInterval(() => {
            wrapPos.y -= 0.02;
            nft.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
        }, 10);
    })

    bDOWN.addEventListener(_end, e => {
        e.preventDefault();
        bDOWN.classList.remove('active');
        clearInterval(timer);
    });

    bUP.addEventListener(_move, e => {
        e.preventDefault();
        bUP.classList.remove('active');
        clearInterval(timer);
    });
    // ↑

});

var _ua = (function () {
    return {
        Touch: typeof document.ontouchstart != "undefined",
        Pointer: window.navigator.pointerEnabled,
        MSPoniter: window.navigator.msPointerEnabled
    }
})();
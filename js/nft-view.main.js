var scene = document.getElementById('ar-scene');
var nft = document.getElementById("ar-gltf");

window.addEventListener('DOMContentLoaded', function () {

    // ↓ rotation 切替

    var anglebtn = document.querySelector('#swAngle');
    var parallelbtn = document.querySelector('#swParallel');

    var arRotation = '-45 0 0';

    anglebtn.classList.add('current');

    anglebtn.addEventListener('click', function () {
        if (!anglebtn.classList.contains('current')) {
            arRotation = '-45 0 0';
            nft.setAttribute('rotation', AFRAME.utils.coordinates.stringify(arRotation));

            anglebtn.classList.add('current');
            parallelbtn.classList.remove('current');
        }
    })

    parallelbtn.addEventListener('click', function () {
        if (!parallelbtn.classList.contains('current')) {
            arRotation = '-90 0 0';
            nft.setAttribute('rotation', AFRAME.utils.coordinates.stringify(arRotation));

            parallelbtn.classList.add('current');
            anglebtn.classList.remove('current');
        }
    })
    // ↑
});

window.addEventListener('DOMContentLoaded', function () {

    var _start = _ua.Pointer ? 'pointerdown' : _ua.MSPointer ? 'MSPointerDown' : _ua.Touch ? 'touchstart' : 'mousedown';
    var _move = _ua.Pointer ? 'pointermove' : _ua.MSPointer ? 'MSPointerMove' : _ua.Touch ? 'touchmove' : 'mousemove';
    var _end = _ua.Pointer ? 'pointerup' : _ua.MSPointer ? 'MSPointerUp' : _ua.Touch ? 'touchend' : 'mouseup';

    var wrapPos = nft.getAttribute('position');
    var prevPageY;
    var prevPageX;
    var zoomRate = 1;

    scene.addEventListener(_start, function (e) {
        var event = e.changedTouches ? e.changedTouches[0] : e;
        prevPageY = event.pageY;    // 縦軸
        prevPageX = event.pageX;    // 横軸
    })

    scene.addEventListener(_move, function (e) {
        var event = e.changedTouches ? e.changedTouches[0] : e;
        if (prevPageY) {
            if ((zoomRate + ((prevPageY - event.pageY) / scene.clientHeight / 5) * 10) > 0.1) {

                zoomRate += ((prevPageY - event.pageY) / scene.clientHeight / 5) * 10;
                AFRAME.utils.entity.setComponentProperty(nft, 'animation__scale', {
                    property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRate + ' ' + zoomRate + ' ' + zoomRate
                });
            }
        }
    });

    scene.addEventListener(_end, function (e) {
        prevPageY = null;
    })

});

var _ua = (function () {
    return {
        Touch: typeof document.ontouchstart != "undefined",
        Pointer: window.navigator.pointerEnabled,
        MSPoniter: window.navigator.msPointerEnabled
    }
})();

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
    window.alert("11");

    var scale = nft.getAttribute("scale");
    window.alert(scale);

    var zoom = scale.split(' ');
    var zoomR = zoom[0];

    scene.addEventListener(_start, function (e) {
        var event = e.changedTouches ? e.changedTouches[0] : e;
        prevPageY = event.pageY;    // 縦軸
        prevPageX = event.pageX;    // 横軸
    })

    scene.addEventListener(_move, function (e) {
        var event = e.changedTouches ? e.changedTouches[0] : e;
        if (prevPageY) {
            //window.alert(((prevPageY - event.pageY) / scene.clientHeight / 5) * 10);
            window.alert(zoomR);
            AFRAME.utils.entity.getAttribut
            //if ((zoomRate + ((prevPageY - event.pageY) / scene.clientHeight / 5) * 10) > 0.1) {
            if ((zoomR + ((prevPageY - event.pageY) / scene.clientHeight / 5) * 10) > 0.1) {

                //zoomRate += ((prevPageY - event.pageY) / scene.clientHeight / 5) * 10;
                zoomR += ((prevPageY - event.pageY) / scene.clientHeight / 5) * 10;

                //AFRAME.utils.entity.setComponentProperty(nft, 'animation__scale', {
                //    property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRate + ' ' + zoomRate + ' ' + zoomRate
                //});
                AFRAME.utils.entity.setComponentProperty(nft, 'animation__scale', {
                    property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomR + ' ' + zoomR + ' ' + zoomR
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

window.addEventListener('DOMContentLoaded', function () {

    var wrapPos = nft.getAttribute('position');
    window.alert("0");

    //wrapPos.x += 0;
    //wrapPos.y -= 0.5;
    //wrapPos.z -= 8;

    // ↓ 上下移動ボタン押下
    var upbtn = document.getElementById('swUp');
    window.alert("1");

    upbtn.addEventListener('click', function () {
        y += 0.2;
        nft.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
    });
    window.alert("2");

    var downbtn = document.getElementById('swDown');

    downbtn.addEventListener('click', function () {
        wrapPos.y -= 0.2;
        nft.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
    });
    // ↑ 
    window.alert("3");

    // ↓ UPボタン長押し
    var bUP = document.querySelector('#swUp');
    var bDOWN = document.querySelector('#swDown');
    var eventStart = 'touchstart';
    var eventEnd = 'touchend';
    var eventLeave = 'touchmove';
    window.alert("4");

    bUP.addEventListener(eventStart, e => {
        e.preventDefault();
        bUP.classList.add('active');
        timer = setInterval(() => {
            wrapPos.y += 0.02;
            nft.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
        }, 10);
    })
    window.alert("5");

    bUP.addEventListener(eventEnd, e => {
        e.preventDefault();
        bUP.classList.remove('active');
        clearInterval(timer);
    });
    window.alert("6");

    bUP.addEventListener(eventLeave, e => {
        e.preventDefault();
        bUP.classList.remove('active');
        clearInterval(timer);
    });
    // ↑ 
    window.alert("7");

    // ↓ DOWNボタン長押し
    bDOWN.addEventListener(eventStart, e => {
        e.preventDefault();
        bDOWN.classList.add('active');
        timer = setInterval(() => {
            wrapPos.y -= 0.02;
            nft.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
        }, 10);
    })

    bDOWN.addEventListener(eventEnd, e => {
        e.preventDefault();
        bDOWN.classList.remove('active');
        clearInterval(timer);
    });

    bUP.addEventListener(eventLeave, e => {
        e.preventDefault();
        bUP.classList.remove('active');
        clearInterval(timer);
    });
    // ↑
    window.alert("8");

});
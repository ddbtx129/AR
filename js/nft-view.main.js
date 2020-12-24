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

    var wrapPos = nft.getAttribute('position');
    //wrapPos.x += 0;
    //wrapPos.y -= 0.5;
    //wrapPos.z -= 8;
    //self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
    //self.wrap.setAttribute('rotation', '0 0 0');

    var prevPageY;
    var prevPageX;
    var zoomRate = 1;

    webArViewer.scene.addEventListener('touchstart', function (e) {
        var event = e.changedTouches ? e.changedTouches[0] : e;
        prevPageY = event.pageY;    // 縦軸
        prevPageX = event.pageX;    // 横軸
    })

    webArViewer.scene.addEventListener('touchmove', function (e) {
        var event = e.changedTouches ? e.changedTouches[0] : e;

        if (prevPageY) {
            if ((zoomRate + (prevPageY - event.pageY) / webArViewer.scene.clientHeight / 5) > 0.1) {
                zoomRate += (prevPageY - event.pageY) / webArViewer.scene.clientHeight / 5;
                AFRAME.utils.entity.setComponentProperty(wrap, 'animation__scale', {
                    property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRate + ' ' + zoomRate + ' ' + zoomRate
                });
            }
        }
    });

    webArViewer.scene.addEventListener('touchend', function (e) {
        prevPageY = null;
    })

});

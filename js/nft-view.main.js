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

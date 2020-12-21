//var obj = document.querySelector('#source');
//var x = obj.getAttribute('position');

window.addEventListener('DOMContentLoaded', function () {

    var upbtn = document.getElementById('swUp');
    var downbtn = document.getElementById('swDown');

    var obj = document.querySelector('#source');
    var x = obj.getAttribute('position');

    upbtn.addEventListener('click', function () {

        window.alert(x);

    });

    downbtn.addEventListener('click', function () {

        window.alert("downクリック");

    });
});
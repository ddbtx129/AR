window.onload = function () {

    var fws1 = $('<a-entity></a-entity>');
    fws1.attr('position', '-38 -110 -150');
    fws1.attr('particle-firework', 'preset:fireworks;options:{rColor:"#ff4dd6",eColors:["#ff4d8e","#ff4d62","#ff8e4d","#ffc44d"],useTrail:0,useBloom:0,eCount:500,eHeight:80,eSize:6,rSize:3}');
    $('a-scene').append(fws1);

    var fws2 = $('<a-entity></a-entity>');
    fws2.attr('position', '0 -110 -150');
    fws2.attr('particle-firework', 'preset:fireworks;options:{rColor:"#74d9ff",eColors:["#3fc9fc","#357afc","#e64bfa","#fa4bb7"],useTrail:0,useBloom:0,eCount:500,eHeight:80,eSize:6,rSize:3}');
    $('a-scene').append(fws2);

    var fws3 = $('<a-entity></a-entity>');
    fws3.attr('position', '30 -110 -150');
    fws3.attr('particle-firework', 'preset:fireworks;options:{rColor:"#ff9548",eColors:["#fc3f3f","#fca035","#fa4b8e"],useTrail:1,useBloom:1,eCount:10,eHeight:80,eSize:6,rSize:3,tSize:3,bSize:4}');
    $('a-scene').append(fws3);

    function genCirclePoint(radius1, radius2, hei) {
        var rand = Math.random() * Math.PI;
        var xsign = Math.random() > 0.5 ? 1 : -1;
        var r = Math.random() * (radius2 - radius1) + radius1;

        var x = r * Math.sin(rand) * xsign;
        var z = r * Math.cos(rand);
        var p = new THREE.Vector3(x, hei, z);
        return p;
    };

    function genFireWork(pos) {
        var fws = $('<a-entity></a-entity>');
        fws.attr('position', pos.x + ' ' + pos.y + ' ' + pos.z);
        fws.attr('particle-firework', 'preset:fireworks;options:{eColors:["#FF3333","#ffef33","#33ff99","#33b1ff","#4b33ff","#ff33f7"],eCount:8,}');
        $('a-scene').append(fws);
    };

    setInterval(function () {
        var pos = genCirclePoint(20, 120, 30);
        genFireWork(pos);
    }, 750)
};

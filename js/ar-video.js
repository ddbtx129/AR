var path = "https://ddbtx129.github.io/AR/";
var arg = GetQueryString();

var defaultPos = { x: 0, y: 0, z: 0 };
var defaultSize = { w: 10, h: 10 };
var zoomW = 0;
var zoomH = 0;

function VideoEvent () {

    var webArVideo = {};

    var videoview = {

		videoInit: function () {
			window.alert(0);
			if (this.setProperty()) {
				window.alert(2);

				var deviceevents = {
					touch: typeof document.ontouchstart !== 'undefined',
					pointer: window.navigator.pointerenabled,
					mspointer: window.navigator.mspointerenabled
				};

				this.eventnames = {
					start: deviceevents.pointer ? 'pointerdown' : deviceevents.mspointer ? 'mspointerdown' : deviceevents.touch ? 'touchstart' : 'mousedown',
					move: deviceevents.pointer ? 'pointermove' : deviceevents.mspointer ? 'mspointermove' : deviceevents.touch ? 'touchmove' : 'mousemove',
					end: deviceevents.pointer ? 'pointerup' : deviceevents.mspointer ? 'mspointerup' : deviceevents.touch ? 'touchend' : 'mouseup'
				};
				window.alert(3);
			}

			this.setSwitcher();
			window.alert(4);
		},

		setProperty: function () {

			var main = document.getElementById("arMain");

			defaultPos = main.getAttribute('position');
			defaultSize = { w: main.clientWidth, h: main.clientHeight };
			window.alert(1);
			return true;
        },

		setSwitcher: function () {

			var scene = document.getElementById('arScene');
			var main = document.getElementById("arMain");
			var view = document.getElementById("arView");

			var self = this;

			var prevPageY;
			var prevPageX;

			zoomW = defaultSize.w;
			zoomH = defaultSize.h;

			var rate = defaultSize.h / 4;

			// 拡大・縮小
			scene.addEventListener(self.eventnames.start, function (e) {
				var event = e.changedTouches ? e.changedTouches[0] : e;
				prevPageY = event.pageY;    // 縦軸
				prevPageX = event.pageX;    // 横軸
			})

			scene.addEventListener(self.eventnames.move, function (e) {
				var event = e.changedTouches ? e.changedTouches[0] : e;
				if (prevPageY) {
					if (zoomH + ((prevPageY - event.pageY) / scene.clientHeight / 5) * rate > 1) {
						zoomW += ((prevPageY - event.pageY) / scene.clientHeight / 5) * 40;
						zoomH += ((prevPageY - event.pageY) / scene.clientHeight / 5) * 40;
						AFRAME.utils.entity.setComponentProperty(main, 'animation__scale', {
							property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomW + ' ' + zoomH + ' ' + zoomW
						});
					}
				}
			})

			scene.addEventListener(self.eventnames.end, function (e) {
				prevPageY = null;
			})

			// ↓ rotation 切替
			var bAngle = document.querySelector('#swAngle');
			var bParallel = document.querySelector('#swParallel');

			bParallel.classList.add('current');

			bAngle.addEventListener('click', function () {
				if (!bAngle.classList.contains('current')) {
					//main.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));
					view.setAttribute('rotation', AFRAME.utils.coordinates.stringify('90 0 0'));
					main.setAttribute('position', String(defaultPos.x) + ' ' + String(defaultPos.y) + ' ' + String(defaultPos.z));
					bAngle.classList.add('current');
					bParallel.classList.remove('current');
				}
			})

			bParallel.addEventListener('click', function () {
				if (!bParallel.classList.contains('current')) {
					//main.setAttribute('rotation', AFRAME.utils.coordinates.stringify('90 0 0'));
					view.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));
					main.setAttribute('position', String(defaultPos.x) + ' ' + String(defaultPos.y) + ' ' + String(defaultPos.z));
					bParallel.classList.add('current');
					bAngle.classList.remove('current');
				}
			})

			var wrapPos = main.getAttribute('position');

			var bUP = document.querySelector('#swUp');
			var bDOWN = document.querySelector('#swDown');

			var timer;

			// ↓ 上移動ボタン押下
			bUP.addEventListener('click', function (e) {
				if (!!(bAngle.classList.contains('current'))) {
					wrapPos.y += 5;
				} else {
					wrapPos.z -= 5;
				}
				main.setAttribute('position', String(wrapPos.x) + ' ' + String(wrapPos.y) + ' ' + String(wrapPos.z));
			})

			// ↓ 下移動ボタン押下
			bDOWN.addEventListener('click', function (e) {
				if (!!(bAngle.classList.contains('current'))) {
					wrapPos.y -= 5;
				} else {
					wrapPos.z += 5;
				}
				main.setAttribute('position', String(wrapPos.x) + ' ' + String(wrapPos.y) + ' ' + String(wrapPos.z));
			})

			// ↓ UPボタン長押し
			bUP.addEventListener(self.eventnames.start, e => {
				e.preventDefault();
				bUP.classList.add('active');
				timer = setInterval(() => {
					if (!!(bAngle.classList.contains('current'))) {
						wrapPos.y += 2;
					} else {
						wrapPos.z -= 2;
					}
					main.setAttribute('position', String(wrapPos.x) + ' ' + String(wrapPos.y) + ' ' + String(wrapPos.z));
				}, 10);
			})

			bUP.addEventListener(self.eventnames.end, e => {
				e.preventDefault();
				bUP.classList.remove('active');
				clearInterval(timer);
			});

			bUP.addEventListener(self.move, e => {
				e.preventDefault();
				bUP.classList.remove('active');
				clearInterval(timer);
			});

			// ↓ DOWNボタン長押し
			bDOWN.addEventListener(self.eventnames.start, e => {
				e.preventDefault();
				bDOWN.classList.add('active');
				timer = setInterval(() => {
					if (!!(bAngle.classList.contains('current'))) {
						wrapPos.y -= 2;
					} else {
						wrapPos.z += 2;
					}
					main.setAttribute('position', String(wrapPos.x) + ' ' + String(wrapPos.y) + ' ' + String(wrapPos.z));
				}, 10);
			})

			bDOWN.addEventListener(self.eventnames.end, e => {
				e.preventDefault();
				bDOWN.classList.remove('active');
				clearInterval(timer);
			});

			bDOWN.addEventListener(self.eventnames.move, e => {
				e.preventDefault();
				bDOWN.classList.remove('active');
				clearInterval(timer);
			});
		}
	}

	webArVideo.videoview = videoview;
	webArVideo.videoview.init();
};

function getArVideo() {

    //var arg = GetQueryString();

    var video = document.getElementById("arVideo");
    //var vObj = !(arg["o"]) ? 'article/video/notfound_video.mp4' : 'article/video/' + arg["o"] + '.mp4';
    var vObj;

    if ((arg["o1"]) && (arg["o2"])) {
        vObj = 'article/video/' + arg["o1"] + '/' + arg["o2"] + '.mp4';
    } else {
        vObj = !(arg["o"]) ? 'article/video/notfound_video.mp4' : 'article/video/' + arg["o"] + '.mp4';
    }

    video.setAttribute("src", vObj);
};

function getArMarker() {

    var marker = document.getElementById("arMarker");
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
    
    //var arg = GetQueryString();

    var video = document.getElementById("arVideo");
    var audio = document.getElementById("arAudio");
    
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

    //var arg = GetQueryString();

    var main = document.getElementById('arMain');

    if ((arg["o1"]) && (arg["o2"])) {
        nObj = path + 'article/gltf/' + arg["o1"] + '/' + arg["o2"] + '.gltf';
    } else {
        nObj = !(arg["o"]) ? '' : path + 'article/gltf/' + arg["o"] + '.gltf';
    }

	main.setAttribute('gltf-model', nObj);

    if(!!(arg["xs"]))
    {
        var shodow = document.getElementById('arGltf-shadow');
        var sObj;

        if ((arg["o1"]) && (arg["o2"])) {
            sObj = path + 'article/gltf/' + arg["o1"] + '/' + arg["o2"] + '-hs.gltf';;
        } else {
            sObj = !(arg["o"]) ? '' : path + 'article/gltf/' + arg["o"] + '-hs.gltf';
        }

        shodow.setAttribute('gltf-model-shadow', sObj);
        shodow.style.visibility = 'visible';
    }
};

function getNftMarker() {
    
    var arg = GetQueryString();

    var nft = document.getElementById('arNft');
    var nObj;

    if ((arg["m1"]) && (arg["m2"])) {
        nObj = path + 'ImageDescriptors/' + arg["m1"] + '/' + arg["m2"] + '/' + arg["m2"];
    } else {
        nObj = !(arg["m"]) ? '' : path + 'ImageDescriptors/' + arg["m"] + '/' + arg["m"];
    }

    nft.setAttribute('url', nObj);
};
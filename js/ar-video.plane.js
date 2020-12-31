﻿
var defaultPos = { x: 0, y: 0, z: 0 };
var defaultSize = { w: 10, h: 10 };
var zoomW = 0;
var zoomH = 0;

(function (global) {

    var webArVideo = {};

    var VideoView = {

		VideoInit: function () {

			if (this.setProperty()) {

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

			}

			this.setSwitcher();
		},

		setProperty: function () {

			var main = document.querySelector("#arMain");

			defaultPos = main.getAttribute("position");

			defaultSize.w = main.getAttribute("width");
			defaultSize.h = main.getAttribute("height");

			return true;
        },

		setSwitcher: function () {
			window.alert(10);

			var scene = document.getElementById('arScene');
			var main = document.getElementById("arMain");
			var view = document.getElementById("arView");

			var self = this;

			var prevPageY;
			var prevPageX;

			zoomW = defaultSize.w;
			zoomH = defaultSize.h;

			//var rate = ((defaultSize.h / 4) < 1) ? 1 : defaultSize.h / 4;
			//window.alert(1);

			//// 拡大・縮小
			//scene.addEventListener(self.eventnames.start, function (e) {
			//	var event = e.changedTouches ? e.changedTouches[0] : e;
			//	prevPageY = event.pageY;    // 縦軸
			//	prevPageX = event.pageX;    // 横軸
			//})

			//scene.addEventListener(self.eventnames.move, function (e) {
			//	var event = e.changedTouches ? e.changedTouches[0] : e;
			//	if (prevPageY) {
			//		if (zoomH + ((prevPageY - event.pageY) / scene.clientHeight / 5) * rate > 1) {
			//			zoomW += ((prevPageY - event.pageY) / scene.clientHeight / 5) * rate;
			//			zoomH += ((prevPageY - event.pageY) / scene.clientHeight / 5) * rate;
			//			AFRAME.utils.entity.setComponentProperty(main, 'animation__scale', {
			//				//property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomW + ' ' + zoomH + ' ' + zoomW
			//				property: 'size', dur: 5, easing: 'linear', loop: false, to: zoomW + ' ' + zoomH + ' ' + 0
			//			});
			//		}
			//	}
			//})

			//scene.addEventListener(self.eventnames.end, function (e) {
			//	prevPageY = null;
			//})


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
			window.alert(11);

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
			window.alert(12);

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
			window.alert(13);

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
			window.alert(14);
		}
	}

	webArVideo.VideoView = VideoView;
	webArVideo.VideoView.VideoInit();

}());
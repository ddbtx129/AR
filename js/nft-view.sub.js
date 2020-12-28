var defaultPos = { x: 0, y: 0, z: 0};
var defaultSize = { w: 10, h: 10 };
var zoomW = 0;
var zoomH = 0;

(function (global) {

	var webArNft = {};
	var rootPath = "https://ddbtx129.github.io/AR/";

	var nft = {

		nftInit: function () {

			this.setArg();

			if (this.setArData()) {

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

		setArg: function () {

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
			if (!!arg.wh) {
				switch ((parseInt(arg.wh, 16).toString(10)).length) {
					case 2:
						arg.sizeList = arg.wh && (parseInt(arg.wh, 16).toString(10)).match(/.{1}/g);
						break;
					case 4:
						arg.sizeList = arg.wh && (parseInt(arg.wh, 16).toString(10)).match(/.{2}/g);
						break;
					case 6:
						arg.sizeList = arg.wh && (parseInt(arg.wh, 16).toString(10)).match(/.{3}/g);
						break;
					case 8:
						arg.sizeList = arg.wh && (parseInt(arg.wh, 16).toString(10)).match(/.{4}/g);
						break;
					case 10:
						arg.sizeList = arg.wh && (parseInt(arg.wh, 16).toString(10)).match(/.{5}/g);
						break;
					default:
						arg.sizeList = arg.wh && (parseInt(arg.wh, 16).toString(10)).match(/.{1}/g);
						break;

				}
			};

			// マーカー
			arg.markerList = arg.m;
			arg.markerList1 = arg.m1;
			arg.markerList2 = arg.m2;

			// arGltf-main
			arg.ObjectList = arg.o;
			arg.ObjectList1 = arg.o1;
			arg.ObjectList2 = arg.o2;

			self.arg = arg;
		},

		setArData: function () {

			var self = this;
			var arData = null;

			//dataObj.isObject = !self.arg.ObjectList && self.arg.ObjectList1;

			// データの準備
			var dataObj = {
				path: (!(self.arg.ObjectList) ?
							(rootPath + 'article/nftobject/' + self.arg.ObjectList1 + '/' + self.arg.ObjectList2 + '.gltf')
							:
							(!(self.arg.ObjectList) ? '' : rootPath + 'article/nftobject/' + self.arg.ObjectList + '.gltf'))
			};

		    if (!dataObj.path) {

				// 画像なかった
		        Err_Exit('画像情報が取得できませんでした。');
		        return false;

			} else {

				var scene = document.getElementById('arScene');
		        var marker = document.getElementById('arNft');
		        var nft = document.getElementById("arGltf-main");

		        nft.setAttribute('gltf-model', AFRAME.utils.coordinates.stringify(dataObj.path));
				nft.style.zIndex = 9999;

		        if ((!!self.arg.markerList1) && (!!self.arg.markerList2)) {
		        	marker.setAttribute('url',
                        AFRAME.utils.coordinates.stringify(
                            rootPath + 'ImageDescriptors/' + self.arg.markerList1 + '/' + self.arg.markerList2));
		        } else {
		        	marker.setAttribute('url',
                        AFRAME.utils.coordinates.stringify(
                            !(self.arg.markerList) ? '' : path + 'ImageDescriptors/' + self.arg.markerList + '/' + self.arg.markerList));
				}

				var wh = (String(!!(self.arg.sizeList) ? self.arg.sizeList : '10,10')).split(',');
				dataObj.size = { w: Number(wh[0]), h: Number(wh[0]) };
				defaultSize = dataObj.size;

				dataObj.posVec3 = this.positionVec3('main', dataObj.size.h);
				defaultPos = dataObj.posVec3;

				nft.setAttribute('scale', String(dataObj.size.w) + ' ' + String(dataObj.size.h) + ' ' + String(dataObj.size.w));
				nft.setAttribute('position', String(dataObj.posVec3.x) + ' ' + String(dataObj.posVec3.y) + ' ' + String(dataObj.posVec3.z));
				nft.setAttribute('rotation', '0 0 0');

				//var ts, tl;
				//ts = -32;
				//tl = 64;

				//AFRAME.utils.entity.setComponentProperty(nft, 'geometry', {
				//	primitive: 'cylinder', openEnded: true, thetaStart: ts, thetaLength: tl,
				//	height: val.size.h, radius: val.size.w, segmentsHeight: 18, segmentsRadial: 36
				//});

				dataObj.isShadow = self.arg.shodowList && !!Number(self.arg.shodowList);

				//var nftShadow = document.getElementById('arGltf-shadow');
				//var arShadow = document.getElementById('source');

				if (!dataObj.isShadow) {
					//nftShadow.remove();
					//arShadow.remove();
					//nftShadow.style.visibility = "hidden";
				} else {

					//nftShadow.style.visibility = "hidden";

					//dataObj.shadow = {
					//	path: (!(self.arg.ObjectList) ?
					//		(rootPath + 'article/nftobject/' + self.arg.ObjectList1 + '/' + self.arg.ObjectList2 + '-xs.gltf')
					//		:
					//		(!(self.arg.ObjectList) ? '' : rootPath + 'article/nftobject/' + self.arg.ObjectList + '-xs.gltf'))
					//};
					//window.alert(1);
					//nftShadow.setAttribute('gltf-model', AFRAME.utils.coordinates.stringify(dataObj.shadow.path));
					//nftShadow.style.zIndex = 999;

					//nftShadow.setAttribute('scale', String(dataObj.size.w) + ' ' + String(dataObj.size.h) + ' ' + String(dataObj.size.w));
					//nftShadow.setAttribute('position', String(dataObj.posVec3.x) + ' ' + String(dataObj.posVec3.y) + ' ' + String(dataObj.posVec3.z + (dataObj.size.h / 2)));
					//nftShadow.setAttribute('rotation', '-90 0 0');

					//dataObj.shadow = shadow;
					
					//var source = (!(self.arg.ObjectList) ?
					//	(rootPath + 'article/pic/' + self.arg.ObjectList1 + '/' + self.arg.ObjectList2 + '.png')
					//	:
					//	(!(self.arg.ObjectList) ? '' : rootPath + 'article/pic/' + self.arg.ObjectList + '.png'));

					//arShadow.setAttribute("src", source);

					var shadow = document.createElement('a-entity');

					shadow.setAttribute('position', AFRAME.utils.coordinates.stringify(self.positionVec3('shadow')));
					shadow.setAttribute('rotation', '-90 0 0');

					AFRAME.utils.entity.setComponentProperty(shadow, 'geometry', {
						primitive: 'plane', height: dataObj.size.h, width: dataObj.size.w
					});

					AFRAME.utils.entity.setComponentProperty(shadow, 'material', {
						shader: 'flat', npot: true, src: '#arGltf-main', transparent: true, alphaTest: 0.1,
						color: 'black', opacity: 0.3, depthTest: false
					});

					dataObj.shadow = shadow;
					marker.appendChild(dataObj.shadow);
				}
		    }

		    arData = dataObj;
			self.arData = arData;

			return true;
		},

		setSwitcher: function () {
			window.alert(113);

			var scene = document.getElementById('arScene');
			var nft = document.getElementById("arGltf-main");

			var self = this;

			var prevPageY;
			var prevPageX;

			zoomW = defaultSize.w;
			zoomH = defaultSize.h;

			// 拡大・縮小
			scene.addEventListener(self.eventnames.start, function (e) {
                var event = e.changedTouches ? e.changedTouches[0] : e;
                prevPageY = event.pageY;    // 縦軸
				prevPageX = event.pageX;    // 横軸

            })
			
			scene.addEventListener(self.eventnames.move, function (e) {
                var event = e.changedTouches ? e.changedTouches[0] : e;
                if (prevPageY) {
					if ((zoomH + (((prevPageY - event.pageY) * 10) / scene.clientHeight / 5))> 0.1) {
						zoomW += (((prevPageY - event.pageY) * 10) / scene.clientHeight / 5);
						zoomH += (((prevPageY - event.pageY) * 10) / scene.clientHeight / 5);
						window.alert(zoomH);
						AFRAME.utils.entity.setComponentProperty(nft, 'animation__scale', {
							property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomH + ' ' + zoomH + ' ' + zoomH
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
					nft.setAttribute('rotation', AFRAME.utils.coordinates.stringify('90 0 0'));
					bAngle.classList.add('current');
					bParallel.classList.remove('current');
					// position リセット
					nft.setAttribute('position', String(defaultPos.x) + ' ' + String(defaultPos.y) + ' ' + String(defaultPos.z));
				}
			})

			bParallel.addEventListener('click', function () {
				if (!bParallel.classList.contains('current')) {
					nft.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));
					bParallel.classList.add('current');
					bAngle.classList.remove('current');
					// position リセット
					nft.setAttribute('position', String(defaultPos.x) + ' ' + String(defaultPos.y) + ' ' + String(defaultPos.z));
				}
			})

			var wrapPos = nft.getAttribute('position');

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
				nft.setAttribute('position', String(wrapPos.x) + ' ' + String(wrapPos.y) + ' ' + String(wrapPos.z));
			})

			// ↓ 下移動ボタン押下
			bDOWN.addEventListener('click', function (e) {
				if (!!(bAngle.classList.contains('current'))) {
					wrapPos.y -= 5;
				} else {
					wrapPos.z += 5;
				}
				nft.setAttribute('position', String(wrapPos.x) + ' ' + String(wrapPos.y) + ' ' + String(wrapPos.z));
			})

			// ↓ UPボタン長押し
			bUP.addEventListener(self.eventnames.start, e => {
				e.preventDefault();
				bUP.classList.add('active');
				timer = setInterval(() => {
					if (!!(bAngle.classList.contains('current'))) {
						wrapPos.y += 5;
					} else {
						wrapPos.z -= 5;
					}
					nft.setAttribute('position', String(wrapPos.x) + ' ' + String(wrapPos.y) + ' ' + String(wrapPos.z));
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
						wrapPos.y -= 5;
					} else {
						wrapPos.z += 5;
					}
					nft.setAttribute('position', String(wrapPos.x) + ' ' + String(wrapPos.y) + ' ' + String(wrapPos.z));
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
			window.alert(11);
		},

		positionVec3: function (type, sizeHeight) {
			var h1_2 = sizeHeight / 2;

			if (type === 'shadow') {
				return { x: 0, y: 0, z: -h1_2 };
			} else {
				return { x: 0, y: h1_2, z: 0 };
			}
		}
	};

	webArNft.nft = nft;
	webArNft.nft.nftInit();

}());
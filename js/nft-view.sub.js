var defaultPos = { x: 0, y: 0, z: 0};

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

			// ar-gltf-main
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
		        var marker = document.getElementById('ar-nft');
		        var nft = document.getElementById("ar-gltf-main");

		        nft.setAttribute('gltf-model', AFRAME.utils.coordinates.stringify(dataObj.path));

		        if ((!!self.arg.markerList1) && (!!self.arg.markerList2)) {
		        	marker.setAttribute('url',
                        AFRAME.utils.coordinates.stringify(
                            rootPath + 'ImageDescriptors/' + self.arg.markerList1 + '/' + self.arg.markerList2));
		        } else {
		        	marker.setAttribute('url',
                        AFRAME.utils.coordinates.stringify(
                            !(self.arg.markerList) ? '' : path + 'ImageDescriptors/' + self.arg.markerList + '/' + self.arg.markerList));
				}

				dataObj.isShadow = self.arg.shodowList && !!Number(self.arg.shodowList);

				//if (!dataObj.isShadow) {
				//	var el = document.querySelector('ar-gltf-shadow');
				//	el.remove();
				//} else {
				//	//
				//}
				window.alert(10);
				var wh = (String(!!(self.arg.sizeList) ? self.arg.sizeList : '10,10')).split(',');
				dataObj.size = { w: Number(wh[0]), h: Number(wh[0]) };

				dataObj.posVec3 = this.positionVec3('main', dataObj.size.h);
				defaultPos = dataObj.posVec3;

				nft.setAttribute('scale', String(dataObj.size.w) + ' ' + String(dataObj.size.h) + ' ' + String(dataObj.size.w));
				nft.setAttribute('position', String(dataObj.posVec3.x) + ' ' + String(dataObj.posVec3.y) + ' ' + String(dataObj.posVec3.z));
				nft.setAttribute('rotation', '0 0 0');
		    }

		    arData = dataObj;
			self.arData = arData;
			window.alert(11);
		    return true;
		},

        setSwitcher: function () {

            var scene = document.getElementById('ar-scene');
			var nft = document.getElementById("ar-gltf-main");

            var self = this;

            var prevPageY;
            var prevPageX;

			var zoomRate = 160;

            // 拡大・縮小
			scene.addEventListener(self.eventnames.start, function (e) {
                var event = e.changedTouches ? e.changedTouches[0] : e;
                prevPageY = event.pageY;    // 縦軸
				prevPageX = event.pageX;    // 横軸
				window.alert(201);
            })
			window.alert(104);
			scene.addEventListener(self.eventnames.move, function (e) {
                var event = e.changedTouches ? e.changedTouches[0] : e;
                if (prevPageY) {
                    if ((zoomRate + ((prevPageY - event.pageY) / scene.clientHeight / 5)) > 0.1) {
                        zoomRate += ((prevPageY - event.pageY) / scene.clientHeight / 5);
                        AFRAME.utils.entity.setComponentProperty(nft, 'animation__scale', {
                            property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRate + ' ' + zoomRate + ' ' + zoomRate
						});
						window.alert(202);
                    }
                }
            })
			window.alert(105);
			scene.addEventListener(self.eventnames.end, function (e) {
				prevPageY = null;
				window.alert(203);
            })
			window.alert(106);

			// ↓ rotation 切替
            var anglebtn = document.querySelector('#swAngle');
            var parallelbtn = document.querySelector('#swParallel');

            parallelbtn.classList.add('current');

			anglebtn.addEventListener('click', function () {
                if (!anglebtn.classList.contains('current')) {
                    nft.setAttribute('rotation', AFRAME.utils.coordinates.stringify('90 0 0'));
                    anglebtn.classList.add('current');
					parallelbtn.classList.remove('current');
					// position リセット
					nft.setAttribute('position', String(defaultPos.x) + ' ' + String(defaultPos.y) + ' ' + String(defaultPos.z));
                }
            })

			parallelbtn.addEventListener('click', function () {
                if (!parallelbtn.classList.contains('current')) {
                    nft.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));
                    parallelbtn.classList.add('current');
					anglebtn.classList.remove('current');
					// position リセット
					nft.setAttribute('position', String(defaultPos.x) + ' ' + String(defaultPos.y) + ' ' + String(defaultPos.z));
                }
            })

			var wrapPos = nft.getAttribute('position');

			var upbtn = document.querySelector('#swUp');
			var downbtn = document.querySelector('#swDown');

            // ↓ 上移動ボタン押下
			upbtn.addEventListener('click', function (e) {
				if (!!(anglebtn.classList.contains('current'))) {
					wrapPos.y += 5;
				} else {
					wrapPos.z -= 5;
                }
				nft.setAttribute('position', String(wrapPos.x) + ' ' + String(wrapPos.y) + ' ' + String(wrapPos.z));
			})

			// ↓ 下移動ボタン押下
			downbtn.addEventListener('click', function (e) {
				if (!!(anglebtn.classList.contains('current'))) {
					wrapPos.y -= 5;
				} else {
					wrapPos.z += 5;
				}
				nft.setAttribute('position', String(wrapPos.x) + ' ' + String(wrapPos.y) + ' ' + String(wrapPos.z));
			})

			var bUP = document.querySelector('#swUp');
			var bDOWN = document.querySelector('#swDown');

			var timer;

			// ↓ UPボタン長押し
			bUP.addEventListener(self.eventnames.start, e => {
				e.preventDefault();
				bUP.classList.add('active');
				timer = setInterval(() => {
					if (!!(anglebtn.classList.contains('current'))) {
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
					if (!!(anglebtn.classList.contains('current'))) {
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
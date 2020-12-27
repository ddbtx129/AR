
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
			arg.sizeList = arg.wh && (parseInt(arg.wh, 16).toString(10)).match(/.{3}/g);
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

				window.alert(0)
				dataObj.isShadow = self.arg.shodowList && !!Number(self.arg.shodowList);

				//if (!dataObj.isShadow) {
				//	var el = document.querySelector('ar-gltf-shadow');
				//	el.remove();
				//} else {
				//	//
				//}
				window.alert(String(self.arg.sizeList));
				var wh = (String(!!(self.arg.sizeList) ? self.arg.sizeList : '1010')).split(',');
				dataObj.size = { w: Number(wh[0]), h: Number(wh[0]) };
				dataObj.posVec3 = this.positionVec3('main', dataObj.size.h);

				nft.setAttribute('scale', String(dataObj.size.w) + ' ' + String(dataObj.size.h) + ' ' + String(dataObj.size.w));
				nft.setAttribute('position', String(dataObj.posVec3.x) + ' ' + String(dataObj.posVec3.y) + ' ' + String(dataObj.posVec3.z));
				nft.setAttribute('rotation', '90 0 0');
		    }

		    arData = dataObj;
			self.arData = arData;
			window.alert(dataObj.size.w);
		    return true;
		},

        setSwitcher: function () {

			//window.alert(100);
   //         var scene = document.getElementById('ar-scene');
			//var nft = document.getElementById("ar-gltf-main");
			//window.alert(101);

   //         var self = this;
			//window.alert(102);

   //         var prevPageY;
   //         var prevPageX;
			//window.alert(103);

			//var zoomRate = self.arData.size.h;
			//window.alert(!!(self.arData));
   //         // 拡大・縮小
   //         scene.addEventListener(deviceEvents.start, function (e) {
   //             var event = e.changedTouches ? e.changedTouches[0] : e;
   //             prevPageY = event.pageY;    // 縦軸
			//	prevPageX = event.pageX;    // 横軸
			//	window.alert(201);
   //         })
			//window.alert(104);
   //         scene.addEventListener(deviceEvents.move, function (e) {
   //             var event = e.changedTouches ? e.changedTouches[0] : e;
   //             if (prevPageY) {
   //                 if ((zoomRate + ((prevPageY - event.pageY) / scene.clientHeight / 5)) > 0.1) {
   //                     zoomRate += ((prevPageY - event.pageY) / scene.clientHeight / 5);
   //                     AFRAME.utils.entity.setComponentProperty(nft, 'animation__scale', {
   //                         property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRate + ' ' + zoomRate + ' ' + zoomRate
			//			});
			//			window.alert(202);
   //                 }
   //             }
   //         })
			//window.alert(105);
   //         scene.addEventListener(deviceEvents.end, function (e) {
			//	prevPageY = null;
			//	window.alert(203);
   //         })
			//window.alert(106);
			//// ↓ rotation 切替
   //         var anglebtn = document.querySelector('#swAngle');
   //         var parallelbtn = document.querySelector('#swParallel');

   //         parallelbtn.classList.add('current');
			//window.alert(107);
   //         anglebtn.addEventListener('click', function () {
   //             if (!anglebtn.classList.contains('current')) {
   //                 nft.setAttribute('rotation', AFRAME.utils.coordinates.stringify('90 0 0'));
   //                 anglebtn.classList.add('current');
   //                 parallelbtn.classList.remove('current');
   //             }
   //         })
			//window.alert(108);
   //         parallelbtn.addEventListener('click', function () {
   //             if (!parallelbtn.classList.contains('current')) {
   //                 nft.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));
   //                 parallelbtn.classList.add('current');
   //                 anglebtn.classList.remove('current');
   //             }
   //         })
			//window.alert(109);
   //         // ↓ 上下移動ボタン押下
   //         var bUP = document.querySelector('#swUp');
   //         var bDOWN = document.querySelector('#swDown');

   //         bUP.addEventListener('click', function (e) {
   //             window.alert(arPosY);
   //             self.arData..posVec3.y += 0.2;
   //             window.alert(arPosY);
   //             nft.setAttribute('position', AFRAME.utils.coordinates.stringify(self.arData.posVec3));
   //         })

   //         bDOWN.addEventListener('click', function (e) {
   //             window.alert(arPosY);
   //             self.arData.posVec3.y -= 0.2;
   //             window.alert(arPosY);
   //             nft.setAttribute('position', AFRAME.utils.coordinates.stringify(self.arData.posVec3));
   //         })
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

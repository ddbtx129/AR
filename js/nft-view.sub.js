
(function (global) {

	var webArNft = {};
	var rootPath = "https://ddbtx129.github.io/AR/";
	window.alert(0);

	var nft = {

		nftInit: function () {
			window.alert(3);
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
		},

		setArg: function () {
			window.alert(4);
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
			arg.sizeList = arg.wh && (parseInt(arg.wh, 16).toString(10)).match(/.{2}/g);
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
			window.alert(5);

			var self = this;
			var arData = null;

			//dataObj.isObject = !self.arg.ObjectList && self.arg.ObjectList1;
			window.alert(6);

			// データの準備
			var dataObj = {
				path: (!(self.arg.ObjectList) ?
							(rootPath + 'article/nftobject/' + self.arg.ObjectList1 + '/' + self.arg.ObjectList2 + '.gltf')
							:
							(!(self.arg.ObjectList) ? '' : rootPath + 'article/nftobject/' + self.arg.ObjectList + '.gltf'))
			};
            
		    window.alert(dataObj.path);
		    window.alert(7);

		    if (!dataObj.path) {
		        // 画像なかった
		        Err_Exit('画像情報が取得できませんでした。');
		        return false;
		    } else {
		    	window.alert(8);

		        var marker = document.getElementById('ar-nft');
		        var nft = document.getElementById("ar-gltf-main");
		        window.alert(9);

		        nft.setAttribute('gltf-model', AFRAME.utils.coordinates.stringify(dataObj.path));
		        window.alert(10);

		        if ((!!self.arg.markerList1) && (!!self.arg.markerList2)) {
		        	marker.setAttribute('url',
                        AFRAME.utils.coordinates.stringify(
                            rootPath + 'ImageDescriptors/' + self.arg.markerList1 + '/' + self.arg.markerList2));
		        } else {
		        	marker.setAttribute('url',
                        AFRAME.utils.coordinates.stringify(
                            !(self.arg.markerList) ? '' : path + 'ImageDescriptors/' + self.arg.markerList + '/' + self.arg.markerList));
		        }
		        window.alert(11);

		        dataObj.isShadow = self.arg.shodowList && !!Number(self.arg.shodowList);
				window.alert(12);
				var wh = (String(!!(self.arg.sizeList) ? self.arg.sizeList : '1010')).split(',');
		        dataObj.size = { w: wh[0], y: wh[1], z: wh[0] };
		        window.alert(13);
		        dataObj.posVec3 = this.positionVec3('main');
				window.alert(16);
				nft.setAttribute('scale', AFRAME.utils.coordinates.stringify(dataObj.size));
				window.alert(17);
				nft.setAttribute('position', AFRAME.utils.coordinates.stringify(dataObj.posVec3));
				window.alert(18);
				nft.setAttribute('rotation', '0 0 0');
				window.alert(19);
				
		    }

		    arData = dataObj;
		    self.arData = arData;

		    return true;
		},

		positionVec3: function (type) {
			window.alert(14);
			var self = this;
			var h1_2 = self.arData.size.h / 2;
			window.alert(15);
			if (type === 'shadow') {
				return { x: 0, y: 0, z: -h1_2 };
			} else {
				return { x: 0, y: h1_2, z: 0 };
			}
		}
	};

	window.alert(1);
	webArNft.nft = nft;

	window.alert(2);
	webArNft.nft.nftInit();

}());

(function (global) {

	var webArNft = {};
	var rootPath = "https://ddbtx129.github.io/AR/";
	window.alert(0);

	var nft = {

		nftInit: function () {
			window.alert(3);
			this.setArg();

			//if (true) {

			//	var deviceevents = {
			//        touch: typeof document.ontouchstart !== 'undefined',
			//        pointer: window.navigator.pointerenabled,
			//        mspointer: window.navigator.mspointerenabled
			//    };

			//    this.eventnames = {
			//        start: deviceevents.pointer ? 'pointerdown' : deviceevents.mspointer ? 'mspointerdown' : deviceevents.touch ? 'touchstart' : 'mousedown',
			//        move: deviceevents.pointer ? 'pointermove' : deviceevents.mspointer ? 'mspointermove' : deviceevents.touch ? 'touchmove' : 'mousemove',
			//        end: deviceevents.pointer ? 'pointerup' : deviceevents.mspointer ? 'mspointerup' : deviceevents.touch ? 'touchend' : 'mouseup'
			//    };

			//}
		},

		setArg: function () {
			window.alert(4);
			var self = this;

			var arg = {};
			var pair = location.search.substring(1).split('&');

			for (var i = 0; pair[i]; i++) {
				var kv = pair[i].split('=');
				arg[kv[0]] = decodeURIComponent(kv[1]);
				window.alert(arg[kv[0]]);
			}

			// 影
			arg.shodowList = arg.xs && (parseInt(arg.xs, 16).toString(2));
			window.alert(arg.shodowList);
			// サイズ
			arg.sizeList = arg.wh && (parseInt(arg.wh, 16).toString(10)).match(/.{2}/g);
			window.alert(arg.sizeList);
			// マーカー
			arg.markerList = arg.m;
			window.alert(arg.markerList);
			arg.markerList1 = arg.m1;
			window.alert(arg.markerList1);
			arg.markerList2 = arg.m2;
			window.alert(arg.markerList2);

			// ar-gltf-main
			arg.ObjectList = arg.o;
			window.alert(arg.ObjectList);
			arg.ObjectList1 = arg.o1;
			window.alert(arg.ObjectList1);
			arg.ObjectList2 = arg.o2;
			window.alert(arg.ObjectList2);

			self.arg = arg;
		}

	};

	window.alert(1);
	
	webArNft.nft = nft;
	window.alert(2);
	webArNft.nft.nftInit();

}());
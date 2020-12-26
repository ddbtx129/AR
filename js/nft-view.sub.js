
var webArNft = {};

(function (rootPath) {

	window.alert(0);

	var nft = {

		nftInit: function () {
			window.alert(3);
			setArg();
			if (true) {

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
				window.alert(arg[kv[0]]);
			}

			// 影
			arg.shodowList = arg.xs && (parseInt(arg.xs, 16).toString(2));
			// サイズ
			arg.sizeList = arg.wh && (parseInt(arg.wh, 16).toString(10)).match(/.{2}/g);
			// マーカー
			//arg.markerList = arg.m;
			//arg.markerList12 = arg.m1 && arg.m2;
			//// ar-gltf-main
			//arg.ObjectList = arg.o;
			//arg.ObjectList12 = arg.o1 && arg.o2;
			window.alert(5);

			self.arg = arg;
		}
	};
	window.alert(1);
	webArNft.nft = nft;
	window.alert(2);
	webArNft.nft.nftInit();

}("https://ddbtx129.github.io/AR/"));
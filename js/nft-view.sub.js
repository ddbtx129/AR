
var webArNft = {};

(function (rootPath) {

	window.alert(0);

	var nft = {

		nftInit: function () {

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
			arg.markerList12 = arg.m1 && arg.m2;
			// ar-gltf-main
			arg.ObjectList = arg.o;
			arg.ObjectList12 = arg.o1 && arg.o2;

			self.arg = arg;
		}
	};

	webArNft.nft = nft;
	webArNft.nft.nftInit();

}("https://ddbtx129.github.io/AR/"));
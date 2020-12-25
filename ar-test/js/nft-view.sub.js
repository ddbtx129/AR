
var webArNft = {};
var rootPath = "https://ddbtx129.github.io/AR/";

(function () {

	var nft = {

		nftInit: function () {

			if (setardata()) {

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

		}
	};

}());
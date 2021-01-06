var webArViewer = webArViewer || {};

var defaultAngle = -5;
var defaultPos = { x: 0, y: 0, z: 0 };
var defaultSize = { w: 10, h: 10 };
var zoomW = 0;
var zoomH = 0;

var videoInfo = {};
var videoState = 0;
var objecttype = "pic";
var dec = 2;
var SizeRate = 10;

(function (global) {

    document.getElementById("info1").style.display = "none";
    webArViewer.scene = document.querySelector('a-scene');

    var ar = {

        init: function () {

            this.setArg();

            videostate = 0;

            if (this.setArData()) {

                this.setWrap();

                this.createModel();

                var deviceEvents = {
                    Touch: typeof document.ontouchstart !== 'undefined',
                    Pointer: window.navigator.pointerEnabled,
                    MSPointer: window.navigator.msPointerEnabled
                };

                this.eventNames = {
                    start: deviceEvents.Pointer ? 'pointerdown' : deviceEvents.MSPointer ? 'MSPointerDown' : deviceEvents.Touch ? 'touchstart' : 'mousedown',
                    move: deviceEvents.Pointer ? 'pointermove' : deviceEvents.MSPointer ? 'MSPointerMove' : deviceEvents.Touch ? 'touchmove' : 'mousemove',
                    end: deviceEvents.Pointer ? 'pointerup' : deviceEvents.MSPointer ? 'MSPointerUp' : deviceEvents.Touch ? 'touchend' : 'mouseup'
                };
                window.alert(100);
                this.setScene();
                window.alert(101);

                if (!this.arData.isMp4) {
                    window.alert(1010);
                    objecttype = "pic";
                } else {
                     window.alert(1011);
                    objecttype = "video";
                }

                this.setDiplayBtn();
                window.alert(102);

                window.alert(103);

            }

            if (!this.arData.isMp4) {
                this.setSwitcher();
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
            if (!!arg.wh) {
                switch ((parseInt(arg.wh, 16).toString(10)).length) {
                    case 2:
                        arg.sizeList = arg.wh && (parseInt(arg.wh, 16).toString(10)).match(/.{1}/g);
                        dec = 1;
                        SizeRate = 1;
                        break;
                    case 4:
                        arg.sizeList = arg.wh && (parseInt(arg.wh, 16).toString(10)).match(/.{2}/g);
                        dec = 1;
                        SizeRate = 10;
                        break;
                    case 6:
                        arg.sizeList = arg.wh && (parseInt(arg.wh, 16).toString(10)).match(/.{3}/g);
                        dec = 2;
                        SizeRate = 100;
                        break;
                    case 8:
                        arg.sizeList = arg.wh && (parseInt(arg.wh, 16).toString(10)).match(/.{4}/g);
                        dec = 3;
                        SizeRate = 1000;
                        break;
                    case 10:
                        arg.sizeList = arg.wh && (parseInt(arg.wh, 16).toString(10)).match(/.{5}/g);
                        dec = 4;
                        SizeRate = 10000;
                        break;
                    default:
                        arg.sizeList = arg.wh && (parseInt(arg.wh, 16).toString(10)).match(/.{1}/g);
                        dec = 1;
                        SizeRate = 1;
                        break;
                }
            };

            arg.angleList = arg.an && (parseInt(arg.an, 16).toString(2));

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

            var assets = document.createElement('a-assets');
            assets.setAttribute('timeout', '9000');

            var arData = null;

            // データの準備
            var dataObj = {
                path: (!(self.arg.ObjectList) ?
                    (self.arg.ObjectList1 + '/' + self.arg.ObjectList2)
                    :
                    (!(self.arg.ObjectList) ? '' : self.arg.ObjectList))
            };

            dataObj.isPng = !!(dataObj.path || '').match(/\.png$/i);
            dataObj.isGif = !!(dataObj.path || '').match(/\.gif$/i);
            dataObj.isMp4 = !!(dataObj.path || '').match(/\.mp4$/i);

            dataObj.isShadow = self.arg.shodowList && !!Number(self.arg.shodowList);
            dataObj.isMarker = !!self.arg.markerList;
            defaultAngle = (self.arg.angleList && Number(self.arg.angleList) == 1) ? -90 : -5;

            var wh = (String(!!(self.arg.sizeList) ? self.arg.sizeList : '10,10')).split(',');
            if (dataObj.isMp4) {
                dataObj.size = { w: (Number(wh[0]) / 10).toFixed(2), h: (Number(wh[1]) / 10).toFixed(2) };
                defaultSize = { w: (Number(wh[0]) / 10).toFixed(2), h: (Number(wh[1]) / 10).toFixed(2) };
            } else {
                dataObj.size = { w: Number(wh[0]), h: Number(wh[1]) };
                defaultSize = { w: Number(wh[0]), h: Number(wh[1]) };
            }

            if (dataObj.path) {

                var folder = !!(dataObj.isMp4) ? 'video' : 'pic';
                dataObj.path = rootPath + 'article/' + folder + '/' + dataObj.path;

                if (dataObj.isPng || dataObj.isGIf) {

                    var img = document.createElement('img');
                    img.setAttribute('crossorigin', 'anonymous');
                    img.setAttribute('id', 'source');
                    img.setAttribute('src', dataObj.path);
                    assets.appendChild(img);

                } else if (dataObj.isMp4) {

                    var video = document.createElement("video");
                    video.setAttribute("src", dataObj.path);
                    video.setAttribute('id', 'source');
                    video.setAttribute('preload', 'auto');
                    video.setAttribute('response-type', 'arraybuffer');
                    video.setAttribute('loop', 'true');
                    video.setAttribute('crossorigin', 'anonymous');
                    video.setAttribute('webkit-playsinline', 'webkit-playsinline');
                    video.setAttribute("playsinline", "");
                    video.setAttribute("controls", "");
                    video.setAttribute("autoplay", "");

                    var audio = document.createElement("audio");
                    audio.setAttribute("src", dataObj.path);
                    audio.setAttribute('id', 'source2');
                    audio.setAttribute('preload', 'auto');
                    audio.setAttribute('response-type', 'arraybuffer');
                    audio.setAttribute('loop', 'true');
                    audio.setAttribute('crossorigin', 'anonymous');
                    audio.setAttribute('webkit-playsinline', 'webkit-playsinline');
                    audio.setAttribute("playsinline", "");
                    audio.setAttribute("controls", "");
                    audio.setAttribute("autoplay", "");

                    dataObj.video = video;
                    dataObj.audio = audio;

                    assets.appendChild(video);
                    assets.appendChild(audio);

                    document.getElementById("scrshot").style.display = "none";
                    document.getElementById("swCamera").style.display = "none";
                }
            }

            arData = dataObj;

            if (!arData.path) {
                // 画像なかった
                Err_Exit('画像情報が取得できませんでした。');
                return false;
            }

            webArViewer.scene.appendChild(assets);
            self.arData = arData;

            return true;
        },

        setSwitcher: function () {

            var self = this;

            var swMarker = document.getElementById('swMarker');
            var swPreview = document.getElementById('swPreview');

            if (self.arg.preview) {
                swPreview.classList.add('current');
            } else {
                swMarker.classList.add('current');
            }

            swMarker.addEventListener('click', function () {
                if (!this.classList.contains('current')) {
                    location.replace(location.search.replace('&preview=1', ''));
                    this.setDiplayBtn();
                }
            });

            swPreview.addEventListener('click', function () {
                if (!this.classList.contains('current')) {
                    location.replace(location.search + '&preview=1');
                    this.setDiplayBtn();
                }
            });
        },

        setWrap: function () {

            var self = this;
            var base = self.arg.base ? decodeURI(self.arg.base) : AFRAME.utils.coordinates.stringify(self.positionVec3('main'));

            self.wrap = document.createElement('a-plane');
            self.wrap.setAttribute('id', 'base');
            self.wrap.setAttribute('scale', '1 1 1');
            self.wrap.setAttribute('position', base);
            self.wrap.setAttribute('src', rootPath + 'asset/plane.png');
            self.wrap.setAttribute('rotation', '0 0 0');
            self.wrap.setAttribute('material', 'transparent: true, opacity: 0');
        },

        createModel: function () {

            var self = this;
            var val = self.arData;

            if (!val.path) {
                return;
            }

            var wh = { w: val.size.w, h: val.size.h };

            if (val.isShadow) {

                var shadow = document.createElement('a-entity');

                shadow.setAttribute('id', 'shadow');
                shadow.setAttribute('position', AFRAME.utils.coordinates.stringify(self.positionVec3('shadow')));
                shadow.setAttribute('rotation', '-90 0 0');

                AFRAME.utils.entity.setComponentProperty(shadow, 'geometry', {
                    primitive: 'plane', height: wh.h, width: wh.w
                });
                
                AFRAME.utils.entity.setComponentProperty(shadow, 'material', {
                    shader: val.isGif ? 'gif' : 'flat', npot: true, src: '#source', transparent: true, alphaTest: 0.1,
                    color: 'black', opacity: 0.3, depthTest: false
                });

                self.arData.shadow = shadow;
            }

            var elname = '';

            if (val.isPng || val.arData) {
                elname = 'a-entity'
            } else if (val.isMp4) {
                elname = 'a-video'
            }

            var main = document.createElement(elname);
            var posVec3 = self.positionVec3('main');
            defaultPos = posVec3;

            main.setAttribute('id', 'main');
            main.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3));

            if (!val.isGif) {

                main.setAttribute('rotation', '-5 0 0');
                main.setAttribute('width', AFRAME.utils.coordinates.stringify(wh.w));
                main.setAttribute('height', AFRAME.utils.coordinates.stringify(wh.h));

                if (val.isMp4) {
                    main.setAttribute('play', 'true');
                }

                AFRAME.utils.entity.setComponentProperty(main, 'geometry', {
                    primitive: 'plane', height: wh.h, width: wh.w, segmentsHeight: 1, segmentsWidth: 1
                });

                AFRAME.utils.entity.setComponentProperty(main, 'material', {
                    shader: val.isGif ? 'gif' : 'standard', npot: true, src: '#source', displacementMap: null, displacementBias: -0.5,
                    side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                });

            } else {
                main.setAttribute('rotation', '-30 0 0');
            }

            self.arData.main = main;
        },

        setScene: function () {

            var self = this;
            var val = self.arData;

            self.arData.shadow && self.wrap.appendChild(self.arData.shadow);
            self.arData.main && self.wrap.appendChild(self.arData.main);

            // ボタン 表示・非表示切替
            //document.getElementById("swUp").style.display = 'inline';
            //document.getElementById("swDown").style.display = 'inline';
            window.alert(11);
            if (val.isMp4) {
                var video = document.querySelector('#source');
                if (videostate == 0) {
                    document.getElementById("player").style.display = 'inline';
                }
                videostate = 1
            } else {
                document.getElementById("player").style.display = 'none';
                videostate = 0
            }
            window.alert(12);

            var bAngle = document.getElementById('swAngle');
            var bParalle = document.getElementById('swParallel');

            if (!!bParalle.classList.remove('current')) {
                bParalle.classList.remove('current');
            }
            bAngle.classList.add('current');

            var arPicRotation = '-5 0 0';
            var arGifRotation = '-30 0 0';
            var arVRotation = '-90 0 0'

            var prevPageY;
            //var zoomRateH = defaultSize.h;
            var zoomRateH = 1;

            var wrapPos = self.positionVec3('main');

            if (self.arg.preview) {

                //document.getElementById("swAngle").style.display = 'none';
                //document.getElementById("swParallel").style.display = 'none';

                wrapPos.x += 0;
                wrapPos.y -= 2;
                wrapPos.z -= 8;

                self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                self.wrap.setAttribute('rotation', '0 0 0');

                webArViewer.scene.appendChild(self.wrap);
            } else {

                //document.getElementById("swAngle").style.display = 'inline';
                //document.getElementById("swParallel").style.display = 'inline';

                // ARマーカー
                var mWrap = document.createElement('a-marker');
                mWrap.setAttribute('videohandler', ''); 
                mWrap.setAttribute('preset', 'custom');
                mWrap.setAttribute('type', 'pattern');
                mWrap.setAttribute('id', 'arMarker');

                if (!!self.arg.m1 && !!self.arg.m2) {
                    mWrap.setAttribute('url', AFRAME.utils.coordinates.stringify('pattern/' + self.arg.markerList1 + '/pattern-' + self.arg.markerList2 + '.patt'));
                } else {
                    mWrap.setAttribute('url', AFRAME.utils.coordinates.stringify(
                        !(self.arg.markerList) ? 'pattern/pattern-def.patt' : 'pattern/pattern-' + self.arg.markerList + '.patt'));
                }

                mWrap.appendChild(self.wrap);

                webArViewer.scene.appendChild(mWrap);
                self.mWrap = mWrap;

                // ↓ rotation 切替
                bAngle.classList.add('current');

                bAngle.addEventListener('click', function () {
                    if (!bAngle.classList.contains('current')) {
                        var arRotation = arPicRotation;
                        wrapPos = self.positionVec3('main');
                        self.wrap.setAttribute('rotation', AFRAME.utils.coordinates.stringify(arRotation));
                        self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                        bAngle.classList.add('current');
                        bParalle.classList.remove('current');
                    }
                });

                bParalle.addEventListener('click', function () {
                    if (!bParalle.classList.contains('current')) {
                        var arRotation = arVRotation;
                        wrapPos = self.positionVec3('main');
                        self.wrap.setAttribute('rotation', AFRAME.utils.coordinates.stringify(arRotation));
                        self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                        bParalle.classList.add('current');
                        bAngle.classList.remove('current');
                    }
                });
                // ↑
            }

            // 拡大・縮小
            webArViewer.scene.addEventListener(self.eventNames.start, function (e) {
                var event = e.changedTouches ? e.changedTouches[0] : e;
                prevPageY = event.pageY;    // 縦軸
            });

            webArViewer.scene.addEventListener(self.eventNames.move, function (e) {
                var event = e.changedTouches ? e.changedTouches[0] : e;
                if (prevPageY) {
                    if ((zoomRateH + (prevPageY - event.pageY) / webArViewer.scene.clientHeight / 5) > 0.1) {
                        zoomRateH += (prevPageY - event.pageY) / webArViewer.scene.clientHeight / 5;
                        AFRAME.utils.entity.setComponentProperty(self.wrap, 'animation__scale', {
                            property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRateH + ' ' + zoomRateH + ' ' + zoomRateH
                        });
                    }
                }
            });
            
            webArViewer.scene.addEventListener(self.eventNames.end, function (e) {
                prevPageY = null;
            });

            // ↓ 上下移動ボタン押下
            var bUP = document.getElementById('swUp');
            var bDOWN = document.getElementById('swDown');
            var timer;

            bUP.addEventListener('click', function () {
                if (!!(bAngle.classList.contains('current'))) {
                    wrapPos.y += 0.2;
                } else {
                    wrapPos.z -= 0.2;
                }
                self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
            });

            bDOWN.addEventListener('click', function () {
                if (!!(bAngle.classList.contains('current'))) {
                    wrapPos.y -= 0.2;
                } else {
                    wrapPos.z += 0.2;
                }
                self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
            });
            // ↑ 

            // ↓ UPボタン長押し
            bUP.addEventListener(self.eventNames.start, e => {
                e.preventDefault();
                bUP.classList.add('active');
                timer = setInterval(() => {
                    if (!!(bAngle.classList.contains('current'))) {
                        wrapPos.y += 0.02;
                    } else {
                        wrapPos.z -= 0.02;
                    }
                    self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                }, 10);
            })

            bUP.addEventListener(self.eventNames.end, e => {
                e.preventDefault();
                bUP.classList.remove('active');
                clearInterval(timer);
            });

            bUP.addEventListener(self.eventNames.move, e => {
                e.preventDefault();
                bUP.classList.remove('active');
                clearInterval(timer);
            });
            // ↑ 

            // ↓ DOWNボタン長押し
            bDOWN.addEventListener(self.eventNames.start, e => {
                e.preventDefault();
                bDOWN.classList.add('active');
                timer = setInterval(() => {
                    if (!!(bAngle.classList.contains('current'))) {
                        wrapPos.y -= 0.02;
                    } else {
                        wrapPos.z += 0.02;
                    }
                    self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                }, 10);
            })

            bDOWN.addEventListener(self.eventNames.end, e => {
                e.preventDefault();
                bDOWN.classList.remove('active');
                clearInterval(timer);
            });

            bUP.addEventListener(self.eventNames.move, e => {
                e.preventDefault();
                bUP.classList.remove('active');
                clearInterval(timer);
            });
            // ↑
        },

        setDiplayBtn: function()
        {
            window.alret('-1');
            var self = this;
            document.getElementById("swUp").style.display = 'inline';
            document.getElementById("swDown").style.display = 'inline';
            window.alret(0);
            if (objecttype == 'pic') {
                document.getElementById("modeSwitch").style.display = "inline";
                document.getElementById("scrshot").style.display = "inline";
                document.getElementById("swCamera").style.display = "inline";
                if (self.arg.preview) {
                    document.getElementById("swCamera").style.display = "inline";
                    document.getElementById("swAngle").style.display = 'inline';
                    document.getElementById("swParallel").style.display = 'inline';
                } else {
                    document.getElementById("swCamera").style.display = "none";
                    document.getElementById("swAngle").style.display = 'none';
                    document.getElementById("swParallel").style.display = 'none';
                }

            } else {
                document.getElementById("modeSwitch").style.display = "inline";
                document.getElementById("scrshot").style.display = "none";
                document.getElementById("swCamera").style.display = "none";
            }
        },

        positionVec3: function (type) {
            var self = this;
            var h1_2 = (self.arData.size.h / 2);

            if (type === 'shadow') {
                return { x: 0, y: 0, z: -h1_2 };
            } else {
                return { x: 0, y: h1_2, z: 0 };
            }
        }
    };

    webArViewer.ar = ar;
    webArViewer.ar.init();

    if (defaultAngle != -5 && !(ar.arg.preview)) {
        var evant = new Event("click", { "bubbles": true, "cancelable": true });
        var bParalle = document.getElementById('swParallel');
        // イベントを発生させる
        bParalle.dispatchEvent(evant);
    }

}());

var webArViewer = webArViewer || {};

var defaultPos = { x: 0, y: 0, z: 0 };
var defaultSize = { w: 10, h: 10 };
var zoomW = 0;
var zoomH = 0;

var videostate = 0;

(function (global) {

    webArViewer.scene = document.querySelector('a-scene');

    var ar = {

        init: function () {

            this.setArg();

            if (this.setArData()) {
                window.alert(2);
                this.setWrap();
                window.alert(3);
                this.createModel();
                this.createVideoInfo();
                window.alert(4);
                var deviceEvents = {
                    Touch: typeof document.ontouchstart !== 'undefined',
                    Pointer: window.navigator.pointerEnabled,
                    MSPointer: window.navigator.msPointerEnabled
                };
                window.alert(5);
                this.eventNames = {
                    start: deviceEvents.Pointer ? 'pointerdown' : deviceEvents.MSPointer ? 'MSPointerDown' : deviceEvents.Touch ? 'touchstart' : 'mousedown',
                    move: deviceEvents.Pointer ? 'pointermove' : deviceEvents.MSPointer ? 'MSPointerMove' : deviceEvents.Touch ? 'touchmove' : 'mousemove',
                    end: deviceEvents.Pointer ? 'pointerup' : deviceEvents.MSPointer ? 'MSPointerUp' : deviceEvents.Touch ? 'touchend' : 'mouseup'
                };
                window.alert(6);
                this.setScene();
                window.alert(7);
            }

            //this.setSwitcher();

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
            //arg.sizeList = arg.wh && (parseInt(arg.wh, 16).toString(10)).match(/.{2}/g);

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
            window.alert(String(dataObj.path));

            dataObj.isPng = !!(dataObj.path || '').match(/\.png$/i);
            dataObj.isGif = !!(dataObj.path || '').match(/\.gif$/i);
            dataObj.isMp4 = !!(dataObj.path || '').match(/\.mp4$/i);
            window.alert(11);

            // データの準備
            //var dataObj =
            //    path: (!(self.arg.ObjectList) ?
            //        ('article/pic/' + self.arg.ObjectList1 + '/' + self.arg.ObjectList2)
            //        :
            //        (!(self.arg.ObjectList) ? '' : 'article/pic/' + self.arg.ObjectList))
            //};

            dataObj.isShadow = self.arg.shodowList && !!Number(self.arg.shodowList);
            dataObj.isMarker = !!self.arg.markerList;
            window.alert(12);

            var wh = (String(!!(dataObj.isMp4) ? '213, 120' : !!(self.arg.sizeList) ? self.arg.sizeList : '40, 40')).split(',');
            dataObj.size = { w: Number(wh[0]), h: Number(wh[0]) };
            defaultSize = { w: Number(wh[0]), h: Number(wh[0]) };
            window.alert(13);

            if (dataObj.path) {
                window.alert(14);

                var folder = !!(dataObj.isMp4) ? 'video' : 'pic';
                dataObj.path = rootPath + 'article/' + folder + '/' + dataObj.path;
                window.alert(15);

                if (dataObj.isPng || dataObj.isGIf) {
                    window.alert(16);
                    var img = document.createElement('img');
                    img.setAttribute('crossorigin', 'anonymous');
                    img.setAttribute('id', 'source');
                    img.setAttribute('src', dataObj.path);
                    assets.appendChild(img);
                    window.alert(17);
                }
                else if (dataObj.isMp4) {


                    dataObj.video = document.createElement("arVideo");
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

                    dataObj.audio = document.createElement("arAudio");
                    audio.setAttribute("src", dataObj.path);
                    audio.setAttribute('id', 'arVideo');
                    audio.setAttribute('preload', 'auto');
                    audio.setAttribute('response-type', 'arraybuffer');
                    audio.setAttribute('loop', 'true');
                    audio.setAttribute('crossorigin', 'anonymous');
                    audio.setAttribute('webkit-playsinline', 'webkit-playsinline');
                    audio.setAttribute("playsinline", "");
                    audio.setAttribute("controls", "");
                    audio.setAttribute("autoplay", "");

                    assets.appendChild(video);
                    assets.appendChild(audio);
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
            window.alert(String(dataObj.path));

            return true;
        },

        createVideoInfo: function () {

            var self = this;

            self.videoinfo = document.createAttribute("div");
            self.videoinfo.setAttribute('id', 'info1');
            self.videoinfo.setAttribute('info1', 'info1');
            
            self.videotag = document.createAttribute("a");
            self.videotag.setAttribute('id', 'swPlay');
            self.videotag.setAttribute('info1', 'InfoItem');
            self.videoinfo.appendChild(self.videotag);

            self.videotext = document.createAttribute("p");
            self.videotext.setAttribute('id', 'p1');
            self.videotag.appendChild(self.videotext);

            //self.pbr = document.createAttribute('br')
            self.ptext1 = document.createTextNode('画面をタップすると、再生が開始されます。\n\n音声が流れますのでご注意下さい。');
            //self.ptext2 = document.createTextNode('音声が流れますのでご注意下さい。');
            self.videotag.appendChild(self.ptext1);

            document.body.appendChild(self.videoinfo);

            self.play = document.createAttribute("img");
            self.play.setAttribute('id', 'player');
            self.play.setAttribute('class', 'playbutton');
            self.play.setAttribute('src', 'asset/play.png');
            self.play.style.display = 'none';

            document.body.appendChild(self.play);
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
                }
            });

            swPreview.addEventListener('click', function () {
                if (!this.classList.contains('current')) {
                    location.replace(location.search + '&preview=1');
                }
            });
        },

        setWrap: function () {

            var self = this;
            var base = self.arg.base ? decodeURI(self.arg.base) : AFRAME.utils.coordinates.stringify(self.positionVec3('main'));

            self.wrap = document.createElement('a-plane');
            self.wrap.setAttribute('id', 'base');
            self.wrap.setAttribute('scale', (defaultSize.w / 10) + ' ' + (defaultSize.h / 10) + ' ' + (defaultSize.h / 10));
            self.wrap.setAttribute('position', base);
            self.wrap.setAttribute('rotation', '-5 0 0');
            self.wrap.setAttribute('material', 'transparent: true, opacity: 0');
        },

        createModel: function () {

            var self = this;
            var val = self.arData;
            window.alert(20);
            if (!val.path) {
                return;
            }
            window.alert(21);
            if (val.isShadow) {

                var shadow = document.createElement('a-image');

                shadow.setAttribute('id', 'shadow');
                shadow.setAttribute('position', AFRAME.utils.coordinates.stringify(self.positionVec3('shadow')));
                shadow.setAttribute('rotation', '-90 0 0');

                AFRAME.utils.entity.setComponentProperty(shadow, 'geometry', {
                    primitive: 'plane', height: val.size.h, width: val.size.w
                });

                AFRAME.utils.entity.setComponentProperty(shadow, 'material', {
                    shader: val.isGif ? 'gif' : 'flat', npot: true, src: '#source', transparent: true, alphaTest: 0.1,
                    color: 'black', opacity: 0.3, depthTest: false
                });

                self.arData.shadow = shadow;
                window.alert(22);
            }

            var elname = '';

            if (val.isPng || val.arData) {
                elname = 'a-image'
                window.alert(23);
            } else if (val.isMp4) {
                elname = 'a-video'
            }

            var main = document.createElement(elname);
            var posVec3 = self.positionVec3('main');
            defaultPos = posVec3;
            window.alert(24);
            main.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3));
            window.alert(25);
            if (!val.isGif) {
                main.setAttribute('rotation', '-5 0 0');
                window.alert(26);
                if (val.isMp4) {
                    main.setAttribute('width', 'true');
                    main.setAttribute('height', 'true');
                    main.setAttribute('play', 'true');
                    window.alert(26.5);
                }
                window.alert(27);

            } else {
                main.setAttribute('rotation', '-30 0 0');
            }
            window.alert(27);
            AFRAME.utils.entity.setComponentProperty(main, 'material', {
                shader: val.isGif ? 'gif' : 'standard', npot: true, src: '#source', displacementMap: null, displacementBias: -0.5,
                side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
            });
            window.alert(28);
            AFRAME.utils.entity.setComponentProperty(main, 'geometry', {
                primitive: 'plane', height: val.size.h, width: val.size.w, segmentsHeight: 1, segmentsWidth: 1
            });
            window.alert(29);
            self.arData.main = main;
        },

        setScene: function () {
            window.alert(30);

            var self = this;
            var val = self.arData;
            window.alert(31);

            self.arData.shadow && self.wrap.appendChild(self.arData.shadow);
            self.arData.main && self.wrap.appendChild(self.arData.main);
            window.alert(32);
            // ボタン 表示
            //document.getElementById("swUp").style.display = 'inline';
            //document.getElementById("swDown").style.display = 'inline';

            //document.getElementById("swAngle").style.display = 'inline';
            //document.getElementById("swParallel").style.display = 'inline';

            // NFTマーカー
            var mWrap = document.createElement('a-nft');

            //if (val.isMp4) mWrap.setAttribute('videohandler');

            mWrap.setAttribute('preset', 'custom');
            mWrap.setAttribute('type', 'nft');
            mWrap.setAttribute('id', 'arMarker');
            mWrap.setAttribute('smooth', 'true');
            mWrap.setAttribute('smoothCount', '10');
            mWrap.setAttribute('smoothTolerance', '0.01');
            mWrap.setAttribute('smoothThreshold', '5');
            window.alert(33);

            if ((!!self.arg.markerList1) && (!!self.arg.markerList2)) {
                mWrap.setAttribute('url',
                    AFRAME.utils.coordinates.stringify(
                        rootPath + 'ImageDescriptors/' + self.arg.markerList1 + '/' + self.arg.markerList2 + '/' + self.arg.markerList2));
            } else {
                mWrap.setAttribute('url',
                    AFRAME.utils.coordinates.stringify(
                        !(self.arg.markerList) ? '' : rootPath + 'ImageDescriptors/' + self.arg.markerList + '/' + self.arg.markerList));
            }
            window.alert(34);

            mWrap.appendChild(self.wrap);
            webArViewer.scene.appendChild(mWrap);
            window.alert(35);

            if (val.isMp4) {

                // マーカーを検出したイベントの登録
                mWrap.addEventListener('markerFound', function () {

                    if (videostate == 0) {
                        sekf.play.style.display = 'inline';
                    }

                    // マーカー認識したら、ビデオ再生
                    val.arData.video.play();
                    videostate = 1;
                });

                // マーカーを見失ったイベントの登録
                mWrap.addEventListener('markerLost', function () {
                    // マーカー認識が外れたら、、ビデオ停止
                    val.arData.video.pause();
                    videostate = 2;
                });

                var btn = val.play;

                btn.addEventListener('click', function () {

                    if (videostate >= 1 && videostate < 2) {

                        //var video = document.querySelector('#source');
                        val.arData.video.play();

                        videostate = 1;

                        // プレインボタン 非表示
                        //document.getElementById("player").style.display = 'none';
                        val.arData.play.style.display = 'none';

                        self.videotext.style.display = "none";
                        sekf.videoinfo.style.display = "none";
                    }
                });
            }
            window.alert(36);

            // ↓ rotation 切替
            var bAngle = document.getElementById('swAngle');
            var bParalle = document.getElementById('swParallel');
            var arRotation = '-5 0 0';

            var prevPageY;
            var prevPageX;
            var zoomRate = (defaultSize.w / 10);
            var wrapPos = self.positionVec3('main');
            window.alert(37);
            bAngle.classList.add('current');

            bAngle.addEventListener('click', function () {
                if (!bAngle.classList.contains('current')) {
                    arRotation = '-5 0 0';
                    wrapPos = self.positionVec3('main');;
                    self.wrap.setAttribute('rotation', AFRAME.utils.coordinates.stringify(arRotation));
                    self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                    bAngle.classList.add('current');
                    bParalle.classList.remove('current');
                }
            });
            window.alert(38);
            bParalle.addEventListener('click', function () {
                if (!bParalle.classList.contains('current')) {
                    arRotation = '-90 0 0';
                    wrapPos = self.positionVec3('main');
                    self.wrap.setAttribute('rotation', AFRAME.utils.coordinates.stringify(arRotation));
                    self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                    bParalle.classList.add('current');
                    bAngle.classList.remove('current');
                }
            });
            // ↑
            window.alert(39);
            // 拡大・縮小
            webArViewer.scene.addEventListener(self.eventNames.start, function (e) {
                var event = e.changedTouches ? e.changedTouches[0] : e;
                prevPageY = event.pageY;    // 縦軸
                prevPageX = event.pageX;    // 横軸
            });

            webArViewer.scene.addEventListener(self.eventNames.move, function (e) {
                var event = e.changedTouches ? e.changedTouches[0] : e;
                if (prevPageY) {
                    if ((zoomRate + (prevPageY - event.pageY) / webArViewer.scene.clientHeight / 5) > 0.1) {
                        zoomRate += (prevPageY - event.pageY) / webArViewer.scene.clientHeight / 5;
                        AFRAME.utils.entity.setComponentProperty(self.wrap, 'animation__scale', {
                            property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRate + ' ' + zoomRate + ' ' + zoomRate
                        });
                    }
                }
            });

            webArViewer.scene.addEventListener(self.eventNames.end, function (e) {
                prevPageY = null;
            });

            var arBase = document.getElementById('base');

            // ↓ 上下移動ボタン押下
            var bUP = document.getElementById('swUp');
            var bDOWN = document.getElementById('swDown');
            var timer;

            bUP.addEventListener('click', function () {
                if (!!(bAngle.classList.contains('current'))) {
                    wrapPos.y += 5;
                } else {
                    wrapPos.z -= 5;
                }
                self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                //arBase.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
            });

            bDOWN.addEventListener('click', function () {
                if (!!(bAngle.classList.contains('current'))) {
                    wrapPos.y -= 5;
                } else {
                    wrapPos.z += 5;
                }
                self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                //arBase.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
            });
            // ↑ 

            // ↓ UPボタン長押し
            bUP.addEventListener(self.eventNames.start, e => {
                e.preventDefault();
                bUP.classList.add('active');
                timer = setInterval(() => {
                    if (!!(bAngle.classList.contains('current'))) {
                        wrapPos.y += 2;
                    } else {
                        wrapPos.z -= 2;
                    }
                    self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                    //arBase.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                }, 10);
            });

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
                        wrapPos.y -= 2;
                    } else {
                        wrapPos.z += 2;
                    }
                    self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                    //arBase.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                }, 10);
            });

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

        positionVec3: function (type) {
            var self = this;
            var h1_2 = self.arData.size.h / 2;
            var width = self.arData.size.w;
            var isWarp = self.arData.isWarp;

            if (type === 'shadow') {
                return { x: 0, y: 0, z: -h1_2 };
            } else {
                return { x: 0, y: h1_2, z: 0 };
            }
        }
    };

    webArViewer.ar = ar;
    webArViewer.ar.init();

}());
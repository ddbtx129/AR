var webArViewer = webArViewer || {};

var defaultAngle = -5;
var defaultPos = { x: 0, y: 0, z: 0 };
var defaultSize = { w: 10, h: 10 };
var zoomW = 0;
var zoomH = 0;

var videoInfo = {};
var videoState = 0;
var objecttype = "png";
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

                this.setScene();
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

            arg.typeList = arg.t;

            // マーカー
            arg.markerList = arg.m;
            arg.markerList1 = arg.m1;
            arg.markerList2 = arg.m2;

            // オブジェクト
            arg.ObjectList = arg.o;
            arg.ObjectList1 = arg.o1;
            arg.ObjectList2 = arg.o2;

            arg.MkObjList = arg.mo;

            var logo = arg.l && ('0000' + (parseInt(arg.l, 16).toString(10))).slice(-4);

            arg.LogoList = {};
            arg.LogoAnimeList = {};

            if (!!(logo)){ 
                logo = (logo.match(/.{2}/g));
                arg.LogoList = (logo).toString().split(',');
                var anime = (arg.LogoList[1] && ('00' + (parseInt(arg.LogoList[1]).toString(10))).slice(-2));
                arg.LogoAnimeList = anime.split('');
            }

            arg.PVList = arg.pv;

            self.arg = arg;
        },

        setArData: function () {

            var self = this;

            var assets = document.createElement('a-assets');
            assets.setAttribute('timeout', '9000');

            var arData = null;

            objecttype = (!(self.arg.typeList) ? GetFileType('') : GetFileType(String(self.arg.typeList)));

            // データの準備
            var object = '';
            var n_object = '';

            if (!(self.arg.ObjectList)) {
                object = ((self.arg.MkObjList) && (self.arg.ObjectList2) ?
                    (self.arg.MkObjList + '/' + self.arg.ObjectList2)
                    :
                    (self.arg.ObjectList1 + '/' + self.arg.ObjectList2));

            } else {
                object = (!(self.arg.ObjectList) ? '' : self.arg.ObjectList);
            }

            n_object = ((self.arg.MkObjList) ? (self.arg.MkObjList) : ((self.arg.ObjectList1) ? (self.arg.ObjectList1) : (self.arg.ObjectList)));

            var dataObj = { path: object + '.' + String(objecttype) };

            dataObj.isPng = !!(dataObj.path || '').match(/\.png$/i);
            dataObj.isGif = !!(dataObj.path || '').match(/\.gif$/i);
            dataObj.isMp4 = !!(dataObj.path || '').match(/\.mp4$/i);
            dataObj.isGltf = !!(dataObj.path || '').match(/\.gltf$/i);

            dataObj.isPV = !!(self.arg.PVList);

            dataObj.isLogo = (!!(self.arg.LogoList) ? self.arg.LogoList[0] : '0');
            dataObj.isReflection = (!!(self.arg.LogoAnimeList) ? Number(self.arg.LogoAnimeList[0]) : 0);
            dataObj.isTurn = (!!(self.arg.LogoAnimeList) ? Number(self.arg.LogoAnimeList[1]) : 0);

            dataObj.isShadow = self.arg.shodowList && !!Number(self.arg.shodowList);
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

                var folder = !!(dataObj.isMp4) ? 'video' : (!!(dataObj.isGltf) ? 'gltf' : 'pic');
                dataObj.path = rootPath + 'article/' + folder + '/' + dataObj.path;

                if (!!(dataObj.isPng) || !!(dataObj.isGif)) {

                    var img = document.createElement('img');
                    img.setAttribute('crossorigin', 'anonymous');
                    img.setAttribute('id', 'source');
                    img.setAttribute('src', dataObj.path);
                    assets.appendChild(img);

                } else if (!!(dataObj.isMp4)) {

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

                } else if (dataObj.isGltf) {

                    var model = document.createElement('a-asset-item');
                    model.setAttribute('crossorigin', 'anonymous');
                    model.setAttribute('id', 'source');
                    model.setAttribute('src', dataObj.path);
                    assets.appendChild(model);
                }

                if (dataObj.isLogo) {
                    dataObj.logopath = rootPath + 'article/gltf/' + n_object + '/' + 'logo-' + self.arg.LogoList[0] + '.gltf';

                    var model = document.createElement('a-asset-item');
                    model.setAttribute('crossorigin', 'anonymous');
                    model.setAttribute('id', 'logosource');
                    model.setAttribute('src', dataObj.logopath);
                    assets.appendChild(model);
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

            //if (self.arg.preview) {
            if (self.arg.pv) {
                swPreview.classList.add('current');
            } else {
                swMarker.classList.add('current');
            }

            swMarker.addEventListener('click', function () {
                if (!this.classList.contains('current')) {
                    location.replace(location.search.replace('&pv=1', ''));
                    videostate = 0;
                    this.setDiplayBtn(0);
                }
            });

            swPreview.addEventListener('click', function () {
                if (!this.classList.contains('current')) {
                    location.replace(location.search + '&pv=1');
                    videostate = 0;
                    this.setDiplayBtn(1);
                }
            });
        },

        setWrap: function () {

            var self = this;
            var base = self.arg.base ? decodeURI(self.arg.base) : AFRAME.utils.coordinates.stringify(self.positionVec3('main'));

            self.wrap = document.createElement('a-plane');
            self.wrap.setAttribute('id', 'base');
            self.wrap.setAttribute('scale', '2 2 2');
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

            if (!val.isMp4) {
                elname = 'a-entity'
            } else {
                elname = 'a-video'
            }

            var main = document.createElement(elname);
            var posVec3 = self.positionVec3('main');
            defaultPos = posVec3;

            main.setAttribute('id', 'main');
            main.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3));

            if (!val.isGif) {

                main.setAttribute('rotation', '-5 0 0');

                if (!val.isGltf) {

                    main.setAttribute('width', AFRAME.utils.coordinates.stringify(wh.w));
                    main.setAttribute('height', AFRAME.utils.coordinates.stringify(wh.h));

                    if (!!val.isMp4) {
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
                    main.setAttribute('scale', AFRAME.utils.coordinates.stringify(wh.w + ' ' + wh.h + '' + wh.h));
                }

            } else {
                main.setAttribute('rotation', '-30 0 0');
            }

            self.arData.main = main;

            if (val.isLogo) {

                var logo = document.createElement('a-entity');

                var logopos = self.positionVec3Logo('a');
                var logoscale = (!val.isMp4) ? ((val.isPV) ? 8 : 25) : ((val.isPV) ? 16 : 50)

                logo.setAttribute('id', 'logo');
                logo.setAttribute('position', AFRAME.utils.coordinates.stringify(logopos));
                logo.setAttribute('rotation', '-5 0 0');
                logo.setAttribute('scale', (String(logoscale) + ' ' + String(logoscale) + ' ' + String(logoscale)));
                logo.setAttribute('gltf-model', '#logosource');

                //AFRAME.utils.entity.setComponentProperty(logo, 'geometry', {
                //    primitive: 'box', height: logoscale, width: logoscale, depth: logoscale, segmentsHeight: 1, segmentsWidth: 1
                //});

                //AFRAME.utils.entity.setComponentProperty(logo, 'material', {
                //    shader: 'standard', npot: true, src: '#logosource', displacementMap: null, displacementBias: -0.5,
                //    side: 'double', transparent: true, alphaTest: 0.1, metalness: val.isReflect ? 0.1 : 0, roughness: val.isReflect ? 0.3 : 0.5
                //});

                if (!!val.isTurn) {
                    logo.setAttribute('radius', logoscale);
                    if (val.isTurn == 1) {
                        AFRAME.utils.entity.setComponentProperty(logo, 'animation', {
                            property: 'rotation', from: '-5 0 0', to: '-5 360 0', dur: 3000, loop: true, easing: 'linear'
                        });
                    } else if (val.isTurn == 2) {
                        AFRAME.utils.entity.setComponentProperty(logo, 'animation', {
                            property: 'rotation', from: '-5 0 0', to: '-5 360 0', dur: 3000, loop: true, easing: 'easeOutElastic', elasticity: 300
                        });
                    }
                }

                self.arData.logo = logo;
            }
        },

        setScene: function () {

            var self = this;
            var val = self.arData;

            self.arData.shadow && self.wrap.appendChild(self.arData.shadow);
            self.arData.main && self.wrap.appendChild(self.arData.main);


            if (!val.isMp4) {
                document.getElementById("player").style.display = 'none';
            }

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
            var zoomRateH = 2;

            var wrapPos = self.positionVec3('main');

            if (self.arg.pv) {

                wrapPos.x -= 0;
                wrapPos.y -= ((val.isMp4) ? 0 : 2);
                wrapPos.z -= 10;

                self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                self.wrap.setAttribute('rotation', '0 0 0');

                webArViewer.scene.appendChild(self.wrap);
                if (val.isLogo) {
                    self.arData.logo && webArViewer.scene.appendChild(self.arData.logo);
                }

            } else {

                // ARマーカー
                var mWrap = document.createElement('a-marker');
                mWrap.setAttribute('markerhandler', '');
                mWrap.setAttribute('preset', 'custom');
                mWrap.setAttribute('type', 'pattern');
                mWrap.setAttribute('id', 'arMarker');

                var mk = 'pattern/p-def.patt';

                if ((self.arg.MkObjList) && (self.arg.markerList2)) {
                    mk = 'pattern/' + self.arg.MkObjList + '/p-' + self.arg.markerList2 + '.patt';
                } else if ((self.arg.markerList1) && (self.arg.markerList2)) {
                    mk = 'pattern/' + self.arg.markerList1 + '/p-' + self.arg.markerList2 + '.patt';
                } else if ((self.arg.markerList)) {
                    mk = 'pattern/p-' + self.arg.markerList + '.patt';
                }

                mWrap.setAttribute('url', AFRAME.utils.coordinates.stringify(mk));

                mWrap.appendChild(self.wrap);

                if (val.isLogo) {
                    self.arData.logo && mWrap.appendChild(self.arData.logo);
                }

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
                        if (val.isLogo) {
                            if (val.isTurn == 1) {
                                AFRAME.utils.entity.setComponentProperty(logo, 'animation', {
                                    property: 'rotation', from: '-5 0 0', to: '-5 360 0', dur: 3000, loop: true, easing: 'linear'
                                });
                            } else if (val.isTurn == 2) {
                                AFRAME.utils.entity.setComponentProperty(logo, 'animation', {
                                    property: 'rotation', from: '-5 0 0', to: '-5 360 0', dur: 3000, loop: true, easing: 'easeOutElastic', elasticity: 300
                                });
                            } else {
                                self.arData.logo.setAttribute('rotation', AFRAME.utils.coordinates.stringify(arRotation));
                            }
                            self.arData.logo.setAttribute('position', AFRAME.utils.coordinates.stringify(self.positionVec3Logo('a')));
                        }
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
                        if (val.isLogo) {
                            
                            if (val.isTurn == 1) {
                                AFRAME.utils.entity.setComponentProperty(logo, 'animation', {
                                    property: 'rotation', from: '0 -90 0', to: '0 -90 360', dur: 3000, loop: true, easing: 'linear'
                                });
                            } else if (val.isTurn == 2) {
                                AFRAME.utils.entity.setComponentProperty(logo, 'animation', {
                                    property: 'rotation', from: '-90 0 0', to: '-90 360 0', dur: 3000, loop: true, easing: 'easeOutElastic', elasticity: 300
                                });
                            } else {
                                self.arData.logo.setAttribute('rotation', AFRAME.utils.coordinates.stringify(arRotation));
                            }
                            self.arData.logo.setAttribute('position', AFRAME.utils.coordinates.stringify(self.positionVec3Logo('p')));
                        }
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
                        AFRAME.utils.entity.setComponentProperty(self.wrap, 'animation', {
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

        setDiplayBtn: function (mode) {

            var self = this;
            var val = self.arData;

            document.getElementById("modeSwitch").style.display = "inline";
            document.getElementById("swUp").style.display = 'inline';
            document.getElementById("swDown").style.display = 'inline';

            if (objecttype != 'mp4') {

                document.getElementById("player").style.display = 'none';

                document.getElementById("scrshot").style.display = "inline";
                document.getElementById("swCamera").style.display = "inline";

                if (mode) {
                    document.getElementById("swAngle").style.display = 'none';
                    document.getElementById("swParallel").style.display = 'none';
                } else {
                    document.getElementById("swAngle").style.display = 'inline';
                    document.getElementById("swParallel").style.display = 'inline';
                }

            } else {

                document.getElementById("info1").style.display = "inline";

                document.getElementById("scrshot").style.display = "none";
                document.getElementById("swCamera").style.display = "none";

                if (mode) {

                    document.getElementById("swAngle").style.display = 'none';
                    document.getElementById("swParallel").style.display = 'none';

                    var video = document.querySelector('#source');

                    if (videostate == 0) {
                        document.getElementById("player").style.display = 'inline';
                        videostate = 1
                    }

                } else {
                    document.getElementById("swAngle").style.display = 'inline';
                    document.getElementById("swParallel").style.display = 'inline';

                    document.getElementById("player").style.display = 'none';
                }
            }
        },

        positionVec3Logo: function (angle) {
            var self = this;

            if (self.arData.isPV) {
                return { x: 0, y: -0.5, z: -2 };
            } else {
                if (angle == 'a') {
                    return { x: 0, y: -2.5, z: 0 };
                } else {
                    return { x: 0, y: 0, z: 2.5 };
                }
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

    if (defaultAngle != -5 && !(ar.arg.pv)) {
        var evant = new Event("click", { "bubbles": true, "cancelable": true });
        var bParalle = document.getElementById('swParallel');
        // イベントを発生させる
        bParalle.dispatchEvent(evant);
    }

    webArViewer.ar.setDiplayBtn(!!(ar.arg.pv));

}());
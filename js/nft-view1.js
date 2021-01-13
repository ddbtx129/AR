var webArViewer = webArViewer || {};

var defaultAngle = -5;
var defaultPos = { x: 0, y: 0, z: 0 };
var defaultSize = { w: 10, h: 10 };
var zoomW = 0;
var zoomH = 0;
var objAngle = -5;
var videoInfo = {};
var videoState = 0;
var objecttype = "png";
var dec = 2;
var SizeRate = 20;

(function (global) {

    document.getElementById("info1").style.display = "inline";
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

            var dec = 10;

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

            arg.whList = arg.wh && (parseInt(arg.wh, 16).toString(10));

            arg.angleList = arg.an && (parseInt(arg.an, 10).toString(2));

            arg.typeList = arg.t;

            // マーカー
            arg.markerList = arg.m;
            arg.markerList1 = arg.m1;
            arg.markerList2 = arg.m2;

            // 対象オブジェクト
            arg.ObjectList = arg.o;
            arg.ObjectList1 = arg.o1;
            arg.ObjectList2 = arg.o2;

            arg.MkObjList = arg.mo;

            var logo = arg.l && ('0000' + (parseInt(arg.l, 16).toString(10))).slice(-4);

            arg.LogoList = {};
            arg.LogoAnimeList = {};

            if (!!(logo)) {
                logo = (logo.match(/.{2}/g));
                arg.LogoList = (logo).toString().split(',');
                arg.LogoAnimeList = (arg.LogoList[1] && parseInt(arg.LogoList[1]));
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
            dataObj.isAnime = (!!(self.arg.LogoAnimeList) ? Number(self.arg.LogoAnimeList) : 0);

            dataObj.isShadow = self.arg.shodowList && !!Number(self.arg.shodowList);
            defaultAngle = (self.arg.angleList && Number(self.arg.angleList) == 1) ? -90 : 0;

            var wh = (String(!!(self.arg.sizeList) ? self.arg.sizeList : '60,60')).split(',');

            var i = ((parseInt(self.arg.whList).toString(10)).length % 2 == 0) ? (parseInt(self.arg.whList).toString(10)).length : (parseInt(self.arg.whList).toString(10)).length + 1;
            dataObj.size = { w: (Number(wh[0]) * (10 ** -((i - 4) / 2))).toFixed(1), h: (Number(wh[1]) * (10 ** -((i - 4) / 2))).toFixed(1) };
            defaultSize = { w: (Number(wh[0]) * (10 ** -((i - 4) / 2))).toFixed(1), h: (Number(wh[1]) * (10 ** -((i - 4) / 2))).toFixed(1) };

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
            self.wrap.setAttribute('scale', '4 4 4');
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

                var shadow = document.createElement('a-image');

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
                elname = 'a-image'
            } else if (val.isMp4) {
                elname = 'a-video'
            }

            var main = document.createElement(elname);
            var posVec3 = self.positionVec3('main');
            defaultPos = posVec3;

            main.setAttribute('id', 'main');
            main.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3));

            if (!val.isGif) {

                main.setAttribute('rotation', AFRAME.utils.coordinates.stringify(String(objAngle) + ' 0 0'));
                
                if (!val.isGltf) {

                    main.setAttribute('width', AFRAME.utils.coordinates.stringify(wh.w));
                    main.setAttribute('height', AFRAME.utils.coordinates.stringify(wh.h));

                    if (val.isMp4) {
                        main.setAttribute('play', 'true');
                    }

                    AFRAME.utils.entity.setComponentProperty(main, 'geometry', {
                        primitive: 'plane', height: val.size.h, width: val.size.w, segmentsHeight: 1, segmentsWidth: 1
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

                var logopos = self.positionVec3Logo(Number(val.isAnime));
                var logoscale = { w: 8, h: 8, d: 2 };
                var rete = (!val.isMp4) ? 1 : 2;

                logo.setAttribute('id', 'logo');
                logo.setAttribute('position', AFRAME.utils.coordinates.stringify(logopos));
                logo.setAttribute('scale', (String(logoscale.w * rete) + ' ' + String(logoscale.h * rete) + ' ' + String(logoscale.d * rete)));
                logo.setAttribute('gltf-model', '#logosource');

                // 反射
                //AFRAME.utils.entity.setComponentProperty(logo, 'geometry', {
                //    primitive: 'box', height: logoscale, width: logoscale, depth: logoscale, segmentsHeight: 1, segmentsWidth: 1
                //});
                //AFRAME.utils.entity.setComponentProperty(logo, 'material', {
                //    shader: 'standard', npot: true, src: '#logosource', displacementMap: null, displacementBias: -0.5,
                //    side: 'double', transparent: true, alphaTest: 0.1, metalness: (!!(val.isReflect) ? 1 : 0), roughness: (!!(val.isReflect) ? 0.3 : 0.5)
                //});

                if (!!val.isAnime) {
                    logo.setAttribute('radius', logoscale);
                    if (val.isAnime == 1) {
                        AFRAME.utils.entity.setComponentProperty(logo, 'animation__turn', {
                            property: 'rotation',
                            from: String(objAngle) + ' 0 0',
                            to: String(objAngle) + ' 360 0',
                            dur: 3000,
                            loop: true,
                            easing: 'linear'
                        });
                    } else if (val.isAnime == 2) {
                        AFRAME.utils.entity.setComponentProperty(logo, 'animation__turn', {
                            property: 'rotation',
                            from: String(objAngle) + ' 0 0',
                            to: String(objAngle) + ' 360 0',
                            dur: 3000,
                            loop: true,
                            easing: 'easeOutElastic',
                            elasticity: 300
                        });
                    } else if (val.isAnime == 3) {
                        logo.setAttribute('rotation', AFRAME.utils.coordinates.stringify(String(objAngle - 5) + ' 0 0'));
                        // 弾む
                        AFRAME.utils.entity.setComponentProperty(logo, 'animation__pos', {
                            property: 'position',
                            dir: 'alternate',
                            dur: 400,
                            easing: 'easeInOutQuart',
                            loop: true,
                            from: logopos.x + ' ' + logopos.y + ' ' + logopos.z,
                            to: logopos.x + ' ' + (logopos.y + (logoscale.h * rete) / 5) + ' ' + logopos.z
                        });

                        AFRAME.utils.entity.setComponentProperty(logo, 'animation__scale', {
                            property: 'scale',
                            dir: 'alternate',
                            dur: 400,
                            easing: 'easeOutQuad',
                            loop: true,
                            from: logoscale.w * rete * 1.2 + ' ' + logoscale.h * rete * 0.8 + ' ' + logoscale.d * rete,
                            to: logoscale.w * rete * 0.8 + ' ' + logoscale.h * rete * 1.2 + ' ' + logoscale.d * rete * 1
                        });
                    } else {
                        logo.setAttribute('rotation', AFRAME.utils.coordinates.stringify(String(objAngle) + ' 0 0'));
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

            var arGifRotation = '-30 0 0';

            var prevPageY;
            var zoomRateH = (defaultSize.h / 10);

            var wrapPos = self.positionVec3('main');

            // NFTマーカー
            var mWrap = document.createElement('a-nft');
            mWrap.setAttribute('markerhandler', ''); 
            mWrap.setAttribute('preset', 'custom');
            mWrap.setAttribute('type', 'nft');
            mWrap.setAttribute('id', 'arMarker');
            mWrap.setAttribute('smooth', 'true');
            mWrap.setAttribute('smoothCount', '10');
            mWrap.setAttribute('smoothTolerance', '0.01');
            mWrap.setAttribute('smoothThreshold', '5');

            //if ((!!self.arg.markerList1) && (!!self.arg.markerList2)) {
            //    mWrap.setAttribute('url',
            //        AFRAME.utils.coordinates.stringify(
            //            rootPath + 'ImageDescriptors/' + self.arg.markerList1 + '/' + self.arg.markerList2 + '/' + self.arg.markerList2));
            //} else {
            //    mWrap.setAttribute('url',
            //        AFRAME.utils.coordinates.stringify(
            //            !(self.arg.markerList) ? '' : rootPath + 'ImageDescriptors/' + self.arg.markerList + '/' + self.arg.markerList));
            //}

            var mk = '';

            if ((self.arg.markerList1) && (self.arg.markerList2)) {
                mk = 'ImageDescriptors/' + self.arg.markerList1 + '/' + self.arg.markerList2 + '/' + self.arg.markerList2;
            } else if ((self.arg.MkObjList) && (self.arg.markerList2)) {
                mk = 'ImageDescriptors/' + self.arg.MkObjList + '/' + self.arg.markerList2 + '/' + self.arg.markerList2;
            } else if ((self.arg.markerList) && (self.arg.markerList2)) {
                mk = 'ImageDescriptors/' + self.arg.markerList + '/' + self.arg.markerList2 + '/' + self.arg.markerList2;
            } else if ((self.arg.markerList)) {
                mk = 'ImageDescriptors/' + self.arg.markerList + '/' + self.arg.markerList;
            }

            mWrap.setAttribute('url', AFRAME.utils.coordinates.stringify(rootPath + mk));

            mWrap.appendChild(self.wrap);

            if (val.isLogo) {
                self.arData.logo && mWrap.appendChild(self.arData.logo);
                //self.arData.logo && webArViewer.scene.appendChild(self.arData.logo);
            }

            webArViewer.scene.appendChild(mWrap);
            self.mWrap = mWrap;

            // ↓ rotation 切替
            //var bAngle = document.getElementById('swAngle');
            //var bParalle = document.getElementById('swParallel');
            //var arPicRotation = '-5 0 0';
            //var arGifRotation = '-30 0 0';
            //var arVRotation = '-90 0 0'

            //var prevPageY;
            //var prevPageX;
            //var zoomRateW = (defaultSize.w / 10);
            //var zoomRateH = (defaultSize.h / 10);
            //var zoomRate = defaultSize.w / defaultSize.h;

            //var wrapPos = self.positionVec3('main');

            bAngle.classList.add('current');

            bAngle.addEventListener('click', function () {
                if (!bAngle.classList.contains('current')) {
                    wrapPos = self.positionVec3('main');
                    self.wrap.setAttribute('rotation', AFRAME.utils.coordinates.stringify(String(objAngle) + ' 0 0'));
                    self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                    bAngle.classList.add('current');
                    bParalle.classList.remove('current');
                }
            });

            bParalle.addEventListener('click', function () {
                if (!bParalle.classList.contains('current')) {
                    wrapPos = self.positionVec3('main');
                    self.wrap.setAttribute('rotation', AFRAME.utils.coordinates.stringify(String(objAngle - 90) + ' 0 0'));
                    self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                    bParalle.classList.add('current');
                    bAngle.classList.remove('current');
                }
            });
            // ↑

            // 拡大・縮小
            webArViewer.scene.addEventListener(self.eventNames.start, function (e) {
                var event = e.changedTouches ? e.changedTouches[0] : e;
                prevPageY = event.pageY;    // 縦軸
            });

            //webArViewer.scene.addEventListener(self.eventNames.move, function (e) {
            //    var event = e.changedTouches ? e.changedTouches[0] : e;
            //    if (prevPageY) {
            //        if ((zoomRateH + (prevPageY - event.pageY) / webArViewer.scene.clientHeight / 5) > 0.1) {
            //            zoomRateH += (prevPageY - event.pageY) / webArViewer.scene.clientHeight / 5;
            //            AFRAME.utils.entity.setComponentProperty(self.wrap, 'animation__scale', {
            //                property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRateH + ' ' + zoomRateH + ' ' + zoomRateH
            //            });
            //        }
            //    }
            //});
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
                    wrapPos.y += 5;
                } else {
                    wrapPos.z -= 5;
                }
                self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
            });

            bDOWN.addEventListener('click', function () {
                if (!!(bAngle.classList.contains('current'))) {
                    wrapPos.y -= 5;
                } else {
                    wrapPos.z += 5;
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
                        wrapPos.y += 2;
                    } else {
                        wrapPos.z -= 2;
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
                        wrapPos.y -= 2;
                    } else {
                        wrapPos.z += 2;
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

            document.getElementById("modeSwitch").style.display = "none";
            document.getElementById("swUp").style.display = 'inline';
            document.getElementById("swDown").style.display = 'inline';

            document.getElementById("player").style.display = 'none';

            if (objecttype != 'mp4') {

                document.getElementById("info1").style.display = "none";

                document.getElementById("scrshot").style.display = "inline";
                document.getElementById("swCamera").style.display = "inline";

                document.getElementById("swAngle").style.display = 'inline';
                document.getElementById("swParallel").style.display = 'inline';

            } else {

                document.getElementById("info1").style.display = "inline";

                document.getElementById("scrshot").style.display = "none";
                document.getElementById("swCamera").style.display = "none";

                document.getElementById("swAngle").style.display = 'none';
                document.getElementById("swParallel").style.display = 'none';
            }
        },

        positionVec3Logo: function (anime) {
            var self = this;
            var h1_2 = (self.arData.size.h / 2);
            var posy = 0;

            switch (anime) {
                case 3:
                    posy = -(30 / 2);
                    break;
                default:
                    posy = 0;
                    break;
            }

            if (self.arData.size.w > self.arData.size.h) {
                h1_2 = (self.arData.size.w / 2);
            }

            //return { x: 0, y: -(h1_2) + 7.5 + posy, z: 0 };
            return { x: 0, y: 0, z: 0 };
        },

        positionVec3: function (type) {
            var self = this;
            var h1_2 = self.arData.size.h / 2;

            if (type === 'shadow') {
                return { x: 0, y: 0, z: -h1_2 };
            } else {
                return { x: 0, y: h1_2, z: 0 };
            }
        }
    };

    webArViewer.ar = ar;
    webArViewer.ar.init();

    if (defaultAngle != -5) {
        var evant = new Event("click", { "bubbles": true, "cancelable": true });
        var bParalle = document.getElementById('swParallel');
        bParalle.dispatchEvent(evant);
    }

    webArViewer.ar.setDiplayBtn(0);
}());

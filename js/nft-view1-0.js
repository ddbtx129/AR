var webArViewer = webArViewer || {};

var defaultPos = { x: 0, y: 0, z: 0 };
var defaultSize = { w: 10, h: 10 };
var zoomW = 0;
var zoomH = 0;

(function (global) {

    webArViewer.scene = document.querySelector('a-scene');

    var ar = {

        init: function () {

            this.setArg();

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
            arg.ObjectList = arg.p;
            arg.ObjectList1 = arg.p1;
            arg.ObjectList2 = arg.p2;

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
                    ('article/pic/' + self.arg.ObjectList1 + '/' + self.arg.ObjectList2)
                    :
                    (!(self.arg.ObjectList) ? '' : 'article/pic/' + self.arg.ObjectList))
            };

            dataObj.isShadow = self.arg.shodowList && !!Number(self.arg.shodowList);

            dataObj.isMarker = !!self.arg.markerList;

            var wh = (String(!!(self.arg.sizeList) ? self.arg.sizeList : '10,10')).split(',');

            dataObj.size = { w: Number(wh[0]), h: Number(wh[0]) };
            dataObj.isGif = !!(dataObj.path || '').match(/\.gif$/i);
            defaultSize = dataObj.size;

            if (dataObj.path) {

                var source = document.createElement('img');

                source.setAttribute('crossorigin', 'anonymous');
                source.setAttribute('id', 'source');
                source.setAttribute('src', rootPath + dataObj.path);
                assets.appendChild(source);
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
            //self.wrap.setAttribute('scale', '4 4 4');
            self.wrap.setAttribute('scale', (defaultSize.w / 10) + ' ' + (defaultSize.h / 10) + ' ' + (defaultSize.h / 10)); // '4 4 4');
            self.wrap.setAttribute('position', base);
            self.wrap.setAttribute('rotation', '-5 0 0');
            self.wrap.setAttribute('material', 'transparent: true, opacity: 0');
        },

        createModel: function () {

            var self = this;
            var val = self.arData;

            if (!val.path) {
                return;
            }

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
            }

            var main = document.createElement('a-image');
            var posVec3 = self.positionVec3('main');
            defaultPos = posVec3;

            main.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3));

            if (!val.isGif) {
                main.setAttribute('rotation', '-5 0 0');
            } else {
                main.setAttribute('rotation', '-30 0 0');
            }

            AFRAME.utils.entity.setComponentProperty(main, 'material', {
                shader: val.isGif ? 'gif' : 'standard', npot: true, src: '#source', displacementMap: null, displacementBias: -0.5,
                side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
            });

            AFRAME.utils.entity.setComponentProperty(main, 'geometry', {
                primitive: 'plane', height: val.size.h, width: val.size.w, segmentsHeight: 1, segmentsWidth: 1
            });

            self.arData.main = main;
        },

        setScene: function () {

            var self = this;

            self.arData.shadow && self.wrap.appendChild(self.arData.shadow);
            self.arData.main && self.wrap.appendChild(self.arData.main);

            // ボタン 表示
            //document.getElementById("swUp").style.display = 'inline';
            //document.getElementById("swDown").style.display = 'inline';

            //document.getElementById("swAngle").style.display = 'inline';
            //document.getElementById("swParallel").style.display = 'inline';

            // NFTマーカー
            var mWrap = document.createElement('a-nft');

            mWrap.setAttribute('preset', 'custom');
            mWrap.setAttribute('type', 'nft');
            mWrap.setAttribute('id', 'arMarker');
            mWrap.setAttribute('smooth', 'true');
            mWrap.setAttribute('smoothCount', '10');
            mWrap.setAttribute('smoothTolerance', '0.01');
            mWrap.setAttribute('smoothThreshold', '5');

            if ((!!self.arg.markerList1) && (!!self.arg.markerList2)) {
                mWrap.setAttribute('url',
                    AFRAME.utils.coordinates.stringify(
                        rootPath + 'ImageDescriptors/' + self.arg.markerList1 + '/' + self.arg.markerList2 + '/' + self.arg.markerList2));
            } else {
                mWrap.setAttribute('url',
                    AFRAME.utils.coordinates.stringify(
                        !(self.arg.markerList) ? '' : rootPath + 'ImageDescriptors/' + self.arg.markerList + '/' + self.arg.markerList));
            }

            mWrap.appendChild(self.wrap);
            webArViewer.scene.appendChild(mWrap);

            // ↓ rotation 切替
            var bAngle = document.getElementById('swAngle');
            var bParalle = document.getElementById('swParallel');
            var arRotation = '-5 0 0';

            var prevPageY;
            var prevPageX;
            var zoomRate = (defaultSize.w / 10);
            var wrapPos = self.positionVec3('main');

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
                    //arBase.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
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
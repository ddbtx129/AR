var webArViewer = webArViewer || {};

(function (global) {

    webArViewer.scene = document.querySelector('a-scene');
    var rootPath = 'https://ddbtx129.github.io/AR/';
    var ar = {
        //C: {
        //    arNum: 1
        //},
        
        init: function () {
window.alert(20);
            this.setArg();
window.alert(21);
            if (this.setArData()) {
window.alert(22);
                this.setWrap();
window.alert(23);
                this.createModel();
window.alert(24);
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
window.alert(25);
                this.setScene();
            }
window.alert(26);
            //this.setSwitcher();
            window.alert(27);
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

            dataObj.isDeca = self.arg.decaList && !!Number(self.arg.decaList);

            dataObj.size = self.arg.sizeList ? {
                w: parseInt(Number(self.arg.sizeList / 10), 10),
                h: Number(self.arg.sizeList) - parseInt(Number(self.arg.sizeList / 10), 10) * 10
            } : {
                w: 2,
                h: 2
            };

            if (dataObj.isDeca) {
                dataObj.size = {
                    w: dataObj.size.w * 10,
                    h: dataObj.size.h * 10
                };
            }

            dataObj.isGif = !!(dataObj.path || '').match(/\.gif$/i);

            if (dataObj.path) {

                var source = document.createElement('img');
                window.alert(dataObj.path);

                source.setAttribute('crossorigin', 'anonymous');
                source.setAttribute('id', 'source');
                source.setAttribute('src', dataObj.path);
                assets.appendChild(source);
            }

            arData = dataObj;

            if (!arData.path) {
                // 画像なかった
                if (window.confirm('画像情報が取得できませんでした。')) {
                    location.href = "http://www.aoshima-bk.co.jp/";
                }

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
            window.alert(30);
            var self = this;
                        window.alert(31);
            var base = self.arg.base ? decodeURI(self.arg.base) : '40 -75 -75';
                        window.alert(32);
            self.wrap = document.createElement('a-plane');
                        window.alert(33);
            self.wrap.setAttribute('id', 'base');
                        window.alert(34);
            self.wrap.setAttribute('position', base);
                        window.alert(35);
            self.wrap.setAttribute('rotation', '0 0 0');
                        window.alert(36);
            self.wrap.setAttribute('material', 'transparent: true, opacity: 0');
             window.alert(37);
        },

        createModel: function () {

            var self = this;
            var val = self.arData;

            if (!val.path) {
                return;
            }

            if (val.isShadow) {
                //var shadow = document.createElement('a-entity');
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

            main.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3));

            if (!val.isGif) {
                main.setAttribute('rotation', '-5 0 0');
            } else {
                main.setAttribute('rotation', (!val.isWarp && !self.arg.preview ? '-30' : (self.arg.preview ? '-5' : '-30')) + ' 0 0');
            }

            AFRAME.utils.entity.setComponentProperty(main, 'material', {
                shader: val.isGif ? 'gif' : 'standard', npot: true, src: '#source', displacementMap: null, displacementBias: -0.5,
                side: 'double', transparent: true, alphaTest: 0.1, metalness: val.isReflect ? 0.1 : 0, roughness: val.isReflect ? 0.3 : 0.5
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

            if (self.arg.preview) {
                // ボタン 表示・非表示切替
                document.getElementById("swUp").style.display = 'inline';
                document.getElementById("swDown").style.display = 'inline';

                document.getElementById("swAngle").style.display = 'none';
                document.getElementById("swParallel").style.display = 'none';

                var wrapPos = self.wrap.getAttribute('position');
                wrapPos.x += 0;
                wrapPos.y -= 0.5;
                wrapPos.z -= 8;
                self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                self.wrap.setAttribute('rotation', '0 0 0');

                var prevPageY;
                var prevPageX;
                var zoomRate = 1;

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

                // ↓ 上下移動ボタン押下
                var bUP = document.getElementById('swUp');
                var bDOWN = document.getElementById('swDown');

                bUP.addEventListener('click', function () {
                    wrapPos.y += 0.2;
                    self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                });

                bDOWN.addEventListener('click', function () {
                    wrapPos.y -= 0.2;
                    self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                });
                // ↑ 

                // ↓ UPボタン長押し
                var eventStart = 'touchstart';
                var eventEnd = 'touchend';
                var eventLeave = 'touchmove';
                var timer;

                bUP.addEventListener(eventStart, e => {
                    e.preventDefault();
                    bUP.classList.add('active');
                    timer = setInterval(() => {
                        wrapPos.y += 0.02;
                        self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                    }, 10);
                })

                bUP.addEventListener(eventEnd, e => {
                    e.preventDefault();
                    bUP.classList.remove('active');
                    clearInterval(timer);
                });

                bUP.addEventListener(eventLeave, e => {
                    e.preventDefault();
                    bUP.classList.remove('active');
                    clearInterval(timer);
                });
                // ↑ 

                // ↓ DOWNボタン長押し
                bDOWN.addEventListener(eventStart, e => {
                    e.preventDefault();
                    bDOWN.classList.add('active');
                    timer = setInterval(() => {
                        wrapPos.y -= 0.02;
                        self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                    }, 10);
                })

                bDOWN.addEventListener(eventEnd, e => {
                    e.preventDefault();
                    bDOWN.classList.remove('active');
                    clearInterval(timer);
                });

                bUP.addEventListener(eventLeave, e => {
                    e.preventDefault();
                    bUP.classList.remove('active');
                    clearInterval(timer);
                });
                // ↑ 

            } else {
window.alert(40);
                // ボタン 表示・非表示切替
                document.getElementById("swUp").style.display = 'none';
                document.getElementById("swDown").style.display = 'none';
window.alert(41);
                document.getElementById("swAngle").style.display = 'inline';
                document.getElementById("swParallel").style.display = 'inline';
window.alert(42);
                var mWrap = document.createElement('a-nft');
                mWrap.setAttribute('preset', 'custom');
                mWrap.setAttribute('type', 'nft');
                mWrap.setAttribute('id', 'arMarker');
                mWrap.setAttribute('smooth', 'true');
                mWrap.setAttribute('smoothCount', '10');
                mWrap.setAttribute('smoothTolerance', '0.01');
                mWrap.setAttribute('smoothThreshold', '5');
window.alert(43);
                if ((!!self.arg.markerList1) && (!!self.arg.markerList2)) {
                    mWrap.setAttribute('url',
                        AFRAME.utils.coordinates.stringify(
                            rootPath + 'ImageDescriptors/' + self.arg.markerList1 + '/' + self.arg.markerList2 + '/' + self.arg.markerList2));

                    window.alert(rootPath + 'ImageDescriptors/' + self.arg.markerList1 + '/' + self.arg.markerList2 + '/' + self.arg.markerList2);
                } else {
                    mWrap.setAttribute('url',
                        AFRAME.utils.coordinates.stringify(
                            !(self.arg.markerList) ? '' : path + 'ImageDescriptors/' + self.arg.markerList + '/' + self.arg.markerList));
                    window.alert(44);
                }
                
                mWrap.appendChild(self.wrap);
                webArViewer.scene.appendChild(mWrap);

                // ↓ rotation 切替
                var anglebtn = document.getElementById('swAngle');
                var parallelbtn = document.getElementById('swParallel');
                var arRotation = '-5 0 0';

                if (self.arg.preview) {
                    parallelbtn.classList.add('current');
                } else {
                    anglebtn.classList.add('current');
                }
                    window.alert(45);
                anglebtn.addEventListener('click', function () {
                    if (!anglebtn.classList.contains('current')) {
                        arRotation = '-5 0 0';
                        self.wrap.setAttribute('rotation', AFRAME.utils.coordinates.stringify(arRotation));

                        anglebtn.classList.add('current');
                        parallelbtn.classList.remove('current');
                    }
                });
                    window.alert(46);
                parallelbtn.addEventListener('click', function () {
                    if (!parallelbtn.classList.contains('current')) {
                        arRotation = '-90 0 0';
                        self.wrap.setAttribute('rotation', AFRAME.utils.coordinates.stringify(arRotation));

                        parallelbtn.classList.add('current');
                        anglebtn.classList.remove('current');
                    }
                });
                // ↑
                    window.alert(47);
                return;
            }

            webArViewer.scene.appendChild(self.wrap);
        },

        positionVec3: function (type) {
            var self = this;
            var h1_2 = self.arData.size.h / 2;
            var width = self.arData.size.w;
            var isWarp = self.arData.isWarp;

            if (type === 'shadow') {
                return { x: 0, y: 0, z: -h1_2 + (isWarp ? 0.2 : 0) };
            } else {
                return { x: 0, y: h1_2, z: -(isWarp ? width - 0.2 : 0) };
            }
        }
    };
window.alert(10);
    webArViewer.ar = ar;
    window.alert(11);
    webArViewer.ar.init();
window.alert(12);
}());

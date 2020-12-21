var webArViewer = webArViewer || {};

(function (global) {

    webArViewer.scene = document.querySelector('a-scene');

    var ar = {
        C: {
            arNum: 1
        },

        init: function () {

            this.setArg();

            if (this.setArData()) {

                this.setWrap();

                this.createModel();

                var deviceEvents = {
                    Touch     : typeof document.ontouchstart !== 'undefined',
                    Pointer   : window.navigator.pointerEnabled,
                    MSPointer : window.navigator.msPointerEnabled
                };

                this.eventNames = {
                    start     : deviceEvents.Pointer ? 'pointerdown' : deviceEvents.MSPointer ? 'MSPointerDown' : deviceEvents.Touch ? 'touchstart' : 'mousedown',
                    move      : deviceEvents.Pointer ? 'pointermove' : deviceEvents.MSPointer ? 'MSPointerMove' : deviceEvents.Touch ? 'touchmove'  : 'mousemove',
                    end       : deviceEvents.Pointer ? 'pointerup'   : deviceEvents.MSPointer ? 'MSPointerUp'   : deviceEvents.Touch ? 'touchend'   : 'mouseup'
                };

                this.setScene();

                //this.setTapEvents();

            }

            this.setSwitcher();
        },

        setArg : function() {
            var self = this;

            var arg = {};
            var pair = location.search.substring(1).split('&');

            for(var i=0; pair[i]; i++) {
                var kv = pair[i].split('=');
                arg[kv[0]] = decodeURIComponent(kv[1]);
            }

            // 曲面
            arg.warpList = arg.xw && (parseInt(arg.xw, 16).toString(2));
            // 影
            arg.shodowList = arg.xs && (parseInt(arg.xs, 16).toString(2));
            // 弾性(弾む)
            arg.QuartList = arg.xq && (parseInt(arg.xq, 16).toString(2));
            // 反射 
            arg.ReflectList = arg.xr && (parseInt(arg.xr, 16).toString(2));
            // ターン
            arg.turnList = arg.xt && (parseInt(arg.xt, 16).toString(2));
            // ゆがむ
            arg.ElasticList = arg.xe && (parseInt(arg.xe, 16).toString(2));
            // でこぼこ
            arg.decaList = arg.xd && (parseInt(arg.xd, 16).toString(2));
            // サイズ
            arg.sizeList = arg.wh && (parseInt(arg.wh, 16).toString(10)).match(/.{2}/g);
            // マーカー
            arg.markerList = arg.m;

            self.arg = arg;
        },

        setArData: function () {

            var self = this;

            var assets = document.createElement('a-assets');
            assets.setAttribute('timeout', '9000');

            var arData = null;

            // データの準備
            var dataObj = { path: self.arg['p'] };

            //dataObj.map = null;
            //dataObj.tap = null;
            dataObj.isWarp = self.arg.warpList && !!Number(self.arg.warpList);
            dataObj.isShadow = self.arg.shodowList && !!Number(self.arg.shodowList);
            dataObj.isQuart = self.arg.QuartList && !!Number(self.arg.QuartList);
            dataObj.isReflect = self.arg.ReflectList && !!Number(self.arg.ReflectList);
            dataObj.isTurn = self.arg.turnList && !!Number(self.arg.turnList);
            dataObj.isElastic = self.arg.ElasticList && !!Number(self.arg.ElasticList);

            dataObj.isMarker = !!self.arg.markerList;

            dataObj.isDeca = self.arg.decaList && !!Number(self.arg.decaList);

            dataObj.size = self.arg.sizeList ? {
                //w: Number(self.arg.sizeList[0]),
                //h: Number(self.arg.sizeList[1])
                w: parseInt(Number(self.arg.sizeList / 10), 10),
                h: Number(self.arg.sizeList) - parseInt(Number(self.arg.sizeList / 10), 10) * 10
                //w: 4,
                //h: 4
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

            dataObj.isGif = !!(self.arg['p'] || '').match(/\.gif$/i);

            if (dataObj.path) {

                var source = document.createElement('img');

                source.setAttribute('crossorigin', 'anonymous');
                source.setAttribute('id', 'source');
                source.setAttribute('src', dataObj.path);
                assets.appendChild(source);
            }

            arData = dataObj;

            if (!arData.path)
            {
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

            swMarker.addEventListener('click', function() {
                if(!this.classList.contains('current')) {
                    location.replace(location.search.replace('&preview=1', ''));
                }
            });

            swPreview.addEventListener('click', function() {
                if(!this.classList.contains('current')) {
                    location.replace(location.search + '&preview=1');
                }
            });
        },

        setWrap : function() {
            var self = this;
            var offsetPos = self.arg.offsetPos ? decodeURI(self.arg.offsetPos) : '0 0 0';
            self.wrap = document.createElement('a-entity');
            self.wrap.setAttribute('position', offsetPos);
        },

        createModel: function () {
            var self = this;
            var val = self.arData;

            if (!val.path) {
                return;
            }
            
            if (val.isShadow) {
                var shadow = document.createElement('a-entity');

                shadow.setAttribute('position', AFRAME.utils.coordinates.stringify(self.positionVec3('shadow')));

                shadow.setAttribute('rotation', '-90 0 0');

                AFRAME.utils.entity.setComponentProperty(shadow, 'geometry', {
                    primitive: 'plane', height: val.size.h, width: val.size.w
                });

                AFRAME.utils.entity.setComponentProperty(shadow, 'material', {
                    shader: val.isGif ? 'gif' : 'flat', npot: true, src: '#source', transparent: true, alphaTest: 0.1,
                    color: 'black', opacity: 0.3, depthTest: false
                });

                // アニメーション
                if (val.isQuart) {
                    AFRAME.utils.entity.setComponentProperty(shadow, 'animation__alpha', {
                        property: 'material.opacity', dir: 'alternate', dur: 400, easing: 'easeInOutQuart', loop: true, to: '0.1'
                    });

                    AFRAME.utils.entity.setComponentProperty(shadow, 'animation__scale', {
                        property: 'scale', dir: 'alternate', dur: 400, easing: 'easeInOutQuart', loop: true, to: '0.8 0.7 1'
                    });
                }

                if (val.isTurn) {
                    AFRAME.utils.entity.setComponentProperty(shadow, 'animation__turn', {
                        property: 'scale', dir: 'alternate', dur: 100, loop: 4, from: '1 1 1', to: '0.1 1 1', startEvents: 'turn'
                    });
                }

                if (val.isElastic) {
                    AFRAME.utils.entity.setComponentProperty(shadow, 'animation__guni', {
                        property: 'scale', dur: 600, easing: 'easeOutBack', to: '1.3 0.95 1', startEvents: 'guni'
                    });
                    AFRAME.utils.entity.setComponentProperty(shadow, 'animation__guniback', {
                        property: 'scale', dur: 1000, easing: 'easeOutElastic', elasticity: 600, from: '1.35 0.9 1', to: '1 1 1', startEvents: 'guniback'
                    });
                }
                self.arData.shadow = shadow;
            }

            var main = document.createElement('a-entity');
            var posVec3 = self.positionVec3('main');
            
            main.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3));

            if (!val.isGif) {
                main.setAttribute('rotation', '0 0 0');
            } else {
                main.setAttribute('rotation', (!val.isWarp && !self.arg.preview ? '-30' : (self.arg.preview ? '-5' : '-30')) + ' 0 0');
            }

            AFRAME.utils.entity.setComponentProperty(main, 'material', {
                shader: val.isGif ? 'gif' : 'standard', npot: true, src: '#source', displacementMap: null, displacementBias: -0.5,
                side: 'double', transparent: true, alphaTest: 0.1, metalness: val.isReflect ? 0.1 : 0, roughness: val.isReflect ? 0.3 : 0.5
            });

            if (!val.isWarp) {
                AFRAME.utils.entity.setComponentProperty(main, 'geometry', {
                    primitive: 'plane', height: val.size.h, width: val.size.w, segmentsHeight: 1, segmentsWidth: 1
                });
            } else {
                var ts, tl;
                ts = -32;
                tl = 64;

                AFRAME.utils.entity.setComponentProperty(main, 'geometry', {
                    primitive: 'cylinder', openEnded: true, thetaStart: ts, thetaLength: tl,
                    height: val.size.h, radius: val.size.w, segmentsHeight: 18, segmentsRadial: 36
                });
            }

            // アニメーション
            if (val.isQuart) {
                AFRAME.utils.entity.setComponentProperty(main, 'animation__pos', {
                    property: 'position', dir: 'alternate', dur: 400, easing: 'easeInOutQuart', loop: true, to: posVec3.x + ' ' + (posVec3.y+val.size.h/3) + ' ' + posVec3.z
                });

                AFRAME.utils.entity.setComponentProperty(main, 'animation__scale', {
                    property: 'scale', dir: 'alternate', dur: 400, easing: 'easeOutQuad', loop: true, to: '0.94 1.06 1'
                });
            }

            if (val.isTurn) {
                AFRAME.utils.entity.setComponentProperty(main, 'animation__turn', {
                    property: 'rotation', dur: 3000, easing: 'easeOutElastic', elasticity: 300, from: '0 0 0', to: '0 360 0', startEvents: 'turn'
                });
            }

            if (val.isElastic) {
                AFRAME.utils.entity.setComponentProperty(main, 'animation__guni', {
                    property: 'scale', dur: 600, easing: 'easeOutBack', to: '1.3 0.95 1', startEvents: 'guni'
                });

                AFRAME.utils.entity.setComponentProperty(main, 'animation__guniback', {
                    property: 'scale', dur: 1000, easing: 'easeOutElastic', elasticity: 600, from: '1.35 0.9 1', to: '1 1 1', startEvents: 'guniback'
                });
            }

            self.arData.main = main;
        },

        setScene: function () {
            var self = this;

            self.arData.shadow && self.wrap.appendChild(self.arData.shadow);
            self.arData.main && self.wrap.appendChild(self.arData.main);

            if (self.arg.preview) {

                document.getElementById("swUp").style.display = 'inline';
                document.getElementById("swDown").style.display = 'inline';

                var wrapPos = self.wrap.getAttribute('position');
                wrapPos.x += 0;
                wrapPos.y -= 0.5;
                wrapPos.z -= 8;
                self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                self.wrap.setAttribute('rotation', '10 0 0');

                var prevPageY;
                var prevPageX;
                var zoomRate = 1;

                webArViewer.scene.addEventListener(self.eventNames.start, function(e) {
                    var event = e.changedTouches ? e.changedTouches[0] : e;
                    prevPageY = event.pageY;    // 縦軸
                    prevPageX = event.pageX;    // 横軸
                });
                
                webArViewer.scene.addEventListener(self.eventNames.move, function(e) {
                    var event = e.changedTouches ? e.changedTouches[0] : e;

                    if(prevPageY) {
                        //zoomRate += (event.pageY - prevPageY) / webArViewer.scene.clientHeight / 5;

                        if ((zoomRate + (prevPageY - event.pageY) / webArViewer.scene.clientHeight / 5) > 0.1) {
                            zoomRate += (prevPageY - event.pageY) / webArViewer.scene.clientHeight / 5;
                            AFRAME.utils.entity.setComponentProperty(self.wrap, 'animation__scale', {
                                property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRate + ' ' + zoomRate + ' ' + zoomRate
                            });
                        }
                    }
                });

                webArViewer.scene.addEventListener(self.eventNames.end, function(e) {
                    prevPageY = null;
                });

                // ↓ 上下移動ボタン押下
                var upbtn = document.getElementById('swUp');

                upbtn.addEventListener('click', function () {
                    wrapPos.y += 0.2;
                    self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                });

                var downbtn = document.getElementById('swDown');

                downbtn.addEventListener('click', function () {

                    wrapPos.y -= 0.2;
                    self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));

                });
                // ↑ 上下移動ボタン押下

                // ↓ UPボタン長押し
                //var b = document.getElementById('swUp');
                //var eventStart = 'touchstart';
                //var eventEnd = 'touchend';
                //var eventLeave = 'touchmove';

                //b.addEventListener(eventStart, e => {
                //    e.preventDefault();
                //    b.classList.add('active');

                //})

                //b.addEventListener(eventEnd, e => {
                //    e.preventDefault();
                //    b.classList.remove('active');

                //});

                // ↑ UPボタン長押し

                // ↓ DOWNボタン長押し
                //const ua = navigator.userAgent.toLowerCase();
                //const isSP = /iphone|ipod|ipad|android/.test(ua);
                //const b = document.getElementById('swUp');
                //const eventStart = isSP ? 'touchstart' : 'mousedown';
                //const eventEnd = isSP ? 'touchend' : 'mouseup';
                //const eventLeave = isSP ? 'touchmove' : 'mouseleave';

                //b.addEventListener(eventStart, e => {
                //    e.preventDefault();
                //    b.classList.add('active');
                //})

                //b.addEventListener(eventEnd, e => {
                //    e.preventDefault();
                //    b.classList.remove('active');

                //});

                //b.addEventListener(eventLeave, e => {
                //    e.preventDefault();
                //    let el;
                //    el = isSP ? document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY) : b;
                //    if (!isSP || el !== b) {
                //        b.classList.remove('active');
                //    }
                //});
                // ↑ DOWNボタン長押し

            } else {
                document.getElementById("swUp").style.display = 'none';
                document.getElementById("swDown").style.display = 'none';

                var mWrap = document.createElement('a-marker');
                mWrap.setAttribute('preset', 'custom');
                mWrap.setAttribute('type', 'pattern');
                mWrap.setAttribute('id', 'arMarker');

                if (!!self.arg.m) {
                    mWrap.setAttribute('url', 'pattern/pattern-' + self.arg.m + '.patt');
                } else {
                    mWrap.setAttribute('url', 'pattern/pattern-0.patt');
                }

                mWrap.appendChild(self.wrap);
                webArViewer.scene.appendChild(mWrap);

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
                    return { x: 0, y: 0, z: - h1_2 + (isWarp ? 0.2 : -2) };
            } else {
                    return { x: 0, y: h1_2, z: - (isWarp ? width - 0.2 : 2) };
            }
        }
    };

    webArViewer.ar = ar;
    webArViewer.ar.init();

}());

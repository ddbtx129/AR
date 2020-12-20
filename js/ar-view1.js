var webArViewer = webArViewer || {};

(function (global) {

    webArViewer.scene = document.querySelector('a-scene');

    var ar = null;
    ar = {
        C : {
            arNum: 5
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
                this.setTapEvents();
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

            var pad = new Array(self.C.arNum).join('0');

            // 曲面
            arg.warpList = arg.xw && (pad + parseInt(arg.xw, 16).toString(2)).slice(-1 * self.C.arNum).split('').reverse();
            // 影
            arg.shodowList = arg.xs && (pad + parseInt(arg.xs, 16).toString(2)).slice(-1 * self.C.arNum).split('').reverse();
            // 弾性(弾む)
            arg.QuartList = arg.xq && (pad + parseInt(arg.xq, 16).toString(2)).slice(-1 * self.C.arNum).split('').reverse();
            // 反射 
            arg.ReflectList = arg.xr && (pad + parseInt(arg.xr, 16).toString(2)).slice(-1 * self.C.arNum).split('').reverse();
            // ターン
            arg.turnList = arg.xt && (pad + parseInt(arg.xt, 16).toString(2)).slice(-1 * self.C.arNum).split('').reverse();
            // ゆがむ
            arg.ElasticList = arg.xe && (pad + parseInt(arg.xe, 16).toString(2)).slice(-1 * self.C.arNum).split('').reverse();
            // 
            arg.decaList = arg.xd && (pad + parseInt(arg.xd, 16).toString(2)).slice(-1 * self.C.arNum).split('').reverse();
            // サイズ
            arg.sizeList = arg.wh && (pad + pad + parseInt(arg.wh, 16).toString(10)).slice(-2 * self.C.arNum).match(/.{2}/g).reverse();
            
            arg.markerList = arg.m;

            self.arg = arg;
        },

        setArData: function () {

            var self = this;

            var assets = document.createElement('a-assets');
            assets.setAttribute('timeout', '9000');

            var arData = new Array(self.C.arNum);

            var flg = true;
            var fsize = 0;

            // データの準備
            for (var idx = 0; idx < self.C.arNum; idx=(idx+1)|0) {

                var dataObj = { path: self.arg['p' + idx] };

                dataObj.map = self.arg['m' + idx];
                dataObj.tap = self.arg['t' + idx];
                dataObj.isWarp = self.arg.warpList && !!Number(self.arg.warpList[idx]);
                dataObj.isShadow = self.arg.shodowList && !!Number(self.arg.shodowList[idx]);
                dataObj.isQuart = self.arg.QuartList && !!Number(self.arg.QuartList[idx]);
                dataObj.isReflect = self.arg.ReflectList && !!Number(self.arg.ReflectList[idx]);
                dataObj.isTurn = self.arg.turnList && !!Number(self.arg.turnList[idx]);
                dataObj.isElastic = self.arg.ElasticList && !!Number(self.arg.ElasticList[idx]);

                dataObj.isMarker = !!self.arg.markerList;

                dataObj.isDeca = self.arg.decaList && !!Number(self.arg.decaList[idx]);

                dataObj.size = self.arg.sizeList ? {
                    w: Number(self.arg.sizeList[idx][0]),
                    h: Number(self.arg.sizeList[idx][1])
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

                // アセット読み込み
                if (dataObj.path) {

                    var source = document.createElement('img');

                    source.setAttribute('crossorigin', 'anonymous');
                    source.setAttribute('id', 'source' + idx);
                    source.setAttribute('src', dataObj.path);
                    assets.appendChild(source);

                    if (dataObj.map) {
                        var map = document.createElement('img');
                        map.setAttribute('crossorigin', 'anonymous');
                        map.setAttribute('id', 'map' + idx);
                        map.setAttribute('src', dataObj.map);
                        assets.appendChild(map);
                    }

                    if (dataObj.tap) {

                        self.tap = true;

                        if (dataObj.hasMp4) {
                            var tapEl = document.createElement('video');
                            tapEl.setAttribute('webkit-playsinline', 'true');
                            tapEl.setAttribute('playsinline', 'true');
                            dataObj.tapEl = tapEl;
                            dataObj.keyColor = self.arg['kc' + idx] ? decodeURI(self.arg['kc' + idx]) : '0.1 0.9 0.2'
                        } else {
                            var tapEl = document.createElement('img');
                        }

                        tapEl.setAttribute('crossorigin', 'anonymous');
                        tapEl.setAttribute('id', 'tap' + idx);
                        tapEl.setAttribute('src', dataObj.tap);

                        assets.appendChild(tapEl);
                    }
                }

                arData[idx] = dataObj;
            }

            if (!arData.some(function (val) {
                var imgpath = val.path;
                return imgpath;
            })) {
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

            if(!self.arData || location.pathname.match(/vr/)) {
                return false;
            }

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

        createModel : function() {
            var self = this;

            for (var idx = 0; idx < self.C.arNum; idx = (idx + 1) | 0) {

                var val = self.arData[idx];

                if (!val.path) {
                    continue;
                }

                if (idx === 4) {
                    var sky = document.createElement('a-sky');
                    AFRAME.utils.entity.setComponentProperty(sky, 'material', {
                        shader: val.isGif ? 'gif' : 'standard', src: '#source' + idx, radius: val.isWarp ? 80 : 5000
                    });

                    if (val.isShadow) {
                        AFRAME.utils.entity.setComponentProperty(sky, 'animation__rot', {
                            property: 'geometry.phiStart', dur: 20000, easing: 'linear', loop: true, to: -360
                        });
                    }

                    webArViewer.scene.appendChild(sky);

                    if (val.isQuart) {
                        var light1 = document.createElement('a-entity');
                        var light2 = document.createElement('a-entity');
                        light1.setAttribute('light', 'type: hemisphere; color: #33F; groundColor: #BB3; intensity: 2');
                        light2.setAttribute('light', 'type: directional; color: #FF3; intensity: 0.6');
                        light2.setAttribute('position', '-20 90 10');
                        webArViewer.scene.appendChild(light1);
                        webArViewer.scene.appendChild(light2);
                    }
                    continue;
                }

                if (idx && val.isShadow) {
                    var shadow = document.createElement('a-entity');

                    shadow.setAttribute('position', AFRAME.utils.coordinates.stringify(self.positionVec3(idx, 'shadow')));
                    shadow.setAttribute('rotation', '-90 0 0');

                    AFRAME.utils.entity.setComponentProperty(shadow, 'geometry', {
                        primitive: 'plane', height: val.size.h, width: val.size.w
                    });

                    AFRAME.utils.entity.setComponentProperty(shadow, 'material', {
                        shader: val.isGif ? 'gif' : 'flat', npot: true, src: '#source' + idx, transparent: true, alphaTest: 0.1,
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
                    self.arData[idx].shadow = shadow;
                }

                var main = document.createElement('a-entity');
                var posVec3 = self.positionVec3(idx, 'main');

                main.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3));
                //main.setAttribute('rotation', ((idx === 0 && !val.isWarp) ? -90 : 0) + ' 0 0');

                if (!val.isGif) {
                    main.setAttribute('rotation', ((idx === 0 && !val.isWarp) ? -90 : 0) + ' 0 0');
                } else {
                    main.setAttribute('rotation', ((idx === 0 && !val.isWarp) ? -90 : (self.arg.preview) ? 0 : -30) + ' 0 0');
                }

                AFRAME.utils.entity.setComponentProperty(main, 'material', {
                    shader: val.isGif ? 'gif' : 'standard', npot: true, src: '#source' + idx, displacementMap: val.map ? '#map' + idx : null, displacementBias: -0.5,
                    side: 'double', transparent: true, alphaTest: 0.1, metalness: val.isReflect ? 0.1 : 0, roughness: val.isReflect ? 0.3 : 0.5
                });

                if (!val.isWarp) {
                    AFRAME.utils.entity.setComponentProperty(main, 'geometry', {
                        primitive: 'plane', height: val.size.h, width: val.size.w, segmentsHeight: val.map ? 180 : 1, segmentsWidth: val.map ? 180 : 1
                    });

                } else if (idx) {
                    var ts, tl;
                    if (idx === 1 && !self.arg.multi) {
                        ts = 212;
                        tl = -64;

                    } else {
                        ts = -32;
                        tl = 64;

                    }

                    AFRAME.utils.entity.setComponentProperty(main, 'geometry', {
                        primitive: 'cylinder', openEnded: true, thetaStart: ts, thetaLength: tl,
                        height: val.size.h, radius: val.size.w, segmentsHeight: val.map ? 180 : 18, segmentsRadial: val.map ? 360 : 36
                    });
                } else {
                    AFRAME.utils.entity.setComponentProperty(main, 'geometry', {
                        primitive: 'sphere', radius: val.size.w/2, phiStart: -90, segmentsHeight: val.map ? 180 : 18, segmentsWidth: val.map ? 360 : 36
                    });
                    window.alert("4");
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

                if (idx === 0 && val.isShadow) {
                    AFRAME.utils.entity.setComponentProperty(main, 'animation__rot', {
                        property: 'rotation', dur: 20000, easing: 'linear', loop: true, to: (val.isWarp ? 0 : -90) + ' 360 0'
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

                self.arData[idx].main = main;
            }
        },

        setScene: function () {
            var self = this;

            if (self.arg.multi) {
                if (self.arg.preview) {
                    for (var idx = 0; idx < self.C.arNum; idx=(idx+1)|0) {
                        if (!self.arData[idx].path || idx === 4) {
                            continue;
                        }
                        var arObj = document.createElement('a-entity');
                        arObj.setAttribute('position', ['0 0 0', '2 0 -2.1', '0 0 -2.3', '-2 0 -2.2'][idx]);

                        self.arData[idx].shadow && arObj.appendChild(self.arData[idx].shadow);
                        self.arData[idx].main && arObj.appendChild(self.arData[idx].main);

                        self.wrap.appendChild(arObj);
                    }
                } else {

                    for (var idx = 0; idx < self.C.arNum; idx = (idx + 1) | 0) {

                        if (!self.arData[idx].path || idx === 4) {
                            continue;
                        }
 
                        var arMarker = document.createElement('a-marker');
                        arMarker.setAttribute('preset', 'custom');
                        arMarker.setAttribute('type', 'pattern');

                        if (!!self.arData[idx].m) {
                            arMarker.setAttribute('url', 'asset/pattern-' + self.arData[idx].m + '.patt');
                        } else {
                            arMarker.setAttribute('url', 'asset/pattern-' + idx + '.patt');
                        }

                        self.arData[idx].shadow && arMarker.appendChild(self.arData[idx].shadow);
                        self.arData[idx].main && arMarker.appendChild(self.arData[idx].main);

                        webArViewer.scene.appendChild(arMarker);
                    }
                    return;
                }
            } else {

                self.arData[0].main && !self.arData[0].isWarp && self.wrap.appendChild(self.arData[0].main);

                self.arData[1].shadow && self.wrap.appendChild(self.arData[1].shadow);
                self.arData[2].shadow && self.wrap.appendChild(self.arData[2].shadow);
                self.arData[3].shadow && self.wrap.appendChild(self.arData[3].shadow);

                self.arData[1].main && self.wrap.appendChild(self.arData[1].main);
                self.arData[2].main && self.wrap.appendChild(self.arData[2].main);
                self.arData[0].main && self.arData[0].isWarp && self.wrap.appendChild(self.arData[0].main);
                self.arData[3].main && self.wrap.appendChild(self.arData[3].main);
            }

            if (location.pathname.match(/vr/)) {
                var vrPos = self.arg.vrPos ? decodeURI(self.arg.vrPos) : '0 0 -4';
                self.wrap.setAttribute('position', vrPos);
            } else if (self.arg.preview) {
                
                var wrapPos = self.wrap.getAttribute('position');
                //wrapPos.x += 4;
                wrapPos.y -= 0.5;
                wrapPos.z -= 8;
                self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                //self.wrap.setAttribute('rotation', '25 0 0');
                self.wrap.setAttribute('rotation', '10 0 0');

                var prevPageY;
                var zoomRate = 1;

                webArViewer.scene.addEventListener(self.eventNames.start, function(e) {
                    var event = e.changedTouches ? e.changedTouches[0] : e;
                    prevPageY = event.pageY;
                });

                webArViewer.scene.addEventListener(self.eventNames.move, function(e) {
                    var event = e.changedTouches ? e.changedTouches[0] : e;
                    if(prevPageY) {
                        zoomRate += (event.pageY - prevPageY) / webArViewer.scene.clientHeight / 5;

                        AFRAME.utils.entity.setComponentProperty(self.wrap, 'animation__scale', {
                            property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRate + ' ' + zoomRate + ' ' + zoomRate
                        });
                    }
                });

                webArViewer.scene.addEventListener(self.eventNames.end, function(e) {
                    prevPageY = null;
                });

            } else if (!self.arg.multi) {

                var mWrap = document.createElement('a-marker');
                mWrap.setAttribute('preset', 'custom');
                mWrap.setAttribute('type', 'pattern');

                if (!!self.arg.m) {
                    mWrap.setAttribute('url', 'asset/pattern-' + self.arg.m + '.patt');
                } else {
                    mWrap.setAttribute('url', 'asset/pattern-0.patt');
                }

                mWrap.appendChild(self.wrap);
                webArViewer.scene.appendChild(mWrap);

                return;
            }
            webArViewer.scene.appendChild(self.wrap);
        },

        positionVec3: function (idx, type) {
            var self = this;
            var h1_2 = self.arData[idx].size.h/2;
            var width = self.arData[idx].size.w;
            var isWarp = self.arData[idx].isWarp;

            if (type === 'shadow') {
                if (self.arg.multi) {
                    return {x: 0, y: 0, z: - h1_2};
                } else {
                    var p = {};
                    p[1] = function () {
                        return {x: 0, y: 0, z: - self.arData[0].size.h/2 - h1_2 - (isWarp ? 0.2 : 0)};
                    };
                    p[2] = function () {
                        return {x: 0, y: 0, z: - h1_2 + (isWarp ? 0.2 : 0)};
                    };
                    p[3] = function () {
                        return {x: 0, y: 0, z: self.arData[0].size.h/2 - h1_2 + (isWarp ? 0.2 : 0)};
                    };
                    return p[idx]();
                }
            } else {
                if (idx === 0) {
                    return {x: 0, y: isWarp ? width/2 : 0, z: 0};
                } else if (self.arg.multi) {
                    return {x: 0, y: h1_2, z: - (isWarp ? width : 0)};
                } else {
                    var p = {};
                    p[1] = function () {
                        return {x: 0, y: h1_2, z: (isWarp ? width-0.2 : 0) - self.arData[0].size.h/2};
                    };
                    p[2] = function () {
                        return {x: 0, y: h1_2, z: - (isWarp ? width-0.2 : 0)};
                    };
                    p[3] = function () {
                        return {x: 0, y: h1_2, z: - (isWarp ? width-0.2 : 0) + self.arData[0].size.h/2};
                    };
                    return p[idx]();
                }
            }
        },

        setTapEvents: function () {
            var self = this;

            if (!self.arg.xt && !self.arg.xe && !self.tap) {
                return;
            } else {
                var touchAt = document.getElementById('touch');
                var touchImg = new Image(54, 40);
                touchImg.src = 'asset/touch.png';
                touchImg.onload = function () {
                    touchAt.appendChild(touchImg);
                    touchAt.classList.add('attention');
                };
            }

            if (self.arg.xt) {
                webArViewer.scene.addEventListener('click', function(e) {
                    for (var idx = 0; idx < self.C.arNum; idx=(idx+1)|0) {
                        if (self.arData[idx].path && self.arData[idx].isTurn) {
                            self.arData[idx].main.emit('turn');
                            self.arData[idx].isShadow && self.arData[idx].shadow.emit('turn');
                        }
                    }
                });
            }

            if (self.arg.xe) {
                webArViewer.scene.addEventListener(self.eventNames.start, function(e) {
                    for (var idx = 0; idx < self.C.arNum; idx=(idx+1)|0) {
                        if (self.arData[idx].path && self.arData[idx].isElastic) {
                            self.arData[idx].main.emit('guni');
                            self.arData[idx].isShadow && self.arData[idx].shadow.emit('guni');
                        }
                    }
                });

                webArViewer.scene.addEventListener(self.eventNames.end, function(e) {
                    for (var idx = 0; idx < self.C.arNum; idx=(idx+1)|0) {
                        if (self.arData[idx].path && self.arData[idx].isElastic) {
                            self.arData[idx].main.emit('guniback');
                            self.arData[idx].isShadow && self.arData[idx].shadow.emit('guniback');
                        }
                    }
                });
            }

            if (self.tap) {
                for (var idx = 0; idx < self.C.arNum; idx=(idx+1)|0) {

                    var val = self.arData[idx];

                    if (!val.tap) {
                        continue;
                    }

                    val.mainTap = document.createElement('a-plane');
                    AFRAME.utils.entity.setComponentProperty(val.mainTap, 'material', {
                        shader: val.hasMp4 ? 'chromakey' : val.tap.match(/\.gif$/i) ? 'gif' : 'standard', npot: true, src: '#tap' + idx, displacementMap: val.map ? '#map' + idx : null, displacementBias: -0.5,
                        side: 'double', transparent: true, alphaTest: 0.1, metalness: val.isReflect ? 0.1 : 0, roughness: val.isReflect ? 0.3 : 0.5, keyColor: val.hasMp4 ? val.keyColor: null
                    });

                    val.mainTap.setAttribute('visible', false);
                    webArViewer.scene.appendChild(val.mainTap);

                    if (val.isShadow) {
                        val.shadowTap = document.createElement('a-plane');
                        AFRAME.utils.entity.setComponentProperty(val.shadowTap, 'material', {
                            shader: val.hasMp4 ? 'chromakey' : val.tap.match(/\.gif$/i) ? 'gif' : 'flat', npot: true, src: '#tap' + idx, transparent: true, alphaTest: 0.1,
                            color: 'black', opacity: 0.3, depthTest: false, keyColor: val.hasMp4 ? val.keyColor: null
                        });

                        val.shadowTap.setAttribute('visible', false);
                        webArViewer.scene.appendChild(val.shadowTap);
                    }
                }

                webArViewer.scene.addEventListener('click', function(e) {
                    for (var idx = 0; idx < self.C.arNum; idx=(idx+1)|0) {
                        var val = self.arData[idx];

                        if (!val.tap) {
                            continue;
                        }

                        if (val.tapVisible) {
                            val.tapVisible = false;
                            val.main.object3DMap.mesh.material = val.mainDefaultMaterial;
                            val.isShadow && (val.shadow.object3DMap.mesh.material = val.shadowDefaultMaterial);
                            if (val.hasMp4) {
                                val.tapEl.pause();
                            }
                        } else {
                            val.tapVisible = true;
                            if (!val.mainDefaultMaterial) {
                                val.mainDefaultMaterial = val.main.object3DMap.mesh.material;
                                val.mainTapMaterial = val.mainTap.object3DMap.mesh.material;

                                if (val.isShadow) {
                                    val.shadowDefaultMaterial = val.shadow.object3DMap.mesh.material;
                                    val.shadowTapMaterial = val.shadowTap.object3DMap.mesh.material;
                                }
                            }
                            val.main.object3DMap.mesh.material = val.mainTapMaterial;
                            val.isShadow && (val.shadow.object3DMap.mesh.material = val.shadowTapMaterial);
                            if (val.hasMp4) {
                                val.tapEl.currentTime = 0;
                                val.tapEl.play();
                            }
                        }
                    }
                }, true);
            }
        }
    };

    webArViewer.ar = ar;
    webArViewer.ar.init();

}());
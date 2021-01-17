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
                this.setTapEvents();
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

            arg.sizeList = arg.wh && (parseInt(arg.wh, 16).toString(10));
            //arg.whList = arg.wh && (parseInt(arg.wh, 16).toString(10));

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

            arg.ARList = arg.ar && (parseInt(arg.ar, 10).toString());

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
            dataObj.isNFT = !!(self.arg.ARList);
            dataObj.isMarkerType = !!(self.arg.ARList) ? Number(self.arg.ARList) : 2; 

            dataObj.isLogo = (!!(self.arg.LogoList) ? self.arg.LogoList[0] : '0');
            dataObj.isAnime = (!!(self.arg.LogoAnimeList) ? Number(self.arg.LogoAnimeList) : 0);

            dataObj.isShadow = self.arg.shodowList && !!Number(self.arg.shodowList);
            //defaultAngle = (self.arg.angleList && Number(self.arg.angleList) == 1) ? -90 : -5;

            self.arg.sizeList = String(!!(!!(self.arg.sizeList) && Number(self.arg.ar) == 0) ? self.arg.sizeList : GetDefaultSize((dataObj.isMarkerType == 1 ? 0 : 1), objecttype));

            var wh = SizeSplit(self.arg.sizeList).toString().split(',');

            var i = ((parseInt(self.arg.sizeList).toString(10)).length % 2 == 0) ? (parseInt(self.arg.sizeList).toString(10)).length : (parseInt(self.arg.sizeList).toString(10)).length + 1;
            var j = (dataObj.isMarkerType == 1 ? 2 : 4);

            dataObj.size = { w: (Number(wh[0]) * (10 ** -((i - j) / 2))).toFixed(1), h: (Number(wh[1]) * (10 ** -((i - j) / 2))).toFixed(1) };
            defaultSize = { w: (Number(wh[0]) * (10 ** -((i - j) / 2))).toFixed(1), h: (Number(wh[1]) * (10 ** -((i - j) / 2))).toFixed(1) };

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

                if (dataObj.tap) {

                    self.tap = true;
                    var bTap = document.createElement('img');

                    bTap.setAttribute('crossorigin', 'anonymous');
                    bTap.setAttribute('id', 'swDown');
                    bTap.setAttribute('src', 'asset/touch_w.png');

                    document.body.appendChild(bTap);
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
                    //if (self.arData.isNFT) {
                    //    var urlParam = location.search.substring(0);
                    //    location.href = rootPath + 'ar-view1.html' + urlParam + '&pv=1';
                    //}
                    location.replace(location.search + '&pv=1')
                    videostate = 0;
                    this.setDiplayBtn(1);
                }
            });
        },

        setWrap: function () {

            var self = this;
            var base = self.arg.base ? decodeURI(self.arg.base) : AFRAME.utils.coordinates.stringify(self.positionVec3('main'));
            defaultSize = (self.arData.isMarkerType == 1 ? { w: 2, h: 2, d: 2 } : { w: 4, h: 4, d: 4 });

            self.wrap = document.createElement('a-box');
            self.wrap.setAttribute('id', 'base');
            //self.wrap.setAttribute('scale', (self.arData.isMarkerType == 1 ? '2 2 2' : '4 4 4'));
            self.wrap.setAttribute('scale', defaultSize.w + ' ' + defaultSize.h + ' ' + defaultSize.w);
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

                main.setAttribute('rotation', AFRAME.utils.coordinates.stringify('-5 0 0'));
                
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
                //var logo = document.createElement('a-image');

                var logopos = self.positionVec3Logo(Number(val.isAnime));
                var logoscale = (!!(val.isMarkerType == 1) ? { w: 8, h: 8, d: 2 } : { w: 256, h: 256, d: 128 });
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
                    logo.setAttribute('radius', (logoscale.w / 2));
                    if (val.isAnime == 1) {
                        AFRAME.utils.entity.setComponentProperty(logo, 'animation__turn', {
                            property: 'rotation',
                            from: '0 0 0',
                            to: '0 360 0',
                            dur: 3000,
                            loop: true,
                            easing: 'linear'
                        });
                    } else if (val.isAnime == 2) {
                        AFRAME.utils.entity.setComponentProperty(logo, 'animation__turn', {
                            property: 'rotation',
                            from: '0 0 0',
                            to: '0 360 0',
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
                    } else if (val.isAnime == 11) {
                        AFRAME.utils.entity.setComponentProperty(logo, 'animation__turn1', {
                            property: 'rotation',
                            dur: 3000,
                            easing: 'linear',
                            from: '0 0 0',
                            to: '0 360 0',
                            startEvents: 'turn1'
                        });
                    } else if (val.isAnime == 12) {
                        AFRAME.utils.entity.setComponentProperty(logo, 'animation__turn2', {
                            property: 'rotation',
                            dur: 3000,
                            easing: 'easeOutElastic',
                            elasticity: 300,
                            from: '0 0 0',
                            to: '0 360 0',
                            startEvents: 'turn2'
                        });
                    } else if (val.isAnime == 13) {
                        logo.setAttribute('rotation', AFRAME.utils.coordinates.stringify(String(objAngle - 5) + ' 0 0'));
                        // 弾む
                        AFRAME.utils.entity.setComponentProperty(logo, 'animation__pos3', {
                            property: 'position',
                            dir: 'alternate',
                            dur: 400,
                            easing: 'easeInOutQuart',
                            loop: false,
                            from: logopos.x + ' ' + logopos.y + ' ' + logopos.z,
                            to: logopos.x + ' ' + (logopos.y + (logoscale.h * rete) / 5) + ' ' + logopos.z,
                            startEvents: 'pos3'
                        });
                        AFRAME.utils.entity.setComponentProperty(logo, 'animation__scale3', {
                            property: 'scale',
                            dir: 'alternate',
                            dur: 400,
                            easing: 'easeOutQuad',
                            loop: false,
                            from: logoscale.w * rete * 1.2 + ' ' + logoscale.h * rete * 0.8 + ' ' + logoscale.d * rete,
                            to: logoscale.w * rete * 0.8 + ' ' + logoscale.h * rete * 1.2 + ' ' + logoscale.d * rete * 1,
                            startEvents: 'scale3'
                        });
                    }
                } else {
                    //logo.setAttribute('rotation', AFRAME.utils.coordinates.stringify(String(objAngle) + ' 0 0'));
                    AFRAME.utils.entity.setComponentProperty(logo, 'animation__turn', {
                        property: 'rotation',
                        dur: 3000,
                        easing: 'easeOutElastic',
                        elasticity: 300,
                        from: '0 0 0',
                        to: '0 360 0',
                        startEvents: 'turn'
                    });
                }

                self.arData.logo = logo;
            }
        },

        setScene: function () {

            var self = this;
            var val = self.arData;

            self.arData.shadow && self.wrap.appendChild(self.arData.shadow);
            self.arData.main && self.wrap.appendChild(self.arData.main);

            if (val.isLogo) {
                self.arData.logo && self.wrap.appendChild(self.arData.logo);
            }

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
            //var zoomRateH = (val.isMarkerType == 1) ? 2 : (defaultSize.h / 10);
            var zoomRateH = defaultSize.h;

            var wh = { w: val.size.w, h: val.size.h };
            var wrapPos = self.positionVec3('main');

            if (self.arg.pv) {

                //wrapPos.x -= 0;
                //wrapPos.y -= ((val.isMp4) ? 0 : 2);
                //wrapPos.z -= 10;

                var pvAngle = 0;

                //AFRAME.utils.entity.setComponentProperty(self.wrap, 'animation', {
                //    property: 'scale',
                //    dir: 'alternate',
                //    dur: 1,
                //    easing: 'linear',
                //    loop: false,
                //    to: (wh.w / 2) + ' ' + (wh.h / 2) + ' ' + 1
                //});

                self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                self.wrap.setAttribute('rotation', AFRAME.utils.coordinates.stringify(String(pvAngle) + ' 0 0'));

                if (!!val.isLogo) {

                    var logopos = self.positionVec3Logo(Number(val.isAnime));
                    self.arData.logo.setAttribute('position', AFRAME.utils.coordinates.stringify(logopos));

                    if (!!val.isAnime) {
                        self.arData.logo.setAttribute('radius', (8 / 2));
                        if (val.isAnime == 1) {
                            AFRAME.utils.entity.setComponentProperty(self.arData.logo, 'animation__turn', {
                                property: 'rotation',
                                from: '0 0 0',
                                to: '0 360 0',
                                dur: 3000,
                                loop: true,
                                easing: 'linear'
                            });
                        } else if (val.isAnime == 2) {
                            AFRAME.utils.entity.setComponentProperty(self.arData.logo, 'animation__turn', {
                                property: 'rotation',
                                from: '0 0 0',
                                to: '0 360 0',
                                dur: 3000,
                                loop: true,
                                easing: 'easeOutElastic',
                                elasticity: 300
                            });
                        } else if (val.isAnime == 3) {
                            self.arData.logo.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));
                            var logoscale = { w: 8, h: 8, d: 2 };
                            var rete = (!val.isMp4) ? 1 : 2;
                            // 弾む
                            AFRAME.utils.entity.setComponentProperty(self.arData.logo, 'animation__pos', {
                                property: 'position',
                                dir: 'alternate',
                                dur: 400,
                                easing: 'easeInOutQuart',
                                loop: true,
                                from: logopos.x + ' ' + logopos.y + ' ' + logopos.z,
                                to: logopos.x + ' ' + (logopos.y + (logoscale.h * rete) / 5) + ' ' + logopos.z
                            });
                            AFRAME.utils.entity.setComponentProperty(self.arData.logo, 'animation__scale', {
                                property: 'scale',
                                dir: 'alternate',
                                dur: 400,
                                easing: 'easeOutQuad',
                                loop: true,
                                from: logoscale.w * rete * 1.2 + ' ' + logoscale.h * rete * 0.8 + ' ' + logoscale.d * rete,
                                to: logoscale.w * rete * 0.8 + ' ' + logoscale.h * rete * 1.2 + ' ' + logoscale.d * rete * 1
                            });
                        } else if (val.isAnime == 11) {
                            AFRAME.utils.entity.setComponentProperty(self.arData.logo, 'animation__turn1', {
                                property: 'rotation',
                                dur: 3000,
                                easing: 'linear',
                                from: '0 0 0',
                                to: '0 360 0',
                                startEvents: 'turn1'
                            });
                        } else if (val.isAnime == 12) {
                            AFRAME.utils.entity.setComponentProperty(self.arData.logo, 'animation__turn2', {
                                property: 'rotation',
                                dur: 3000,
                                easing: 'easeOutElastic',
                                elasticity: 300,
                                from: '0 0 0',
                                to: '0 360 0',
                                startEvents: 'turn2'
                            });
                        } else if (val.isAnime == 13) {
                            self.arData.logo.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));
                            var logoscale = { w: 8, h: 8, d: 2 };
                            var rete = (!val.isMp4) ? 1 : 2;
                            // 弾む
                            AFRAME.utils.entity.setComponentProperty(self.arData.logo, 'animation__pos3', {
                                property: 'position',
                                dir: 'alternate',
                                dur: 400,
                                easing: 'easeInOutQuart',
                                loop: false,
                                from: logopos.x + ' ' + logopos.y + ' ' + logopos.z,
                                to: logopos.x + ' ' + (logopos.y + (logoscale.h * rete) / 5) + ' ' + logopos.z,
                                startEvents: 'pos3'
                            });
                            AFRAME.utils.entity.setComponentProperty(self.arData.logo, 'animation__scale3', {
                                property: 'scale',
                                dir: 'alternate',
                                dur: 400,
                                easing: 'easeOutQuad',
                                loop: false,
                                from: logoscale.w * rete * 1.2 + ' ' + logoscale.h * rete * 0.8 + ' ' + logoscale.d * rete,
                                to: logoscale.w * rete * 0.8 + ' ' + logoscale.h * rete * 1.2 + ' ' + logoscale.d * rete * 1,
                                startEvents: 'scale3'
                            });
                        }
                    } else {
                        //self.arData.logo.setAttribute('rotation', AFRAME.utils.coordinates.stringify(String(objAngle) + ' 0 0'));
                        AFRAME.utils.entity.setComponentProperty(self.arData.logo, 'animation__turn0', {
                            property: 'rotation',
                            dur: 3000,
                            easing: 'easeOutElastic',
                            elasticity: 300,
                            from: '0 0 0',
                            to: '0 360 0',
                            startEvents: 'turn0'
                        });
                    }
                }

                webArViewer.scene.appendChild(self.wrap);

            } else {

                //AFRAME.utils.entity.setComponentProperty(self.arData.main, 'animation', {
                //    property: 'scale',
                //    dir: 'alternate',
                //    dur: 1,
                //    easing: 'linear',
                //    loop: false,
                //    to: wh.w + ' ' + wh.h + ' ' + 1
                //});

                var mk = '';

                // NFTマーカー
                var mWrap = document.createElement('a-nft');

                if (val.isMarkerType == 1) {

                    mWrap = null;

                    // ARマーカー
                    mWrap = document.createElement('a-marker');
                    mWrap.setAttribute('markerhandler', '');
                    mWrap.setAttribute('preset', 'custom');
                    mWrap.setAttribute('type', 'pattern');
                    mWrap.setAttribute('id', 'arMarker');

                    mk = 'pattern/p-def.patt';

                    if ((self.arg.markerList1) && (self.arg.markerList2)) {
                        mk = 'pattern/' + self.arg.markerList1 + '/p-' + self.arg.markerList2 + '.patt';
                    } else if ((self.arg.MkObjList) && (self.arg.markerList2)) {
                        mk = 'pattern/' + self.arg.MkObjList + '/p-' + self.arg.markerList2 + '.patt';
                    } else if ((self.arg.markerList) && (self.arg.markerList2)) {
                        mk = 'pattern/' + self.arg.markerList + '/p-' + self.arg.markerList2 + '.patt';
                    } else if ((self.arg.markerList)) {
                        mk = 'pattern/p-' + self.arg.markerList + '.patt';
                    }
                } else {

                    mWrap.setAttribute('markerhandler', '');
                    mWrap.setAttribute('preset', 'custom');
                    mWrap.setAttribute('type', 'nft');
                    mWrap.setAttribute('id', 'arMarker');
                    mWrap.setAttribute('smooth', 'true');
                    mWrap.setAttribute('smoothCount', '10');
                    mWrap.setAttribute('smoothTolerance', '0.01');
                    mWrap.setAttribute('smoothThreshold', '5');

                    if ((self.arg.markerList1) && (self.arg.markerList2)) {
                        mk = 'ImageDescriptors/' + self.arg.markerList1 + '/' + self.arg.markerList2 + '/' + self.arg.markerList2;
                    } else if ((self.arg.MkObjList) && (self.arg.markerList2)) {
                        mk = 'ImageDescriptors/' + self.arg.MkObjList + '/' + self.arg.markerList2 + '/' + self.arg.markerList2;
                    } else if ((self.arg.markerList) && (self.arg.markerList2)) {
                        mk = 'ImageDescriptors/' + self.arg.markerList + '/' + self.arg.markerList2 + '/' + self.arg.markerList2;
                    } else if ((self.arg.markerList)) {
                        mk = 'ImageDescriptors/' + self.arg.markerList + '/' + self.arg.markerList;
                    }
                }

                mWrap.setAttribute('url', AFRAME.utils.coordinates.stringify(rootPath + mk));
                mWrap.appendChild(self.wrap);

                webArViewer.scene.appendChild(mWrap);
                self.mWrap = mWrap;

                // ↓ rotation 切替
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
                        self.wrap.setAttribute('rotation', AFRAME.utils.coordinates.stringify('-90 0 0'));
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
            var yClickRate = val.isMarkerType == 1 ? 0.2 : 5;

            bUP.addEventListener('click', function () {
                if (!!(bAngle.classList.contains('current'))) {
                    wrapPos.y += yClockRate;
                } else {
                    wrapPos.y -= yClickRate;
                }
                self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
            });

            bDOWN.addEventListener('click', function () {
                if (!!(bAngle.classList.contains('current'))) {
                    wrapPos.y -= yClickRate;
                } else {
                    wrapPos.y += yClickRate;
                }
                self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
            });
            // ↑ 

            var yTouchRate = val.isMarkerType == 1 ? 0.02 : 2 ;

            // ↓ UPボタン長押し
            bUP.addEventListener(self.eventNames.start, e => {
                e.preventDefault();
                bUP.classList.add('active');
                timer = setInterval(() => {
                    if (!!(bAngle.classList.contains('current'))) {
                        wrapPos.y += yTouchRate;
                    } else {
                        wrapPos.y -= yTouchRate;
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
                        wrapPos.y -= yTouchRate;
                    } else {
                        wrapPos.y += yTouchRate;
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

        setTapEvents: function () {

            var self = this;
            var val = self.arData;

            if (!(val.isAnime)) {

                webArViewer.scene.addEventListener('click', function (e) {
                    if (val.path) {
                        self.arData.logo.emit('turn0');
                    }
                });

            } else {

                if (val.isAnime == 11) {
                    webArViewer.scene.addEventListener('click', function (e) {
                        if (val.path && val.isAnime == 11) {
                            self.arData.logo.emit('turn1');
                        }
                    });
                }

                if (val.isAnime == 12) {
                    webArViewer.scene.addEventListener('click', function (e) {
                        if (val.path && val.isAnime == 12) {
                            self.arData.logo.emit('turn2');
                        }
                    });
                }

                if (val.isAnime == 13) {
                    webArViewer.scene.addEventListener('click', function (e) {
                        if (val.path && val.isAnime == 13) {
                            self.arData.logo.emit('pos3');
                            self.arData.logo.emit('scale3');
                        }
                    });
                }
            }
        },

        setDiplayBtn: function (mode) {

            var self = this;
            var val = self.arData;

            document.getElementById("modeSwitch").style.display = "inline";
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

                //document.getElementById("swAngle").style.display = 'none';
                //document.getElementById("swParallel").style.display = 'none';

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

            if (val.isMarkerType == 1 || !!(val.isPV)) {
                document.getElementById("loader").style.display = 'none';
            }
        },

        positionVec3Logo: function (anime) {
            var self = this;
            var h1_2 = (self.arData.size.h / 5);
            var posy = 0;

            switch (anime) {
                case 3:
                    posy = -((self.arData.isMarkerType == 1 ? 3 : 110) / 2);
                    break;
                default:
                    posy = 0;
                    break;
            }

            if (self.arData.size.w > self.arData.size.h) {
                h1_2 = (self.arData.size.w / 2);
            }
            
            return { x: 0, y: -(h1_2) + (self.arData.isMarkerType == 1 ? 0.75 : 10) * ((self.arData.isMarkerType == 1) ? 1 : -1) + posy, z: 0 };
        },

        positionVec3: function (type, angle) {
            var self = this;
            //var h1_2 = self.arData.size.h / 2;
            var h1_2 = defaultSize.h / 2;

            //if (self.arData.size.w > self.arData.size.h) {
            //    h1_2 = (self.arData.size.w / 2);
            //}
                
            if (type === 'shadow') {
                return { x: 0, y: -(self.arData.size.h) * ((self.arData.isMarkerType == 1) ? 1 : -1), z: -h1_2 + (!!(self.arg.pv) ? defaultSize.h : 0) };
            } else {
                //if (angle == 1) {
                //    return { x: 0, y: 0, z: h1_2 * ((self.arData.isMarkerType == 1) ? -1 : 1) };
                //} else {
                //    return { x: 0, y: h1_2 * ((self.arData.isMarkerType == 1) ? -1 : 1), z: 0 };
                //}
                return { x: 0, y: h1_2 * ((self.arData.isMarkerType == 1) ? -1 : 1), z: 0 + (!!(self.arg.pv) ? defaultSize.h : 0) };
            }
        }
    };

    webArViewer.ar = ar;
    webArViewer.ar.init();

    if (!(ar.arData.isMarkerType == 1)) {
        var evant = new Event("click", { "bubbles": true, "cancelable": true });
        var bParalle = document.getElementById('swParallel');
        bParalle.dispatchEvent(evant);
    }

    webArViewer.ar.setDiplayBtn(!!(ar.arg.pv));

}());

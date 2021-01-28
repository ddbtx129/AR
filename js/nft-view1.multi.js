var webArViewer = webArViewer || {};

var videoInfo = {};
var videoState = 0;
var objecttype = "png";
var tapCount = 0;
var tapclicked = false;

var viewmode = 'marker';

(function (global) {

    document.getElementById("info1").style.display = "inline";
    webArViewer.scene = document.querySelector('a-scene');

    var defaultAngle = 0;
    var defaultPos = { x: 0, y: 0, z: 0 };
    var defaultScale = { w: 4, h: 4, d: 4 };
    var defaultwrapPos = { x: 0, y: 0, z: 0 };
    var defaultwrapScale = { w: 4, h: 4, d: 4 };
    var defaultlogoScale = { w: 8, h: 6, d: 6 };

    var objAngle = -10;
    var srcno = { obj: 1, from: 1, to: 1, length: 1 };
    var scalechange = 0;

    var getType = '';
    var objLen = 1;
    
    var ar = {

        init: function () {

            videostate = 0;

            this.setArg();
            
            if (this.setArData()) {

                this.setWrap();
                this.createModel(srcno.obj);

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

                this.wrap.setAttribute('visible', true);

                this.setTapEvents();
            }

            this.setSwitcher();

            var elem = document.getElementById("version1");
            elem.innerHTML = 'v1.0.130';

            // デバイスの方向の変化を検出したとき
            window.addEventListener('deviceorientation', function (e) {
                // e.beta：(x軸 -180 ～ 180)    e.gamma：(y軸 -90 ～ 90)   e.alpha：(z軸 0 ～ 360)
                var elem = document.getElementById("debug3");
                elem.innerHTML = "dir X: " + Number(e.beta).toFixed(1) + " Y: " + Number(e.gamma).toFixed(1) + ' Z: ' + Number(e.alpha).toFixed(1);

            });

            var loader = document.querySelector('a-assets');
            loader.addEventListener('loaded', function (e) {
                // ロード完了
                if (webArViewer.srcno.length > 1) {
                    var msg = document.querySelector('slideshow');

                    document.getElementById("slideshow").style.display = 'inline';

                    //setTimeout(function () {
                    //    document.getElementById("slideshow").style.display = 'none';
                    //}, 6000);
                }

                if (webArViewer.ar.arData.isPV && webArViewer.ar.arData.isMp4) {
                    var video = document.querySelector('#source1');
                    document.getElementById("player").style.display = 'inline';

                    videostate = 1;
                }
            });
        },

        setArg: function () {

            var self = this;
            var arg = new Array;
            arg[0] = {};

            var pair = location.search.substring(1).split('&');

            for (var i = 0; pair[i]; i++) {
                var kv = pair[i].split('=');
                arg[0][kv[0]] = decodeURIComponent(kv[1]);
            }

            // プレビューモード
            arg[0].PVList = arg[0].pv;

            // マーカー OR NFT
            arg[0].ARList = arg[0].ar && (parseInt(arg[0].ar, 10).toString());

            // 影
            arg[0].shodowList = arg[0].xs && (parseInt(arg[0].xs, 16).toString(2));
            // サイズ
            arg[0].sizeList = arg[0].wh && (parseInt(arg[0].wh, 16).toString(10));
            // 角度
            arg[0].angleList = arg[0].an && (parseInt(arg[0].an, 10).toString(2));
            // オブジェクトタイプ
            arg[0].typeList = arg[0].t;
            //// 
            //arg[0].pmList = arg[0].pmList && (parseInt(arg[0].pmList, 10).toString());

            // マーカー
            arg[0].markerList = arg[0].m;
            arg[0].markerList1 = arg[0].m1;
            arg[0].markerList2 = arg[0].m2;

            // 対象オブジェクト
            arg[0].ObjectList = arg[0].o;
            arg[0].ObjectList1 = arg[0].o1;
            arg[0].ObjectList2 = arg[0].o2;
            arg[0].ObjectList3 = !!(arg[0].o3) ? arg[0].o3 : arg[0].o2;

            // マーカー＆オブジェクト
            arg[0].MkObjList = arg[0].mo;

            // ロゴ表示
            var logo = arg[0].l && ('0000' + (parseInt(arg[0].l, 16).toString(10))).slice(-4);

            arg[0].LogoList = {};
            arg[0].LogoAnimeList = {};

            if (!!(logo)) {
                logo = (logo.match(/.{2}/g));
                arg[0].LogoList = (logo).toString().split(',');
                arg[0].LogoAnimeList = (arg[0].LogoList[1] && parseInt(arg[0].LogoList[1]));
            }

            self.arg = arg;

            var base = this.readXml('data/ren_nagase/01.xml', 'setXmlbasedata');
        },

        setArData: function () {

            var self = this;

            var assets = document.createElement('a-assets');
            assets.setAttribute('timeout', '9000');

            var arData = null;
            //var dataObj = new Array;

            objecttype = (!(self.arg[0].typeList) ? GetFileType('') : GetFileType(String(self.arg[0].typeList)));

            // データの準備
            var object = {};
            var n_object = '';
            var seq = 1;

            if (!(self.arg[0].ObjectList)) {
                seq = (Number(self.arg[0].ObjectList3) - Number(self.arg[0].ObjectList2));
                var no = Number(self.arg[0].ObjectList2);
                for (var i = 0; i <= seq; i++) {
                    var j = ((no + i) < 100) ? 2 : ((no + i).toString()).length;
                    var obj = (('0').repeat(j) + (parseInt(no + i, 10).toString())).slice(-(j));
                    object[i] = ((self.arg[0].MkObjList) && (obj) ?
                        (self.arg[0].MkObjList + '/' + obj)
                        :
                        (self.arg[0].ObjectList1 + '/' + obj));
                }
            } else {
                object[0] = (!(self.arg[0].ObjectList) ? '' : self.arg[0].ObjectList);
            }

            n_object = ((self.arg[0].MkObjList) ? (self.arg[0].MkObjList) : ((self.arg[0].ObjectList1) ? (self.arg[0].ObjectList1) : (self.arg[0].ObjectList)));

            var dataObj = { path: object[0] + '.' + String(objecttype) };

            dataObj.paths = {};

            if (seq > 1) {
                srcno.length = 0;
                for (var i = 0; i <= seq; i++) {
                    dataObj.paths[i] = object[i] + '.' + String(objecttype);
                    srcno.length += 1;
                }
            } else {
                dataObj.paths[0] = object[0] + '.' + String(objecttype);
            }

            dataObj.isPng = !!(dataObj.path || '').match(/\.png$/i);
            dataObj.isGif = !!(dataObj.path || '').match(/\.gif$/i);
            dataObj.isMp4 = !!(dataObj.path || '').match(/\.mp4$/i);
            dataObj.isGltf = !!(dataObj.path || '').match(/\.gltf$/i);
            dataObj.isPV = !!(self.arg[0].PVList);
            dataObj.isNFT = !!(self.arg[0].ARList);
            dataObj.isMarkerType = !!(self.arg[0].ARList) ? Number(self.arg[0].ARList) : 1;
            dataObj.isLogo = (!!(self.arg[0].LogoList) ? self.arg[0].LogoList[0] : '0');
            dataObj.isAnime = (!!(self.arg[0].LogoAnimeList) ? Number(self.arg[0].LogoAnimeList) : 0);
            dataObj.isShadow = self.arg[0].shodowList && !!Number(self.arg[0].shodowList);
            //dataObj.isPm = !!(self.arg[0].pmList);

            // サイズ
            self.arg[0].sizeList = String(!!(!!(self.arg[0].sizeList) && Number(self.arg[0].ar) == 0) ? self.arg[0].sizeList : GetDefaultSize((dataObj.isMarkerType == 1 ? 0 : 1), objecttype));

            var wh = SizeSplit(self.arg[0].sizeList).toString().split(',');
            var i = ((parseInt(self.arg[0].sizeList).toString(10)).length % 2 == 0) ? (parseInt(self.arg[0].sizeList).toString(10)).length : (parseInt(self.arg[0].sizeList).toString(10)).length + 1;
            //var j = (dataObj.isMarkerType == 1 ? 2 : 4);
            var j = (dataObj.isMarkerType == 1 ? 2 : 2);

            dataObj.size = { w: (Number(wh[0]) * (10 ** -((i - j) / 2))).toFixed(1), h: (Number(wh[1]) * (10 ** -((i - j) / 2))).toFixed(1) };
            defaultScale = { w: dataObj.size.w, h: dataObj.size.h, d: dataObj.size.h };

            // オブジェクトソース
            if (dataObj.path) {

                var folder = !!(dataObj.isMp4) ? 'video' : (!!(dataObj.isGltf) ? 'gltf' : 'pic');
                dataObj.path = rootPath + 'article/' + folder + '/' + dataObj.path;
                dataObj.arObj = {};

                if (!!(dataObj.isPng) || !!(dataObj.isGif)) {

                    var img = {};

                    for (var i = 0; i <= seq; i++) {
                        dataObj.paths[i] = rootPath + 'article/' + folder + '/' + dataObj.paths[i];

                        img[i] = document.createElement('img');
                        img[i].setAttribute('crossorigin', 'anonymous');
                        img[i].setAttribute('id', 'source' + (i + 1).toString());
                        img[i].setAttribute('src', dataObj.paths[i]);

                        dataObj.arObj[i] = { obj: img[i] };

                        assets.appendChild(img[i]);
                    }

                } else if (!!(dataObj.isMp4)) {

                    var video = {};
                    var audio = {};

                    for (var i = 0; i <= seq; i++) {
                        dataObj.paths[i] = rootPath + 'article/' + folder + '/' + dataObj.paths[i];

                        video[i] = document.createElement("video");
                        video[i].setAttribute("src", dataObj.paths[i]);
                        video[i].setAttribute('id', 'source' + (i + 1).toString());
                        video[i].setAttribute('preload', 'auto');
                        video[i].setAttribute('response-type', 'arraybuffer');
                        video[i].setAttribute('loop', 'true');
                        video[i].setAttribute('crossorigin', 'anonymous');
                        video[i].setAttribute('webkit-playsinline', 'webkit-playsinline');
                        video[i].setAttribute("playsinline", "");
                        video[i].setAttribute("controls", "");
                        video[i].setAttribute("autoplay", "");

                        audio[i] = document.createElement("audio");
                        audio[i].setAttribute("src", dataObj.paths[i]);
                        audio[i].setAttribute('id', 'a-source' + (i + 1).toString());
                        audio[i].setAttribute('preload', 'auto');
                        audio[i].setAttribute('response-type', 'arraybuffer');
                        audio[i].setAttribute('loop', 'true');
                        audio[i].setAttribute('crossorigin', 'anonymous');
                        audio[i].setAttribute('webkit-playsinline', 'webkit-playsinline');
                        audio[i].setAttribute("playsinline", "");
                        audio[i].setAttribute("controls", "");
                        audio[i].setAttribute("autoplay", "");

                        dataObj.arObj[i] = { obj: video[i], obj2: audio[i] };

                        assets.appendChild(video[i]);
                        assets.appendChild(audio[i]);
                    }

                } else if (dataObj.isGltf) {

                    var model = {};

                    for (var i = 0; i <= seq; i++) {
                        dataObj.paths[i] = rootPath + 'article/' + folder + '/' + dataObj.paths[i];

                        model[i] = document.createElement('a-asset-item');
                        model[i].setAttribute('crossorigin', 'anonymous');
                        model[i].setAttribute('id', 'source' + (i + 1).toString());
                        model[i].setAttribute('src', dataObj.paths[i]); 

                        dataObj.arObj[i] = { obj: model[i] };

                        assets.appendChild(model[i]);
                    }
                }

                if (dataObj.isLogo) {

                    dataObj.logopath = rootPath + 'article/gltf/' + n_object + '/' + 'logo-' + self.arg[0].LogoList[0] + '.gltf';

                    var model = document.createElement('a-asset-item');
                    model.setAttribute('crossorigin', 'anonymous');
                    model.setAttribute('id', 'logosource1');
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

            if (self.arg[0].pv) {
                swPreview.classList.add('current');
            } else {
                swMarker.classList.add('current');
            }

            swMarker.addEventListener('click', function () {
                if (!this.classList.contains('current')) {
                    location.replace(location.search.replace('&pv=1', ''));
                    videostate = 0;
                    this.setDiplayBtn(0, webArViewer.srcno.obj);
                }
            })

            swPreview.addEventListener('click', function () {
                if (!this.classList.contains('current')) {
                    location.replace(location.search + '&pv=1')
                    videostate = 0;
                    this.setDiplayBtn(1, webArViewer.srcno.obj);
                }
            })
        },

        setWrap: function () {

            var self = this;
            var basePos = AFRAME.utils.coordinates.parse(defaultwrapPos.x + ' ' + defaultwrapPos.y + ' ' + defaultwrapPos.z);
            var baseScale = AFRAME.utils.coordinates.parse(defaultwrapScale.w + ' ' + defaultwrapScale.h + ' ' + defaultwrapScale.d);

            //if (self.arData.isMarkerType == 1) {
            //    self.wrap = document.createElement('a-entity');
            //} else {
            //    self.wrap = document.createElement('a-box');
            //}
            self.wrap = document.createElement('a-entity');
            self.wrap.setAttribute('id', 'base');
            self.wrap.setAttribute('scale', AFRAME.utils.coordinates.stringify(baseScale));
            self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(basePos));
            self.wrap.setAttribute('rotation', '0 0 0');
            self.wrap.setAttribute('src', rootPath + 'asset/plane.png');
            self.wrap.setAttribute('material', 'transparent: true, opacity: 0');
            self.wrap.setAttribute('style', 'z-index: 5');
            self.wrap.setAttribute('visible', false);

            self.arData.wrap = self.wrap;
        },

        createModel: function (objno) {

            var self = this;
            var val = self.arData;

            if (!val.path) {
                return;
            }

            var srcname = '#source' + (objno).toString();

            if (val.isShadow) {

                var shadow = document.createElement('a-image');

                shadow.setAttribute('id', 'shadow');
                shadow.setAttribute('position', AFRAME.utils.coordinates.stringify(self.positionVec3('shadow')));
                shadow.setAttribute('rotation', '-90 0 0');
                shadow.setAttribute('style', 'z-index: 2');

                AFRAME.utils.entity.setComponentProperty(shadow, 'geometry', {
                    primitive: 'plane', height: defaultScale.h, width: defaultScale.w
                });

                AFRAME.utils.entity.setComponentProperty(shadow, 'material', {
                    shader: val.isGif ? 'gif' : 'flat', npot: true, src: srcname, transparent: true, alphaTest: 0.1,
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
            main.setAttribute('position', AFRAME.utils.coordinates.stringify(defaultPos));

            if (!val.isGif) {

                main.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));

                if (!val.isGltf) {

                    main.setAttribute('width', AFRAME.utils.coordinates.stringify(defaultScale.w));
                    main.setAttribute('height', AFRAME.utils.coordinates.stringify(defaultScale.h));
                    main.setAttribute('style', 'z-index: 3');

                    if (val.isMp4) {
                        main.setAttribute('play', 'true');
                    }

                    AFRAME.utils.entity.setComponentProperty(main, 'geometry', {
                        primitive: 'plane', height: defaultScale.h, width: defaultScale.w, segmentsHeight: 1, segmentsWidth: 1
                    });

                    AFRAME.utils.entity.setComponentProperty(main, 'material', {
                        shader: val.isGif ? 'gif' : 'standard', npot: true, src: srcname, displacementMap: null, displacementBias: -0.5,
                        side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                    });
                } else {
                    main.setAttribute('scale', AFRAME.utils.coordinates.stringify(defaultScale));
                }

            } else {
                main.setAttribute('rotation', '-30 0 0');
            }

            self.arData.main = main;

            if (val.isLogo) {

                var logo = document.createElement('a-entity');

                var logopos = self.positionVec3Logo(Number(val.isAnime));
                var rete = (!val.isMp4) ? 1 : 2;

                logo.setAttribute('id', 'logo');
                logo.setAttribute('position', AFRAME.utils.coordinates.stringify(logopos));
                logo.setAttribute('scale', (String(defaultlogoScale.w * rete) + ' ' + String(defaultlogoScale.h * rete) + ' ' + String(defaultlogoScale.d * rete)));
                logo.setAttribute('gltf-model', '#logosource1');
                main.setAttribute('style', 'z-index: 4');

                self.arData.logo = logo;
            }
        },

        createAnimation: function (){

            var self = this;
            var val = self.arData;

            if (!!val.isLogo) {

                var logopos = self.positionVec3Logo(Number(val.isAnime));
                var rete = (!val.isMp4) ? 1 : 2;

                self.arData.logo.setAttribute('position', AFRAME.utils.coordinates.stringify(logopos));

                // 反射
                //AFRAME.utils.entity.setComponentProperty(logo, 'geometry', {
                //    primitive: 'box', height: defaultlogoScale, width: defaultlogoScale, depth: defaultlogoScale, segmentsHeight: 1, segmentsWidth: 1
                //});
                //AFRAME.utils.entity.setComponentProperty(logo, 'material', {
                //    shader: 'standard', npot: true, src: '#logosource', displacementMap: null, displacementBias: -0.5,
                //    side: 'double', transparent: true, alphaTest: 0.1, metalness: (!!(val.isReflect) ? 1 : 0), roughness: (!!(val.isReflect) ? 0.3 : 0.5)
                //});

                if (!!val.isAnime) {

                    self.arData.logo.setAttribute('radius', (defaultlogoScale.w / 2));

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
                        // 弾む
                        AFRAME.utils.entity.setComponentProperty(self.arData.logo, 'animation__pos', {
                            property: 'position',
                            dir: 'alternate',
                            dur: 400,
                            easing: 'easeInOutQuart',
                            loop: true,
                            from: logopos.x + ' ' + logopos.y + ' ' + logopos.z,
                            to: logopos.x + ' ' + (logopos.y + (defaultlogoScale.h * rete) / 5) + ' ' + logopos.z
                        });
                        AFRAME.utils.entity.setComponentProperty(self.arData.logo, 'animation__scale', {
                            property: 'scale',
                            dir: 'alternate',
                            dur: 400,
                            easing: 'easeOutQuad',
                            loop: true,
                            from: defaultlogoScale.w * rete * 1.2 + ' ' + defaultlogoScale.h * rete * 0.8 + ' ' + defaultlogoScale.d * rete,
                            to: defaultlogoScale.w * rete * 0.8 + ' ' + defaultlogoScale.h * rete * 1.2 + ' ' + defaultlogoScale.d * rete * 1
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
                        // 弾む
                        AFRAME.utils.entity.setComponentProperty(self.arData.logo, 'animation__pos3', {
                            property: 'position',
                            dir: 'alternate',
                            dur: 400,
                            easing: 'easeInOutQuart',
                            loop: false,
                            from: logopos.x + ' ' + (logopos.y - + (defaultlogoScale.h * rete) / 5) + ' ' + logopos.z,
                            to: logopos.x + ' ' + logopos.y + ' ' + logopos.z,
                            startEvents: 'pos3'
                        });
                        AFRAME.utils.entity.setComponentProperty(self.arData.logo, 'animation__scale3', {
                            property: 'scale',
                            dir: 'alternate',
                            dur: 400,
                            easing: 'easeOutQuad',
                            loop: false,
                            from: defaultlogoScale.w * rete * 1.2 + ' ' + defaultlogoScale.h * rete * 0.8 + ' ' + defaultlogoScale.d * rete,
                            to: defaultlogoScale.w * rete * 0.8 + ' ' + defaultlogoScale.h * rete * 1.2 + ' ' + defaultlogoScale.d * rete * 1,
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
        },

        objectDataVal: function (oScale, oPosition) {

            if (oScale != null) {
                var elem = document.getElementById("debug1");
                elem.innerHTML = "scale: " + Number(oScale).toFixed(1);
            }

            if (oPosition != null) {
                var elem = document.getElementById("debug2");
                elem.innerHTML = "pos X: " + Number(oPosition.x).toFixed(1) + " Y: " + Number(oPosition.y).toFixed(1) + ' Z: ' + Number(oPosition.z).toFixed(1);
            }
        },

        addScene: function() {

            var self = this;
            var val = self.arData;

            self.arData.shadow && self.wrap.appendChild(self.arData.shadow);
            self.arData.main && self.wrap.appendChild(self.arData.main);

            if (val.isLogo) {
                self.arData.logo && self.wrap.appendChild(self.arData.logo);
            }
        },

        setScene: function () {

            var self = this;
            var val = self.arData;

            this.addScene();

            if (!val.isMp4) {
                document.getElementById("player").style.display = 'none';
            }

            var bAngle = document.getElementById('swAngle');
            var bParalle = document.getElementById('swParallel');

            if (!!bParalle.classList.remove('current')) {
                bParalle.classList.remove('current');
            }

            var arGifRotation = '-30 0 0';
            var prevPageY;
            var zoomRateH = defaultwrapScale.h;
            var wrapZoom = 1;

            bAngle.classList.add('current');

            var wrapPos = AFRAME.utils.coordinates.parse(defaultwrapPos.x + ' ' + defaultwrapPos.y + ' ' + defaultwrapPos.z);

            if (self.arg[0].pv) {
                
                viewmode = 'pv';

                document.getElementById("swAngle").style.display = 'none';
                document.getElementById("swParallel").style.display = 'none';

                wrapPos.x -= 0;
                wrapPos.y -= ((val.isMp4) ? 0 : 1.5);
                wrapPos.z -= defaultwrapScale.h * 1.5;
                
                //var pvAngle = 0;
                var pvAngle = -5;

                wrapZoom = 0.5;
                zoomRateH = defaultwrapScale.h * wrapZoom;
                AFRAME.utils.entity.setComponentProperty(self.wrap, 'animation', {
                    property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRateH + ' ' + zoomRateH + ' ' + zoomRateH
                });

                self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                self.wrap.setAttribute('rotation', AFRAME.utils.coordinates.stringify(String(pvAngle) + ' 0 0'));

                webArViewer.scene.appendChild(self.wrap);

            } else {

                document.getElementById("swAngle").style.display = 'inline';
                document.getElementById("swParallel").style.display = 'inline';

                var mk = '';

                // NFTマーカー
                var mWrap = document.createElement('a-nft');

                if (val.isMarkerType == 1) {

                    viewmode = 'marker';

                    wrapZoom = 0.625;
                    zoomRateH = zoomRateH * wrapZoom;

                    defaultwrapPos.y = -5;

                    mWrap = null;

                    // ARマーカー
                    mWrap = document.createElement('a-marker');
                    mWrap.setAttribute('markerhandler', '');
                    mWrap.setAttribute('preset', 'custom');
                    mWrap.setAttribute('type', 'pattern');
                    mWrap.setAttribute('id', 'arMarker');

                    mk = 'pattern/p-def.patt';

                    if ((self.arg[0].markerList1) && (self.arg[0].markerList2)) {
                        mk = 'pattern/' + self.arg[0].markerList1 + '/p-' + self.arg[0].markerList2 + '.patt';
                    } else if ((self.arg[0].MkObjList) && (self.arg[0].markerList2)) {
                        mk = 'pattern/' + self.arg[0].MkObjList + '/p-' + self.arg[0].markerList2 + '.patt';
                    } else if ((self.arg[0].markerList) && (self.arg[0].markerList2)) {
                        mk = 'pattern/' + self.arg[0].markerList + '/p-' + self.arg[0].markerList2 + '.patt';
                    } else if ((self.arg[0].markerList)) {
                        mk = 'pattern/p-' + self.arg[0].markerList + '.patt';
                    }

                } else {

                    viewmode = 'nft';

                    wrapZoom = 30;
                    zoomRateH = zoomRateH * wrapZoom;

                    mWrap.setAttribute('markerhandler', '');
                    mWrap.setAttribute('preset', 'custom');
                    mWrap.setAttribute('type', 'nft');
                    mWrap.setAttribute('id', 'arMarker');
                    mWrap.setAttribute('smooth', 'true');
                    mWrap.setAttribute('smoothCount', '10');
                    mWrap.setAttribute('smoothTolerance', '0.01');
                    mWrap.setAttribute('smoothThreshold', '5');

                    if ((self.arg[0].markerList1) && (self.arg[0].markerList2)) {
                        mk = 'ImageDescriptors/' + self.arg[0].markerList1 + '/' + self.arg[0].markerList2 + '/' + self.arg[0].markerList2;
                    } else if ((self.arg[0].MkObjList) && (self.arg[0].markerList2)) {
                        mk = 'ImageDescriptors/' + self.arg[0].MkObjList + '/' + self.arg[0].markerList2 + '/' + self.arg[0].markerList2;
                    } else if ((self.arg[0].markerList) && (self.arg[0].markerList2)) {
                        mk = 'ImageDescriptors/' + self.arg[0].markerList + '/' + self.arg[0].markerList2 + '/' + self.arg[0].markerList2;
                    } else if ((self.arg[0].markerList)) {
                        mk = 'ImageDescriptors/' + self.arg[0].markerList + '/' + self.arg[0].markerList;
                    } else if ((self.arg[0].MkObjList)) {
                        mk = 'ImageDescriptors/' + self.arg[0].MkObjList + '/01';
                    }
                }

                AFRAME.utils.entity.setComponentProperty(self.wrap, 'animation', {
                    property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRateH + ' ' + zoomRateH + ' ' + zoomRateH
                });

                wrapPos = defaultwrapPos;
                self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));

                mWrap.setAttribute('url', AFRAME.utils.coordinates.stringify(rootPath + mk));
                
                mWrap.appendChild(self.wrap);
                webArViewer.scene.appendChild(mWrap);

                self.mWrap = mWrap;

                // ↓ rotation 切替 Event
                if (!(self.arData.isMarkerType == 1)) {
                    self.wrap.setAttribute('rotation', AFRAME.utils.coordinates.stringify('-90 0 0'));
                    self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                    if (!bParalle.classList.contains('current')) {
                        bParalle.classList.add('current');
                        bAngle.classList.remove('current');   
                    }
                }

                bAngle.addEventListener('click', function () {
                    if (!bAngle.classList.contains('current')) {
                        webArViewer.ar.arData.wrapPos = webArViewer.defaultwrapPos;
                        webArViewer.ar.arData.zoomRateH = webArViewer.defaultwrapScale.h * wrapZoom;
                        AFRAME.utils.entity.setComponentProperty(self.wrap, 'animation', {
                            property: 'scale', dur: 5, easing: 'linear', loop: false, to: webArViewer.ar.arData.zoomRateH + ' ' + webArViewer.ar.arData.zoomRateH + ' ' + webArViewer.ar.arData.zoomRateH
                        });
                        self.wrap.setAttribute('rotation', AFRAME.utils.coordinates.stringify((objAngle).toString() + ' 0 0'));
                        self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(webArViewer.ar.arData.wrapPos));
                        bAngle.classList.add('current');
                        bParalle.classList.remove('current');   
                        webArViewer.ar.objectDataVal(webArViewer.ar.arData.zoomRateH, webArViewer.ar.arData.wrapPos);
                    }
                });

                bParalle.addEventListener('click', function () {
                    if (!bParalle.classList.contains('current')) {
                        webArViewer.ar.arData.wrapPos = webArViewer.defaultwrapPos;
                        webArViewer.ar.arData.zoomRateH = webArViewer.defaultwrapScale.h * wrapZoom;
                        AFRAME.utils.entity.setComponentProperty(self.wrap, 'animation', {
                            property: 'scale', dur: 5, easing: 'linear', loop: false, to: webArViewer.ar.arData.zoomRateH + ' ' + webArViewer.ar.arData.zoomRateH + ' ' + webArViewer.ar.arData.zoomRateH
                        });
                        self.wrap.setAttribute('rotation', AFRAME.utils.coordinates.stringify('-90 0 0'));
                        self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(webArViewer.ar.arData.wrapPos));
                        bParalle.classList.add('current');
                        bAngle.classList.remove('current');
                        webArViewer.ar.objectDataVal(webArViewer.ar.arData.zoomRateH, webArViewer.ar.arData.wrapPos);
                    }
                });
                // ↑
            }

            if (!!val.isLogo) {
                this.createAnimation();
            }

            // 拡大・縮小
            webArViewer.scene.addEventListener(self.eventNames.start, function (e) {
                var event = e.changedTouches ? e.changedTouches[0] : e;
                scalechange = 0;
                prevPageY = event.pageY;    // 縦軸 or 前後軸
            });

            webArViewer.scene.addEventListener(self.eventNames.move, function (e) {
                var event = e.changedTouches ? e.changedTouches[0] : e;
                if (prevPageY) {
                    tapclicked = !!(tapCount = scalechange);
                    scalechange = 1;

                    if ((webArViewer.ar.arData.zoomRateH + (prevPageY - event.pageY) / webArViewer.scene.clientHeight / 5) > 0.1) {
                        var rate = ((prevPageY - event.pageY) / webArViewer.scene.clientHeight / 5) * wrapZoom;
                        webArViewer.ar.arData.zoomRateH += rate;
                        AFRAME.utils.entity.setComponentProperty(self.wrap, 'animation', {
                            property: 'scale', dur: 5, easing: 'linear', loop: false, to: webArViewer.ar.arData.zoomRateH + ' ' + webArViewer.ar.arData.zoomRateH + ' ' + webArViewer.ar.arData.zoomRateH
                        });
                        var elem = document.getElementById("debug1");
                        elem.innerHTML = "Scale: " + Number(webArViewer.ar.arData.zoomRateH).toFixed(5);
                    }
                } 
            });

            webArViewer.scene.addEventListener(self.eventNames.end, function (e) {
                scalechange = 0;
                prevPageY= null;
            });

            // ↓ 上下移動ボタン押下
            var bUP = document.getElementById('swUp');
            var bDOWN = document.getElementById('swDown');
            var timer;
            var yClickRate = ((!!(val.isMarkerType == 1) || !!(self.arg[0].pv)) ? 0.2 : 5);

            bUP.addEventListener('click', function () {
                webArViewer.ar.arData.wrapPos = AFRAME.utils.coordinates.parse(self.wrap.getAttribute('position'));
                if (!!(bAngle.classList.contains('current'))) {
                    webArViewer.ar.arData.wrapPos.y += yClickRate;
                } else {
                    webArViewer.ar.arData.wrapPos.z -= yClickRate;
                }
                self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(webArViewer.ar.arData.wrapPos));
                webArViewer.ar.objectDataVal(webArViewer.ar.arData.zoomRateH, webArViewer.ar.arData.wrapPos);
            });

            bDOWN.addEventListener('click', function () {
                webArViewer.ar.arData.wrapPos = AFRAME.utils.coordinates.parse(self.wrap.getAttribute('position'));
                if (!!(bAngle.classList.contains('current'))) {
                    webArViewer.ar.arData.wrapPos.y -= yClickRate;
                } else {
                    webArViewer.ar.arData.wrapPos.z += yClickRate;
                }
                self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(webArViewer.ar.arData.wrapPos));
                webArViewer.ar.objectDataVal(webArViewer.ar.arData.zoomRateH, webArViewer.ar.arData.wrapPos);
            });
            // ↑ 

            var yTouchRate = ((!!(val.isMarkerType == 1) || !!(self.arg[0].pv)) ? 0.02 : 2);

            // ↓ UPボタン長押し
            bUP.addEventListener(self.eventNames.start, e => {
                e.preventDefault();
                bUP.classList.add('active');
                timer = setInterval(() => {
                    webArViewer.ar.arData.wrapPos = AFRAME.utils.coordinates.parse(self.wrap.getAttribute('position'));
                    if (!!(bAngle.classList.contains('current'))) {
                        webArViewer.ar.arData.wrapPos.y += yTouchRate;
                    } else {
                        webArViewer.ar.arData.wrapPos.z -= yTouchRate;
                    }
                    self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(webArViewer.ar.arData.wrapPos));
                    webArViewer.ar.objectDataVal(webArViewer.ar.arData.zoomRateH, webArViewer.ar.arData.wrapPos);
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
                    webArViewer.ar.arData.wrapPos = AFRAME.utils.coordinates.parse(self.wrap.getAttribute('position'));
                    if (!!(bAngle.classList.contains('current'))) {
                        webArViewer.ar.arData.wrapPos.y -= yTouchRate;
                    } else {
                        webArViewer.ar.arData.wrapPos.z += yTouchRate;
                    }
                    self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(webArViewer.ar.arData.wrapPos));
                    webArViewer.ar.objectDataVal(webArViewer.ar.arData.zoomRateH, webArViewer.ar.arData.wrapPos);
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

            this.objectDataVal(zoomRateH, wrapPos);

            webArViewer.ar.arData.wrapPos = wrapPos;
            webArViewer.ar.arData.zoomRateH = zoomRateH;
        },

        resetScene: function () {

            var self = this;
            var val = self.arData;

            this.addScene();

            if (!val.isMp4) {
                document.getElementById("player").style.display = 'none';
            }

            if (!!val.isLogo) {
                this.createAnimation();
            }

            this.objectDataVal(webArViewer.ar.arData.zoomRateH, webArViewer.ar.arData.wrapPos);
        },

        setTapEvents: function () {

            var self = this;
            var val = self.arData;
            var elem = document.getElementById("version1");
            var timer = 350;

            webArViewer.scene.addEventListener(self.eventNames.start, function (e) {
                
                ++tapCount;
                
                if (tapclicked && tapCount > 0) {

                    var objNo = '';

                    setTimeout(function () {
                        if (tapclicked && tapCount == 2 && !(scalechange)) {
                            tapclicked = false;
                            objNo = ((webArViewer.srcno.obj + 1) <= webArViewer.srcno.length) ? webArViewer.srcno.obj + 1 : 1;
                            switchObject(e, objNo);
                            return;
                        }
                        if (tapclicked && tapCount >= 3 && !(scalechange)) {
                            tapclicked = false;
                            objNo = ((webArViewer.srcno.obj - 1) > 0) ? webArViewer.srcno.obj - 1 : webArViewer.srcno.length;
                            switchObject(e, objNo);
                            return;
                        }
                    }, timer);
                }

                tapclicked = true;

                setTimeout(function () {

                    if (tapclicked && tapCount == 1 && !(scalechange)) {

                        e.preventDefault();

                        if (!(val.isAnime)) {
                                if (!!(val.isLogo)) {
                                    if (val.path) {
                                        self.arData.logo.emit('turn0');
                                    }
                            }
                        } else {
                            if (val.isAnime == 11) {
                                if (val.path && val.isAnime == 11) {
                                    self.arData.logo.emit('turn1');
                                }
                            }
                            if (val.isAnime == 12) {
                                if (val.path && val.isAnime == 12) {
                                    self.arData.logo.emit('turn2');
                                }
                            }
                            if (val.isAnime == 13) {
                                if (val.path && val.isAnime == 13) {
                                    self.arData.logo.emit('pos3');
                                    self.arData.logo.emit('scale3');
                                }
                            }
                        }
                    }
                    tapCount = 0;
                    tapclicked = false;
                }, 750);

            });

            var slideinfo = document.getElementById("slideshow");
            slideinfo.addEventListener(self.eventNames.start, function (e) {
                document.getElementById("slideshow").style.display = 'none';
            });

            function switchObject(e, fileno) {

                e.preventDefault();

                if (webArViewer.srcno.length == 1) {
                    return;
                }

                if (!!(webArViewer.ar.arData.isMp4)) {
                    return;
                }

                // ビューポートの変更(ズーム)を防止
                e.preventDefault();

                var wrap = document.getElementById('base');
                var shadow = document.getElementById('shadow');
                if (shadow != null) {
                    shadow.remove();
                }
                var main = document.getElementById('main');
                if (main != null) {
                    main.remove();
                }
                var logo = document.getElementById('logo');
                if (logo != null) {
                    logo.remove();
                }

                webArViewer.srcno.obj = fileno;
                webArViewer.ar.createModel(webArViewer.srcno.obj);
                webArViewer.ar.resetScene();

                tapCount = 0;
                tapclicked = false;
            };
        },

        setCameraEvents: function (){


        },

        setDiplayBtn: function (mode, objno) {

            var self = this;
            var val = self.arData;

            document.getElementById("debug1").style.display = "inline";
            document.getElementById("debug2").style.display = "inline";

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
                } else {
                    document.getElementById("swAngle").style.display = 'inline';
                    document.getElementById("swParallel").style.display = 'inline';

                    document.getElementById("player").style.display = 'none';
                }
            }

            if (val.isMarkerType == 1 || !!(val.isPV)) {
                document.getElementById("arloader").style.display = 'none';
            }
        },

        positionVec3Logo: function (anime) {
            var self = this;
            var h1_2 = (self.arData.size.h / 5);
            var margin = ((self.arData.isMp4) ? 0.25 : 0);

            return { x: 0, y: -h1_2 - margin, z: 0 };
        },

        positionVec3: function (type, angle) {
            var self = this;
            var h1 = self.arData.size.h;
            var h1_2 = self.arData.size.h / 2;

            var i = (!!(self.arg[0].pv) ? h1_2 : (!!(self.arg[0].isMarkerType == 1) ? -h1 * 5 : 0));

            if (type === 'shadow') {
                return { x: 0, y: 0, z: -h1_2 };
            } else {
                return { x: 0, y: h1_2, z: 0 };
            }
        },

        readXml: function (filenm, fncnm) {
            var xmldata;
            var XMLHR = new XMLHttpRequest();
            XMLHR.onreadystatechange = function () {
                if (ＸＭＬＨＲ.readyState == 4 && ＸＭＬＨＲ.status == 200) {
                    var reader = XMLHR.responseXML;
                    // ＸＭＬファイルではresponseTextではなくresponseXML
                    var fnc = new Function("arg", "return " + fncnm + "(arg)");
                    xmldata = fnc(reader);
                }
            }
            XMLHR.open("GET", filenm, true);
            XMLHR.send(null);

            return xmldata; 
        },

        setXmlbasedata: function (tabelnm) {
            var base = {};

            var ed = new Array();
            var ar = new Array();
            var pv = new Array();

            var baseD = tabelnm.getElementsByTagName("basedata");
            var cEd = tabelnm.getElementsByTagName("ed");
            var cAr = tabelnm.getElementsByTagName("ar");
            var cPv = tabelnm.getElementsByTagName("pv");

            var rows = baseD.length;
            for (var i = 0; i < rows; i++) {
                ed[i] = ed[i].childNodes[0].nodeValue;
                ar[i] = ar[i].childNodes[0].nodeValue;
                pv[i] = pv[i].childNodes[0].nodeValue;
            }

            base.rows = rows;
            base.ed = ed;
            base.ar = ar;
            base.pv = pv;

            return base;
        },

        setXmlpcsdata: function (tabelnm) {
            var pcs = {};

            var m = new Array();
            var m1 = new Array();
            var m2 = new Array();
            var mo = new Array();
            var t = new Array();
            var xs = new Array();
            var an = new Array();
            var wh = new Array();
            var o = new Array();
            var o1 = new Array();
            var o2 = new Array();
            var o3 = new Array();
            var l = new Array();

            var pcsD = tabelnm.getElementsByTagName("pcsdata");
            var cM = tabelnm.getElementsByTagName("m");
            var cM1 = tabelnm.getElementsByTagName("m1");
            var cM2 = tabelnm.getElementsByTagName("m2");
            var cMo = tabelnm.getElementsByTagName("mo");
            var cXs = tabelnm.getElementsByTagName("xs");
            var cWh = tabelnm.getElementsByTagName("wh");
            var cO = tabelnm.getElementsByTagName("o");
            var cO1 = tabelnm.getElementsByTagName("o1");
            var cO2 = tabelnm.getElementsByTagName("o2");
            var cO3 = tabelnm.getElementsByTagName("o3");
            var cO3 = tabelnm.getElementsByTagName("l");

            var rows = pcsD.length;
            for (var i = 0; i < rows; i++) {
                m[i] = m[i].childNodes[0].nodeValue;
                m1[i] = m1[i].childNodes[0].nodeValue;
                m2[i] = m2[i].childNodes[0].nodeValue;
                mo[i] = mo[i].childNodes[0].nodeValue;
                t[i] = t[i].childNodes[0].nodeValue;
                an[i] = an[i].childNodes[0].nodeValue;
                wh[i] = wh[i].childNodes[0].nodeValue;
                o[i] = o[i].childNodes[0].nodeValue;
                o1[i] = o1[i].childNodes[0].nodeValue;
                o2[i] = o2[i].childNodes[0].nodeValue;
                o3[i] = o3[i].childNodes[0].nodeValue;
                l[i] = l[i].childNodes[0].nodeValue;
            }

            pcs.rows = rows;
            pcs.m = m;
            pcs.m1 = m1;
            pcs.m2 = m2;
            pcs.mo = m0;
            pcs.t = t;
            pcs.xs = xs;
            pcs.an = an;
            pcs.wh = wh;
            pcs.o = o;
            pcs.o1 = o1;
            pcs.o2 = o2;
            pcs.o3 = o3;
            pcs.l = l;

            return pcs;
        }
};

    webArViewer.ar = ar;
    webArViewer.ar.init();
    webArViewer.ar.setDiplayBtn(!!(ar.arg[0].pv), srcno.obj);

    webArViewer.srcno = srcno;

    webArViewer.defaultAngle = defaultAngle;
    webArViewer.defaultPos = defaultPos;
    webArViewer.defaultScale = defaultScale;
    webArViewer.defaultwrapPos = defaultwrapPos;
    webArViewer.defaultwrapScale = defaultwrapScale;
    webArViewer.defaultlogoScale = defaultlogoScale;

}());

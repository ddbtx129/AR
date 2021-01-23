var webArViewer = webArViewer || {};

var videoInfo = {};
var videoState = 0;
var objecttype = "png";
var tapCount = 0;

(function (global) {

    document.getElementById("info1").style.display = "inline";
    webArViewer.scene = document.querySelector('a-scene');

    var defaultAngle = 0;
    var defaultPos = { x: 0, y: 0, z: 0 };
    var defaultScale = { w: 4, h: 4, d: 4 };
    var defaultwrapPos = { x: 0, y: 0, z: 0 };
    var defaultwrapScale = { w: 4, h: 4, d: 4 };
    var defaultlogoScale = { w: 8, h: 6, d: 6 };

    var objAngle = 0;
    var SizeRate = 20;
    var srcno = { obj: 1, from: 1, to: 1, length: 1 };
    
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
                this.switchObject();
            }

            this.setSwitcher();

            var elem = document.getElementById("version1");
            elem.innerHTML = '1.0.121';
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

            arg.pmList = arg.pmList && (parseInt(arg.pmList, 10).toString());

            // マーカー
            arg.markerList = arg.m;
            arg.markerList1 = arg.m1;
            arg.markerList2 = arg.m2;

            // 対象オブジェクト
            arg.ObjectList = arg.o;
            arg.ObjectList1 = arg.o1;
            arg.ObjectList2 = arg.o2;
            arg.ObjectList3 = !!(arg.o3) ? arg.o3 : arg.o2;

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
            var object = {};
            var n_object = '';
            var seq = 1;

            if (!(self.arg.ObjectList)) {
                seq = (Number(self.arg.ObjectList3) - Number(self.arg.ObjectList2));
                var no = Number(self.arg.ObjectList2);
                for (var i = 0; i <= seq; i++) {
                    var obj = (('0').repeat((self.arg.ObjectList2).length) + (parseInt(no + i, 10).toString())).slice(-((self.arg.ObjectList2).length));
                    //object[0] = ((self.arg.MkObjList) && (self.arg.ObjectList2) ?
                    //    (self.arg.MkObjList + '/' + self.arg.ObjectList2)
                    //    :
                    //    (self.arg.ObjectList1 + '/' + self.arg.ObjectList2));
                    object[i] = ((self.arg.MkObjList) && (obj) ?
                        (self.arg.MkObjList + '/' + obj)
                        :
                        (self.arg.ObjectList1 + '/' + obj));
                }
            } else {
                object[0] = (!(self.arg.ObjectList) ? '' : self.arg.ObjectList);
            }

            n_object = ((self.arg.MkObjList) ? (self.arg.MkObjList) : ((self.arg.ObjectList1) ? (self.arg.ObjectList1) : (self.arg.ObjectList)));

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

            dataObj.isPV = !!(self.arg.PVList);
            dataObj.isNFT = !!(self.arg.ARList);
            dataObj.isMarkerType = !!(self.arg.ARList) ? Number(self.arg.ARList) : 2;

            dataObj.isLogo = (!!(self.arg.LogoList) ? self.arg.LogoList[0] : '0');
            dataObj.isAnime = (!!(self.arg.LogoAnimeList) ? Number(self.arg.LogoAnimeList) : 0);

            dataObj.isShadow = self.arg.shodowList && !!Number(self.arg.shodowList);

            dataObj.isPm = !!(self.arg.pmList);

            self.arg.sizeList = String(!!(!!(self.arg.sizeList) && Number(self.arg.ar) == 0) ? self.arg.sizeList : GetDefaultSize((dataObj.isMarkerType == 1 ? 0 : 1), objecttype));

            var wh = SizeSplit(self.arg.sizeList).toString().split(',');

            var i = ((parseInt(self.arg.sizeList).toString(10)).length % 2 == 0) ? (parseInt(self.arg.sizeList).toString(10)).length : (parseInt(self.arg.sizeList).toString(10)).length + 1;
            //var j = (dataObj.isMarkerType == 1 ? 2 : 4);
            var j = (dataObj.isMarkerType == 1 ? 2 : 2);

            dataObj.size = { w: (Number(wh[0]) * (10 ** -((i - j) / 2))).toFixed(1), h: (Number(wh[1]) * (10 ** -((i - j) / 2))).toFixed(1) };
            //defaultScale = { w: (Number(wh[0]) * (10 ** -((i - j) / 2))).toFixed(1), h: (Number(wh[1]) * (10 ** -((i - j) / 2))).toFixed(1) };
            defaultScale = { w: dataObj.size.w, h: dataObj.size.h, d: dataObj.size.h };

            if (dataObj.path) {

                var folder = !!(dataObj.isMp4) ? 'video' : (!!(dataObj.isGltf) ? 'gltf' : 'pic');
                dataObj.path = rootPath + 'article/' + folder + '/' + dataObj.path;
                dataObj.arObj = {};

                if (!!(dataObj.isPng) || !!(dataObj.isGif)) {
                    var img = {};

                    //if (seq > 1) {
                    //    var img = document.createElement('img');
                    //    img.setAttribute('crossorigin', 'anonymous');
                    //    img.setAttribute('class', 'arObjectSrc1');
                    //    img.setAttribute('id', 'source1');
                    //    img.setAttribute('src', dataObj.path);

                    //    dataObj.img = img;

                    //    assets.appendChild(img);
                    //} else {
                    for (var i = 0; i <= seq; i++) {
                        dataObj.paths[i] = rootPath + 'article/' + folder + '/' + dataObj.paths[i];

                        img[i] = document.createElement('img');
                        img[i].setAttribute('crossorigin', 'anonymous');
                        img[i].setAttribute('id', 'source' + (i + 1).toString());
                        img[i].setAttribute('src', dataObj.paths[i]);

                        dataObj.arObj[i] = { obj: img[i] };

                        assets.appendChild(img[i]);
                    }
                    //}
                } else if (!!(dataObj.isMp4)) {
                    var video = {};
                    var audio = {};

                    //var video = document.createElement("video");
                    //video.setAttribute("src", dataObj.path);
                    //video.setAttribute('class', 'arObjectSrc1');
                    //video.setAttribute('id', 'source1');
                    //video.setAttribute('preload', 'auto');
                    //video.setAttribute('response-type', 'arraybuffer');
                    //video.setAttribute('loop', 'true');
                    //video.setAttribute('crossorigin', 'anonymous');
                    //video.setAttribute('webkit-playsinline', 'webkit-playsinline');
                    //video.setAttribute("playsinline", "");
                    //video.setAttribute("controls", "");
                    //video.setAttribute("autoplay", "");

                    //var audio = document.createElement("audio");
                    //audio.setAttribute("src", dataObj.path);
                    //audio.setAttribute('class', 'arObjectSrc2');
                    //audio.setAttribute('id', 'source2');
                    //audio.setAttribute('preload', 'auto');
                    //audio.setAttribute('response-type', 'arraybuffer');
                    //audio.setAttribute('loop', 'true');
                    //audio.setAttribute('crossorigin', 'anonymous');
                    //audio.setAttribute('webkit-playsinline', 'webkit-playsinline');
                    //audio.setAttribute("playsinline", "");
                    //audio.setAttribute("controls", "");
                    //audio.setAttribute("autoplay", "");

                    //dataObj.video = video;
                    //dataObj.audio = audio;

                    //assets.appendChild(video);
                    //assets.appendChild(audio);

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

                        //dataObj.video = video[i];
                        //dataObj.audio = audio[i];
                        dataObj.arObj[i] = { obj: video[i], obj2: audio[i] };

                        assets.appendChild(video[i]);
                        assets.appendChild(audio[i]);
                    }

                } else if (dataObj.isGltf) {
                    var model = {};
                    //var model = document.createElement('a-asset-item');
                    //model.setAttribute('crossorigin', 'anonymous');
                    //model.setAttribute('class', 'arObjectSrc1');
                    //model.setAttribute('id', 'source1');
                    //model.setAttribute('src', dataObj.path);

                    //assets.appendChild(model);

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

                    dataObj.logopath = rootPath + 'article/gltf/' + n_object + '/' + 'logo-' + self.arg.LogoList[0] + '.gltf';

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

            if (self.arg.pv) {
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
            //var base = self.arg.base ? decodeURI(self.arg.base) : AFRAME.utils.coordinates.stringify(self.positionVec3('main'));
            //defaultScale = (self.arData.isMarkerType == 1 ? { w: 2, h: 2, d: 2 } : { w: 4, h: 4, d: 4 });
            var basePos = AFRAME.utils.coordinates.parse(defaultwrapPos.x + ' ' + defaultwrapPos.y + ' ' + defaultwrapPos.z);
            var baseScale = AFRAME.utils.coordinates.parse(defaultwrapScale.w + ' ' + defaultwrapScale.h + ' ' + defaultwrapScale.d);

            self.wrap = document.createElement('a-box');
            self.wrap.setAttribute('id', 'base');
            self.wrap.setAttribute('scale', AFRAME.utils.coordinates.stringify(baseScale));
            self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(basePos));
            self.wrap.setAttribute('rotation', '0 0 0');
            self.wrap.setAttribute('src', rootPath + 'asset/plane.png');
            self.wrap.setAttribute('material', 'transparent: true, opacity: 0');
            self.wrap.setAttribute('visible', false);
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
                //var logo = document.createElement('a-image');

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
                elem.innerHTML = "Scale: " + Number(oScale).toFixed(1);
            }

            if (oPosition != null) {
                var elem = document.getElementById("debug2");
                elem.innerHTML = "X: " + Number(oPosition.x).toFixed(1) + " Y: " + Number(oPosition.y).toFixed(1) + ' Z: ' + Number(oPosition.z).toFixed(1);
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

            if (self.arg.pv) {

                document.getElementById("swAngle").style.display = 'none';
                document.getElementById("swParallel").style.display = 'none';

                wrapPos.x -= 0;
                wrapPos.y -= ((val.isMp4) ? 0 : 1.5);
                wrapPos.z -= defaultwrapScale.h * 1.5;
                
                var pvAngle = 0;
                
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

                    wrapZoom = 0.625;
                    zoomRateH = zoomRateH * wrapZoom;
                    //AFRAME.utils.entity.setComponentProperty(self.wrap, 'animation', {
                    //    property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRateH + ' ' + zoomRateH + ' ' + zoomRateH
                    //});

                    defaultwrapPos.y = -5;

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

                AFRAME.utils.entity.setComponentProperty(self.wrap, 'animation', {
                    property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRateH + ' ' + zoomRateH + ' ' + zoomRateH
                });

                wrapPos = webArViewer.defaultwrapPos;
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
                        wrapPos = webArViewer.defaultwrapPos;
                        zoomRateH = webArViewer.defaultwrapScale.h * wrapZoom;
                        AFRAME.utils.entity.setComponentProperty(self.wrap, 'animation', {
                            property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRateH + ' ' + zoomRateH + ' ' + zoomRateH
                        });
                        self.wrap.setAttribute('rotation', AFRAME.utils.coordinates.stringify(String(objAngle) + ' 0 0'));
                        self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                        bAngle.classList.add('current');
                        bParalle.classList.remove('current');   
                        webArViewer.ar.objectDataVal(zoomRateH, wrapPos);
                    }
                });

                bParalle.addEventListener('click', function () {
                    if (!bParalle.classList.contains('current')) {
                        wrapPos = webArViewer.defaultwrapPos;
                        zoomRateH = webArViewer.defaultwrapScale.h * wrapZoom;
                        AFRAME.utils.entity.setComponentProperty(self.wrap, 'animation', {
                            property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRateH + ' ' + zoomRateH + ' ' + zoomRateH
                        });
                        self.wrap.setAttribute('rotation', AFRAME.utils.coordinates.stringify('-90 0 0'));
                        self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                        bParalle.classList.add('current');
                        bAngle.classList.remove('current');
                        
                        webArViewer.ar.objectDataVal(zoomRateH, wrapPos);
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
                prevPageY = event.pageY;    // 縦軸
            });

            webArViewer.scene.addEventListener(self.eventNames.move, function (e) {
                var event = e.changedTouches ? e.changedTouches[0] : e;
                if (prevPageY) {
                    if ((zoomRateH + (prevPageY - event.pageY) / webArViewer.scene.clientHeight / 5) > 0.1) {
                        var rate = (prevPageY - event.pageY) / webArViewer.scene.clientHeight / 5;
                        zoomRateH += rate;
                        AFRAME.utils.entity.setComponentProperty(self.wrap, 'animation', {
                            property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRateH + ' ' + zoomRateH + ' ' + zoomRateH
                        });
                        var elem = document.getElementById("debug1");
                        elem.innerHTML = "Scale: " + Number(zoomRateH).toFixed(1);
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
            var yClickRate = ((!!(val.isMarkerType == 1) || !!(self.arg.pv)) ? 0.2 : 5);

            bUP.addEventListener('click', function () {
                wrapPos = AFRAME.utils.coordinates.parse(self.wrap.getAttribute('position'));
                if (!!(bAngle.classList.contains('current'))) {
                    wrapPos.y += yClickRate;
                } else {
                    wrapPos.z -= yClickRate;
                }
                self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                webArViewer.ar.objectDataVal(zoomRateH, wrapPos);
            });

            bDOWN.addEventListener('click', function () {
                wrapPos = AFRAME.utils.coordinates.parse(self.wrap.getAttribute('position'));
                if (!!(bAngle.classList.contains('current'))) {
                    wrapPos.y -= yClickRate;
                } else {
                    wrapPos.z += yClickRate;
                }
                self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                webArViewer.ar.objectDataVal(zoomRateH, wrapPos);
            });
            // ↑ 

            var yTouchRate = ((!!(val.isMarkerType == 1) || !!(self.arg.pv)) ? 0.02 : 2);

            // ↓ UPボタン長押し
            bUP.addEventListener(self.eventNames.start, e => {
                e.preventDefault();
                bUP.classList.add('active');
                timer = setInterval(() => {
                    wrapPos = AFRAME.utils.coordinates.parse(self.wrap.getAttribute('position'));
                    if (!!(bAngle.classList.contains('current'))) {
                        wrapPos.y += yTouchRate;
                    } else {
                        wrapPos.z -= yTouchRate;
                    }
                    self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                    webArViewer.ar.objectDataVal(zoomRateH, wrapPos);
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
                    wrapPos = AFRAME.utils.coordinates.parse(self.wrap.getAttribute('position'));
                    if (!!(bAngle.classList.contains('current'))) {
                        wrapPos.y -= yTouchRate;
                    } else {
                        wrapPos.z += yTouchRate;
                    }
                    self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                    webArViewer.ar.objectDataVal(zoomRateH, wrapPos);
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
        },

        switchObject: function(){

            if (!(webArViewer.ar.arData.isMp4)) {

                var self = this;
                var val = self.arData;

                webArViewer.scene.addEventListener(self.eventNames.start, function (e) {

                    if (webArViewer.srcno.length == 1) {
                        return;
                    }


                    // シングルタップの場合
                    if (!tapCount) {
                        ++tapCount;
                        // 350ミリ秒だけ、タップ回数を維持
                        setTimeout(function () {
                            tapCount = 0;
                        }, 350);

                    } else {

                        // ビューポートの変更(ズーム)を防止
                        e.preventDefault();

                        //webArViewer.ar.wrap.setAttribute('visible', false);

                        var shadow = document.getElementById('shadow');
                        if (shadow != null) {
                            shadow.remove();
                        }

                        var main = document.getElementById('main');
                        if (main != null) {
                            main.remove();
                        }

                        //var logo = document.getElementById('logo');
                        //if (logo != null) {
                        //    logo.remove();
                        //}

                        //var wrap = document.getElementById('base');
                        //wrap.remove();
                        ////wrap.setAttribute('src', rootPath + 'asset/plane.png');
                        ////wrap.setAttribute('material', 'transparent: true, opacity: 0');
                        ////wrap.setAttribute('visible', false);
                        ////wrap.setAttribute('style', 'z-index: 1');
                        //webArViewer.ar.setWrap();

                        webArViewer.ar.wrap.removeAttribute('src');
                        webArViewer.ar.wrap.removeAttribute('material');

                        webArViewer.ar.wrap.setAttribute('src', rootPath + 'asset/plane.png');
                        webArViewer.ar.wrap.setAttribute('material', 'transparent: true, opacity: 0');
                        //webArViewer.ar.wrap.setAttribute('visible', true);

                        if (tapCount == 1) {
                            webArViewer.srcno.obj = ((webArViewer.srcno.obj + 1) < webArViewer.srcno.length) ? webArViewer.srcno.obj + 1 : 1;
                        } else if (tapCount == 2) {
                            webArViewer.srcno.obj = ((webArViewer.srcno.obj - 1) > 0) ? webArViewer.srcno.obj - 1 : webArViewer.srcno.length;
                        }

                        webArViewer.ar.createModel(webArViewer.srcno.obj);
                        webArViewer.ar.addScene();
                        webArViewer.ar.arData.shadow && wrap.appendChild(webArViewer.ar.arData.shadow);
                        webArViewer.ar.arData.main && wrap.appendChild(webArViewer.ar.arData.main);
                        //webArViewer.ar.setScene();
                        //webArViewer.ar.setTapEvents();

                        //if (!!webArViewer.ar.arData.isLogo) {
                        //    webArViewer.ar.createAnimation();
                        //}

                        //webArViewer.ar.wrap.setAttribute('visible', true);

                        tapCount = 0;
                    }
                });
            }
        },

        setTapEvents: function () {

            var self = this;
            var val = self.arData;

            webArViewer.scene.addEventListener(self.eventNames.start, function (e) {
                if (!(val.isAnime)) {
                    if (val.path) {
                        self.arData.logo.emit('turn0');
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
            });
        },

        swichScene: function () {
            var self = this;
            var val = self.arData;
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

                    var srcname = '#source' + (objno).toString();
                    var video = document.querySelector(srcname);

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

            return { x: 0, y: -h1_2, z: 0 };
        },

        positionVec3: function (type, angle) {
            var self = this;
            var h1 = self.arData.size.h;
            var h1_2 = self.arData.size.h / 2;

            var i = (!!(self.arg.pv) ? h1_2 : (!!(self.arg.isMarkerType == 1) ? -h1 * 5 : 0));

            if (type === 'shadow') {
                return { x: 0, y: 0, z: -h1_2 };
            } else {
                return { x: 0, y: h1_2, z: 0 };
            }
        }
    };

    webArViewer.ar = ar;
    webArViewer.ar.init();
    webArViewer.ar.setDiplayBtn(!!(ar.arg.pv), srcno.obj);

    webArViewer.srcno = srcno;

    webArViewer.defaultAngle = defaultAngle;
    webArViewer.defaultPos = defaultPos;
    webArViewer.defaultScale = defaultScale;
    webArViewer.defaultwrapPos = defaultwrapPos;
    webArViewer.defaultwrapScale = defaultwrapScale;
    webArViewer.defaultlogoScale = defaultlogoScale;

    //if (!(webArViewer.ar.arData.isMarkerType == 1)) {
    //    var evant = new Event("click", { "bubbles": true, "cancelable": true });
    //    var bParalle = document.getElementById('swParallel');
    //    bParalle.dispatchEvent(evant);
    //}

}());

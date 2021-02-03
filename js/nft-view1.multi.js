var webAr = webAr || {};

var videoInfo = {};
var videoState = 0;
var objecttype = "png";
var tapCount = 0;
var tapclicked = false;

var viewmode = 'marker';


(function (global) {

    document.getElementById("info1").style.display = "inline";
    webAr.scene = document.querySelector('a-scene');

    var defAngle = 0;

    var defPos = { x: 0, y: 0, z: 0 };
    var defScale = { x: 4, y: 4, z: 4 };
    var defwrapPos = { x: 0, y: 0, z: 0 };
    var defwrapScale = { x: 4, y: 4, z: 4 };
    var deflogoScale = { x: 8, y: 6, z: 6 };

    var objAngle = -10;
    var srcno = { obj: 1, from: 1, to: 1, length: 1 };
    var scalechange = 0;

    var getType = '';

    var idx = 0;
    var n_idx = 0;

    var defwrap = {};
    var defobj = {};
    var deflogo = {};

    var viewIdx = {};

    var ar = {

        init: function () {

            videostate = 0;

            this.setArg();

            if (this.setArData()) {

                this.setWrap();

                this.createModel(1);

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

                this.setAngleEvents();
                this.setResizeEvents();
                this.setMoveEvents();
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
                if (webAr.srcno.length > 1) {
                    var msg = document.querySelector('slideshow');

                    document.getElementById("slideshow").style.display = 'inline';

                    //setTimeout(function () {
                    //    document.getElementById("slideshow").style.display = 'none';
                    //}, 6000);
                }

                if (webAr.ar.arData.isPV && webAr.ar.arData.isMp4) {
                    var video = document.querySelector('#source1');
                    document.getElementById("player").style.display = 'inline';

                    videostate = 1;
                }
            });
        },

        setArg: function () {

            var self = this;

            var arg = {};

            var pair = location.search.substring(1).split('&');

            for (var i = 0; pair[i]; i++) {
                var kv = pair[i].split('=');
                arg[kv[0]] = decodeURIComponent(kv[1]);
            }

            var args = new Array;

            if (!!(arg.xd)) {
                
                var base = {};
                base = this.readBaseXml(rootPath + 'data/' + arg.mo + '/' + arg.x + '.xml');

                var pcs = {};
                pcs = this.readPcsXml(rootPath + 'data/' + arg.mo + '/' + arg.x + '.xml');

                // プレビューモード
                arg.PVList = base[0].pv;
                // マーカー OR NFT
                arg.ARList = base[0].ar && (parseInt(base[0].ar, 10).toString());
                
                arg.Multi = pcs.length;

                for (idx = 0; idx < arg.Multi; idx++) {

                    args[idx] = {};

                    // 影
                    args[idx].shodowList = pcs[idx].xs && (parseInt(pcs[idx].xs, 16).toString(2));
                    // サイズ
                    args[idx].sizeList = pcs[idx].wh && (parseInt(pcs[idx].wh, 16).toString(10));
                    // 角度
                    args[idx].angleList = pcs[idx].an && (parseInt(pcs[idx].an, 10).toString(2));
                    // オブジェクトタイプ
                    args[idx].typeList = pcs[idx].t;

                    // マーカー
                    args[idx].markerList = pcs[idx].m;
                    args[idx].markerList1 = pcs[idx].m1;
                    args[idx].markerList2 = pcs[idx].m2;

                    // 対象オブジェクト
                    args[idx].ObjectList = pcs[idx].o;
                    args[idx].ObjectList1 = pcs[idx].o1;
                    args[idx].ObjectList2 = pcs[idx].o2;
                    args[idx].ObjectList3 = !!(pcs[idx].o3) ? pcs[idx].o3 : pcs[idx].o2;

                    // マーカー＆オブジェクト
                    args[idx].MkObjList = pcs[idx].mo;

                    viewIdx[idx] = 0;

                    // ロゴ表示
                    var logo = pcs[idx].l && ('0000' + (parseInt(pcs[idx].l, 16).toString(10))).slice(-4);
                    
                    args[idx].LogoList = {};
                    args[idx].LogoAnimeList = {};

                    if (!!(logo)) {
                        logo = (logo.match(/.{2}/g));
                        args[idx].LogoList = (logo).toString().split(',');
                        args[idx].LogoAnimeList = (args[idx].LogoList[1] && parseInt(args[idx].LogoList[1]));
                    }
                }

            } else {

                arg.Multi = 1;

                args[0] = {};
                idx = 0;

                args[idx] = arg;

                // プレビューモード
                arg.PVList = arg.pv;
                // マーカー OR NFT
                arg.ARList = arg.ar && (parseInt(arg.ar, 10).toString());

                // 影
                args[idx].shodowList = args[idx].xs && (parseInt(args[idx].xs, 16).toString(2));
                // サイズ
                args[idx].sizeList = args[idx].wh && (parseInt(args[idx].wh, 16).toString(10));
                // 角度
                args[idx].angleList = args[idx].an && (parseInt(args[idx].an, 10).toString(2));
                // オブジェクトタイプ
                args[idx].typeList = args[idx].t;

                // マーカー
                args[idx].markerList = args[idx].m;
                args[idx].markerList1 = args[idx].m1;
                args[idx].markerList2 = args[idx].m2;

                // 対象オブジェクト
                args[idx].ObjectList = args[idx].o;
                args[idx].ObjectList1 = args[idx].o1;
                args[idx].ObjectList2 = args[idx].o2;
                args[idx].ObjectList3 = !!(args[idx].o3) ? args[idx].o3 : args[idx].o2;

                // マーカー＆オブジェクト
                args[idx].MkObjList = args[idx].mo;

                viewIdx[0] = 0;

                // ロゴ表示
                var logo = args[idx].l && ('0000' + (parseInt(args[idx].l, 16).toString(10))).slice(-4);

                args[idx].LogoList = {};
                args[idx].LogoAnimeList = {};

                if (!!(logo)) {
                    logo = (logo.match(/.{2}/g));
                    args[idx].LogoList = (logo).toString().split(',');
                    args[idx].LogoAnimeList = (args[idx].LogoList[1] && parseInt(args[idx].LogoList[1]));
                }
            }

            self.arg = arg;
            self.args = args;
        },

        setArData: function () {

            var self = this;
            
            var arData = {};
            var dataObj = {};

            var assets = document.createElement('a-assets');

            assets.setAttribute('id', 'arAssets' + (idx + 1).toString());
            assets.setAttribute('timeout', '9000');

            for (idx = 0; idx < self.arg.Multi; idx++) {

                arData[idx] = null;
                dataObj[idx] = {};
                //oType[idx] = "png";

                defobj[idx] = {};

                objecttype = (!(self.args[idx].typeList) ? GetFileType('') : GetFileType(String(self.args[idx].typeList)));
                //oType[idx] = (!(self.args[idx].typeList) ? GetFileType('') : GetFileType(String(self.args[idx].typeList)));
                
                // データの準備
                var object = {};
                var n_object = '';
                var seq = 1;
                
                if (!(self.args[idx].ObjectList)) {
                    seq = (Number(self.args[idx].ObjectList3) - Number(self.args[idx].ObjectList2));
                    var no = Number(self.args[idx].ObjectList2);
                    for (var i = 0; i <= seq; i++) {
                        var j = ((no + i) < 100) ? 2 : ((no + i).toString()).length;
                        var obj = (('0').repeat(j) + (parseInt(no + i, 10).toString())).slice(-(j));
                        object[i] = ((self.args[idx].MkObjList) && (obj) ?
                            (self.args[idx].MkObjList + '/' + obj)
                            :
                            (self.args[idx].ObjectList1 + '/' + obj));
                    }
                    
                } else {
                    object[0] = (!(self.args[idx].ObjectList) ? '' : self.args[idx].ObjectList);
                }
                
                n_object = ((self.args[idx].MkObjList) ? (self.args[idx].MkObjList) : ((self.args[idx].ObjectList1) ? (self.args[idx].ObjectList1) : (self.args[idx].ObjectList)));
                
                dataObj[idx] = { path: object[0] + '.' + objecttype };
                dataObj[idx].oType = (!(self.args[idx].typeList) ? GetFileType('') : GetFileType(String(self.args[idx].typeList)));

                dataObj[idx].paths = {};

                dataObj[idx].srcno = { obj: 1, from: 1, to: 1, length: 1 };

                if (seq > 1) {
                    dataObj[idx].srcno.length = 0;
                    for (var i = 0; i <= seq; i++) {
                        dataObj[idx].paths[i] = object[i] + '.' + dataObj[idx].oType;
                        dataObj[idx].srcno.length += 1;
                    }
                } else {
                    dataObj[idx].paths[0] = object[0] + '.' + dataObj[idx].oType;
                }
                
                dataObj[idx].isPng = !!(dataObj[idx].path || '').match(/\.png$/i);
                dataObj[idx].isGif = !!(dataObj[idx].path || '').match(/\.gif$/i);
                dataObj[idx].isMp4 = !!(dataObj[idx].path || '').match(/\.mp4$/i);
                dataObj[idx].isGltf = !!(dataObj[idx].path || '').match(/\.gltf$/i);
                dataObj[idx].isPV = !!(self.arg.PVList);
                dataObj[idx].isNFT = !!(self.arg.ARList);
                dataObj[idx].isMarkerType = !!(self.arg.ARList) ? Number(self.arg.ARList) : 1;
                dataObj[idx].isLogo = (!!(self.args[idx].LogoList) ? self.args[idx].LogoList[0] : '0');
                dataObj[idx].isAnime = (!!(self.args[idx].LogoAnimeList) ? Number(self.args[idx].LogoAnimeList) : 0);
                dataObj[idx].isShadow = self.args[idx].shodowList && !!Number(self.args[idx].shodowList);
                
                // サイズ
                self.args[idx].sizeList = String(!!(!!(self.args[idx].sizeList) && Number(self.args[idx].ar) == 0) ? self.args[idx].sizeList : GetDefaultSize((dataObj[idx].isMarkerType == 1 ? 0 : 1), objecttype));
                
                var wh = SizeSplit(self.args[idx].sizeList).toString().split(',');
                var i = ((parseInt(self.args[idx].sizeList).toString(10)).length % 2 == 0) ? (parseInt(self.args[idx].sizeList).toString(10)).length : (parseInt(self.args[idx].sizeList).toString(10)).length + 1;
                //var j = (dataObj[idx].isMarkerType == 1 ? 2 : 4);
                var j = (dataObj[idx].isMarkerType == 1 ? 2 : 2);
                
                dataObj[idx].size = { w: (Number(wh[0]) * (10 ** -((i - j) / 2))).toFixed(1), h: (Number(wh[1]) * (10 ** -((i - j) / 2))).toFixed(1) };
                //defScale = { w: dataObj[idx].size.w, h: dataObj[idx].size.h, d: dataObj[idx].size.h };
                defobj[idx].Scale = { x: dataObj[idx].size.w, y: dataObj[idx].size.h, z: dataObj[idx].size.h };

                // オブジェクトソース
                if (dataObj[idx].path) {

                    var folder = !!(dataObj[idx].isMp4) ? 'video' : (!!(dataObj[idx].isGltf) ? 'gltf' : 'pic');
                    dataObj[idx].path = rootPath + 'article/' + folder + '/' + dataObj[idx].path;
                    dataObj[idx].arObj = {};

                    if (!!(dataObj[idx].isPng) || !!(dataObj[idx].isGif)) {

                        var img = {};

                        for (var i = 0; i <= seq; i++) {
                            dataObj[idx].paths[i] = rootPath + 'article/' + folder + '/' + dataObj[idx].paths[i];

                            img[i] = document.createElement('img');
                            img[i].setAttribute('crossorigin', 'anonymous');
                            img[i].setAttribute('id', 'source' + ((idx + 1) * 100 + (i + 1)).toString());
                            img[i].setAttribute('src', dataObj[idx].paths[i]);

                            dataObj[idx].arObj[i] = { obj: img[i] };

                            assets.appendChild(img[i]);
                        }

                    } else if (!!(dataObj[idx].isMp4)) {

                        var video = {};
                        var audio = {};

                        for (var i = 0; i <= seq; i++) {
                            dataObj[idx].paths[i] = rootPath + 'article/' + folder + '/' + dataObj[idx].paths[i];

                            video[i] = document.createElement("video");
                            video[i].setAttribute("src", dataObj[idx].paths[i]);
                            video[i].setAttribute('id', 'source' + ((idx + 1) * 100 + (i + 1)).toString());
                            video[i].setAttribute('preload', 'auto');
                            video[i].setAttribute('response-type', 'arraybuffer');
                            video[i].setAttribute('loop', 'true');
                            video[i].setAttribute('crossorigin', 'anonymous');
                            video[i].setAttribute('webkit-playsinline', 'webkit-playsinline');
                            video[i].setAttribute("playsinline", "");
                            video[i].setAttribute("controls", "");
                            video[i].setAttribute("autoplay", "");

                            audio[i] = document.createElement("audio");
                            audio[i].setAttribute("src", dataObj[idx].paths[i]);
                            audio[i].setAttribute('id', 'a-source' + ((idx + 1) * 100 + (i + 1)).toString());
                            audio[i].setAttribute('preload', 'auto');
                            audio[i].setAttribute('response-type', 'arraybuffer');
                            audio[i].setAttribute('loop', 'true');
                            audio[i].setAttribute('crossorigin', 'anonymous');
                            audio[i].setAttribute('webkit-playsinline', 'webkit-playsinline');
                            audio[i].setAttribute("playsinline", "");
                            audio[i].setAttribute("controls", "");
                            audio[i].setAttribute("autoplay", "");

                            dataObj[idx].arObj[i] = { obj: video[i], obj2: audio[i] };

                            assets.appendChild(video[i]);
                            assets.appendChild(audio[i]);
                        }

                    } else if (dataObj[idx].isGltf) {

                        var model = {};

                        for (var i = 0; i <= seq; i++) {
                            dataObj[idx].paths[i] = rootPath + 'article/' + folder + '/' + dataObj[idx].paths[i];

                            model[i] = document.createElement('a-asset-item');
                            model[i].setAttribute('crossorigin', 'anonymous');
                            model[i].setAttribute('id', 'source' + ((idx + 1) * 100 + (i + 1)).toString());
                            model[i].setAttribute('src', dataObj[idx].paths[i]);

                            dataObj[idx].arObj[i] = { obj: model[i] };

                            assets.appendChild(model[i]);
                        }
                    }
                    
                    if (dataObj[idx].isLogo) {

                        dataObj[idx].logopath = rootPath + 'article/gltf/' + n_object + '/' + 'logo-' + self.args[idx].LogoList[0] + '.gltf';

                        var model = document.createElement('a-asset-item');
                        model.setAttribute('crossorigin', 'anonymous');
                        model.setAttribute('id', 'logosource' + ((idx + 1) * 100 + 1).toString());
                        model.setAttribute('src', dataObj[idx].logopath);

                        assets.appendChild(model);
                    }
                    
                    if (dataObj[idx].tap) {

                        self.tap = true;
                        var bTap = document.createElement('img');

                        bTap.setAttribute('crossorigin', 'anonymous');
                        bTap.setAttribute('id', 'swDown');
                        bTap.setAttribute('src', 'asset/touch_w.png');

                        document.body.appendChild(bTap);
                    }
                }

                arData[idx] = dataObj[idx];

                if (!arData[idx].path) {
                    // 画像なかった
                    Err_Exit('画像情報が取得できませんでした。');
                    return false;
                }
            }

            webAr.scene.appendChild(assets);
            self.arData = arData;

            return true;
        },

        setSwitcher: function () {

            var self = this;

            var swMarker = document.getElementById('swMarker');
            var swPreview = document.getElementById('swPreview');

            if (self.args[n_idx].pv) {
                swPreview.classList.add('current');
            } else {
                swMarker.classList.add('current');
            }

            swMarker.addEventListener('click', function () {
                if (!this.classList.contains('current')) {
                    location.replace(location.search.replace('&pv=1', ''));
                    videostate = 0;
                    this.setDiplayBtn(0, webAr.ar.arData[n_idx].srcno.obj);
                }
            })

            swPreview.addEventListener('click', function () {
                if (!this.classList.contains('current')) {
                    location.replace(location.search + '&pv=1')
                    videostate = 0;
                    this.setDiplayBtn(1, webAr.ar.arData[n_idx].srcno.obj);
                }
            })
        },

        setWrap: function () {

            var self = this;
            self.wrap = new Array;

            for (idx = 0; idx < self.arg.Multi; idx++) {

                //var basePos = AFRAME.utils.coordinates.parse(defwrapPos.x + ' ' + defwrapPos.y + ' ' + defwrapPos.z);
                //var baseScale = AFRAME.utils.coordinates.parse(defwrapScale.w + ' ' + defwrapScale.h + ' ' + defwrapScale.d);
                //var basePos = AFRAME.utils.coordinates.parse(defwrap[idx].Pos.x + ' ' + defwrap[idx].Pos.y + ' ' + defwrap[idx].Pos.z);
                //var baseScale = AFRAME.utils.coordinates.parse(defwrap[idx].Scale.w + ' ' + defwrap[idx].Scale.h + ' ' + defwrap[idx].Scale.d);

                //if (self.arData.isMarkerType == 1) {
                //    self.wrap = document.createElement('a-entity');
                //} else {
                //    self.wrap = document.createElement('a-box');
                //}
                //self.wrap = document.createElement('a-entity');
                //self.wrap.setAttribute('id', 'base');
                //self.wrap.setAttribute('scale', AFRAME.utils.coordinates.stringify(baseScale));
                //self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(basePos));
                //self.wrap.setAttribute('rotation', '0 0 0');
                //self.wrap.setAttribute('src', rootPath + 'asset/plane.png');
                //self.wrap.setAttribute('material', 'transparent: true, opacity: 0');
                //self.wrap.setAttribute('style', 'z-index: 5');
                //self.wrap.setAttribute('visible', false);

                defwrap[idx] = { Pos: defwrapPos, Scale: defwrapScale };

                var wrap= document.createElement('a-entity');

                wrap.setAttribute('id', 'base' + ((idx + 1)).toString());
                wrap.setAttribute('scale', AFRAME.utils.coordinates.stringify(defwrap[idx].Scale));
                wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(defwrap[idx].Pos));
                wrap.setAttribute('rotation', '0 0 0');
                wrap.setAttribute('src', rootPath + 'asset/plane.png');
                wrap.setAttribute('material', 'transparent: true, opacity: 0');
                wrap.setAttribute('style', 'z-index: 5');
                //if (self.arData.isPV && idx != 0) {
                //    wrap.setAttribute('visible', false);
                //} else {
                    wrap.setAttribute('visible', true);
                //}
                self.wrap[idx] = wrap;
                self.arData[idx].wrap = self.wrap[idx];
            }
        },

        createModel: function (objno) {

            var self = this;
            var val = self.arData;
            
            for (idx = 0; idx < self.arg.Multi; idx++) {

                if (!val[idx].path) {
                    continue;
                }

                var srcname = '#source' + (((idx + 1) * 100) + objno).toString();

                if (val[idx].isShadow) {
                    var shadow = document.createElement('a-image');

                    shadow.setAttribute('id', 'shadow' + (idx + 1).toString());
                    shadow.setAttribute('position', AFRAME.utils.coordinates.stringify(self.positionVec3('shadow', idx)));
                    shadow.setAttribute('rotation', '-90 0 0');
                    shadow.setAttribute('style', 'z-index: 2');

                    //AFRAME.utils.entity.setComponentProperty(shadow, 'geometry', {
                    //    primitive: 'plane', height: defScale.h, width: defScale.w
                    //});
                    AFRAME.utils.entity.setComponentProperty(shadow, 'geometry', {
                        primitive: 'plane', height: defobj[idx].Scale.y, width: defobj[idx].Scale.x
                    });

                    AFRAME.utils.entity.setComponentProperty(shadow, 'material', {
                        shader: val.isGif ? 'gif' : 'flat', npot: true, src: srcname, transparent: true, alphaTest: 0.1,
                        color: 'black', opacity: 0.3, depthTest: false
                    });

                    self.arData[idx].shadow = shadow;
                }

                var elname = '';

                if (!val[idx].isMp4) {
                    elname = 'a-image'
                } else if (val[idx].isMp4) {
                    elname = 'a-video'
                }

                var main = document.createElement(elname);

                var posVec3 = self.positionVec3('main', idx);
                defPos = posVec3;
                defobj[idx].Pos = posVec3;

                main.setAttribute('id', 'main' + (idx + 1).toString());
                //main.setAttribute('position', AFRAME.utils.coordinates.stringify(defPos));
                main.setAttribute('position', AFRAME.utils.coordinates.stringify(defobj[idx].Pos));

                if (!val[idx].isGif) {

                    main.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));

                    if (!val[idx].isGltf) {

                        //main.setAttribute('width', AFRAME.utils.coordinates.stringify(defScale.w));
                        //main.setAttribute('height', AFRAME.utils.coordinates.stringify(defScale.h));

                        main.setAttribute('width', AFRAME.utils.coordinates.stringify(defobj[idx].Scale.x));
                        main.setAttribute('height', AFRAME.utils.coordinates.stringify(defobj[idx].Scale.y));

                        main.setAttribute('style', 'z-index: 3');

                        if (val.isMp4) {
                            main.setAttribute('play', 'true');
                        }

                        //AFRAME.utils.entity.setComponentProperty(main, 'geometry', {
                        //    primitive: 'plane', height: defScale.h, width: defScale.w, segmentsHeight: 1, segmentsWidth: 1
                        //});
                        AFRAME.utils.entity.setComponentProperty(main, 'geometry', {
                            primitive: 'plane', height: defobj[idx].Scale.y, width: defobj[idx].Scale.x, segmentsHeight: 1, segmentsWidth: 1
                        });

                        AFRAME.utils.entity.setComponentProperty(main, 'material', {
                            shader: val.isGif ? 'gif' : 'standard', npot: true, src: srcname, displacementMap: null, displacementBias: -0.5,
                            side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                        });
                    } else {
                        //main.setAttribute('scale', AFRAME.utils.coordinates.stringify(defScale));
                        main.setAttribute('scale', AFRAME.utils.coordinates.stringify(defobj[idx].Scale));
                    }

                } else {
                    main.setAttribute('rotation', '-30 0 0');
                }

                self.arData[idx].main = main;
                
                if (val[idx].isLogo) {

                    var logo = document.createElement('a-entity');
                    var rate = (!val[idx].isMp4) ? 1 : 2;

                    deflogo[idx] = {
                        Pos: self.positionVec3Logo(Number(val[idx].isAnime), idx),
                        Scale: ((deflogoScale.x * rate) + ' ' + (deflogoScale.y * rate) + ' ' + (deflogoScale.z * rate))
                    };

                    //var logopos = self.positionVec3Logo(Number(val[idx].isAnime));
                    //deflogo[idx].Pos = self.positionVec3Logo(Number(val[idx].isAnime), idx);
                    //deflogo[idx].Scale = { w: (deflogoScale.w * rate), h: (deflogoScale.h * rate), d: (deflogoScale.d * rate) };

                    logo.setAttribute('id', 'logo' + (idx + 1).toString());
                    logo.setAttribute('position', AFRAME.utils.coordinates.stringify(deflogo[idx].Pos));
                    logo.setAttribute('scale', AFRAME.utils.coordinates.stringify(deflogo[idx].Scale));
                    logo.setAttribute('gltf-model', '#logosource' + ((idx + 1) * 100 + 1).toString());
                    logo.setAttribute('style', 'z-index: 4');

                    self.arData[idx].logo = logo;
                }
            }
        },

        resetModel: function (oidx, objno) {

            var self = this;
            var val = self.arData;

            if (!val[oidx].path) {
                return;
            }

            var srcname = '#source' + (((Number(oidx) + 1) * 100) + objno).toString();

            if (val[oidx].isShadow) {
                var shadow = document.createElement('a-image');

                shadow.setAttribute('id', 'shadow' + ((oidx + 1)).toString());
                shadow.setAttribute('position', AFRAME.utils.coordinates.stringify(self.positionVec3('shadow', oidx)));
                shadow.setAttribute('rotation', '-90 0 0');
                shadow.setAttribute('style', 'z-index: 2');

                //AFRAME.utils.entity.setComponentProperty(shadow, 'geometry', {
                //    primitive: 'plane', height: defScale.h, width: defScale.w
                //});
                AFRAME.utils.entity.setComponentProperty(shadow, 'geometry', {
                    primitive: 'plane', height: defobj[oidx].Scale.y, width: defobj[oidx].Scale.x
                });

                AFRAME.utils.entity.setComponentProperty(shadow, 'material', {
                    shader: val.isGif ? 'gif' : 'flat', npot: true, src: srcname, transparent: true, alphaTest: 0.1,
                    color: 'black', opacity: 0.3, depthTest: false
                });

                self.arData[oidx].shadow = shadow;
            }

            var elname = '';

            if (!val[oidx].isMp4) {
                elname = 'a-image'
            } else if (val[oidx].isMp4) {
                elname = 'a-video'
            }

            var main = document.createElement(elname);

            var posVec3 = self.positionVec3('main', oidx);
            defobj[oidx].Pos = posVec3;

            main.setAttribute('id', 'main' + ((oidx + 1)).toString());
            main.setAttribute('position', AFRAME.utils.coordinates.stringify(defobj[oidx].Pos));

            if (!val[oidx].isGif) {

                main.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));

                if (!val[oidx].isGltf) {

                    main.setAttribute('width', AFRAME.utils.coordinates.stringify(defobj[oidx].Scale.x));
                    main.setAttribute('height', AFRAME.utils.coordinates.stringify(defobj[oidx].Scale.y));

                    main.setAttribute('style', 'z-index: 3');

                    if (val[oidx].isMp4) {
                        main.setAttribute('play', 'true');
                    }

                    AFRAME.utils.entity.setComponentProperty(main, 'geometry', {
                        primitive: 'plane', height: defobj[oidx].Scale.y, width: defobj[oidx].Scale.x, segmentsHeight: 1, segmentsWidth: 1
                    });

                    AFRAME.utils.entity.setComponentProperty(main, 'material', {
                        shader: val.isGif ? 'gif' : 'standard', npot: true, src: srcname, displacementMap: null, displacementBias: -0.5,
                        side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                    });
                } else {
                    main.setAttribute('scale', AFRAME.utils.coordinates.stringify(defobj[oidx].Scale));
                }

            } else {
                main.setAttribute('rotation', '-30 0 0');
            }

            self.arData[oidx].main = main;

            if (val[oidx].isLogo) {

                var logo = document.createElement('a-entity');
                var rate = (!val[oidx].isMp4) ? 1 : 2;

                deflogo[oidx] = {
                    Pos: self.positionVec3Logo(Number(val[oidx].isAnime), oidx),
                    Scale: ((deflogoScale.x * rate) + ' ' + (deflogoScale.y * rate) + ' ' + (deflogoScale.z * rate))
                };

                //deflogo[oidx].Pos = self.positionVec3Logo(Number(val[oidx].isAnime), oidx);
                //deflogo[oidx].Scale = { w: deflogo[oidx].Scale.w * rate, h: deflogo[oidx].Scale.h * rate, d: deflogo[oidx].Scale.wd * rate };

                logo.setAttribute('id', 'logo' + (oidx + 1).toString());
                logo.setAttribute('position', AFRAME.utils.coordinates.stringify(deflogo[oidx].Pos));
                //logo.setAttribute('scale', String(dedeflogo[oidx].Scale.w + ' ' + deflogo[oidx].Scale.h + ' ' + deflogo[oidx].Scale.d));
                logo.setAttribute('scale', AFRAME.utils.coordinates.stringify(deflogo[oidx].Scale));
                logo.setAttribute('gltf-model', '#logosource' + ((oidx + 1) * 100 +1).toString());
                logo.setAttribute('style', 'z-index: 4');

                self.arData[oidx].logo = logo;
            }
        },

        createAnimation: function (oidx){

            var self = this;
            var val = self.arData;

            if (!!val[oidx].isLogo) {

                //var logopos = self.positionVec3Logo(Number(val[idx].isAnime));
                var rate = (!val[oidx].isMp4) ? 1 : 2;

                //self.arData.logo.setAttribute('position', AFRAME.utils.coordinates.stringify(logopos));
                self.arData[oidx].logo.setAttribute('position', AFRAME.utils.coordinates.stringify(deflogo[oidx].Pos));

                // 反射
                //AFRAME.utils.entity.setComponentProperty(logo, 'geometry', {
                //    primitive: 'box', height: deflogoScale, width: deflogoScale, depth: deflogoScale, segmentsHeight: 1, segmentsWidth: 1
                //});
                //AFRAME.utils.entity.setComponentProperty(logo, 'material', {
                //    shader: 'standard', npot: true, src: '#logosource', displacementMap: null, displacementBias: -0.5,
                //    side: 'double', transparent: true, alphaTest: 0.1, metalness: (!!(val.isReflect) ? 1 : 0), roughness: (!!(val.isReflect) ? 0.3 : 0.5)
                //});

                if (!!val[oidx].isAnime) {

                    self.arData[oidx].logo.setAttribute('radius', (deflogo[oidx].Scale.x / 2));

                    if (val[oidx].isAnime == 1) {
                        AFRAME.utils.entity.setComponentProperty(self.arData[oidx].logo, 'animation__turn', {
                            property: 'rotation',
                            from: '0 0 0',
                            to: '0 360 0',
                            dur: 3000,
                            loop: true,
                            easing: 'linear'
                        });
                    } else if (val[oidx].isAnime == 2) {
                        AFRAME.utils.entity.setComponentProperty(self.arData[oidx].logo, 'animation__turn', {
                            property: 'rotation',
                            from: '0 0 0',
                            to: '0 360 0',
                            dur: 3000,
                            loop: true,
                            easing: 'easeOutElastic',
                            elasticity: 300
                        });
                    } else if (val[idx].isAnime == 3) {
                        self.arData[oidx].logo.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));
                        // 弾む
                        AFRAME.utils.entity.setComponentProperty(self.arData[oidx].logo, 'animation__pos', {
                            property: 'position',
                            dir: 'alternate',
                            dur: 400,
                            easing: 'easeInOutQuart',
                            loop: true,
                            from: logopos.x + ' ' + deflogo[oidx].Pos.y + ' ' + deflogo[oidx].Pos.z,
                            to: logopos.x + ' ' + (deflogo[oidx].Pos.y + (deflogo[oidx].Scale.y * rate) / 5) + ' ' + deflogo[oidx].Pos.z
                        });
                        AFRAME.utils.entity.setComponentProperty(self.arData[oidx].logo, 'animation__scale', {
                            property: 'scale',
                            dir: 'alternate',
                            dur: 400,
                            easing: 'easeOutQuad',
                            loop: true,
                            //from: deflogo[oidx].Scale.x * rate * 1.2 + ' ' + deflogo[oidx].Scale.y * rate * 0.8 + ' ' + deflogo[oidx].Scale.z * rate,
                            //to: deflogo[oidx].Scale.x * rate * 0.8 + ' ' + deflogo[oidx].Scale.y * rate * 1.2 + ' ' + deflogo[oidx].Scale.z * rate * 1
                            from: deflogo[oidx].Scale.x * 1.2 + ' ' + deflogo[oidx].Scale.y* 0.8 + ' ' + deflogo[oidx].Scale.z,
                            to: deflogo[oidx].Scale.x * 0.8 + ' ' + deflogo[oidx].Scale.y * 1.2 + ' ' + deflogo[oidx].Scale.z
                        });
                    } else if (val[oidx].isAnime == 11) {
                        AFRAME.utils.entity.setComponentProperty(self.arData[oidx].logo, 'animation__turn1', {
                            property: 'rotation',
                            dur: 3000,
                            easing: 'linear',
                            from: '0 0 0',
                            to: '0 360 0',
                            startEvents: 'turn1'
                        });
                    } else if (val[oidx].isAnime == 12) {
                        AFRAME.utils.entity.setComponentProperty(self.arData[oidx].logo, 'animation__turn2', {
                            property: 'rotation',
                            dur: 3000,
                            easing: 'easeOutElastic',
                            elasticity: 300,
                            from: '0 0 0',
                            to: '0 360 0',
                            startEvents: 'turn2'
                        });
                    } else if (val[idx].isAnime == 13) {
                        self.arData[oidx].logo.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));
                        // 弾む
                        AFRAME.utils.entity.setComponentProperty(self.arData[oidx].logo, 'animation__pos3', {
                            property: 'position',
                            dir: 'alternate',
                            dur: 400,
                            easing: 'easeInOutQuart',
                            loop: false,
                            //from: logopos.x + ' ' + (deflogo[oidx].Pos.y + (deflogo[oidx].Scale.h * rate) / 5) + ' ' + deflogo[oidx].Pos.z,
                            //to: deflogo[oidx].Pos.x + ' ' + deflogo[oidx].Pos.y + ' ' + deflogo[oidx].Pos.z,
                            from: deflogo[oidx].x + ' ' + (deflogo[oidx].Pos.y + (deflogo[oidx].Scale.h * rate) / 5) + ' ' + deflogo[oidx].Pos.z,
                            to: deflogo[oidx].Pos.x + ' ' + deflogo[oidx].Pos.y + ' ' + deflogo[oidx].Pos.z,
                            startEvents: 'pos3'
                        });
                        AFRAME.utils.entity.setComponentProperty(self.arData[oidx].logo, 'animation__scale3', {
                            property: 'scale',
                            dir: 'alternate',
                            dur: 400,
                            easing: 'easeOutQuad',
                            loop: false,
                            //from: deflogo[oidx].Scale.w * rate * 1.2 + ' ' + deflogo[oidx].Scale.h * rate * 0.8 + ' ' + deflogo[oidx].Scale.d * rate,
                            //to: deflogo[oidx].Scale.w * rate * 0.8 + ' ' + deflogo[oidx].Scale.h * rate * 1.2 + ' ' + deflogo[oidx].Scale.d * rate * 1,
                            from: deflogo[oidx].Scale.x * 1.2 + ' ' + deflogo[oidx].Scale.y * 0.8 + ' ' + deflogo[oidx].Scale.z,
                            to: deflogo[oidx].Scale.x * 0.8 + ' ' + deflogo[oidx].Scale.y * 1.2 + ' ' + deflogo[oidx].Scale.z,
                            startEvents: 'scale3'
                        });
                    }
                } else {
                    //self.arData.logo.setAttribute('rotation', AFRAME.utils.coordinates.stringify(String(objAngle) + ' 0 0'));
                    AFRAME.utils.entity.setComponentProperty(self.arData[oidx].logo, 'animation__turn0', {
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

        addScene: function(oidx) {

            var self = this;
            var val = self.arData;

            self.arData[oidx].shadow && self.wrap[oidx].appendChild(self.arData[oidx].shadow);
            self.arData[oidx].main && self.wrap[oidx].appendChild(self.arData[oidx].main);

            if (val[oidx].isLogo) {
                self.arData[oidx].logo && self.wrap[oidx].appendChild(self.arData[oidx].logo);
            }
        },

        setScene: function () {

            var self = this;
            var val = self.arData;

            var bUP = document.getElementById('swUp');
            var bDOWN = document.getElementById('swDown');
            var bAngle = document.getElementById('swAngle');
            var bParalle = document.getElementById('swParallel');

            if (!!bParalle.classList.remove('current')) {
                bParalle.classList.remove('current');
            }

            bAngle.classList.add('current');

            var mWrap = {};
            self.mWrap = {};
            var yClickRate = {};
            var yTouchRate = {};

            for (idx = 0; idx < self.arg.Multi; idx++) {

                this.addScene(idx);

                //if (!val.isMp4) {
                //    document.getElementById("player").style.display = 'none';
                //}

                var arGifRotation = '-30 0 0';
                var prevPageY;
                var zoomRateH = defwrap[idx].Scale.y;
                var wrapZoom = 1;

                //var wrapPos = AFRAME.utils.coordinates.parse(defwrap[idx].Pos.x + ' ' + defwrap[idx].Pos.y + ' ' + defwrap[idx].Pos.z);
                var wrapPos = defwrap[idx].Pos;

                if (self.args[idx].pv) {

                    viewmode = 'pv';

                    //document.getElementById("swAngle").style.display = 'none';
                    //document.getElementById("swParallel").style.display = 'none';

                    wrapPos.x -= 0;
                    wrapPos.y -= ((val.isMp4) ? 0 : 1.5);
                    wrapPos.z -= defwrap[idx].Scale.y * 1.5;

                    //var pvAngle = 0;
                    var pvAngle = -5;

                    wrapZoom = 0.5;
                    zoomRateH = defwrap[idx].Scale.y * wrapZoom;
                    AFRAME.utils.entity.setComponentProperty(self.wrap[idx], 'animation', {
                        property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRateH + ' ' + zoomRateH + ' ' + zoomRateH
                    });

                    self.wrap[idx].setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                    self.wrap[idx].setAttribute('rotation', AFRAME.utils.coordinates.stringify(String(pvAngle) + ' 0 0'));

                    webAr.scene.appendChild(self.wrap[idx]);

                } else {

                    //document.getElementById("swAngle").style.display = 'inline';
                    //document.getElementById("swParallel").style.display = 'inline';

                    var mk = '';

                    // NFTマーカー
                    mWrap[idx] = document.createElement('a-nft');

                    if (val[idx].isMarkerType == 1) {

                        viewmode = 'marker';

                        wrapZoom = 0.625;
                        zoomRateH = zoomRateH * wrapZoom;

                        //defwrapPos.y = -5;
                        defwrap[idx].Pos.y = -5;

                        mWrap[idx] = null;

                        // ARマーカー
                        mWrap[idx] = document.createElement('a-marker');
                        mWrap[idx].setAttribute('markerhandler', '');
                        mWrap[idx].setAttribute('preset', 'custom');
                        mWrap[idx].setAttribute('type', 'pattern');
                        mWrap[idx].setAttribute('id', 'arMarker' + (idx + 1).toString());
                        mWrap[idx].setAttribute('data-index', idx);

                        mk = 'pattern/p-def.patt';

                        if ((self.args[idx].markerList1) && (self.args[idx].markerList2)) {
                            mk = 'pattern/' + self.args[idx].markerList1 + '/p-' + self.args[idx].markerList2 + '.patt';
                        } else if ((self.args[idx].MkObjList) && (self.args[idx].markerList2)) {
                            mk = 'pattern/' + self.args[idx].MkObjList + '/p-' + self.args[idx].markerList2 + '.patt';
                        } else if ((self.args[idx].markerList) && (self.args[idx].markerList2)) {
                            mk = 'pattern/' + self.args[idx].markerList + '/p-' + self.args[idx].markerList2 + '.patt';
                        } else if ((self.args[idx].markerList)) {
                            mk = 'pattern/p-' + self.args[idx].markerList + '.patt';
                        }

                    } else {

                        viewmode = 'nft';

                        wrapZoom = 30;
                        zoomRateH = zoomRateH * wrapZoom;

                        mWrap[idx].setAttribute('markerhandler', '');
                        mWrap[idx].setAttribute('preset', 'custom');
                        mWrap[idx].setAttribute('type', 'nft');
                        mWrap[idx].setAttribute('id', 'arMarker' + (idx + 1).toString());
                        mWrap[idx].setAttribute('smooth', 'true');
                        mWrap[idx].setAttribute('smoothCount', '10');
                        mWrap[idx].setAttribute('smoothTolerance', '0.01');
                        mWrap[idx].setAttribute('smoothThreshold', '5');
                        mWrap[idx].setAttribute('data-index', idx);

                        if ((self.args[idx].markerList1) && (self.args[idx].markerList2)) {
                            mk = 'ImageDescriptors/' + self.args[idx].markerList1 + '/' + self.args[idx].markerList2 + '/' + self.args[idx].markerList2;
                        } else if ((self.args[idx].MkObjList) && (self.args[idx].markerList2)) {
                            mk = 'ImageDescriptors/' + self.args[idx].MkObjList + '/' + self.args[idx].markerList2 + '/' + self.args[idx].markerList2;
                        } else if ((self.args[idx].markerList) && (self.args[idx].markerList2)) {
                            mk = 'ImageDescriptors/' + self.args[idx].markerList + '/' + self.args[idx].markerList2 + '/' + self.args[idx].markerList2;
                        } else if ((self.args[idx].markerList)) {
                            mk = 'ImageDescriptors/' + self.args[idx].markerList + '/' + self.args[idx].markerList;
                        } else if ((self.args[idx].MkObjList)) {
                            mk = 'ImageDescriptors/' + self.args[idx].MkObjList + '/01';
                        }
                    }

                    mWrap[idx].addEventListener('markerFound', function (e) {
                        var elem = e.target || e.srcElement;
                        var elemId = elem.id;
                        var targetmarker = document.getElementById(elemId.toString());
                        var i = Number(targetmarker.getAttribute('data-index'));
                        viewIdx[i] = 1;

                        var multi = document.getElementById('txtMultiNo');
                        
                        if(!!(chkVIew())){
                            multi.innerHTML = 'ALL';
                        } else {
                            multi.innerHTML = (i + 1).toString();
                        }

                        n_idx = i;

                        if (webAr.ar.arData[i].oType == "mp4") {
                            var video = document.querySelector('#source' + (((Number(i) + 1) * 100) + objno).toString());
                            if (videostate == 0) {
                                document.getElementById("player").style.display = 'inline';
                            }
                            // マーカー認識したら、ビデオ再生
                            video.play();
                            videostate = 1
                        };

                        function chkVIew(){
                            for (var i = 0; i < webAr.ar.arg.Multi; i++){
                                if(viewIdx[i] == 0) {
                                    return false;
                                    break;
                                }
                            }
                            return true;
                        }
                    });

                    mWrap[idx].addEventListener('markerLost', function (e) {
                        var elem = e.target || e.srcElement;
                        var elemId = elem.id;
                        var targetmarker = document.getElementById(elemId.toString());
                        var i = Number(targetmarker.getAttribute('data-index'));
                        viewIdx[i] = 0;

                        if (webAr.ar.arData[i].oType == 'mp4') {
                            var video = document.querySelector('#source' + (((Number(i) + 1) * 100) + objno).toString());
                            // マーカー認識が外れたら、、ビデオ停止
                            video.pause();
                            videostate = 2;
                        }

                        //var cameraWrapper = document.getElementById("camera-wrapper");
                        //var camera = document.getElementById("camera");

                        //var y = camera.getAttribute("rotation").y;
                        //cameraWrapper.setAttribute("rotation", { y: -1 * y });
                    });

                    AFRAME.utils.entity.setComponentProperty(self.wrap[idx], 'animation', {
                        property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRateH + ' ' + zoomRateH + ' ' + zoomRateH
                    });

                    //wrapPos = defwrapPos;
                    //self.wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                    wrapPos = defwrap[idx].Pos;
                    self.wrap[idx].setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));

                    mWrap[idx].setAttribute('url', AFRAME.utils.coordinates.stringify(rootPath + mk));

                    mWrap[idx].appendChild(self.wrap[idx]);
                    webAr.scene.appendChild(mWrap[idx]);

                    self.mWrap[idx] = mWrap[idx];

                    // ↓ rotation 切替 Event
                    if (!(self.arData[idx].isMarkerType == 1)) {
                        self.wrap[idx].setAttribute('rotation', AFRAME.utils.coordinates.stringify('-90 0 0'));
                        self.wrap[idx].setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));
                        if (!bParalle.classList.contains('current')) {
                            bParalle.classList.add('current');
                            bAngle.classList.remove('current');
                        }
                    }
                    // ↑
                }

                if (!!val[idx].isLogo) {
                    this.createAnimation(idx);
                }

                yClickRate[idx] = ((!!(val[idx].isMarkerType == 1) || !!(self.args[idx].pv)) ? 0.2 : 5);
                yTouchRate[idx] = ((!!(val[idx].isMarkerType == 1) || !!(self.args[idx].pv)) ? 0.02 : 2);

                var timer = {};

                self.arData[idx].yClickRate = yClickRate[idx];
                self.arData[idx].yTouchRate = yTouchRate[idx];

                webAr.ar.arData[idx].wrapPos = wrapPos;
                webAr.ar.arData[idx].zoomRateH = zoomRateH;

                this.objectDataVal(zoomRateH, wrapPos);
            }

            //bAngle.addEventListener('click', function () {
            //    if (!bAngle.classList.contains('current')) {
            //        for (n_idx = 0; n_idx < viewIdx.length; i++) {
            //            if (viewIdx[n_idx] == 1) {
            //                webAr.ar.arData[n_idx].wrapPos = webAr.defwrap[n_idx].Pos;
            //                webAr.ar.arData[n_idx].zoomRateH = webAr.defwrap[n_idx].Scale.y * wrapZoom;
            //                AFRAME.utils.entity.setComponentProperty(self.wrap[n_idx], 'animation', {
            //                    property: 'scale', dur: 5, easing: 'linear', loop: false, to: webAr.ar.arData[n_idx].zoomRateH + ' ' + webAr.ar.arData[n_idx].zoomRateH + ' ' + webAr.ar.arData[n_idx].zoomRateH
            //                });
            //                self.wrap[n_idx].setAttribute('rotation', AFRAME.utils.coordinates.stringify((objAngle).toString() + ' 0 0'));
            //                self.wrap[n_idx].setAttribute('position', AFRAME.utils.coordinates.stringify(webAr.ar.arData[n_idx].wrapPos));
            //                bAngle.classList.add('current');
            //                bParalle.classList.remove('current');
            //                webAr.ar.objectDataVal(webAr.ar.arData[n_idx].zoomRateH, webAr.ar.arData[n_idx].wrapPos);
            //            }
            //        }
            //    }
            //});

            //bParalle.addEventListener('click', function () {
            //    if (!bParalle.classList.contains('current')) {
            //        for (n_idx = 0; n_idx < viewIdx.length; n_idx++) {
            //            if (viewIdx[n_idx] == 1) {
            //                webAr.ar.arData[n_idx].wrapPos = webAr.defwrap[n_idx].Pos;
            //                webAr.ar.arData[n_idx].zoomRateH = webAr.defwrap[n_idx].Scale.y * wrapZoom;
            //                AFRAME.utils.entity.setComponentProperty(self.wrap[idx], 'animation', {
            //                    property: 'scale', dur: 5, easing: 'linear', loop: false, to: webAr.ar.arData[n_idx].zoomRateH + ' ' + webAr.ar.arData[n_idx].zoomRateH + ' ' + webAr.ar.arData[n_idx].zoomRateH
            //                });
            //                self.wrap[n_idx].setAttribute('rotation', AFRAME.utils.coordinates.stringify('-90 0 0'));
            //                self.wrap[n_idx].setAttribute('position', AFRAME.utils.coordinates.stringify(webAr.ar.arData[n_idx].wrapPos));
            //                bParalle.classList.add('current');
            //                bAngle.classList.remove('current');
            //                webAr.ar.objectDataVal(webAr.ar.arData[n_idx].zoomRateH, webAr.ar.arData[n_idx].wrapPos);
            //            }
            //        }
            //    }
            //});

            //// 拡大・縮小
            //webAr.scene.addEventListener(self.eventNames.start, function (e) {
            //    var event = e.changedTouches ? e.changedTouches[0] : e;
            //    scalechange = 0;
            //    prevPageY = event.pageY;    // 縦軸 or 前後軸
            //});

            //webAr.scene.addEventListener(self.eventNames.move, function (e) {
            //    var event = e.changedTouches ? e.changedTouches[0] : e;
            //    if (prevPageY) {
            //        tapclicked = !!(tapCount = scalechange);
            //        scalechange = 1;
            //        if ((webAr.ar.arData[n_idx].zoomRateH + (prevPageY - event.pageY) / webAr.scene.clientHeight / 5) > 0.1) {
            //            var rate = ((prevPageY - event.pageY) / webAr.scene.clientHeight / 5) * wrapZoom;
            //            webAr.ar.arData[n_idx].zoomRateH += rate;
            //            AFRAME.utils.entity.setComponentProperty(self.wrap[n_idx], 'animation', {
            //                property: 'scale', dur: 5, easing: 'linear', loop: false, to: webAr.ar.arData[n_idx].zoomRateH + ' ' + webAr.ar.arData[n_idx].zoomRateH + ' ' + webAr.ar.arData[n_idx].zoomRateH
            //            });
            //            var elem = document.getElementById("debug1");
            //            elem.innerHTML = "Scale: " + Number(webAr.ar.arData[n_idx].zoomRateH).toFixed(5);
            //        }
            //    }
            //});

            //webAr.scene.addEventListener(self.eventNames.end, function (e) {
            //    scalechange = 0;
            //    prevPageY = null;
            //});

            //// 上下移動ボタン押下
            //bUP.addEventListener('click', function () {
            //    webAr.ar.arData[n_idx].wrapPos = AFRAME.utils.coordinates.parse(self.wrap[n_idx].getAttribute('position'));
            //    if (!!(bAngle.classList.contains('current'))) {
            //        webAr.ar.arData[n_idx].wrapPos.y += yClickRate[n_idx];
            //    } else {
            //        webAr.ar.arData[n_idx].wrapPos.z -= yClickRate[n_idx];
            //    }
            //    self.wrap[n_idx].setAttribute('position', AFRAME.utils.coordinates.stringify(webAr.ar.arData[n_idx].wrapPos));
            //    webAr.ar.objectDataVal(webAr.ar.arData[n_idx].zoomRateH, webAr.ar.arData[n_idx].wrapPos);
            //});

            //bDOWN.addEventListener('click', function () {
            //    webAr.ar.arData[n_idx].wrapPos = AFRAME.utils.coordinates.parse(self.wrap[n_idx].getAttribute('position'));
            //    if (!!(bAngle.classList.contains('current'))) {
            //        webAr.ar.arData[n_idx].wrapPos.y -= yClickRate[n_idx];
            //    } else {
            //        webAr.ar.arData[n_idx].wrapPos.z += yClickRate[n_idx];
            //    }
            //    self.wrap[n_idx].setAttribute('position', AFRAME.utils.coordinates.stringify(webAr.ar.arData[n_idx].wrapPos));
            //    webAr.ar.objectDataVal(webAr.ar.arData[n_idx].zoomRateH, webAr.ar.arData[n_idx].wrapPos);
            //});
            //// ↑ 

            //// UPボタン長押し
            //bUP.addEventListener(self.eventNames.start, e => {
            //    e.preventDefault();
            //    bUP.classList.add('active');
            //    timer[n_idx] = setInterval(() => {
            //        webAr.ar.arData[n_idx].wrapPos = AFRAME.utils.coordinates.parse(self.wrap[n_idx].getAttribute('position'));
            //        if (!!(bAngle.classList.contains('current'))) {
            //            webAr.ar.arData[n_idx].wrapPos.y += yTouchRate[n_idx];
            //        } else {
            //            webAr.ar.arData[n_idx].wrapPos.z -= yTouchRate[n_idx];
            //        }
            //        self.wrap[n_idx].setAttribute('position', AFRAME.utils.coordinates.stringify(webAr.ar.arData[n_idx].wrapPos));
            //        webAr.ar.objectDataVal(webAr.ar.arData[n_idx].zoomRateH, webAr.ar.arData[n_idx].wrapPos);
            //    }, 10);
            //});

            //bUP.addEventListener(self.eventNames.end, e => {
            //    e.preventDefault();
            //    bUP.classList.remove('active');
            //    clearInterval(timer[n_idx]);
            //});

            //bUP.addEventListener(self.eventNames.move, e => {
            //    e.preventDefault();
            //    bUP.classList.remove('active');
            //    clearInterval(timer[n_idx]);
            //});

            //// DOWNボタン長押し
            //bDOWN.addEventListener(self.eventNames.start, e => {
            //    e.preventDefault();
            //    bDOWN.classList.add('active');
            //    timer[n_idx] = setInterval(() => {
            //        webAr.ar.arData[n_idx].wrapPos = AFRAME.utils.coordinates.parse(self.wrap[n_idx].getAttribute('position'));
            //        if (!!(bAngle.classList.contains('current'))) {
            //            webAr.ar.arData[n_idx].wrapPos.y -= yTouchRate[n_idx];
            //        } else {
            //            webAr.ar.arData[n_idx].wrapPos.z += yTouchRate[n_idx];
            //        }
            //        self.wrap[n_idx].setAttribute('position', AFRAME.utils.coordinates.stringify(webAr.ar.arData[n_idx].wrapPos));
            //        webAr.ar.objectDataVal(webAr.ar.arData[n_idx].zoomRateH, webAr.ar.arData[n_idx].wrapPos);
            //    }, 10);
            //});

            //bDOWN.addEventListener(self.eventNames.end, e => {
            //    e.preventDefault();
            //    bDOWN.classList.remove('active');
            //    clearInterval(timer[n_idx]);
            //});

            //bDOWN.addEventListener(self.eventNames.move, e => {
            //    e.preventDefault();
            //    bDOWN.classList.remove('active');
            //    clearInterval(timer[n_idx]);
            //});
        },

        resetScene: function (oidx) {

            var self = this;
            var val = self.arData;

            this.addScene(oidx);

            if (!val[oidx].isMp4) {
                document.getElementById("player").style.display = 'none';
            }

            if (!!val[oidx].isLogo) {
                this.createAnimation(oidx);
            }

            this.objectDataVal(webAr.ar.arData[oidx].zoomRateH, webAr.ar.arData[oidx].wrapPos);
        },

        setAngleEvents: function(){
            
            var self = this;

            var bAngle = document.getElementById('swAngle');
            var bParalle = document.getElementById('swParallel');

            bAngle.addEventListener('click', function () {
                if (!bAngle.classList.contains('current')) {
                    for (var i = 0; i < viewIdx.length; i++) {
                        if (viewIdx[i] == 1) {
                            webAr.ar.arData[i].wrapPos = webAr.defwrap[i].Pos;
                            webAr.ar.arData[i].zoomRateH = webAr.defwrap[i].Scale.y * wrapZoom;
                            AFRAME.utils.entity.setComponentProperty(webAr.ar.arData[i].wrap, 'animation', {
                                property: 'scale', dur: 5, easing: 'linear', loop: false, to: webAr.ar.arData[i].zoomRateH + ' ' + webAr.ar.arData[i].zoomRateH + ' ' + webAr.ar.arData[i].zoomRateH
                            });
                            webAr.ar.arData[i].wrap.setAttribute('rotation', AFRAME.utils.coordinates.stringify((objAngle).toString() + ' 0 0'));
                            webAr.ar.arData[i].wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(webAr.ar.arData[i].wrapPos));
                            bAngle.classList.add('current');
                            bParalle.classList.remove('current');
                            webAr.ar.objectDataVal(webAr.ar.arData[i].zoomRateH, webAr.ar.arData[i].wrapPos);
                        }
                    }
                }
            });

            bParalle.addEventListener('click', function () {
                if (!bParalle.classList.contains('current')) {
                    for (var i = 0; i < viewIdx.length; i++) {
                        if (viewIdx[i] == 1) {
                            webAr.ar.arData[i].wrapPos = webAr.defwrap[i].Pos;
                            webAr.ar.arData[i].zoomRateH = webAr.defwrap[i].Scale.y * wrapZoom;
                            AFRAME.utils.entity.setComponentProperty(webAr.ar.arData[i].wrap, 'animation', {
                                property: 'scale', dur: 5, easing: 'linear', loop: false, to: webAr.ar.arData[i].zoomRateH + ' ' + webAr.ar.arData[i].zoomRateH + ' ' + webAr.ar.arData[i].zoomRateH
                            });
                            webAr.ar.arData[i].wrap.setAttribute('rotation', AFRAME.utils.coordinates.stringify('-90 0 0'));
                            webAr.ar.arData[i].wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(webAr.ar.arData[i].wrapPos));
                            bParalle.classList.add('current');
                            bAngle.classList.remove('current');
                            webAr.ar.objectDataVal(webAr.ar.arData[i].zoomRateH, webAr.ar.arData[i].wrapPos);
                        }
                    }
                }
            });
        },

        setResizeEvents: function(){

            var self = this;

            var prevPageY;

            // 拡大・縮小
            webAr.scene.addEventListener(self.eventNames.start, function (e) {
                var event = e.changedTouches ? e.changedTouches[0] : e;
                scalechange = 0;
                prevPageY = event.pageY;    // 縦軸 or 前後軸
            });

            webAr.scene.addEventListener(self.eventNames.move, function (e) {
                var event = e.changedTouches ? e.changedTouches[0] : e;
                if (prevPageY) {
                    tapclicked = !!(tapCount = scalechange);
                    scalechange = 1;
                    var zoomRate = getSmall();
                    //if ((webAr.ar.arData[n_idx].zoomRateH + (prevPageY - event.pageY) / webAr.scene.clientHeight / 5) > 0.1) {
                    if ((zoomRate + (prevPageY - event.pageY) / webAr.scene.clientHeight / 5) > 0.1) {

                        var rate = ((prevPageY - event.pageY) / webAr.scene.clientHeight / 5) * wrapZoom;
                        
                        for(var i = 0; i < webAr.ar.arg.multi; i++){
                            if(webAr.viewIdx[i] == 1) {
                                webAr.ar.arData[i].zoomRateH += rate;
                                AFRAME.utils.entity.setComponentProperty(webAr.ar.arData[i].wrap, 'animation', {
                                    property: 'scale', dur: 5, easing: 'linear', loop: false, to: webAr.ar.arData[i].zoomRateH + ' ' + webAr.ar.arData[i].zoomRateH + ' ' + webAr.ar.arData[i].zoomRateH
                                });
                            }
                        }

                        var elem = document.getElementById("debug1");
                        elem.innerHTML = "Scale: " + Number(webAr.ar.arData[i].zoomRateH).toFixed(5);
                    }
                }
            });

            webAr.scene.addEventListener(self.eventNames.end, function (e) {
                scalechange = 0;
                prevPageY = null;
            });

            function getSmall() {
                var i = 0;
                var zoomRate =webAr.ar.arData[i].zoomRateH;

                for(i + 1; i < webAr.ar.arg.multi; i++){
                    if(webAr.ar.arData[i - 1].zoomRateH > webAr.ar.arData[i].zoomRateH){
                        zoomRate = webAr.ar.arData[i].zoomRateH;
                    }
                }
                return zoomRate;
            }
        },

        setMoveEvents: function(){

            var self = this;

            var bUP = document.getElementById('swUp');
            var bDOWN = document.getElementById('swDown');
            var bAngle = document.getElementById('swAngle');
            var bParalle = document.getElementById('swParallel');
            var timer;
            var timers = {};

            var multiview = getOnMarkers();

            // 上下移動ボタン押下
            bUP.addEventListener('click', function () {
                for (var i = 0; i < webAr.ar.arg.multi; i++) {
                    if (webAr.viewIdx[i] == 1) {
                        webAr.ar.arData[i].wrapPos = AFRAME.utils.coordinates.parse(webAr.ar.arData[i].wrap.getAttribute('position'));
                    }
                }
                for (var i = 0; i < webAr.ar.arg.multi; i++) {
                    if (webAr.viewIdx[i] == 1) {
                        if (!!(bAngle.classList.contains('current'))) {
                            webAr.ar.arData[i].wrapPos.y += webAr.ar.arData[i].yClickRate[i];
                        } else {
                            webAr.ar.arData[i].wrapPos.z -= webAr.ar.arData[i].yClickRate[i];
                        }
                    }
                }
                for (var i = 0; i < webAr.ar.arg.multi; i++) {
                    if (webAr.viewIdx[i] == 1) {
                        webAr.ar.arData[i].wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(webAr.ar.arData[i].wrapPos));
                    }
                }
                webAr.ar.objectDataVal(webAr.ar.arData[i].zoomRateH, webAr.ar.arData[i].wrapPos);
            });

            bDOWN.addEventListener('click', function () {
                for (var i = 0; i < webAr.ar.arg.multi; i++) {
                    if (webAr.viewIdx[i] == 1) {
                        webAr.ar.arData[i].wrapPos = AFRAME.utils.coordinates.parse(webAr.ar.arData[i].wrap.getAttribute('position'));
                    }
                }
                for (var i = 0; i < webAr.ar.arg.multi; i++) {
                    if (webAr.viewIdx[i] == 1) {
                        if (!!(bAngle.classList.contains('current'))) {
                            webAr.ar.arData[i].wrapPos.y -= webAr.ar.arData[i].yClickRate[i];
                        } else {
                            webAr.ar.arData[i].wrapPos.z += webAr.ar.arData[i].yClickRate[i];
                        }
                    }
                }
                for (var i = 0; i < webAr.ar.arg.multi; i++) {
                    if (webAr.viewIdx[i] == 1) {
                        webAr.ar.arData[i].wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(webAr.ar.arData[i].wrapPos));
                    }
                }
                webAr.ar.objectDataVal(webAr.ar.arData[i].zoomRateH, webAr.ar.arData[i].wrapPos);
            });
            // ↑ 

            // UPボタン長押し
            bUP.addEventListener(self.eventNames.start, e => {
                e.preventDefault();
                bUP.classList.add('active');
                if (multiview) {
                    timer = setInterval(() => {
                        for (var i = 0; i < webAr.ar.arg.multi; i++) {
                            if (webAr.viewIdx[i] == 1) {
                                webAr.ar.arData[i].wrapPos = AFRAME.utils.coordinates.parse(webAr.ar.arData[i].wrap.getAttribute('position'));
                            }
                        }
                        for (var i = 0; i < webAr.ar.arg.multi; i++) {
                            if (webAr.viewIdx[i] == 1) {
                                if (!!(bAngle.classList.contains('current'))) {
                                    webAr.ar.arData[i].wrapPos.y += webAr.ar.arData[i].yTouchRate[i];
                                } else {
                                    webAr.ar.arData[i].wrapPos.z -= webAr.ar.arData[i].yTouchRate[i];
                                }
                            }
                        }
                        for (var i = 0; i < webAr.ar.arg.multi; i++) {
                            if (webAr.viewIdx[i] == 1) {
                                webAr.ar.arData[i].wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(webAr.ar.arData[i].wrapPos));
                                webAr.ar.objectDataVal(webAr.ar.arData[i].zoomRateH, webAr.ar.arData[i].wrapPos);
                            }
                        }
                    }, 10);
                } else {
                    for (var i = 0; i < webAr.ar.arg.multi; i++) {
                        if (webAr.viewIdx[i] == 1) {
                            timers[i] = setInterval(() => {
                                webAr.ar.arData[i].wrapPos = AFRAME.utils.coordinates.parse(webAr.ar.arData[i].wrap.getAttribute('position'));
                                if (!!(bAngle.classList.contains('current'))) {
                                    webAr.ar.arData[i].wrapPos.y += webAr.ar.arData[i].yTouchRate[i];
                                } else {
                                    webAr.ar.arData[i].wrapPos.z -= webAr.ar.arData[i].yTouchRate[i];
                                }
                                webAr.ar.arData[i].wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(webAr.ar.arData[i].wrapPos));
                                webAr.ar.objectDataVal(webAr.ar.arData[i].zoomRateH, webAr.ar.arData[i].wrapPos);
                            }, 10);
                        }
                    }
                }
            });

            bUP.addEventListener(self.eventNames.end, e => {
                e.preventDefault();
                bUP.classList.remove('active');
                for (var i = 0; i < webAr.ar.arg.multi; i++) {
                    clearInterval(timers[i]);
                }
                clearInterval(timer);
            });

            bUP.addEventListener(self.eventNames.move, e => {
                e.preventDefault();
                bUP.classList.remove('active');
                for (var i = 0; i < webAr.ar.arg.multi; i++) {
                    clearInterval(timers[i]);
                }
                clearInterval(timer);
            });

            // DOWNボタン長押し
            bDOWN.addEventListener(self.eventNames.start, e => {
                e.preventDefault();
                bDOWN.classList.add('active');
                if (multiview) {
                    timer = setInterval(() => {
                        for (var i = 0; i < webAr.ar.arg.multi; i++) {
                            if (webAr.viewIdx[i] == 1) {
                                webAr.ar.arData[i].wrapPos = AFRAME.utils.coordinates.parse(webAr.ar.arData[i].wrap.getAttribute('position'));
                            }
                        }
                        for (var i = 0; i < webAr.ar.arg.multi; i++) {
                            if (webAr.viewIdx[i] == 1) {
                                if (!!(bAngle.classList.contains('current'))) {
                                    webAr.ar.arData[i].wrapPos.y -= webAr.ar.arData[i].yTouchRate[i];
                                } else {
                                    webAr.ar.arData[i].wrapPos.z += webAr.ar.arData[i].yTouchRate[i];
                                }
                            }
                        }
                        for (var i = 0; i < webAr.ar.arg.multi; i++) {
                            if (webAr.viewIdx[i] == 1) {
                                webAr.ar.arData[i].wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(webAr.ar.arData[i].wrapPos));
                                webAr.ar.objectDataVal(webAr.ar.arData[i].zoomRateH, webAr.ar.arData[i].wrapPos);
                            }
                        }
                    }, 10);

                } else {
                    for (var i = 0; i < webAr.ar.arg.multi; i++) {
                        if (webAr.viewIdx[i] == 1) {
                            timers[i] = setInterval(() => {
                                webAr.ar.arData[i].wrapPos = AFRAME.utils.coordinates.parse(webAr.ar.arData[i].wrap.getAttribute('position'));
                                if (!!(bAngle.classList.contains('current'))) {
                                    webAr.ar.arData[i].wrapPos.y -= webAr.ar.arData[i].yTouchRate[i];
                                } else {
                                    webAr.ar.arData[i].wrapPos.z += webAr.ar.arData[i].yTouchRate[i];
                                }
                                webAr.ar.arData[i].wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(webAr.ar.arData[i].wrapPos));
                                webAr.ar.objectDataVal(webAr.ar.arData[i].zoomRateH, webAr.ar.arData[i].wrapPos);
                            }, 10);
                        }
                    }
                }
            });

            bDOWN.addEventListener(self.eventNames.end, e => {
                e.preventDefault();
                bDOWN.classList.remove('active');
                for (var i = 0; i < webAr.ar.arg.multi; i++) {
                    clearInterval(timers[i]);
                }
                clearInterval(timer);
            });

            bDOWN.addEventListener(self.eventNames.move, e => {
                e.preventDefault();
                bDOWN.classList.remove('active');
                for (var i = 0; i < webAr.ar.arg.multi; i++) {
                    clearInterval(timers[i]);
                }
                clearInterval(timer);
            });

            function getOnMarkers() {
                var j = 0;

                for (var i = 0; i < webAr.ar.arg.multi; i++) {
                    if (webAr.viewIdx[i] == 1) {
                        j++;
                        if (j > 1) {
                            return true;
                        }
                    }
                }
                return false;
            }
        },

        setTapEvents: function () {

            var self = this;
            var val = self.arData;
            var elem = document.getElementById("version1");
            var timer = 350;

            webAr.scene.addEventListener(self.eventNames.start, function (e) {
                
                ++tapCount;
                
                if (tapclicked && tapCount > 0) {

                    var objNo = '';

                    setTimeout(function () {
                        if (tapclicked && tapCount == 2 && !(scalechange)) {
                            tapclicked = false;
                            objNo = ((webAr.ar.arData[n_idx].srcno.obj + 1) <= webAr.ar.arData[n_idx].srcno.length) ? webAr.ar.arData[n_idx].srcno.obj + 1 : 1;
                            switchObject(e, objNo);
                            return;
                        }
                        if (tapclicked && tapCount >= 3 && !(scalechange)) {
                            tapclicked = false;
                            objNo = ((webAr.ar.arData[n_idx].srcno.obj - 1) > 0) ? webAr.ar.arData[n_idx].srcno.obj - 1 : webAr.ar.arData[n_idx].srcno.length;
                            switchObject(e, objNo);
                            return;
                        }
                    }, timer);
                }

                tapclicked = true;

                setTimeout(function () {

                    if (tapclicked && tapCount == 1 && !(scalechange)) {

                        e.preventDefault();

                        if (!(val[n_idx].isAnime)) {
                            if (!!(val[n_idx].isLogo)) {
                                if (val[n_idx].path) {
                                    self.arData[n_idx].logo.emit('turn0');
                                }
                            }
                        } else {
                            if (val[n_idx].isAnime == 11) {
                                if (val[n_idx].path && val[n_idx].isAnime == 11) {
                                    self.arData[n_idx].logo.emit('turn1');
                                }
                            }
                            if (val[n_idx].isAnime == 12) {
                                if (val[n_idx].path && val[n_idx].isAnime == 12) {
                                    self.arData[n_idx].logo.emit('turn2');
                                }
                            }
                            if (val[n_idx].isAnime == 13) {
                                if (val[n_idx].path && val[n_idx].isAnime == 13) {
                                    self.arData[n_idx].logo.emit('pos3');
                                    self.arData[n_idx].logo.emit('scale3');
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

                if (webAr.ar.arData[n_idx].srcno.length == 1) {
                    return;
                }

                if (!!(webAr.ar.arData[n_idx].isMp4)) {
                    return;
                }

                // ビューポートの変更(ズーム)を防止
                e.preventDefault();

                var shadow = document.getElementById('shadow' + (n_idx + 1).toString());
                if (shadow != null) {
                    shadow.remove();
                }
                var main = document.getElementById('main' + (n_idx + 1).toString());
                if (main != null) {
                    main.remove();
                }
                var logo = document.getElementById('logo' + (n_idx + 1).toString());
                if (logo != null) {
                    logo.remove();
                }

                webAr.ar.arData[n_idx].srcno.obj = fileno;
                webAr.ar.resetModel(n_idx, webAr.ar.arData[n_idx].srcno.obj);
                webAr.ar.resetScene(n_idx);
                webAr.ar.arData[n_idx].wrap.setAttribute('visible', true);

                tapCount = 0;
                tapclicked = false;
            };
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

            if (webAr.ar.arData[n_idx].oType != 'mp4') {

                document.getElementById("info1").style.display = "none";

                document.getElementById("scrshot").style.display = "inline";
                document.getElementById("swCamera").style.display = "inline";

                //document.getElementById("swAngle").style.display = 'inline';
                //document.getElementById("swParallel").style.display = 'inline';

            } else {

                document.getElementById("info1").style.display = "inline";

                document.getElementById("scrshot").style.display = "none";
                document.getElementById("swCamera").style.display = "none";

                //document.getElementById("swAngle").style.display = 'none';
                //document.getElementById("swParallel").style.display = 'none';

                if (mode) {
                    //document.getElementById("swAngle").style.display = 'none';
                    //document.getElementById("swParallel").style.display = 'none';
                } else {
                    //document.getElementById("swAngle").style.display = 'inline';
                    //document.getElementById("swParallel").style.display = 'inline';

                    document.getElementById("player").style.display = 'none';
                }
            }

            if (val[n_idx].isMarkerType == 1 || !!(val[n_idx].isPV)) {
                document.getElementById("arloader").style.display = 'none';
            }
        },

        positionVec3Logo: function (anime, oidx) {
            var self = this;
            var h1_2 = (self.arData[oidx].size.h / 5);
            var margin = ((self.arData[oidx].isMp4) ? 0.25 : 0);

            return { x: 0, y: -h1_2 - margin, z: 0 };
        },

        positionVec3: function (type, oidx) {
            var self = this;
            var h1 = self.arData[oidx].size.h;
            var h1_2 = self.arData[oidx].size.h / 2;

            var i = (!!(self.args[oidx].pv) ? h1_2 : (!!(self.args[oidx].isMarkerType == 1) ? -h1 * 5 : 0));

            if (type === 'shadow') {
                return { x: 0, y: 0, z: -h1_2 };
            } else {
                return { x: 0, y: h1_2, z: 0 };
            }
        },

        readBaseXml: function (filenm) {
            var xmlhttp = new XMLHttpRequest();
            var xml = new Array();

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var xmlTb = xmlhttp.responseXML;
                    xml = setXmldata(xmlTb);
                }
            }

            function setXmldata(xmldata) {

                var data = new Array();

                var cEd = xmldata.getElementsByTagName("ed");
                var cAr = xmldata.getElementsByTagName("ar");
                var cPv = xmldata.getElementsByTagName("pv");
                var cLen = xmldata.getElementsByTagName("len");

                var len = cEd.length;
                for (var i = 0; i < len; i++) {
                    data[i] = {
                        ed: cEd[i].textContent,
                        ar: cAr[i].textContent,
                        pv: cPv[i].textContent,
                        len: cLen[i].textContent
                    };
                }

                return data;
            };

            xmlhttp.open("GET", filenm, false);
            xmlhttp.send(null);

            return xml;
        },

        readPcsXml: function (filenm) {
            var xmlhttp = new XMLHttpRequest();
            var xml = new Array();

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var xmlTb = xmlhttp.responseXML;
                    xml = setXmldata(xmlTb);
                }
            }

            function setXmldata(tabelnm) {
                var data = new Array();

                var cM = tabelnm.getElementsByTagName("m");
                var cM1 = tabelnm.getElementsByTagName("m1");
                var cM2 = tabelnm.getElementsByTagName("m2");
                var cMo = tabelnm.getElementsByTagName("mo");
                var cT = tabelnm.getElementsByTagName("t");
                var cXs = tabelnm.getElementsByTagName("xs");
                var cAn = tabelnm.getElementsByTagName("an");
                var cWh = tabelnm.getElementsByTagName("wh");
                var cO = tabelnm.getElementsByTagName("o");
                var cO1 = tabelnm.getElementsByTagName("o1");
                var cO2 = tabelnm.getElementsByTagName("o2");
                var cO3 = tabelnm.getElementsByTagName("o3");
                var cL = tabelnm.getElementsByTagName("l");

                var len = cM.length;
                for (var i = 0; i < len; i++) {
                    data[i] = {
                        m: cM[i].textContent,
                        m1: cM1[i].textContent,
                        m2: cM2[i].textContent,
                        mo: cMo[i].textContent,
                        t: cT[i].textContent,
                        xs: cXs[i].textContent,
                        an: cAn[i].textContent,
                        wh: cWh[i].textContent,
                        o: cO[i].textContent,
                        o1: cO1[i].textContent,
                        o2: cO2[i].textContent,
                        o3: cO3[i].textContent,
                        l: cL[i].textContent
                    };
                }

                return data;
            };

            xmlhttp.open("GET", filenm, false);
            xmlhttp.send(null);

            return xml;
        }
    };

    webAr.ar = ar;
    webAr.ar.init();
    webAr.ar.setDiplayBtn(!!(ar.args[0].pv), ar.arData[0].srcno.obj);

    webAr.srcno = srcno;

    webAr.defAngle = defAngle;
    webAr.defPos = defPos;
    webAr.defScale = defScale;
    webAr.defwrapPos = defwrapPos;
    webAr.defwrapScale = defwrapScale;
    webAr.deflogoScale = deflogoScale;
    webAr.viewIdx = viewIdx;
}());

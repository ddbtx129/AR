var webAr = webAr || {};

var videoInfo = {};
var videoState = 0;
var tapCount = 0;
var tapclicked = false;

var viewmode = 'marker';

(function (global) {

    document.getElementById("info1").style.display = "inline";
    webAr.scene = document.querySelector('a-scene');

    var shadowopacity = 0.5;
    var shadowalphaTest = 0.5;

    var defAngle = 0;

    var defPos = { x: 0, y: 0, z: 0 };
    var defScale = { x: 4, y: 4, z: 4 };
    var defwrapPos = { x: 0, y: 0, z: 0 };
    var defwrapScale = { x: 4, y: 4, z: 4 };
    var deflogoScale = { x: 8, y: 6, z: 6 };

    var objAngle = 5;
    var srcno = { obj: 1, from: 1, to: 1, length: 1 };
    var scalechange = 0;

    var loaderEnd = 0;

    var idx = 0;
    var n_idx = 0;

    var defwrap = {};
    var defobj = {};
    var deflogo = {};
    var markerIdx = '';
    var videoState = {};
    var roulettestate = 0;

    var ar = {

        init: function () {
            
            loaderEnd = 0;
            document.getElementById("swPlay").style.display = 'none';

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

                // イベント設定
                this.setOverturnEvents();
                this.setResizeEvents();
                this.setMoveEvents();
                this.setTapEvents();
                this.setPreviewEvents();
                this.setRouletteRollEvents();
            }

            this.setSwitcher();

            var elem = document.getElementById("version1");
            elem.innerHTML = 'v1.0.130';

            var msg3 = document.getElementById('mloader3');
            msg3.innerHTML = 'データ読み込み中・・・';

            if(n_idx <= 1) {
                var msg1 = document.getElementById('mloader1-1');
                var msg2 = document.getElementById('mloader1-2');

                if (this.arData[0].isMarkerType == 1) {
                    msg1.innerHTML = "対象マーカーを検出し表示します。";
                    msg2.innerHTML = "マーカーに垂直にしてください。";
                } else {
                    msg1.innerHTML = "対象イメージを追跡し表示します。";
                    msg2.innerHTML = "対象イメージに水平にしてください。";
                }
            }
        },

        setArg: function () {

            var self = this;

            var arg = {};
            var viewIdx = {};
            var args = {};
            var pair = location.search.substring(1).split('&');

            for (var i = 0; pair[i]; i++) {
                var kv = pair[i].split('=');
                arg[kv[0]] = decodeURIComponent(kv[1]);
            }

            arg.DebugMode = arg.debug && (parseInt(arg.debug, 10).toString());
            arg.targetObj = arg.target ? (parseInt(arg.target, 10).toString()) : 0;

            if (!!(arg.xd)) {
                
                var base = {};
                base = this.readBaseXml('data/' + arg.mo + '/' + arg.x + '.xml');

                var pcs = {};
                pcs = this.readPcsXml('data/' + arg.mo + '/' + arg.x + '.xml');

                // プレビューモード
                //arg.PVList = base[0].pv;
                arg.PVList = arg.pv;

                // マーカー OR NFT
                arg.ARList = base[0].ar && (parseInt(base[0].ar, 10).toString());
                
                arg.Multi = pcs.length;

                for (idx = 0; idx < arg.Multi; idx++) {

                    args[idx] = {};

                    // マーカー OR NFT
                    args[idx].ARList = pcs[idx].ar && (parseInt(pcs[idx].ar, 10).toString());

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

                    // 追加オブジェクト
                    args[idx].OAtList = pcs[idx].oa;
                    args[idx].OBtList = pcs[idx].ob;
                    args[idx].OCList = pcs[idx].oc;
                    
                    // オブジェクトZ軸(重なり)
                    args[idx].OZList = pcs[idx].oz && Number(pcs[idx].oz);
                    args[idx].OAZList = pcs[idx].oaz && Number(pcs[idx].oaz);
                    args[idx].OBZList = pcs[idx].obz && Number(pcs[idx].obz);
                    args[idx].OCZList = pcs[idx].ocz && Number(pcs[idx].ocz);

                    // マーカー＆オブジェクト
                    args[idx].MkObjList = pcs[idx].mo;

                    viewIdx[idx] = 0;
                    videoState[idx] = 0;

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

                if (arg.Multi > 1) {
                    var bMulti = document.getElementById('imgMulti');
                    bMulti.src = 'asset/markers-w.png';
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

                // マーカー OR NFT
                args[idx].ARList = arg.ar && (parseInt(arg.ar, 10).toString());

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

                // 追加オブジェクト
                args[idx].OAtList = args[idx].oa;
                args[idx].OBtList = args[idx].ob;
                args[idx].OCList = args[idx].oc;

                // オブジェクトZ軸(重なり)
                args[idx].OZList = 0;
                args[idx].OAZList = 0;
                args[idx].OBZList = 0;
                args[idx].OCZList = 0;

                viewIdx[0] = 0;
                videoState[0] = 0;

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

            if (!(arg.DebugMode)) {
                document.getElementById('debug1').style.display = 'none';
                document.getElementById('debug2').style.display = 'none';
                document.getElementById('debug3').style.display = 'none';
            }

            self.arg = arg;
            self.args = args;

            self.viewIdx = viewIdx;
            self.videoState = videoState;
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

                defobj[idx] = {};

                var objecttype = (!(self.args[idx].typeList) ? GetFileType('') : GetFileType(String(self.args[idx].typeList)));
                
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
                dataObj[idx].oType = objecttype;

                dataObj[idx].paths = {};
                dataObj[idx].ObjectPath = {};

                dataObj[idx].srcno = { obj: 1, from: 1, to: 1, length: 1 };

                if (seq > 1) {
                    dataObj[idx].srcno.length = 0;

                    for (var i = 0; i <= seq; i++) {
                        dataObj[idx].ObjectPath[i] = {};
                        dataObj[idx].paths[i] = object[i] + '.' + dataObj[idx].oType;
                        if (!!(self.args[idx].OAtList)) {
                            dataObj[idx].ObjectPath[i].A = object[i] + '-a.' + dataObj[idx].oType;
                        }
                        if (!!(self.args[idx].OBtList)) {
                            dataObj[idx].ObjectPath[i].B = object[i] + '-b.' + dataObj[idx].oType;
                        }
                        if (!!(self.args[idx].OCtList)) {
                            dataObj[idx].ObjectPath[i].C = object[i] + '-c.' + dataObj[idx].oType;
                        }
                        dataObj[idx].srcno.length += 1;
                    }
                } else {
                    dataObj[idx].ObjectPath[0] = {};
                    dataObj[idx].paths[0] = object[0] + '.' + dataObj[idx].oType;
                    if (!!(self.args[idx].OAtList)) {
                        dataObj[idx].ObjectPath[0].A = object[0] + '-a.' + dataObj[idx].oType;
                    }
                    if (!!(self.args[idx].OBtList)) {
                        dataObj[idx].ObjectPath[0].B = object[0] + '-b.' + dataObj[idx].oType;
                    }
                    if (!!(self.args[idx].OCtList)) {
                        dataObj[idx].ObjectPath[0].C = object[0] + '-c.' + dataObj[idx].oType;
                    }
                }

                if (n_idx < dataObj[idx].srcno.length) {
                    n_idx = dataObj[idx].srcno.length
                }

                dataObj[idx].isPng = !!(dataObj[idx].path || '').match(/\.png$/i);
                dataObj[idx].isGif = !!(dataObj[idx].path || '').match(/\.gif$/i);
                dataObj[idx].isMp4 = !!(dataObj[idx].path || '').match(/\.mp4$/i);
                dataObj[idx].isGltf = !!(dataObj[idx].path || '').match(/\.gltf$/i);
                dataObj[idx].isPV = !!(self.arg.PVList);
                dataObj[idx].isNFT = !!(self.arg.ARList);
                dataObj[idx].isMarkerType = !!(self.args[idx].ARList) ? Number(self.args[idx].ARList) : 1;
                dataObj[idx].isLogo = (!!(self.args[idx].LogoList) ? self.args[idx].LogoList[0] : '0');
                dataObj[idx].isAnime = (!!(self.args[idx].LogoAnimeList) ? Number(self.args[idx].LogoAnimeList) : 0);
                dataObj[idx].isShadow = self.args[idx].shodowList && !!Number(self.args[idx].shodowList);
                
                // サイズ
                self.args[idx].sizeList = String(!!(!!(self.args[idx].sizeList) && Number(self.args[idx].ar) == 0) ? self.args[idx].sizeList : GetDefaultSize((dataObj[idx].isMarkerType == 1 ? 0 : 1), dataObj[idx].oType));
                
                var wh = SizeSplit(self.args[idx].sizeList).toString().split(',');
                var i = ((parseInt(self.args[idx].sizeList).toString(10)).length % 2 == 0) ? (parseInt(self.args[idx].sizeList).toString(10)).length : (parseInt(self.args[idx].sizeList).toString(10)).length + 1;
                var j = (dataObj[idx].isMarkerType == 1 ? 2 : 2);
                
                dataObj[idx].size = { w: (Number(wh[0]) * (10 ** -((i - j) / 2))).toFixed(1), h: (Number(wh[1]) * (10 ** -((i - j) / 2))).toFixed(1) };
                defobj[idx].Scale = { x: dataObj[idx].size.w, y: dataObj[idx].size.h, z: dataObj[idx].size.h };
                
                // オブジェクトソース
                if (dataObj[idx].path) {

                    var folder = !!(dataObj[idx].isMp4) ? 'video' : (!!(dataObj[idx].isGltf) ? 'gltf' : 'pic');
                    dataObj[idx].path = rootPath + 'article/' + folder + '/' + dataObj[idx].path;
                    dataObj[idx].arObj = {};

                    if (!!(dataObj[idx].isPng) || !!(dataObj[idx].isGif)) {

                        var img = {};
                        var imgAdd = {};

                        for (var i = 0; i <= seq; i++) {

                            dataObj[idx].arObj[i] = {};

                            dataObj[idx].paths[i] = rootPath + 'article/' + folder + '/' + dataObj[idx].paths[i];

                            img[i] = document.createElement('img');
                            img[i].setAttribute('crossorigin', 'anonymous');
                            img[i].setAttribute('id', 'source' + ((idx + 1) * 100 + (i + 1)).toString());
                            img[i].setAttribute('src', dataObj[idx].paths[i]);

                            dataObj[idx].arObj[i][0] = img[i];

                            assets.appendChild(img[i]);

                            imgAdd[i] = {};

                            if (!!(self.args[idx].OAtList)) {
                                dataObj[idx].ObjectPath[i].A = rootPath + 'article/' + folder + '/' + dataObj[idx].ObjectPath[i].A;

                                imgAdd[i].A = document.createElement('img');
                                imgAdd[i].A.setAttribute('crossorigin', 'anonymous');
                                imgAdd[i].A.setAttribute('id', 'asource' + ((idx + 1) * 100 + (i + 1)).toString());
                                imgAdd[i].A.setAttribute('src', dataObj[idx].ObjectPath[i].A);

                                dataObj[idx].arObj[i][1] = imgAdd[i].A;

                                assets.appendChild(imgAdd[i].A);
                            }
                            if (!!(self.args[idx].OBtList)) {
                                dataObj[idx].ObjectPath[i].B = rootPath + 'article/' + folder + '/' + dataObj[idx].ObjectPath[i].B;

                                imgAdd[i].B = document.createElement('img');
                                imgAdd[i].B.setAttribute('crossorigin', 'anonymous');
                                imgAdd[i].B.setAttribute('id', 'bsource' + ((idx + 1) * 100 + (i + 1)).toString());
                                imgAdd[i].B.setAttribute('src', dataObj[idx].ObjectPath[i].B);

                                dataObj[idx].arObj[i][2] = imgAdd[i].B;

                                assets.appendChild(imgAdd[i].B);
                            }
                            if (!!(self.args[idx].OCtList)) {
                                dataObj[idx].ObjectPath[i].C = rootPath + 'article/' + folder + '/' + dataObj[idx].ObjectPath[i].C;

                                imgAdd[i].C = document.createElement('img');
                                imgAdd[i].C.setAttribute('crossorigin', 'anonymous');
                                imgAdd[i].C.setAttribute('id', 'csource' + ((idx + 1) * 100 + (i + 1)).toString());
                                imgAdd[i].C.setAttribute('src', dataObj[idx].ObjectPath[i].C);

                                dataObj[idx].arObj[i][3] = imgAdd[i].C;

                                assets.appendChild(imgAdd[i].C);
                            }
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
                            audio[i].setAttribute('id', 'asource' + ((idx + 1) * 100 + (i + 1)).toString());
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

            if (self.arData[0].isPV) {
                swPreview.classList.add('current');
            } else {
                swMarker.classList.add('current');
            }
            
            swMarker.addEventListener('click', function () {
                if (!this.classList.contains('current')) {
                    webAr.markerIdx = '';
                    location.replace(location.search.replace('&pv=1', ''));
                    for (var i = 0; i < webAr.ar.arg.Multi; i++) {
                        webAr.ar.videoState[i] = 0;
                    }
                    this.setDiplayBtn(0);
                }
            });

            swPreview.addEventListener('click', function () {
                if (!this.classList.contains('current')) {
                    webAr.markerIdx = '1';
                    location.replace(location.search + '&pv=1');
                    for (var i = 0; i < webAr.ar.arg.Multi; i++) {
                        webAr.ar.videoState[i] = 0;
                    }
                    this.setDiplayBtn(1);
                }
            });
        },

        setWrap: function () {

            var self = this;
            self.wrap = new Array;

            for (idx = 0; idx < self.arg.Multi; idx++) {

                defwrap[idx] = { Pos: defwrapPos, Scale: defwrapScale };

                var wrap= document.createElement('a-entity');

                wrap.setAttribute('id', 'base' + ((idx + 1)).toString());
                wrap.setAttribute('scale', AFRAME.utils.coordinates.stringify(defwrap[idx].Scale));
                wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(defwrap[idx].Pos));
                wrap.setAttribute('rotation', '0 0 0');
                wrap.setAttribute('src', rootPath + 'asset/plane.png');
                wrap.setAttribute('material', 'transparent: true, opacity: 0');
                wrap.setAttribute('style', 'z-index: 5');
                wrap.setAttribute('visible', true);
                
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
                var asrcname = '#asource' + (((idx + 1) * 100) + objno).toString();
                var bsrcname = '#bsource' + (((idx + 1) * 100) + objno).toString();
                var csrcname = '#csource' + (((idx + 1) * 100) + objno).toString();

                if (val[idx].isShadow) {
                    var shadow = document.createElement('a-image');
                    var posVec3shadow = self.positionVec3('shadow', idx);

                    shadow.setAttribute('id', 'shadow' + (idx + 1).toString());
                    shadow.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3shadow));
                    shadow.setAttribute('rotation', '-90 0 0');
                    shadow.setAttribute('style', 'z-index: 2');

                    AFRAME.utils.entity.setComponentProperty(shadow, 'geometry', {
                        primitive: 'plane', height: defobj[idx].Scale.y, width: defobj[idx].Scale.x
                    });

                    AFRAME.utils.entity.setComponentProperty(shadow, 'material', {
                        shader: val.isGif ? 'gif' : 'flat', npot: true, src: srcname, transparent: true, alphaTest: shadowalphaTest,
                        color: 'black', opacity: shadowopacity, depthTest: false
                    });

                    self.arData[idx].shadow = shadow;

                    if (self.args[idx].OAtList) {
                        var ashadow = document.createElement('a-image');
                        var posVec3ashadow = { x: posVec3shadow.x, y: posVec3shadow.y, z: Number(posVec3shadow.z) };
                        defobj[idx].posVec3ashadowa = posVec3ashadow;

                        ashadow.setAttribute('id', 'ashadow' + (idx + 1).toString());
                        ashadow.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3ashadow));

                        ashadow.setAttribute('rotation', '-90 0 0');
                        ashadow.setAttribute('style', 'z-index: 2');
                        ashadow.setAttribute('visible', !(self.arg.targetObj));

                        AFRAME.utils.entity.setComponentProperty(ashadow, 'geometry', {
                            primitive: 'plane', height: (defobj[idx].Scale.y), width: (defobj[idx].Scale.x)
                        });

                        AFRAME.utils.entity.setComponentProperty(ashadow, 'material', {
                            shader: val.isGif ? 'gif' : 'flat', npot: true, src: asrcname, transparent: true, alphaTest: shadowalphaTest,
                            color: 'black', opacity: shadowopacity, depthTest: false
                        });

                        self.arData[idx].ashadow = ashadow;
                    }

                    if (self.args[idx].OBtList) {
                        var bshadow = document.createElement('a-image');
                        var posVec3bshadow = { x: posVec3shadow.x, y: posVec3shadow.y, z: Number(posVec3shadow.z) };
                        defobj[idx].posVec3bshadow = posVec3bshadow;

                        bshadow.setAttribute('id', 'ashadow' + (idx + 1).toString());
                        bshadow.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3bshadow));

                        bshadow.setAttribute('rotation', '-90 0 0');
                        bshadow.setAttribute('style', 'z-index: 2');
                        bshadow.setAttribute('visible', !(self.arg.targetObj));

                        AFRAME.utils.entity.setComponentProperty(bshadow, 'geometry', {
                            primitive: 'plane', height: (defobj[idx].Scale.y), width: (defobj[idx].Scale.x)
                        });

                        AFRAME.utils.entity.setComponentProperty(bshadow, 'material', {
                            shader: val.isGif ? 'gif' : 'flat', npot: true, src: bsrcname, transparent: true, alphaTest: shadowalphaTest,
                            color: 'black', opacity: shadowopacity, depthTest: false
                        });

                        self.arData[idx].bshadow = bshadow;
                    }

                    if (self.args[idx].OCtList) {
                        var cshadow = document.createElement('a-image');
                        var posVec3cshadow = { x: posVec3shadow.x, y: posVec3shadow.y, z: Number(posVec3shadow.z) };
                        defobj[idx].posVec3cshadow = posVec3cshadow;

                        cshadow.setAttribute('id', 'ashadow' + (idx + 1).toString());
                        cshadow.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3cshadow));

                        cshadow.setAttribute('rotation', '-90 0 0');
                        cshadow.setAttribute('style', 'z-index: 2');
                        cshadow.setAttribute('visible', !(self.arg.targetObj));

                        AFRAME.utils.entity.setComponentProperty(cshadow, 'geometry', {
                            primitive: 'plane', height: (defobj[idx].Scale.y), width: (defobj[idx].Scale.x)
                        });

                        AFRAME.utils.entity.setComponentProperty(cshadow, 'material', {
                            shader: val.isGif ? 'gif' : 'flat', npot: true, src: csrcname, transparent: true, alphaTest: shadowalphaTest,
                            color: 'black', opacity: shadowopacity, depthTest: false
                        });

                        self.arData[idx].cshadow = cshadow;
                    }
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
                main.setAttribute('position', AFRAME.utils.coordinates.stringify(defobj[idx].Pos));

                if (!val[idx].isGif) {

                    main.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));

                    if (!val[idx].isGltf) {

                        main.setAttribute('width', AFRAME.utils.coordinates.stringify(defobj[idx].Scale.x));
                        main.setAttribute('height', AFRAME.utils.coordinates.stringify(defobj[idx].Scale.y));

                        main.setAttribute('style', 'z-index: 3');

                        if (val[idx].isMp4) {
                            main.setAttribute('play', 'true');
                        }

                        AFRAME.utils.entity.setComponentProperty(main, 'geometry', {
                            primitive: 'plane', height: defobj[idx].Scale.y, width: defobj[idx].Scale.x, segmentsHeight: 1, segmentsWidth: 1
                        });

                        AFRAME.utils.entity.setComponentProperty(main, 'material', {
                            shader: val.isGif ? 'gif' : 'standard', npot: true, src: srcname, displacementMap: null, displacementBias: -0.5,
                            side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                        });
                    } else {
                        main.setAttribute('scale', AFRAME.utils.coordinates.stringify(defobj[idx].Scale));
                    }

                } else {
                    main.setAttribute('rotation', '-30 0 0');
                }

                self.arData[idx].main = main;

                if (self.args[idx].OAtList) {

                    var amain = document.createElement(elname);

                    var posVec3a = { x: Number(posVec3.x), y: Number(posVec3.y), z: Number(posVec3.z) + Number(self.args[idx].OAZList) };
                    defobj[idx].posVec3a = posVec3a;

                    amain.setAttribute('id', 'amain' + (idx + 1).toString());
                    amain.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3a));

                    if (!val[idx].isGif) {

                        amain.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));

                        if (!val[idx].isGltf) {
                            amain.setAttribute('width', AFRAME.utils.coordinates.stringify(defobj[idx].Scale.x));
                            amain.setAttribute('height', AFRAME.utils.coordinates.stringify(defobj[idx].Scale.y));

                            amain.setAttribute('style', 'z-index: 4');

                            if (val[idx].isMp4) {
                                amain.setAttribute('play', 'true');
                            }

                            AFRAME.utils.entity.setComponentProperty(amain, 'geometry', {
                                primitive: 'plane', height: defobj[idx].Scale.y, width: defobj[idx].Scale.x, segmentsHeight: 1, segmentsWidth: 1
                            });

                            AFRAME.utils.entity.setComponentProperty(amain, 'material', {
                                shader: val.isGif ? 'gif' : 'standard', npot: true, src: asrcname, displacementMap: null, displacementBias: -0.5,
                                side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                            });
                        } else {
                            amain.setAttribute('scale', AFRAME.utils.coordinates.stringify(defobj[idx].Scale));
                        }

                    } else {
                        amain.setAttribute('rotation', '-30 0 0');
                    }

                    self.arData[idx].amain = amain;
                }

                if (self.args[idx].OBtList) {

                    var bmain = document.createElement(elname);

                    var posVec3b = { x: Number(posVec3.x), y: Number(posVec3.y), z: Number(posVec3.z) + Number(self.args[idx].OBZList) };
                    defobj[idx].posVec3b = posVec3b;

                    bmain.setAttribute('id', 'bmain' + (idx + 1).toString());
                    bmain.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3b));

                    if (!val[idx].isGif) {

                        bmain.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));

                        if (!val[idx].isGltf) {
                            bmain.setAttribute('width', AFRAME.utils.coordinates.stringify(defobj[idx].Scale.x));
                            bmain.setAttribute('height', AFRAME.utils.coordinates.stringify(defobj[idx].Scale.y));

                            bmain.setAttribute('style', 'z-index: 4');

                            if (val[idx].isMp4) {
                                bmain.setAttribute('play', 'true');
                            }

                            AFRAME.utils.entity.setComponentProperty(bmain, 'geometry', {
                                primitive: 'plane', height: defobj[idx].Scale.y, width: defobj[idx].Scale.x, segmentsHeight: 1, segmentsWidth: 1
                            });

                            AFRAME.utils.entity.setComponentProperty(bmain, 'material', {
                                shader: val.isGif ? 'gif' : 'standard', npot: true, src: bsrcname, displacementMap: null, displacementBias: -0.5,
                                side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                            });
                        } else {
                            bmain.setAttribute('scale', AFRAME.utils.coordinates.stringify(defobj[idx].Scale));
                        }

                    } else {
                        bmain.setAttribute('rotation', '-30 0 0');
                    }

                    self.arData[idx].bmain = bmain;
                }

                if (self.args[idx].OCtList) {

                    var cmain = document.createElement(elname);

                    var posVec3c = { x: Number(posVec3.x), y: Number(posVec3.y), z: Number(posVec3.z) + Number(self.args[idx].OCZList) };
                    defobj[idx].posVec3c = posVec3c;

                    cmain.setAttribute('id', 'cmain' + (idx + 1).toString());
                    cmain.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3c));

                    if (!val[idx].isGif) {

                        cmain.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));

                        if (!val[idx].isGltf) {
                            cmain.setAttribute('width', AFRAME.utils.coordinates.stringify(defobj[idx].Scale.x));
                            cmain.setAttribute('height', AFRAME.utils.coordinates.stringify(defobj[idx].Scale.y));

                            cmain.setAttribute('style', 'z-index: 4');

                            if (val[idx].isMp4) {
                                cmain.setAttribute('play', 'true');
                            }

                            AFRAME.utils.entity.setComponentProperty(cmain, 'geometry', {
                                primitive: 'plane', height: defobj[idx].Scale.y, width: defobj[idx].Scale.x, segmentsHeight: 1, segmentsWidth: 1
                            });

                            AFRAME.utils.entity.setComponentProperty(cmain, 'material', {
                                shader: val.isGif ? 'gif' : 'standard', npot: true, src: csrcname, displacementMap: null, displacementBias: -0.5,
                                side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                            });
                        } else {
                            cmain.setAttribute('scale', AFRAME.utils.coordinates.stringify(defobj[idx].Scale));
                        }

                    } else {
                        cmain.setAttribute('rotation', '-30 0 0');
                    }

                    self.arData[idx].cmain = cmain;
                }

                if (val[idx].isLogo) {

                    var logo = document.createElement('a-entity');
                    var rate = (!val[idx].isMp4) ? 1 : 2;

                    deflogo[idx] = {
                        Pos: self.positionVec3Logo(Number(val[idx].isAnime), idx),
                        Scale: ((deflogoScale.x * rate) + ' ' + (deflogoScale.y * rate) + ' ' + (deflogoScale.z * rate))
                    };

                    logo.setAttribute('id', 'logo' + (idx + 1).toString());
                    logo.setAttribute('position', AFRAME.utils.coordinates.stringify(deflogo[idx].Pos));
                    logo.setAttribute('scale', AFRAME.utils.coordinates.stringify(deflogo[idx].Scale));
                    logo.setAttribute('gltf-model', '#logosource' + ((idx + 1) * 100 + 1).toString());
                    logo.setAttribute('style', 'z-index: 5');

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
            var asrcname = '#asource' + (((Number(oidx) + 1) * 100) + objno).toString();
            var bsrcname = '#bsource' + (((Number(oidx) + 1) * 100) + objno).toString();
            var csrcname = '#csource' + (((Number(oidx) + 1) * 100) + objno).toString();

            if (val[oidx].isShadow) {
                var shadow = document.createElement('a-image');

                shadow.setAttribute('id', 'shadow' + ((oidx + 1)).toString());
                shadow.setAttribute('position', AFRAME.utils.coordinates.stringify(self.positionVec3('shadow', oidx)));
                shadow.setAttribute('rotation', '-90 0 0');
                shadow.setAttribute('style', 'z-index: 2');

                AFRAME.utils.entity.setComponentProperty(shadow, 'geometry', {
                    primitive: 'plane', height: defobj[oidx].Scale.y, width: defobj[oidx].Scale.x
                });

                AFRAME.utils.entity.setComponentProperty(shadow, 'material', {
                    shader: val.isGif ? 'gif' : 'flat', npot: true, src: srcname, transparent: true, alphaTest: 0.1,
                    color: 'black', opacity: 0.3, depthTest: false
                });

                self.arData[oidx].shadow = shadow;

                if (self.args[oidx].OAtList) {
                    var ashadow = document.createElement('a-image');
                    var posVec3ashadow = { x: posVec3shadow.x, y: posVec3shadow.y, z: Number(posVec3shadow.z) };
                    defobj[oidx].posVec3ashadowa = posVec3ashadow;

                    ashadow.setAttribute('id', 'ashadow' + (oidx + 1).toString());
                    ashadow.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3ashadow));

                    ashadow.setAttribute('rotation', '-90 0 0');
                    ashadow.setAttribute('style', 'z-index: 2');
                    ashadow.setAttribute('visible', !(self.arg.targetObj));

                    AFRAME.utils.entity.setComponentProperty(ashadow, 'geometry', {
                        primitive: 'plane', height: (defobj[oidx].Scale.y), width: (defobj[oidx].Scale.x)
                    });

                    AFRAME.utils.entity.setComponentProperty(ashadow, 'material', {
                        shader: val.isGif ? 'gif' : 'flat', npot: true, src: asrcname, transparent: true, alphaTest: shadowalphaTest,
                        color: 'black', opacity: shadowopacity, depthTest: false
                    });

                    self.arData[oidx].ashadow = ashadow;
                }

                if (self.args[oidx].OBtList) {
                    var bshadow = document.createElement('a-image');
                    var posVec3bshadow = { x: posVec3shadow.x, y: posVec3shadow.y, z: Number(posVec3shadow.z) };
                    defobj[oidx].posVec3bshadow = posVec3bshadow;

                    bshadow.setAttribute('id', 'ashadow' + (oidx + 1).toString());
                    bshadow.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3bshadow));

                    bshadow.setAttribute('rotation', '-90 0 0');
                    bshadow.setAttribute('style', 'z-index: 2');
                    bshadow.setAttribute('visible', !(self.arg.targetObj));

                    AFRAME.utils.entity.setComponentProperty(bshadow, 'geometry', {
                        primitive: 'plane', height: (defobj[oidx].Scale.y), width: (defobj[oidx].Scale.x)
                    });

                    AFRAME.utils.entity.setComponentProperty(bshadow, 'material', {
                        shader: val.isGif ? 'gif' : 'flat', npot: true, src: bsrcname, transparent: true, alphaTest: shadowalphaTest,
                        color: 'black', opacity: shadowopacity, depthTest: false
                    });

                    self.arData[oidx].bshadow = bshadow;
                }

                if (self.args[oidx].OCtList) {
                    var cshadow = document.createElement('a-image');
                    var posVec3cshadow = { x: posVec3shadow.x, y: posVec3shadow.y, z: Number(posVec3shadow.z) };
                    defobj[oidx].posVec3cshadow = posVec3cshadow;

                    cshadow.setAttribute('id', 'ashadow' + (oidx + 1).toString());
                    cshadow.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3cshadow));

                    cshadow.setAttribute('rotation', '-90 0 0');
                    cshadow.setAttribute('style', 'z-index: 2');
                    cshadow.setAttribute('visible', !(self.arg.targetObj));

                    AFRAME.utils.entity.setComponentProperty(cshadow, 'geometry', {
                        primitive: 'plane', height: (defobj[oidx].Scale.y), width: (defobj[oidx].Scale.x)
                    });

                    AFRAME.utils.entity.setComponentProperty(cshadow, 'material', {
                        shader: val.isGif ? 'gif' : 'flat', npot: true, src: csrcname, transparent: true, alphaTest: shadowalphaTest,
                        color: 'black', opacity: shadowopacity, depthTest: false
                    });

                    self.arData[oidx].cshadow = cshadow;
                }
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
                        shader: val.isGif ? 'gif' : 'standard', npot: true, src: asrcname, displacementMap: null, displacementBias: -0.5,
                        side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                    });
                } else {
                    main.setAttribute('scale', AFRAME.utils.coordinates.stringify(defobj[oidx].Scale));
                }

            } else {
                main.setAttribute('rotation', '-30 0 0');
            }

            self.arData[oidx].main = main;

            if (self.args[oidx].OAtList) {

                var amain = document.createElement(elname);

                var posVec3a = { x: Number(posVec3.x), y: Number(posVec3.y), z: Number(posVec3.z) + Number(self.args[oidx].OAZList) };
                defobj[oidx].posVec3a = posVec3a;

                amain.setAttribute('id', 'amain' + (oidx + 1).toString());
                amain.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3a));

                if (!val[oidx].isGif) {

                    amain.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));

                    if (!val[oidx].isGltf) {
                        amain.setAttribute('width', AFRAME.utils.coordinates.stringify(defobj[oidx].Scale.x));
                        amain.setAttribute('height', AFRAME.utils.coordinates.stringify(defobj[oidx].Scale.y));

                        amain.setAttribute('style', 'z-index: 4');

                        if (val[oidx].isMp4) {
                            amain.setAttribute('play', 'true');
                        }

                        AFRAME.utils.entity.setComponentProperty(amain, 'geometry', {
                            primitive: 'plane', height: defobj[oidx].Scale.y, width: defobj[oidx].Scale.x, segmentsHeight: 1, segmentsWidth: 1
                        });

                        AFRAME.utils.entity.setComponentProperty(amain, 'material', {
                            shader: val.isGif ? 'gif' : 'standard', npot: true, src: asrcname, displacementMap: null, displacementBias: -0.5,
                            side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                        });
                    } else {
                        amain.setAttribute('scale', AFRAME.utils.coordinates.stringify(defobj[oidx].Scale));
                    }

                } else {
                    amain.setAttribute('rotation', '-30 0 0');
                }

                self.arData[oidx].amain = amain;
            }

            if (self.args[oidx].OBtList) {

                var bmain = document.createElement(elname);

                var posVec3b = { x: Number(posVec3.x), y: Number(posVec3.y), z: Number(posVec3.z) + Number(self.args[oidx].OBZList) };
                defobj[oidx].posVec3b = posVec3b;

                bmain.setAttribute('id', 'bmain' + (oidx + 1).toString());
                bmain.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3b));

                if (!val[oidx].isGif) {

                    bmain.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));

                    if (!val[oidx].isGltf) {
                        bmain.setAttribute('width', AFRAME.utils.coordinates.stringify(defobj[oidx].Scale.x));
                        bmain.setAttribute('height', AFRAME.utils.coordinates.stringify(defobj[oidx].Scale.y));

                        bmain.setAttribute('style', 'z-index: 4');

                        if (val[oidx].isMp4) {
                            bmain.setAttribute('play', 'true');
                        }

                        AFRAME.utils.entity.setComponentProperty(bmain, 'geometry', {
                            primitive: 'plane', height: defobj[oidx].Scale.y, width: defobj[oidx].Scale.x, segmentsHeight: 1, segmentsWidth: 1
                        });

                        AFRAME.utils.entity.setComponentProperty(bmain, 'material', {
                            shader: val.isGif ? 'gif' : 'standard', npot: true, src: bsrcname, displacementMap: null, displacementBias: -0.5,
                            side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                        });
                    } else {
                        bmain.setAttribute('scale', AFRAME.utils.coordinates.stringify(defobj[oidx].Scale));
                    }

                } else {
                    bmain.setAttribute('rotation', '-30 0 0');
                }

                self.arData[oidx].bmain = bmain;
            }

            if (self.args[oidx].OCtList) {

                var cmain = document.createElement(elname);

                var posVec3c = { x: Number(posVec3.x), y: Number(posVec3.y), z: Number(posVec3.z) + Number(self.args[oidx].OCZList) };
                defobj[oidx].posVec3c = posVec3c;

                cmain.setAttribute('id', 'cmain' + (oidx + 1).toString());
                cmain.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3c));

                if (!val[oidx].isGif) {

                    cmain.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));

                    if (!val[oidx].isGltf) {
                        cmain.setAttribute('width', AFRAME.utils.coordinates.stringify(defobj[oidx].Scale.x));
                        cmain.setAttribute('height', AFRAME.utils.coordinates.stringify(defobj[oidx].Scale.y));

                        cmain.setAttribute('style', 'z-index: 4');

                        if (val[oidx].isMp4) {
                            cmain.setAttribute('play', 'true');
                        }

                        AFRAME.utils.entity.setComponentProperty(cmain, 'geometry', {
                            primitive: 'plane', height: defobj[oidx].Scale.y, width: defobj[oidx].Scale.x, segmentsHeight: 1, segmentsWidth: 1
                        });

                        AFRAME.utils.entity.setComponentProperty(cmain, 'material', {
                            shader: val.isGif ? 'gif' : 'standard', npot: true, src: csrcname, displacementMap: null, displacementBias: -0.5,
                            side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                        });
                    } else {
                        cmain.setAttribute('scale', AFRAME.utils.coordinates.stringify(defobj[oidx].Scale));
                    }

                } else {
                    cmain.setAttribute('rotation', '-30 0 0');
                }

                self.arData[oidx].cmain = cmain;
            }

            if (val[oidx].isLogo) {

                var logo = document.createElement('a-entity');
                var rate = (!val[oidx].isMp4) ? 1 : 2;

                deflogo[oidx] = {
                    Pos: self.positionVec3Logo(Number(val[oidx].isAnime), oidx),
                    Scale: ((deflogoScale.x * rate) + ' ' + (deflogoScale.y * rate) + ' ' + (deflogoScale.z * rate))
                };

                logo.setAttribute('id', 'logo' + (oidx + 1).toString());
                logo.setAttribute('position', AFRAME.utils.coordinates.stringify(deflogo[oidx].Pos));
                logo.setAttribute('scale', AFRAME.utils.coordinates.stringify(deflogo[oidx].Scale));
                logo.setAttribute('gltf-model', '#logosource' + ((oidx + 1) * 100 +1).toString());
                logo.setAttribute('style', 'z-index: 5');

                self.arData[oidx].logo = logo;
            }
        },

        createAnimation: function (oidx){

            var self = this;
            var val = self.arData;

            if (!!val[oidx].isLogo) {

                var rate = (!val[oidx].isMp4) ? 1 : 2;

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
                            from: deflogo[oidx].Scale.x * 1.2 + ' ' + deflogo[oidx].Scale.y * 0.8 + ' ' + deflogo[oidx].Scale.z,
                            to: deflogo[oidx].Scale.x * 0.8 + ' ' + deflogo[oidx].Scale.y * 1.2 + ' ' + deflogo[oidx].Scale.z,
                            startEvents: 'scale3'
                        });
                    }
                } else {
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

        objectDataVal: function (oScale, oPosition, oAngle) {

            if (oScale != null) {
                var elem = document.getElementById("debug1");
                elem.innerHTML = "WDH: " + Number(oScale).toFixed(1) + ' ∠ ' + Number(oAngle).toFixed(1);
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
            self.arData[oidx].ashadow && self.wrap[oidx].appendChild(self.arData[oidx].ashadow);
            self.arData[oidx].bshadow && self.wrap[oidx].appendChild(self.arData[oidx].bshadow);
            self.arData[oidx].cshadow && self.wrap[oidx].appendChild(self.arData[oidx].cshadow);

            self.arData[oidx].main && self.wrap[oidx].appendChild(self.arData[oidx].main);
            self.arData[oidx].amain && self.wrap[oidx].appendChild(self.arData[oidx].amain);
            self.arData[oidx].bmain && self.wrap[oidx].appendChild(self.arData[oidx].bmain);
            self.arData[oidx].cmain && self.wrap[oidx].appendChild(self.arData[oidx].cmain);

            if (val[oidx].isLogo) {
                self.arData[oidx].logo && self.wrap[oidx].appendChild(self.arData[oidx].logo);
            }
        },

        setScene: function () {

            var self = this;
            var val = self.arData;

            var mWrap = {};
            self.mWrap = {};

            for (idx = 0; idx < self.arg.Multi; idx++) {

                this.addScene(idx);

                //var arGifRotation = '-30 0 0';
                var zoomRateH = defwrap[idx].Scale.y;
                var wrapZoom = 1;
                var pvAngle = -5;

                var wrapPos = { x: defwrap[idx].Pos.x, y: defwrap[idx].Pos.y, z: defwrap[idx].Pos.z };

                if (self.arData[idx].isPV) {

                    viewmode = 'pv';

                    wrapPos.x -= 0;
                    wrapPos.y -= ((val[idx].isMp4) ? 0 : 1.5);
                    //wrapPos.y -= ((val[idx].isMp4) ? -0.5 : 1);
                    wrapPos.z -= defwrap[idx].Scale.y * 1.5;
                    //wrapPos.z -= defwrap[idx].Scale.y * 2.5;

                    wrapZoom = 0.25;
                    zoomRateH = defwrap[idx].Scale.y * wrapZoom;
                    AFRAME.utils.entity.setComponentProperty(self.wrap[idx], 'animation', {
                        property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRateH + ' ' + zoomRateH + ' ' + zoomRateH
                    });

                    self.wrap[idx].setAttribute('rotation', AFRAME.utils.coordinates.stringify(String(pvAngle) + ' 0 0'));
                    self.wrap[idx].setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));

                    markerIdx = '1';

                    var multi = document.getElementById('txtMultiNo');
                    multi.innerHTML = markerIdx;

                    if (idx > 0) {
                        self.wrap[idx].setAttribute('visible', false);
                    }

                    webAr.scene.appendChild(self.wrap[idx]);

                } else {

                    var mk = '';

                    // NFTマーカー
                    mWrap[idx] = document.createElement('a-nft');

                    if (val[idx].isMarkerType == 1) {

                        viewmode = 'marker';
                        pvAngle = -30;
                        //wrapZoom = 0.625;
                        wrapZoom = 0.4;
                        zoomRateH = zoomRateH * wrapZoom;

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
                        pvAngle = -90;
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

                    self.wrap[idx].setAttribute('rotation', AFRAME.utils.coordinates.stringify(String(pvAngle) + ' 0 0'));

                    mWrap[idx].addEventListener('markerFound', function (e) {
                        var elem = e.target || e.srcElement;
                        var elemId = elem.id;
                        var targetmarker = document.getElementById(elemId.toString());
                        var i = Number(targetmarker.getAttribute('data-index'));

                        if (webAr.ar.arData[i].isMp4) {
                            if (webAr.markerIdx == '') {
                                webAr.ar.arData[i].wrap.setAttribute('visible', true);
                                webAr.ar.arData[i].viewIdx = 1;
                                webAr.markerIdx += (i + 1).toString();
                                var video = document.querySelector('#source' + (((Number(i) + 1) * 100) + webAr.ar.arData[i].srcno.obj).toString());
                                if (webAr.ar.videoState[i] < 2) {
                                    document.getElementById("swPlay").style.display = 'inline';
                                    webAr.ar.videoState[i] = 1;
                                    video.pause();
                                } else {
                                    webAr.ar.videoState[i] = 3;
                                    video.play();
                                }
                                //video.play();
                            }
                        } else {
                            webAr.ar.arData[i].viewIdx = 1;
                            webAr.markerIdx = '';
                            for (var j = 0; j < webAr.ar.arg.Multi; j++) {
                                if (!!(webAr.ar.arData[j].viewIdx)) {
                                    if (webAr.markerIdx != '') {
                                        webAr.markerIdx += ',';
                                    }
                                    webAr.markerIdx += (j + 1).toString();
                                }
                            }
                        }
                        var multi = document.getElementById('txtMultiNo');
                        multi.innerHTML = webAr.markerIdx;
                    });

                    mWrap[idx].addEventListener('markerLost', function (e) {
                        var elem = e.target || e.srcElement;
                        var elemId = elem.id;
                        var targetmarker = document.getElementById(elemId.toString());
                        var i = Number(targetmarker.getAttribute('data-index'));

                        if (webAr.ar.arData[i].isMp4) {
                            webAr.ar.arData[i].wrap.setAttribute('visible', false);
                            var video = document.querySelector('#source' + (((Number(i) + 1) * 100) + webAr.ar.arData[i].srcno.obj).toString());
                            if (webAr.ar.videoState[i] < 2) {
                                document.getElementById("swPlay").style.display = 'none';
                            } else {
                                video.pause();
                                webAr.ar.videoState[i] = 2;
                            }
                        }

                        webAr.ar.arData[i].viewIdx = 0;
                        webAr.markerIdx = '';

                        for (var j = 0; j < webAr.ar.arg.Multi; j++) {
                            if (!!(webAr.ar.arData[j].viewIdx)) {
                                if (webAr.markerIdx != '') {
                                    webAr.markerIdx += ',';
                                }
                                webAr.markerIdx += (j + 1).toString();
                            }
                        }

                        var multi = document.getElementById('txtMultiNo');
                        multi.innerHTML = webAr.markerIdx;

                        if (webAr.markerIdx == '') {
                            webAr.ar.resetGyro();
                        }
                    });

                    AFRAME.utils.entity.setComponentProperty(self.wrap[idx], 'animation', {
                        property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRateH + ' ' + zoomRateH + ' ' + zoomRateH
                    });

                    //wrapPos = defwrap[idx].Pos;
                    wrapPos = { x: defwrap[idx].Pos.x, y: defwrap[idx].Pos.y, z: defwrap[idx].Pos.z };
                    self.wrap[idx].setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));

                    mWrap[idx].setAttribute('url', AFRAME.utils.coordinates.stringify(rootPath + mk));

                    mWrap[idx].appendChild(self.wrap[idx]);
                    webAr.scene.appendChild(mWrap[idx]);

                    self.mWrap[idx] = mWrap[idx];
                }

                if (!!val[idx].isLogo) {
                    this.createAnimation(idx);
                }
                
                self.arData[idx].yClickRate = ((!!(val[idx].isMarkerType == 1) || !!(val[idx].isPV)) ? 0.2 : 5);
                self.arData[idx].yTouchRate = ((!!(val[idx].isMarkerType == 1) || !!(val[idx].isPV)) ? 0.02 : 2);

                self.arData[idx].wrapPos = wrapPos;
                self.arData[idx].zoomRateH = zoomRateH;
                self.arData[idx].wrapZoom = wrapZoom;
                self.arData[idx].pvAngle = pvAngle;

                this.objectDataVal(zoomRateH, wrapPos, pvAngle);
            }
        },

        resetScene: function (oidx) {

            var self = this;
            var val = self.arData;

            this.addScene(oidx);

            if (!val[oidx].isMp4) {
                document.getElementById("swPlay").style.display = 'none';
            }

            if (!!val[oidx].isLogo) {
                this.createAnimation(oidx);
            }

            this.objectDataVal(webAr.ar.arData[oidx].zoomRateH, webAr.ar.arData[oidx].wrapPos, webAr.ar.arData[oidx].pvAngle);
        },

        setRouletteRollEvents: function () {
            var self = this;

            var bStart = document.getElementById('swStart');
            var target = {};
            var target_dur = {};

            bStart.addEventListener('click', function () {
                if (webAr.roulettestate == 0) {
                    var marker = webAr.markerIdx.split(',');
                    for (var i = 0; i < marker.length; i++) {
                        var j = Number(marker[i]) - 1;
                        target = {
                            0: { 0: webAr.ar.arData[j].main }, 1: { 0: webAr.ar.arData[j].amain }, 2: { 0: webAr.ar.arData[j].main, 1: webAr.ar.arData[j].amain }
                        };
                        target_dur = { 0: 250, 1: 300, 2: 1000 };
                        var rTarget = target[Number(webAr.ar.arg.targetObj)];
                        var rdur = target_dur[Number(webAr.ar.arg.targetObj)];
                        var r = {};
                        for (var k = 0; k < Object.keys(rTarget).length; k++) {
                            r[k] = rTarget[k].getAttribute('rotation');
                            AFRAME.utils.entity.setComponentProperty(rTarget[k], 'animation__roll', {
                                property: 'rotation',
                                from: '0 0 ' + (r[k].z).toString(),
                                to: '0 0 ' + (r[k].z - (360 * (!!(k) ? -1 : 1))).toString(),
                                dur: rdur,
                                loop: true,
                                easing: 'linear',
                                startEvents: 'rollstart',
                                pauseEvents: 'rollpause',
                                resumeEvents: 'rollresume'
                            });
                            rTarget[k].emit('rollstart');
                        }

                        webAr.roulettestate = 1;
                    }
                }
            });

            var bStop = document.getElementById('swStop');

            bStop.addEventListener('click', function () {
                if (webAr.roulettestate == 1) {
                    webAr.roulettestate = 3;
                    var marker = webAr.markerIdx.split(',');
                    for (var i = 0; i < marker.length; i++) {
                        var j = Number(marker[i]) - 1;
                        var timer = {};
                        target = {
                            0: { 0: webAr.ar.arData[j].main }, 1: { 0: webAr.ar.arData[j].amain }, 2: { 0: webAr.ar.arData[j].main, 1: webAr.ar.arData[j].amain }
                        };
                        target_dur = {
                            0: { 0: 350, 1: 600, 2: 800, 3: 1000, 4: 3000, 5: 3500 },
                            1: { 0: 350, 1: 600, 2: 800, 3: 1000, 4: 3000, 5: 3500 },
                            2: { 0: 1200, 1: 1500, 2: 2000, 3: 2500, 4: 3000, 5: 3500 }
                        };                        var rTarget = target[Number(webAr.ar.arg.targetObj)];
                        var rdur = target_dur[Number(webAr.ar.arg.targetObj)];
                        var r = {};
                        for (var k = 0; k < Object.keys(rTarget).length; k++) {
                            rTarget[k].emit('rollresume');
                            r[k] = rTarget[k].getAttribute('rotation');
                            rTarget[k].setAttribute('animation__roll', 'from: 0 0 ' + (r[k].z).toString());
                            rTarget[k].setAttribute('animation__roll', 'to: 0 0 ' + (r[k].z - (360 * (!!(k) ? -1 : 1))).toString());
                            rTarget[k].setAttribute('animation__roll', 'dur: ' + rdur[0]);
                            rTarget[k].emit('rollresume');
                        }
                        timer[0] = getRandomIntInclusive(rdur[0] + 1, rdur[1] -1);
                        setTimeout(function () {
                            for (var k = 0; k < Object.keys(rTarget).length; k++) {
                                rTarget[k].emit('rollresume');
                                r[k] = rTarget[k].getAttribute('rotation');
                                rTarget[k].setAttribute('animation__roll', 'from: 00 0 ' + (r[k].z).toString());
                                rTarget[k].setAttribute('animation__roll', 'to: 0 0 ' + (r[k].z - (360 * (!!(k) ? -1 : 1))).toString());
                                rTarget[k].setAttribute('animation__roll', 'dur:' + rdur[1]);
                                rTarget[k].emit('rollresume');
                            }
                        }, timer[0]);
                        timer[1] = getRandomIntInclusive(rdur[1] + 1, rdur[2] - 1);
                        setTimeout(function () {
                            for (var k = 0; k < Object.keys(rTarget).length; k++) {
                                rTarget[k].emit('rollresume');
                                r[k] = rTarget[k].getAttribute('rotation');
                                rTarget[k].setAttribute('animation__roll', 'from: 0 0 ' + (r[k].z).toString());
                                rTarget[k].setAttribute('animation__roll', 'to: 0 0 ' + (r[k].z - (360 * (!!(k) ? -1 : 1))).toString());
                                rTarget[k].setAttribute('animation__roll', 'dur: ' + rdur[2]);
                                rTarget[k].emit('rollresume');
                            }
                        }, timer[1]);
                        timer[2] = getRandomIntInclusive(rdur[2] + 1, rdur[3] - 1);
                        setTimeout(function () {
                            for (var k = 0; k < Object.keys(rTarget).length; k++) {
                                rTarget[k].emit('rollresume');
                                r[k] = rTarget[k].getAttribute('rotation');
                                rTarget[k].setAttribute('animation__roll', 'from: 0 0 ' + (r[k].z).toString());
                                rTarget[k].setAttribute('animation__roll', 'to: 0 0 ' + (r[k].z - (360 * (!!(k) ? -1 : 1))).toString());
                                rTarget[k].setAttribute('animation__roll', 'dur: ' + rdur[3]);
                                rTarget[k].emit('rollresume');
                            }
                        }, timer[2]);
                        timer[3] = getRandomIntInclusive(rdur[3] + 1, rdur[4] - 1);
                        setTimeout(function () {
                            for (var k = 0; k < Object.keys(rTarget).length; k++) {
                                rTarget[k].emit('rollresume');
                                r[k] = rTarget[k].getAttribute('rotation');
                                rTarget[k].setAttribute('animation__roll', 'from: 0 0 ' + (r[k].z).toString());
                                rTarget[k].setAttribute('animation__roll', 'to: 0 0 ' + (r[k].z - (360 * (!!(k) ? -1 : 1))).toString());
                                rTarget[k].setAttribute('animation__roll', 'dur: ' + rdur[4]);
                                rTarget[k].emit('rollresume');
                            }
                        }, timer[3]);
                        timer[4] = getRandomIntInclusive(rdur[4] + 1, rdur[5] - 1);
                        setTimeout(function () {
                            rTarget[0].emit('rollpause');
                            rTarget[0].emit('rollpause');
                            if (Object.keys(rTarget).length <= 1) {
                                webAr.roulettestate = 0;
                            }
                        }, timer[4]);
                        if (Object.keys(rTarget).length > 1) {
                            timer[5] = getRandomIntInclusive(rdur[5], rdur[5] + 500);
                            setTimeout(function () {
                                rTarget[1].emit('rollpause');
                                rTarget[1].emit('rollpause');
                                webAr.roulettestate = 0;
                            }, timer[5]);
                        }
                    }
                }
            });

            function getRandomIntInclusive(min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
            }
        },

        setOverturnEvents: function (){

            var self = this;

            var bR90 = document.getElementById('swR90');
            var bR00 = document.getElementById('swR00');
            var timer;

            bR90.addEventListener('click', function () {
                changeAngle(-objAngle);
            });

            bR00.addEventListener('click', function () {
                changeAngle(objAngle);
            });

            bR90.addEventListener(self.eventNames.start, e => {
                e.preventDefault();
                timer = setInterval(() => {
                    changeAngle(-(objAngle * 0.1));
                }, 10);
            });

            bR90.addEventListener(self.eventNames.end, e => {
                e.preventDefault();
                clearInterval(timer);
            });

            bR90.addEventListener(self.eventNames.move, e => {
                e.preventDefault();
                clearInterval(timer);
            });

            bR00.addEventListener(self.eventNames.start, e => {
                e.preventDefault();
                timer = setInterval(() => {
                    changeAngle((objAngle * 0.1));
                }, 10);
            });

            bR00.addEventListener(self.eventNames.end, e => {
                e.preventDefault();
                clearInterval(timer);
            });

            bR00.addEventListener(self.eventNames.move, e => {
                e.preventDefault();
                clearInterval(timer);
            });

            function changeAngle (angle){
                var marker = webAr.markerIdx.split(',');
                for (var i = 0; i < marker.length; i++) {
                    var j = Number(marker[i]) - 1;
                    if((webAr.ar.arData[j].pvAngle + angle) > 360){
                        webAr.ar.arData[j].pvAngle += (angle - 360);
                    } else if((webAr.ar.arData[j].pvAngle + angle) < -360) {
                        webAr.ar.arData[j].pvAngle += (angle + 360);
                    } else {
                        webAr.ar.arData[j].pvAngle += angle;
                    }
                    webAr.ar.arData[j].wrap.setAttribute('rotation', AFRAME.utils.coordinates.stringify((webAr.ar.arData[j].pvAngle).toString() + ' 0 0'));
                    webAr.ar.objectDataVal(webAr.ar.arData[j].zoomRateH, webAr.ar.arData[j].wrapPos, webAr.ar.arData[j].pvAngle);
                }
            };
        },

        setResizeEvents: function (){

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
                    var marker = webAr.markerIdx.split(',');
                    for (var i = 0; i < marker.length; i++) {
                        var j = Number(marker[i]) - 1;
                        var zoomRate = webAr.ar.arData[j].zoomRateH;
                        if ((zoomRate + (prevPageY - event.pageY) / webAr.scene.clientHeight / 5) > 0.1) {
                            var rate = ((prevPageY - event.pageY) / webAr.scene.clientHeight / 5) * webAr.ar.arData[j].wrapZoom;
                            webAr.ar.arData[j].zoomRateH += rate;
                            AFRAME.utils.entity.setComponentProperty(webAr.ar.arData[j].wrap, 'animation', {
                                property: 'scale', dur: 5, easing: 'linear', loop: false, to: webAr.ar.arData[j].zoomRateH + ' ' + webAr.ar.arData[j].zoomRateH + ' ' + webAr.ar.arData[j].zoomRateH
                            });
                            var elem = document.getElementById("debug1");
                            elem.innerHTML = "Scale: " + Number(webAr.ar.arData[j].zoomRateH).toFixed(1);
                        }
                    }
                }
            });

            webAr.scene.addEventListener(self.eventNames.end, function (e) {
                scalechange = 0;
                prevPageY = null;
            });

            function getSmall() {
                var marker = webAr.markerIdx.split(',');
                var j = Number(marker[0]);
                var zoomRate = webAr.ar.arData[j].zoomRateH;

                if (marker.length > 1) {
                    for (var i = 1; i < marker.length; i++) {
                        j = Number(marker[i]) - 1;
                        if (zoomRate > webAr.ar.arData[j].zoomRateH) {
                            zoomRate = webAr.ar.arData[j].zoomRateH;
                        }
                    }
                }
                return zoomRate;
            };
        },

        setMoveEvents: function (){

            var self = this;

            var bUP = document.getElementById('swUp');
            var bDOWN = document.getElementById('swDown');
            //var bUP = document.getElementById('s-Up');
            //var bDOWN = document.getElementById('s-Down');
            var timer;

            // 上下移動ボタン押下
            bUP.addEventListener('click', function () {
                moveposition('up');
            });

            bDOWN.addEventListener('click', function () {
                moveposition('down');
            });
            // ↑ 

            // UPボタン長押し
            bUP.addEventListener(self.eventNames.start, e => {
                e.preventDefault();
                timer = setInterval(() => {
                    moveposition('up');
                }, 10);
            });

            bUP.addEventListener(self.eventNames.end, e => {
                e.preventDefault();
                clearInterval(timer);
            });

            bUP.addEventListener(self.eventNames.move, e => {
                e.preventDefault();
                clearInterval(timer);
            });

            // DOWNボタン長押し
            bDOWN.addEventListener(self.eventNames.start, e => {
                e.preventDefault();
                timer = setInterval(() => {
                    moveposition('down');
                }, 10);
            });

            bDOWN.addEventListener(self.eventNames.end, e => {
                e.preventDefault();
                clearInterval(timer);
            });

            bDOWN.addEventListener(self.eventNames.move, e => {
                e.preventDefault();
                clearInterval(timer);
            });

            function moveposition (updown) {
                var marker = webAr.markerIdx.split(',');
                for (var i = 0; i < marker.length; i++) {
                    var j = Number(marker[i]) - 1;
                    webAr.ar.arData[j].wrapPos = AFRAME.utils.coordinates.parse(webAr.ar.arData[j].wrap.getAttribute('position'));
                }

                for (var i = 0; i < marker.length; i++) {
                    var j = Number(marker[i]) - 1;
                    if (webAr.ar.arData[j].isMarkerType == 1 || webAr.ar.arData[j].isPV) {
                        if(updown == 'up'){
                            webAr.ar.arData[j].wrapPos.y += webAr.ar.arData[j].yTouchRate;
                        } else{
                            webAr.ar.arData[j].wrapPos.y -= webAr.ar.arData[j].yTouchRate;
                        }
                    } else {
                        if(updown == 'up'){
                            webAr.ar.arData[j].wrapPos.z -= webAr.ar.arData[j].yTouchRate;
                        } else {
                            webAr.ar.arData[j].wrapPos.z += webAr.ar.arData[j].yTouchRate;
                        }
                    }
                }

                for (var i = 0; i < marker.length; i++) {
                    var j = Number(marker[i]) - 1;
                    webAr.ar.arData[j].wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(webAr.ar.arData[j].wrapPos));
                    webAr.ar.objectDataVal(webAr.ar.arData[j].zoomRateH, webAr.ar.arData[j].wrapPos, webAr.ar.arData[j].pvAngle);
                }            };
        },

        setTapEvents: function () {

            var self = this;
            var val = self.arData;
            var elem = document.getElementById("version1");
            var timer = 350;

            webAr.scene.addEventListener(self.eventNames.start, function (e) {
                
                ++tapCount;
                
                if (tapclicked && tapCount > 0) {

                    //var objNo = '';

                    setTimeout(function () {
                       
                        if (tapclicked && tapCount == 2 && !(scalechange)) {
                            tapclicked = false;
                            var marker = webAr.markerIdx.split(',');
                            for (var i = 0; i < marker.length; i++) {
                                var j = Number(marker[i]) - 1;
                                var objNo = ((webAr.ar.arData[j].srcno.obj + 1) <= webAr.ar.arData[j].srcno.length) ? webAr.ar.arData[j].srcno.obj + 1 : 1;
                                switchObject(e, objNo, j);
                            }
                            return;
                        }
                        if (tapclicked && tapCount >= 3 && !(scalechange)) {
                            tapclicked = false;
                            var marker = webAr.markerIdx.split(',');
                            for (var i = 0; i < marker.length; i++) {
                                var j = Number(marker[i]) - 1;
                                var objNo = ((webAr.ar.arData[j].srcno.obj - 1) > 0) ? webAr.ar.arData[j].srcno.obj - 1 : webAr.ar.arData[j].srcno.length;
                                switchObject(e, objNo, j);
                            }
                            return;
                        }
                    }, timer);
                }

                tapclicked = true;

                setTimeout(function () {

                    if (tapclicked && tapCount == 1 && !(scalechange)) {

                        e.preventDefault();
                        var marker = webAr.markerIdx.split(',');

                        for (var i = 0; i < marker.length; i++) {
                            var j = Number(marker[i]) - 1;
                            if (!(val[j].isAnime)) {
                                if (!!(val[j].isLogo)) {
                                    if (val[j].path) {
                                        self.arData[j].logo.emit('turn0');
                                    }
                                }
                            } else {
                                if (val[j].isAnime == 11) {
                                    if (val[j].path && val[j].isAnime == 11) {
                                        self.arData[j].logo.emit('turn1');
                                    }
                                }
                                if (val[j].isAnime == 12) {
                                    if (val[j].path && val[j].isAnime == 12) {
                                        self.arData[j].logo.emit('turn2');
                                    }
                                }
                                if (val[j].isAnime == 13) {
                                    if (val[j].path && val[j].isAnime == 13) {
                                        self.arData[j].logo.emit('pos3');
                                        self.arData[j].logo.emit('scale3');
                                    }
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
                if (webAr.loaderEnd == 1) {
                    document.getElementById("slideshow").style.display = 'none';
                    webAr.loaderEnd = 2;

                    var slideshow = document.getElementById('slideshow');
                    slideshow.style.zIndex = '996';
                    var slidewrap = document.getElementById('slidewrap');
                    slidewrap.style.marginTop = '25%';
                }
            });

            function switchObject(e, fileno, oidx) {
                // ビューポートの変更(ズーム)を防止
                e.preventDefault();

                var marker = webAr.markerIdx.split(',');

                if (webAr.ar.arData[oidx].srcno.length == 1) {
                    return;
                }

                if (!!(webAr.ar.arData[oidx].isMp4)) {
                    return;
                }

                var shadow = document.getElementById('shadow' + (Number(oidx) + 1).toString());
                if (shadow != null) {
                    shadow.remove();
                }
                var main = document.getElementById('main' + (Number(oidx) + 1).toString());
                if (main != null) {
                    main.remove();
                }
                var amain = document.getElementById('amain' + (Number(oidx) + 1).toString());
                if (amain != null) {
                    amain.remove();
                }
                var logo = document.getElementById('logo' + (Number(oidx) + 1).toString());
                if (logo != null) {
                    logo.remove();
                }

                webAr.ar.arData[oidx].srcno.obj = fileno;
                webAr.ar.resetModel(oidx, webAr.ar.arData[oidx].srcno.obj);
                webAr.ar.resetScene(oidx);
                webAr.ar.arData[oidx].wrap.setAttribute('visible', true);

                tapCount = 0;
                tapclicked = false;
            };
        },

        setPreviewEvents: function () {
            var self = this;

            var bMarker = document.getElementById('swMulti');
            
            bMarker.addEventListener('click', function () {
                if (webAr.ar.arData[0].isPV) {
                    var marker = webAr.markerIdx.split(',');
                    var j = Number(marker[0]) - 1;
                    if (webAr.ar.arData[j].isMp4) {
                        if (webAr.ar.videoState[j] > 1) {
                            var video = document.querySelector('#source' + (((j + 1) * 100) + webAr.ar.arData[j].srcno.obj).toString());
                            video.pause();
                            webAr.ar.videoState[j] = 2;
                        }
                    }

                    webAr.ar.arData[j].wrap.setAttribute('visible', false);

                    var k = ((j + 1) < webAr.ar.arg.Multi) ? j + 1 : 0;
                    webAr.ar.arData[k].wrap.setAttribute('visible', true);
                    webAr.ar.objectDataVal(webAr.ar.arData[k].zoomRateH, webAr.ar.arData[j].wrapPos, webAr.ar.arData[j].pvAngle);

                    var multi = document.getElementById('txtMultiNo');
                    webAr.markerIdx = (k + 1).toString();
                    multi.innerHTML = webAr.markerIdx;

                    if (webAr.ar.arData[k].isMp4) {
                        var video = document.querySelector('#source' + (((k + 1) * 100) + webAr.ar.arData[k].srcno.obj).toString());
                        if (webAr.ar.videoState[k] < 2) {
                            document.getElementById('swPlay').style.display = 'inline';
                            document.getElementById("info1").style.display = "none";
                            video.pause();
                            webAr.ar.videoState[k] = 1;
                        } else {
                            video.play();
                            webAr.ar.videoState[k] = 3;
                        }
                    }
                }
            });
        },

        setMovieEvents: function () {
            var self = this;

            var bPlay = document.getElementById('swPlay');

            bPlay.addEventListener('click', function () {
                var marker = webAr.markerIdx.split(',');
                for (var i = 0; i < marker.length; i++) {
                    var j = Number(marker[i]) - 1;
                    if (webAr.ar.arData[j].isMp4) {
                        var video = document.querySelector('#source' + (((j + 1) * 100) + webAr.ar.arData[j].srcno.obj).toString());
                        video.play();
                        webAr.ar.videoState[j] = 3;
                    }
                }
                document.getElementById("swPlay").style.display = 'none';
                document.getElementById("info1").style.display = "none";
            });

            window.addEventListener('focus', function (e) {
                var marker = webAr.markerIdx.split(',');
                for (var i = 0; i < marker.length; i++) {
                    var j = Number(marker[i]) - 1;
                    if (webAr.ar.arData[j].isMp4 && webAr.ar.videoState[j] == 2) {
                        var video = document.querySelector('#source' + (((j + 1) * 100) + webAr.ar.arData[j].srcno.obj).toString());
                        video.play();
                        webAr.ar.videoState[j] = 3;
                    }
                }
            });

            window.addEventListener('blur', function (e) {
                var marker = webAr.markerIdx.split(',');
                for (var i = 0; i < marker.length; i++) {
                    var j = Number(marker[i]) - 1;
                    if (webAr.ar.arData[j].isMp4) {
                        var video = document.querySelector('#source' + (((j + 1) * 100) + webAr.ar.arData[j].srcno.obj).toString());
                        video.pause();
                        if(webAr.ar.videoState[j] == 3){
                            webAr.ar.videoState[j] = 2;
                        } else {
                            webAr.ar.videoState[j] = 1;
                        }
                    }
                }
            });
        },

        setGyroValuEvents: function (){

            // デバイスの方向の変化を検出したとき
            window.addEventListener('deviceorientation', function (e) {
                // e.beta：(x軸 -180 ～ 180)    e.gamma：(y軸 -90 ～ 90)   e.alpha：(z軸 0 ～ 360)
                var elem = document.getElementById("debug3");
                elem.innerHTML = "dir X: " + Number(e.beta).toFixed(1) + " Y: " + Number(e.gamma).toFixed(1) + ' Z: ' + Number(e.alpha).toFixed(1);
            });
        },

        setDiplayBtn: function (mode) {

            var self = this;
            var val = self.arData;

            document.getElementById("modeSwitch").style.display = "inline";
            document.getElementById("swUp").style.display = 'inline';
            document.getElementById("swDown").style.display = 'inline';

            document.getElementById("swPlay").style.display = 'none';

            if (webAr.ar.arData[0].oType != 'mp4') {
                document.getElementById("info1").style.display = "none";
                document.getElementById("swStop").style.display = "inline";
                document.getElementById("swStart").style.display = "inline";
            } else {
                document.getElementById("info1").style.display = "inline";
                document.getElementById("swStop").style.display = "none";
                document.getElementById("swStart").style.display = "none";
            }

            if (val[0].isMarkerType == 1 || !!(val[0].isPV)) {
                document.getElementById("arloader").style.display = 'none';
            }

            this.resetGyro();
        },

        setLoaderEvents: function () {

            var loader = document.querySelector('a-assets');

            loader.addEventListener('loaded', function (e) {
                // ロード完了
                webAr.loaderEnd = 1;
                var mloader = document.getElementById('mloader3');
                mloader.innerHTML = '※ 画面をタップすると表示を開始します。';
                if (webAr.ar.arData[0].isPV) {
                    if (webAr.ar.arData[0].isMp4) {
                        document.getElementById("swPlay").style.display = 'inline';
                        var video = document.querySelector('#source101');
                        video.pause();
                        webAr.ar.videoState[0] = 1;
                    }
                }
            });
        },

        resetGyro: function () {
            var cameraWrapper = document.getElementById("camera-wrapper");
            var camera = document.getElementById("camera");
            var y = camera.getAttribute("rotation").y;
            cameraWrapper.setAttribute("rotation", { y: -1 * y });
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

                var cEd = xmldata.getElementsByTagName("ed0");
                var cAr = xmldata.getElementsByTagName("ar0");
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

                var cEd = tabelnm.getElementsByTagName("ed1");
                var cAr = tabelnm.getElementsByTagName("ar1");
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
                var cOa = tabelnm.getElementsByTagName("oa");
                var cOb = tabelnm.getElementsByTagName("ob");
                var cOc = tabelnm.getElementsByTagName("oc");
                var cOZ = tabelnm.getElementsByTagName("oz");
                var cOaZ = tabelnm.getElementsByTagName("oaz");
                var cObZ = tabelnm.getElementsByTagName("obz");
                var cOcZ = tabelnm.getElementsByTagName("ocz");
                var cL = tabelnm.getElementsByTagName("l");

                var len = cM.length;
                for (var i = 0; i < len; i++) {
                    data[i] = {
                        ed: cEd[i].textContent,
                        ar: cAr[i].textContent,
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
                        oa: cOa[i].textContent,
                        ob: cOb[i].textContent,
                        oc: cOc[i].textContent,
                        oz: cOZ[i].textContent,
                        oaz: cOaZ[i].textContent,
                        obz: cObZ[i].textContent,
                        ocz: cOcZ[i].textContent,
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
    webAr.ar.setDiplayBtn(!!(ar.args[0].pv));

    webAr.srcno = srcno;

    webAr.defAngle = defAngle;
    webAr.defPos = defPos;
    webAr.defScale = defScale;
    webAr.defwrapPos = defwrapPos;
    webAr.defwrapScale = defwrapScale;
    webAr.deflogoScale = deflogoScale;
    webAr.markerIdx = markerIdx;
    webAr.loaderEnd = loaderEnd;
    webAr.roulettestate = roulettestate;

    webAr.ar.setGyroValuEvents();
    webAr.ar.setLoaderEvents();

}());
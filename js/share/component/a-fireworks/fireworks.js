
(function () {

    var js = document.scripts;

    js = js[js.length - 1];

    var path = js.src.substring(0, js.src.lastIndexOf("/") + 1);

    window.particlefirework = {

        addPreset: function (name, preset) {
            if (!(this.presets[name])) {
                this.presets[name] = preset;
            };
        },

        presets: {},
    };

    AFRAME.registerComponent('particle-firework', {
        schema: {
            preset: {
                type: 'string',
                default: '_default',
            },

            options: {
                type: 'string',
                parse: function (val) {
                    var res = eval('(function(){return ' + val + '})()');
                    return res;
                },
            },

            init: {
                type: 'string',
                default: 'init',
            },

            tick: {
                type: 'string',
                default: 'tick',
            },

            update: {
                type: 'string',
                default: 'update',
            },
        },

        init: function () {
            var self = this;
            if (!particlefirework.presets[self.data.preset]) {
                console.warn('particle-firework:init:preset not found:', self.data.preset, ',set as _default.');
                self.data.preset = '_default';
            };

            var points;
            if (particlefirework.presets[self.data.preset].init) {
                points = particlefirework.presets[self.data.preset].init.call(self, arguments);

            };

            if (points) {
                if (points.constructor != THREE.Points && points.constructor != THREE.Group) {
                    points = new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial());
                    console.warn('particlefirework:init:not return a THREE.Points/THREE.Group object:', self.data.preset, ',use a default THREE.Points.');
                };
            } else {
                points = new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial());
                console.warn('particlefirework:init:not return a object:', self.data.preset, ',use a default THREE.Points..');
            };

            self.particlefirework = points;
            self.el.setObject3D('particle-firework', self.particlefirework);
        },

        update: function () {
            var self = this;
            if (particlefirework.presets[self.data.preset].update) {
                particlefirework.presets[self.data.preset].update.call(self, arguments);
            };
        },

        tick: function () {
            var self = this;
            if (particlefirework.presets[self.data.preset].tick) {
                particlefirework.presets[self.data.preset].tick.call(self, arguments);
            };
        },

        remove: function () {
            var self = this;
            if (particlefirework.presets[self.data.preset].remove) {
                particlefirework.presets[self.data.preset].remove.call(self, arguments);
            };

            if (!self.particlefirework) {
                return;
            };

            self.el.removeObject3D('particle-firework');
        },

        pause: function () {
            var self = this;
            if (particlefirework.presets[self.data.preset].pause) {
                particlefirework.presets[self.data.preset].pause.call(self, arguments);
            };
        },

        play: function () {
            var self = this;
            if (particlefirework.presets[self.data.preset].play) {
                particlefirework.presets[self.data.preset].play.call(self, arguments);
            };
        },

    });

    particlefirework.addPreset('fireworks', {
        init: init,
        tick: tick,
        author: 'fireworks',
        desc: 'particle-firework',
    });

    function defaultInit() {
        var self = this;
        var count = 100;
        var geo = new THREE.Geometry();

        for (var i = 0; i < count; i++) {
            var x = Math.random() * 40 - 20;
            var y = Math.random() * 40 - 20;
            var z = Math.random() * 40 - 20;
            var particle = new THREE.Vector3(x, y, z);
            geo.vertices.push(particle);
        };

        var mat = new THREE.PointsMaterial({
            color: self.data.options.color || '#FFFFFF',
            size: 4,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.5,
            alphaTest: 0.5,
            depthTest: false,
        });

        var pf = new THREE.Points(geo, mat);
        return pf;
    };

    function defaultTick() {
        var self = this;
        var time = arguments[0][0];
        var deltaTime = arguments[0][1];
        var verts = self.particlefirework.geometry.vertices;

        for (var i = 0; i < verts.length; i++) {
            var vert = verts[i];
            if (vert.y < -20) {
                vert.y = Math.random() * 40 - 20;
            }
            vert.y = vert.y - (0.1 * deltaTime);
        }

        self.particlefirework.geometry.verticesNeedUpdate = true;
    };

    function init() {
        var self = this;

        self.pfOption = {
            rMaxCount: 1000, rCount: 300, rSpeed: 50, rSpread: 0.2, rLife: 200, rLifeRand: 100, rSize: 3, rColor: '#90ddff', rColors: undefined, rTexture: path + "/images/particle-64-1.png", rOpacity: 0.8, rAlphaTest: 0.2,
            eMaxCount: 2000, eCount: 50, eSize: 3, eColor: '#ff55ff', eColors: undefined, eTexture: path + "/images/particle-64-1.png", eAcc: 40, eAccRand: 10, eLife: 1000, eLifeRand: 100, eGravity: '0 -100 0', eSpeed: '0 80 0', eHeight: -110, eOpacity: 0.8, eAlphaTest: 0.2, 
            usePattern: 0, pAssetId: "ParticleFireWorksPattern", pScale: 1, pRotationX: 90, pDuration: 500, pLife: 1000, pLifeRand: 500, pHold: 0,
            useTrail: 1, tMaxCount: 2000, tCount: 120, tSize: 2, tSpread: 0.2, tLife: 500, tOpacity: 0.6, tAlphaTest: 0.4,
            useBloom: 1, bMaxCount: 5000, bCount: 200, bCountRand: 100, bColors: undefined, bSize: 2, bTexture: path + "/images/particle-64-1.png", bAcc: 30, bAccRand: 1, bLife: 500, bLifeRand: 200, bOpacity: 0.8, bAlphaTest: 0.2,

            pState:0,
        };

        self.pfOption = Object.assign(self.pfOption, self.data.options);
        
        var gravityArr = self.pfOption.eGravity.split(' ');
        self.pfOption.eGravity = new THREE.Vector3(Number(gravityArr[0]), Number(gravityArr[1]), Number(gravityArr[2]));

        var espeedArr = self.pfOption.eSpeed.split(' ');
        self.pfOption.eSpeed = new THREE.Vector3(Number(espeedArr[0]), Number(espeedArr[1]), Number(espeedArr[2]));

        if (self.pfOption.eCount > 10000) {
            self.pfOption.eCount = 10000;
        }

        if (!self.pfOption.usePattern && self.pfOption.useTrail && self.pfOption.eCount > 100) {
            self.pfOption.eCount = 100;
        }

        if (self.pfOption.useBloom && self.pfOption.bCount > 1000) {
            self.pfOption.bCount = 1000;
        }

        if (self.pfOption.usePattern && self.pfOption.eCount > 10000) {
            self.pfOption.eCount = 10000;
        }

        var rMat = new THREE.PointsMaterial({
            size: self.pfOption.rSize,
            map: new THREE.TextureLoader().load(self.pfOption.rTexture),
            blending: THREE.AdditiveBlending,
            opacity: self.pfOption.rOpacity,
            transparent: true,
            depthTest: false,
            alphaTest: self.pfOption.rAlphaTest,
        });

        if (self.pfOption.rColors) {
            var carr = [];
            self.pfOption.rColors.forEach(function (clr) {
                carr.push(new THREE.Color(clr));
            });
            self.pfOption.rColors = carr;
            rMat.vertexColors = THREE.VertexColors;
        } else {
            rMat.color = new THREE.Color(self.pfOption.rColor);
        };

        var eMat = new THREE.PointsMaterial({
            size: self.pfOption.eSize,
            map: new THREE.TextureLoader().load(self.pfOption.eTexture),
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: self.pfOption.eOpacity,
            alphaTest: self.pfOption.eAlphaTest,
            depthTest: false,
        });

        if (self.pfOption.eColors) {
            var carr = [];
            self.pfOption.eColors.forEach(function (clr) {
                carr.push(new THREE.Color(clr));
            });
            self.pfOption.eColors = carr;
            eMat.vertexColors = THREE.VertexColors;
        } else {
            eMat.color = new THREE.Color(self.pfOption.eColor);
        };

        self.pfData = {
            rPoints: [], rColors: [], ePoints: [], eColors: [], tPoints: [], tColors: [], bPoints: [], bColors: [], pPoints: [], pColors: [], height: 0, level: 0,
            levels: { rocket: 0, explore: 1, bloom: 2, },
            rMat: rMat, eMat: eMat, time: 0,
        };

        self.pfRocket = new THREE.Points(new THREE.Geometry(), rMat);
        self.pfExplore = new THREE.Points(new THREE.Geometry(), eMat);
        var particlemagic = new THREE.Group();
        particlemagic.add(self.pfRocket);
        particlemagic.add(self.pfExplore);

        if (self.pfOption.usePattern) {
            genPattern.call(self);
            self.pMat = new THREE.PointsMaterial({
                size: self.pfOption.eSize,
                vertexColors: THREE.VertexColors,
                map: new THREE.TextureLoader().load(self.pfOption.eTexture),
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: self.pfOption.eOpacity,
                alphaTest: self.pfOption.eAlphaTest,
                depthTest: false,

            });
            self.pfPattern = new THREE.Points(new THREE.Geometry(), self.pMat);
            particlemagic.add(self.pfPattern);
        };

        if (self.pfOption.useTrail) {
            self.tMat = new THREE.PointsMaterial({
                size: self.pfOption.tSize,
                map: new THREE.TextureLoader().load(self.pfOption.eTexture),
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: self.pfOption.tOpacity,
                alphaTest: self.pfOption.tAlphaTest,
                depthTest: false,
            });

            if (self.pfOption.eColors) {
                self.tMat.vertexColors = THREE.VertexColors;
            } else {
                self.tMat.color = new THREE.Color(self.pfOption.eColor);
            };

            self.pfTrail = new THREE.Points(new THREE.Geometry(), self.tMat);
            particlemagic.add(self.pfTrail);
        };

        if (self.pfOption.useBloom) {
            self.bMat = new THREE.PointsMaterial({
                size: self.pfOption.bSize,
                map: new THREE.TextureLoader().load(self.pfOption.bTexture),
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: self.pfOption.bOpacity,
                alphaTest: self.pfOption.bAlphaTest,
                depthTest: false,
            });

            if (self.pfOption.bColors) {
                var carr = [];
                self.pfOption.bColors.forEach(function (clr) {
                    carr.push(new THREE.Color(clr));
                });
                self.pfOption.bColors = carr;
                self.bMat.vertexColors = THREE.VertexColors;
            } else {
                if (self.pfOption.eColors) {
                    self.bMat.vertexColors = THREE.VertexColors;
                } else {
                    self.bMat.color = new THREE.Color(self.pfOption.eColor);
                }
            };

            self.pfOption.pState = 0;

            self.pfBloom = new THREE.Points(new THREE.Geometry(), self.bMat);
            particlemagic.add(self.pfBloom);
        };

        return particlemagic;
    };

    function tick() {
        var self = this;
        var time = arguments[0][0];
        var pfData = self.pfData;
        var pfOption = self.pfOption;

        var deltaTime = arguments[0][1];
        pfData.time += deltaTime;

        if (pfData.height < self.pfOption.eHeight) {
            pfData.level = pfData.levels.rocket;
            genRocket.call(self, deltaTime);
        } else {
            if (pfData.level < pfData.levels.explore) {
                if (!pfOption.usePattern) {
                    genExplore.call(self);
                }
                pfData.level = pfData.levels.explore;
            };
        };

        if (pfData.rPoints.length > 0) {
            rocketTick.call(self, deltaTime);
        };

        if (pfData.level >= pfData.levels.explore) {
            if (!pfOption.usePattern) {
                genTrails.call(self, deltaTime);
                exploreTick.call(self, deltaTime);
                if (pfOption.useTrail) {
                    trailTick.call(self, deltaTime);
                }
            } else {
                patternTick.call(self, deltaTime);
            };
        };

        if (pfData.level >= pfData.levels.bloom && pfOption.useBloom && !pfOption.usePattern) {
            bloomTick.call(self, deltaTime);
        };

        if (pfData.level > 0 && pfData.ePoints.length < 1 && pfData.rPoints.length < 1 && pfData.tPoints.length < 1 && pfData.bPoints.length < 1 && pfData.pPoints.length < 1) {
            self.pfOption.pState = 1;
            self.el.parentNode.removeChild(self.el);
        };
    };

    function genPattern() {

        var self = this;
        var pfData = self.pfData;
        var pfOption = self.pfOption;
        var img = document.getElementById(pfOption.pAssetId);
        if (!img) {
            console.error('>ParticleFireWorks:genPattern failed:Asset not found!');
            return;
        };
        var imgData = getImageData(img);
        var pWid = img.width * pfOption.pScale;
        var hpWid = pWid / 2;
        var pHei = img.height * pfOption.pScale / 2;
        var hpHei = pHei / 2;

        var pRot = new THREE.Vector3(1, 0, 0);
        var pRotR = pfOption.pRotationX * Math.PI / 180;

        for (var i = 0; self.pfData.pPoints.length < self.pfOption.eCount; i++) {
            var ix = Math.floor(Math.random() * img.width);
            var iz = Math.floor(Math.random() * img.height);
            var clr = getPixel(imgData, ix, iz);

            var px = ix * pfOption.pScale - hpWid;
            var pz = iz * pfOption.pScale - hpHei;
            if (clr.a > 10) {
                var p = {};
                p.pos = new THREE.Vector3(0, pfOption.eHeight, 0);
                p.tar = new THREE.Vector3(px, 0, pz);
                p.tar.applyAxisAngle(pRot, pRotR);
                p.tar.setY(p.tar.y + pfOption.eHeight);
                p.clr = new THREE.Color(clr.r / 255, clr.g / 255, clr.b / 255);
                p.acc = p.tar.sub(p.pos).multiplyScalar(1000 / pfOption.pDuration);
                p.life = pfOption.pLife + genRandom() * pfOption.pLifeRand;
                p.dur = pfOption.pDuration;
                p.rand = Math.random() * 0.1 + 0.9;
                self.pfData.pPoints.push(p);
            };
        };
    };

    function patternTick(deltaTime) {

        var self = this;
        var pfData = self.pfData;
        var pfOption = self.pfOption;
        var timeUnit = pfData.time == 0 ? 0.16 : deltaTime / 1000;

        var parr = [];
        var varr = [];
        var carr = [];

        var offset = pfData.pPoints.length < pfOption.eMaxCount ? 0 : pfData.pPoints.length - pfOption.eMaxCount;
        for (var i = offset; i < pfData.pPoints.length; i++) {
            var p = pfData.pPoints[i];
            p.life -= deltaTime;
            p.dur -= deltaTime;
            if (p.life > 0) {
                if (p.dur > 0) {
                    p.pos.add(p.acc.clone().multiplyScalar(timeUnit));
                    p.pos.add(pfOption.eSpeed.clone().multiplyScalar(timeUnit));
                } else {
                    var weak = (pfOption.pLife + p.dur) / pfOption.pLife;
                    if (!pfOption.pHold) {
                        p.pos = p.pos.add(pfOption.eGravity.clone().multiplyScalar(timeUnit * (1 - weak) * p.rand));
                        p.pos = p.pos.add(p.acc.clone().multiplyScalar(timeUnit * weak * p.rand));
                    } else {
                        p.pos = p.pos.add(p.acc.clone().multiplyScalar(timeUnit * weak * 0.1 * p.rand));
                    };
                };
                parr.push(p);
                varr.push(p.pos);
                carr.push(p.clr);
            };
        };
        pfData.pPoints = parr;
        var newGeo = new THREE.Geometry();
        newGeo.vertices = varr;
        newGeo.colors = carr;

        self.pfPattern.geometry = newGeo;
    };

    function genTrails(deltaTime) {
        var self = this;
        var pfData = self.pfData;
        var pfOption = self.pfOption;

        var timeUnit = pfData.time == 0 ? 0.16 : deltaTime / 1000;
        var count = Math.ceil(pfOption.tCount * timeUnit);

        for (var i = 0; i < pfData.ePoints.length; i++) {
            for (var j = 0; j < count; j++) {
                var p = {};
                p.pos = pfData.ePoints[i].pos.clone();
                p.acc = genRandomV3().multiplyScalar(pfOption.tSpread);
                p.life = pfOption.tLife;
                pfData.tPoints.push(p);

                if (pfOption.eColors) {
                    var clr = pfOption.eColors[i % pfOption.eColors.length];
                    p.clr = clr;
                    self.pfData.tColors.push(clr);
                };
            };
        };
    };

    function trailTick(deltaTime) {
        var self = this;
        var pfData = self.pfData;
        var pfOption = self.pfOption;
        var timeUnit = pfData.time == 0 ? 0.16 : deltaTime / 1000;

        var parr = [];
        var varr = [];
        var carr = [];

        var offset = pfData.tPoints.length < pfOption.rMaxCount ? 0 : pfData.tPoints.length - pfOption.rMaxCount;

        for (var i = offset; i < pfData.tPoints.length; i++) {
            var p = pfData.tPoints[i];
            p.life -= deltaTime;
            if (p.life > 0) {
                p.pos = p.pos.add(p.acc);
                parr.push(p);
                varr.push(p.pos);
                if (pfOption.eColors) carr.push(p.clr);
            };
        };

        pfData.tPoints = parr;

        var newGeo = new THREE.Geometry();
        newGeo.vertices = varr;

        if (pfOption.eColors) {
            newGeo.colors = carr;
        }

        self.pfTrail.geometry = newGeo;
    };

    function genBloom(particle) {
        var self = this;
        var pfData = self.pfData;
        var pfOption = self.pfOption;

        var count = pfOption.bCount - genRandom() * pfOption.bCountRand;

        for (var i = 0; i < count; i++) {
            var p = {};
            var pos = genBallPoint();
            p.pos = pos.clone().multiplyScalar(0.5);
            p.pos.add(particle.pos);
            p.acc = pos.multiplyScalar(pfOption.bAcc + genRandom() * pfOption.bAccRand);
            p.life = pfOption.bLife + genRandom() * pfOption.bLifeRand;
            pfData.bPoints.push(p);

            if (pfOption.bColors) {
                var clr = pfOption.bColors[i % pfOption.bColors.length];
                p.clr = clr;
                self.pfData.bColors.push(clr);
            } else if (pfOption.eColors) {
                p.clr = particle.clr;
                self.pfData.bColors.push(p.clr);
            };
        };
    };

    function bloomTick(deltaTime) {
        var self = this;
        var pfData = self.pfData;
        var pfOption = self.pfOption;

        var timeUnit = pfData.time == 0 ? 0.16 : deltaTime / 1000;

        var parr = [];
        var varr = [];
        var carr = [];

        var offset = pfData.bPoints.length < pfOption.bMaxCount ? 0 : pfData.bPoints.length - pfOption.bMaxCount;

        for (var i = offset; i < pfData.bPoints.length; i++) {
            var p = pfData.bPoints[i];
            p.life -= deltaTime;
            if (p.life > 0) {
                p.pos.add(p.acc.clone().multiplyScalar(timeUnit));
                parr.push(p);
                varr.push(p.pos);
                if (pfOption.bColors || pfOption.eColors) carr.push(p.clr);
            };
        };

        pfData.bPoints = parr;

        var newGeo = new THREE.Geometry();
        newGeo.vertices = varr;

        if (pfOption.bColors || pfOption.eColors) {
            newGeo.colors = carr;
        }

        self.pfBloom.geometry = newGeo;
    };

    function rocketTick(deltaTime) {
        var self = this;
        var pfData = self.pfData;
        var pfOption = self.pfOption;

        var timeUnit = pfData.time == 0 ? 0.16 : deltaTime / 1000;

        pfData.height += pfOption.rSpeed * timeUnit;
        self.pfRocket.position.y = pfData.height;

        var parr = [];
        var varr = [];
        var carr = [];

        var offset = pfData.rPoints.length < pfOption.rMaxCount ? 0 : pfData.rPoints.length - pfOption.rMaxCount;

        for (var i = offset; i < pfData.rPoints.length; i++) {
            var p = pfData.rPoints[i];
            p.life -= deltaTime;
            if (p.life > 0) {
                p.pos = p.pos.add(p.acc);
                p.pos = p.pos.add(pfOption.eGravity.clone().multiplyScalar(timeUnit));
                parr.push(p);
                varr.push(p.pos);
                if (pfOption.rColors) {
                    carr.push(p.clr);
                }
            };
        };
        pfData.rPoints = parr;
        var newGeo = new THREE.Geometry();
        newGeo.vertices = varr;
        if (pfOption.rColors) {
            newGeo.colors = carr;
        }

        self.pfRocket.geometry = newGeo;

    };

    function exploreTick(deltaTime) {
        var self = this;
        var pfData = self.pfData;
        var pfOption = self.pfOption;
        var timeUnit = pfData.time == 0 ? 0.16 : deltaTime / 1000;

        var parr = [];
        var varr = [];
        var carr = [];

        var offset = pfData.ePoints.length < pfOption.eMaxCount ? 0 : pfData.ePoints.length - pfOption.eMaxCount;

        for (var i = offset; i < pfData.ePoints.length; i++) {
            var p = pfData.ePoints[i];
            p.life -= deltaTime;
            if (p.life > 0) {
                p.acc.add(pfOption.eGravity.clone().multiplyScalar(timeUnit));
                p.pos.add(p.acc.clone().multiplyScalar(timeUnit));
                parr.push(p);
                varr.push(p.pos);
                if (pfOption.eColors) carr.push(p.clr);
            } else if (pfOption.useBloom) {
                genBloom.call(self, p);
                self.pfData.level = self.pfData.levels.bloom;
            };
        };
        pfData.ePoints = parr;
        var newGeo = new THREE.Geometry();
        newGeo.vertices = varr;

        if (pfOption.eColors) {
            newGeo.colors = carr;
        }

        self.pfExplore.geometry = newGeo;
    };

    function genRocket(deltaTime) {
        var self = this;
        var pfData = self.pfData;
        var pfOption = self.pfOption;

        var timeUnit = pfData.time == 0 ? 0.16 : deltaTime / 1000;
        var n = Math.ceil(pfOption.rCount * timeUnit);

        for (var i = 0; i < n; i++) {
            var p = {};
            p.pos = new THREE.Vector3(0, 0, 0);
            var accx = genRandom() * pfOption.rSpread;
            var accy = Math.random() * -1 - 0.5;
            var accz = genRandom() * pfOption.rSpread;
            p.acc = new THREE.Vector3(accx, accy, accz);

            p.life = pfOption.rLife + genRandom() * pfOption.rLifeRand;
            pfData.rPoints.push(p);

            if (pfOption.rColors) {
                var clr;
                if (pfOption.rCount < pfOption.rColors.length) {
                    clr = pfOption.rColors[Math.floor(Math.random() * pfOption.rColors.length)];
                } else {
                    clr = pfOption.rColors[i % pfOption.rColors.length];
                };
                p.clr = clr;
                self.pfData.rColors.push(clr);
            };
        };
    };

    function genExplore() {
        var self = this;
        var pfData = self.pfData;
        var pfOption = self.pfOption;

        for (var i = 0; i < pfOption.eCount; i++) {
            var p = {};
            var pos = genBallPoint();
            p.pos = pos.clone().multiplyScalar(0.5);
            p.pos.setY(p.pos.y + pfData.height);
            p.acc = pos.multiplyScalar(pfOption.eAcc + genRandom() * pfOption.eAccRand);
            p.acc.add(pfOption.eSpeed);
            p.life = pfOption.eLife + genRandom() * pfOption.eLifeRand;
            p.level = 1;
            pfData.ePoints.push(p);

            if (pfOption.eColors) {
                var clr = pfOption.eColors[i % pfOption.eColors.length];
                p.clr = clr;
                self.pfData.eColors.push(clr);
            };
        };
    };

    function genBallPoint() {
        var a = Math.random() * Math.PI;
        var b = Math.random() * 2 * Math.PI;
        var x = Math.sin(b) * Math.sin(a);
        var y = Math.cos(a);
        var z = Math.cos(b) * Math.sin(a);
        return new THREE.Vector3(x, y, z);
    };

    function genRandom() {
        if (Math.random() > 0.5) {
            return Math.random();
        } else {
            return Math.random() * -1;
        };
    };

    function genRandomV3(base) {
        return new THREE.Vector3(genRandom(), genRandom(), genRandom());
    };

    function getImageData(image) {
        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        var context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);

        return context.getImageData(0, 0, image.width, image.height);
    };

    function getPixel(imagedata, x, y) {
        var position = (x + imagedata.width * y) * 4;
        var data = imagedata.data;
        return {
            r: data[position],
            g: data[position + 1],
            b: data[position + 2],
            a: data[position + 3]
        };
    };

})();
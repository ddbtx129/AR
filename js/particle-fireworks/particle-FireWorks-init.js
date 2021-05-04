
(function () {
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

            self.$particlefirework = points;
            self.el.setObject3D('particle-firework', self.$particlefirework);
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
            if (!self.$particlefirework) {
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

    particlefirework.addPreset('_default', {
        init: defaultInit,
        tick: defaultTick,
        update: undefined,
        author: 'fireworks',
        desc: 'A 400X400X400 with options.color,as default preset.',
    });

    function defaultInit() {
        var self = this;
        var count = 100;
        var geo = new THREE.Geometry();

        for (var i = 0; i < count; i++) {
            //var x = Math.random() * 400 - 200;
            //var y = Math.random() * 400 - 200;
            //var z = Math.random() * 400 - 200;
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
        });

        var pf = new THREE.Points(geo, mat);
        return pf;
    };

    function defaultTick() {
        var self = this;
        var time = arguments[0][0];
        var deltaTime = arguments[0][1];

        var verts = self.particlefirework.$geometry.vertices;
        for (var i = 0; i < verts.length; i++) {
            var vert = verts[i];
            if (vert.y < -200) {
                vert.y = Math.random() * 400 - 200;
            }
            vert.y = vert.y - (0.1 * deltaTime);
        }
        self.particlefirework.$geometry.verticesNeedUpdate = true;
    };

})();

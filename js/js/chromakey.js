! function (o) {
    var t = {};

        function i(e) {
            if (t[e]) return t[e].exports;
            var r = t[e] = {
                exports: {},
                id: e,
                loaded: !1
            };
            return o[e].call(r.exports, r, r.exports, i), r.loaded = !0, r.exports
        }
        i.m = o, i.c = t, i.p = "", i(0)
    }([function (e, r) {
    if ("undefined" == typeof AFRAME) throw new Error("Component attempted to register before AFRAME was available.");
    AFRAME.registerShader("chromakey", {
        schema: {
            src: {
                type: "map"
            },
            keyColor: {
                default: {
                    x: .1,
                    y: .9,
                    z: .2
                },
                type: "vec3",
                is: "uniform"
            },
            transparent: {
                default: !0,
                is: "uniform"
            },
            color: {
                is: "uniform"
            }
        },

        init: function (e) {
            var r = new THREE.VideoTexture(e.src);
            r.minFilter = THREE.LinearFilter, this.material = new THREE.ShaderMaterial({
                uniforms: {
                    keyColor: {
                        type: "c",
                        value: e.keyColor
                    },
                    texture: {
                        type: "t",
                        value: r
                    },
                    shadow: {
                        type: "i",
                        value: e.color ? 1 : 0
                    }
                },

                vertexShader: this.vertexShader,
                fragmentShader: this.fragmentShader
            })
        },

        update: function (e) {
            this.material.color = e.keyColor, this.material.src = e.src, this.material.transparent = e.transparent
        },

        vertexShader: ["varying vec2 vUv;", "void main(void)", "{", "vUv = uv;", "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );", "gl_Position = projectionMatrix * mvPosition;", "}"].join("\n"),
        fragmentShader: ["uniform sampler2D texture;", "uniform vec3 keyColor;", "uniform int shadow;", "varying vec2 vUv;", "const vec3 mono = vec3(0,0,0);", "void main(void)", "{", "vec3 tColor = texture2D( texture, vUv ).rgb;", "float a = (length(tColor - keyColor) - 0.5) * 7.0;", "gl_FragColor = shadow == 1 ? vec4(mono, min(a, 0.3)) : vec4(tColor, a);", "}"].join("\n")
    })
}]);
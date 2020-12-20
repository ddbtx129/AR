! function (s) {
    var i = {};

    function a(t) {
        if (i[t]) return i[t].exports;
        var e = i[t] = {
            exports: {},
            id: t,
            loaded: !1
        };
        return s[t].call(e.exports, e, e.exports, a), e.loaded = !0, e.exports
    }
    a.m = s, a.c = i, a.p = "", a(0)
}([function (t, e, s) {
    "use strict";
    var o = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) {
        return typeof t
    } : function (t) {
        return t && "function" == typeof Symbol && t.constructor === Symbol ? "symbol" : typeof t
    },
      a = s(1);
    if ("undefined" == typeof AFRAME) throw "Component attempted to register before AFRAME was available.";
    var h = AFRAME.utils.srcLoader.parseUrl,
      i = AFRAME.utils.debug;
    i.enable("shader:gif:warn");
    var r = i("shader:gif:warn"),
      n = i("shader:gif:debug"),
      u = {};

    function l(t, e) {
        return {
            status: "error",
            src: e,
            message: t,
            timestamp: Date.now()
        }
    }
    AFRAME.registerShader("gif", {
        schema: {
            color: {
                type: "color"
            },
            fog: {
                default: !0
            },
            metalness: {
                default: 0
            },
            roughness: {
                default: .5
            },
            src: {
                default: null
            },
            autoplay: {
                default: !0
            }
        },
        init: function (t) {
            return n("init", t), n(this.el.components), this.__cnv = document.createElement("canvas"), this.__cnv.width = 2, this.__cnv.height = 2, this.__ctx = this.__cnv.getContext("2d"), this.__texture = new THREE.Texture(this.__cnv), this.__material = {}, this.__reset(), this.material = new THREE.MeshStandardMaterial({
                map: this.__texture
            }), this.el.sceneEl.addBehavior(this), this.__addPublicFunctions(), this.__drawedIndex = 0, this.material
        },
        update: function (t) {
            return n("update", t), this.__updateMaterial(t), this.__updateTexture(t), this.material
        },
        tick: function (t) {
            this.__frames && !this.paused() && Date.now() - this.__startTime >= this.__nextFrameTime && this.nextFrame()
        },
        __updateMaterial: function (t) {
            var e = this.material,
              s = this.__getMaterialData(t);
            Object.keys(s).forEach(function (t) {
                e[t] = s[t]
            })
        },
        __getMaterialData: function (t) {
            return {
                fog: t.fog,
                color: new THREE.Color(t.color),
                metalness: t.metalness,
                roughness: t.roughness
            }
        },
        __setTexure: function (t) {
            n("__setTexure", t), "error" === t.status ? (r("Error: " + t.message + "\nsrc: " + t.src), this.__reset()) : "success" === t.status && t.src !== this.__textureSrc && (this.__reset(), this.__ready(t))
        },
        __updateTexture: function (t) {
            var e = t.src,
              s = t.autoplay;
            "boolean" == typeof s ? this.__autoplay = s : void 0 === s && (this.__autoplay = !0), this.__autoplay && this.__frames && this.play(), e ? this.__validateSrc(e, this.__setTexure.bind(this)) : this.__reset()
        },
        __validateSrc: function (t, e) {
            var s = h(t);
            if (s) this.__getImageSrc(s, e);
            else {
                var i = void 0,
                  a = this.__validateAndGetQuerySelector(t);
                if (a && "object" === (void 0 === a ? "undefined" : o(a))) {
                    if (a.error) i = a.error;
                    else {
                        var r = a.tagName.toLowerCase();
                        if ("video" === r) t = a.src, i = "For video, please use `aframe-video-shader`";
                        else {
                            if ("img" === r) return void this.__getImageSrc(a.src, e);
                            i = "For <" + r + "> element, please use `aframe-html-shader`"
                        }
                    }
                    var n, _;
                    i && (n = u[t], _ = l(i, t), n && n.callbacks ? n.callbacks.forEach(function (t) {
                        return t(_)
                    }) : e(_), u[t] = _)
                }
            }
        },
        __getImageSrc: function (r, t) {
            var e = this;
            if (r !== this.__textureSrc) {
                var n = u[r];
                if (n && n.callbacks) {
                    if (n.src) return void t(n);
                    if (n.callbacks) return void n.callbacks.push(t)
                } else (n = u[r] = {
                    callbacks: []
                }).callbacks.push(t);
                var s = new Image;
                s.crossOrigin = "Anonymous", s.addEventListener("load", function (t) {
                    e.__getUnit8Array(r, function (t) {
                        t ? (0, a.parseGIF)(t, function (t, e, s, i) {
                            var a = {
                                status: "success",
                                src: r,
                                times: t,
                                cnt: e,
                                frames: s,
                                disposalMethods: i,
                                timestamp: Date.now()
                            };
                            n.callbacks && (n.callbacks.forEach(function (t) {
                                return t(a)
                            }), u[r] = a)
                        }, function (t) {
                            return i(t)
                        }) : i("This is not gif. Please use `shader:flat` instead")
                    })
                }), s.addEventListener("error", function (t) {
                    return i("Could be the following issue\n - Not Image\n - Not Found\n - Server Error\n - Cross-Origin Issue")
                }), s.src = r
            }

            function i(t) {
                var e = l(t, r);
                n.callbacks && (n.callbacks.forEach(function (t) {
                    return t(e)
                }), u[r] = e)
            }
        },
        __getUnit8Array: function (t, r) {
            if ("function" == typeof r) {
                var e = new XMLHttpRequest;
                e.open("GET", t), e.responseType = "arraybuffer", e.addEventListener("load", function (t) {
                    for (var e = new Uint8Array(t.target.response), s = e.subarray(0, 4), i = "", a = 0; a < s.length; a++) i += s[a].toString(16);
                    "47494638" === i ? r(e) : r()
                }), e.addEventListener("error", function (t) {
                    n(t), r()
                }), e.send()
            }
        },
        __validateAndGetQuerySelector: function (t) {
            try {
                var e = document.querySelector(t);
                return e || {
                    error: "No element was found matching the selector"
                }
            } catch (t) {
                return {
                    error: "no valid selector"
                }
            }
        },
        __addPublicFunctions: function () {
            this.el.gif = {
                play: this.play.bind(this),
                pause: this.pause.bind(this),
                togglePlayback: this.togglePlayback.bind(this),
                paused: this.paused.bind(this),
                nextFrame: this.nextFrame.bind(this)
            }
        },
        pause: function () {
            n("pause"), this.__paused = !0
        },
        play: function () {
            n("play"), this.__paused = !1
        },
        togglePlayback: function () {
            this.paused() ? this.play() : this.pause()
        },
        paused: function () {
            return this.__paused
        },
        nextFrame: function () {
            for (this.__draw() ; Date.now() - this.__startTime >= this.__nextFrameTime;) this.__nextFrameTime += this.__delayTimes[this.__frameIdx++], (this.__infinity || this.__loopCnt) && this.__frameCnt <= this.__frameIdx && (this.__frameIdx = 0)
        },
        __clearCanvas: function () {
            this.__ctx.clearRect(0, 0, this.__width, this.__height), this.__texture.needsUpdate = !0
        },
        __draw: function () {
            var t = this.__frameIdx ? this.__frameIdx - 1 : 0;
            if (2 === this.__disposalMethods[t]) this.__clearCanvas();
            else if (3 === this.__disposalMethods[t] && 1 < this.__frameIdx) this.__clearCanvas(), this.__ctx.drawImage(this.__frames[this.__frameIdx - 2], 0, 0, this.__width, this.__height);
            else if (1 === this.__disposalMethods[t] && 0 < t - this.__drawedIndex)
                for (var e = this.__drawedIndex + 1; e <= t; e = e + 1 | 0) this.__ctx.drawImage(this.__frames[e], 0, 0, this.__width, this.__height), 2 === this.__disposalMethods[e] && this.__clearCanvas();
            this.__ctx.drawImage(this.__frames[this.__frameIdx], 0, 0, this.__width, this.__height), this.__texture.needsUpdate = !0, this.__drawedIndex = this.__frameIdx
        },
        __ready: function (t) {
            var e = t.src,
              s = t.times,
              i = t.cnt,
              a = t.frames,
              r = t.disposalMethods;
            n("__ready"), this.__textureSrc = e, this.__delayTimes = s, i ? this.__loopCnt = i : this.__infinity = !0, this.__frames = a, this.__frameCnt = s.length, this.__disposalMethods = r, this.__startTime = Date.now(), this.__width = THREE.Math.floorPowerOfTwo(a[0].width), this.__height = THREE.Math.floorPowerOfTwo(a[0].height), this.__cnv.width = this.__width, this.__cnv.height = this.__height, this.__draw(), this.__autoplay && 1 < this.__frames.length ? this.play() : this.pause()
        },
        __reset: function () {
            this.pause(), this.__clearCanvas(), this.__startTime = 0, this.__nextFrameTime = 0, this.__frameIdx = 0, this.__frameCnt = 0, this.__delayTimes = null, this.__infinity = !1, this.__loopCnt = 0, this.__frames = null, this.__disposalMethods = null, this.__textureSrc = null
        }
    })
}, function (t, e) {
    "use strict";
    e.parseGIF = function (t, i, e) {
        var s = 0,
          a = [],
          r = 0,
          n = null,
          _ = null,
          o = [],
          h = [],
          u = 0;
        if (71 !== t[0] || 73 !== t[1] || 70 !== t[2] || 56 !== t[3] || 57 !== t[4] && 55 !== t[4] || 97 !== t[5]) e && e("parseGIF: no GIF89a");
        else {
            s += +!!(128 & t[10]) * Math.pow(2, 1 + (7 & t[10])) * 3 + 13;
            for (var l = t.subarray(0, s) ; t[s] && 59 !== t[s];) {
                var c = s,
                  d = t[s];
                if (33 === d) {
                    var f = t[++s];
                    if (-1 === [1, 254, 249, 255].indexOf(f)) {
                        e && e("parseGIF: unknown label");
                        break
                    }
                    for (249 === f && a.push(10 * (t[s + 3] + (t[s + 4] << 8))), 255 === f && (u = t[s + 15] + (t[s + 16] << 8)) ; t[++s];) s += t[s];
                    249 === f && (n = t.subarray(c, s + 1), h.push(n[3] >> 2 & 7))
                } else {
                    if (44 !== d) {
                        e && e("parseGIF: unknown blockId");
                        break
                    }
                    for (s += 9, s += +!!(128 & t[s]) * (3 * Math.pow(2, 1 + (7 & t[s]))) + 1; t[++s];) s += t[s];
                    _ = t.subarray(c, s + 1);
                    o.push(URL.createObjectURL(new Blob([l, n, _])))
                }
                s++
            }
        }
        if (o.length) {
            var m = document.createElement("canvas"),
              p = function s(t) {
                  var e = new Image;
                  e.onload = function (t, e) {
                      r++, o[e] = this, r === o.length ? (m = null, i && i(a, u, o, h)) : s(++e)
                  }.bind(e), e.src = m.toDataURL("image/gif")
              };
            o.forEach(function (t, e) {
                var s = new Image;
                s.onload = function (t, e) {
                    0 === e && (m.width = s.width, m.height = s.height), r++, o[e] = this, r === o.length && (r = 0, p(1))
                }.bind(s, null, e), s.src = t
            })
        }
    }
}]);
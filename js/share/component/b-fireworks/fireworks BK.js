﻿
(function () {

	function randomNormal(min, max) {
		let rand = 0;
		for (let n = 0; n < 6; n++)
			rand += Math.random();
		return min + (max - min) * (rand / 6);
	}

	function randomUniform(min, max) {
		return min + (max - min) * Math.random();
	}

	AFRAME.registerComponent('spawner', {

		init: function () {
			this.sceneElement = document.querySelector('a-scene');
		},

		tick: function (time, deltaTime) // deltaTime: milliseconds
		{
			let deltaSeconds = deltaTime / 1000;
			let eventFrequency = 0.75;

			if (Math.random() < eventFrequency * deltaSeconds) {
				console.log("Firework");
				let angle = THREE.Math.degToRad(270);
				let angleSpread = THREE.Math.degToRad(90);
				let angleRadians = angle + randomNormal(-angleSpread, angleSpread);
				let radius = 9;
				let x = radius * Math.cos(angleRadians);
				let y = 0;
				let z = radius * Math.sin(angleRadians);

				let firework = document.createElement("a-entity");
				firework.setAttribute("firework", "");
				firework.setAttribute("position", { "x": x, "y": y, "z": z });

				// random flight parameters
				let maxHeight = randomNormal(4, 8);
				firework.setAttribute("firework", "maxHeight", maxHeight);
				let riseTime = randomNormal(2, 3);
				firework.setAttribute("firework", "riseTime", riseTime);
				this.sceneElement.appendChild(firework);

				// chance of multi-firework
				// 0.10 = 1/10 double, 1/100 triple, 1/1000 quadruple, etc.
				// 0.20 =  1/5 double,  1/25 triple,  1/125 quadruple, etc.
				while (Math.random() < 0.15) {
					let fireworkExtra = document.createElement("a-entity");
					fireworkExtra.setAttribute("firework", "");
					// synchronize position, height, time to explosion
					fireworkExtra.setAttribute("position", { "x": x, "y": y, "z": z });
					fireworkExtra.setAttribute("firework", "maxHeight", maxHeight);
					fireworkExtra.setAttribute("firework", "riseTime", riseTime);
					this.sceneElement.appendChild(fireworkExtra);
				}
			}
		}
	});

	AFRAME.registerComponent('firework', {

		schema: {
			color: { type: 'string', default: "" },
			maxHeight: { type: 'number', default: 4.5 },
			riseTime: { type: 'number', default: 2.5 }	// time to reach maxHeight
		},

		randomColor: function () {
			let colorList = ["red", "orange", "gold", "green", "cyan", "#0088FF", "violet"];
			let colorIndex = Math.floor(colorList.length * Math.random());
			return colorList[colorIndex];
		},

		init: function () {
			// set random color if none already set
			if (this.data.color == "")
				this.data.color = this.randomColor();

			// set up movement animation
			let p = this.el.object3D.position;
			this.el.setAttribute("animation__position", "property", "position");
			this.el.setAttribute("animation__position", "from", { "x": p.x, "y": p.y, "z": p.z });
			this.el.setAttribute("animation__position", "to", { "x": p.x, "y": p.y + this.data.maxHeight, "z": p.z });
			this.el.setAttribute("animation__position", "dur", this.data.riseTime * 1000);
			this.el.setAttribute("animation__position", "easing", "easeOutQuad");  // fast at start, then slower

			// trail effect ----------------------------------------------------------

			this.particleTrail = document.createElement("a-image");
			this.particleTrail.setAttribute("position", "0 -0.1 0");
			this.particleTrail.setAttribute("width", "0.5");
			this.particleTrail.setAttribute("height", "0.5");
			this.particleTrail.setAttribute("scale", "1 1 1");

			this.particleTrail.setAttribute("src", "#fireballSheet");

			this.particleTrail.setAttribute("spritesheet-animation", "rows: 1; columns: 8; frameDuration: 0.08; loop: true;");

			this.particleTrail.setAttribute("material", "blending: additive; transparent: true; opacity: 1;");


			this.particleTrail.setAttribute("animation__fade", "property", "material.opacity");
			this.particleTrail.setAttribute("animation__fade", "from", 1.0);
			this.particleTrail.setAttribute("animation__fade", "to", 0.2);
			this.particleTrail.setAttribute("animation__fade", "dur", this.data.riseTime * 1000);
			this.particleTrail.setAttribute("animation__fade", "easing", "easeOutQuad");  // slow at start, then fast

			this.particleTrail.setAttribute("animation__shrink", "property", "scale");
			this.particleTrail.setAttribute("animation__shrink", "from", "1 1 1");
			this.particleTrail.setAttribute("animation__shrink", "to", "0.25 0.25 0.25");
			this.particleTrail.setAttribute("animation__shrink", "dur", this.data.riseTime * 1000);
			this.particleTrail.setAttribute("animation__shrink", "easing", "easeOutQuad");  // slow at start, then fast

			this.el.appendChild(this.particleTrail);

			// burst effect ----------------------------------------------------------

			this.particleBurst = document.createElement("a-entity");
			this.particleBurst.setAttribute("spe-particles", "");

			this.particleBurst.setAttribute("spe-particles", "texture", "images/particles/sparkle.png");
			this.particleBurst.setAttribute("spe-particles", "blending", "additive");
			this.particleBurst.setAttribute("spe-particles", "distribution", "sphere");
			this.particleBurst.setAttribute("spe-particles", "radius", 0.01);

			// particles both shrink and fade during last moments
			this.particleBurst.setAttribute("spe-particles", "opacity", [1, 1, 1, 0]);
			// this.particleBurst.setAttribute("spe-particles", "size", [1, 1, 1, 0]);

			let particleCount = Math.floor(randomUniform(100, 999));
			this.particleBurst.setAttribute("spe-particles", "particleCount", particleCount);

			// change of particle burst vs. particle stream
			if (Math.random() < 0.80)
				this.particleBurst.setAttribute("spe-particles", "activeMultiplier", particleCount);
			else
				this.particleBurst.setAttribute("spe-particles", "activeMultiplier", particleCount / 128);

			// note: when distribution = 'sphere', only first component of velocity vectors are used
			let baseVelocity = randomUniform(1, 2);
			this.particleBurst.setAttribute("spe-particles", "velocity", { "x": baseVelocity, "y": 0, "z": 0 });
			this.particleBurst.setAttribute("spe-particles", "velocitySpread", { "x": 0.5, "y": 0, "z": 0 });
			this.particleBurst.setAttribute("spe-particles", "drag", 1.00);
			this.particleBurst.setAttribute("spe-particles", "randomizeVelocity", true);

			// add a bit of gravity
			this.particleBurst.setAttribute("spe-particles", "accelerationDistribution", "box");
			this.particleBurst.setAttribute("spe-particles", "acceleration", { "x": 0, "y": -0.2, "z": 0 });
			this.particleBurst.setAttribute("spe-particles", "accelerationSpread", { "x": 0, "y": 0.2, "z": 0 });

			// how long will particles last?
			this.burstDuration = randomUniform(1.0, 3.0);
			this.particleBurst.setAttribute("spe-particles", "maxAge", this.burstDuration);
			this.particleBurst.setAttribute("spe-particles", "maxAgeSpread", this.burstDuration / 4);
			// duration = maximum amount of time to emit particles;
			//        	  should be less than smallest max age to prevent second burst
			this.particleBurst.setAttribute("spe-particles", "duration", 0.5);

			// default: steady color
			let colorArray = ["white", this.data.color, this.data.color, this.data.color];
			// random chance of color shifting
			if (Math.random() < 0.25) {
				let color2 = this.data.color;
				// make sure second color is different from first
				while (color2 == this.data.color) {
					color2 = this.randomColor();
				}
				colorArray = ["white", this.data.color, color2, color2];
			}
			this.particleBurst.setAttribute("spe-particles", "color", colorArray);

			// disable burst effect for now;
			//   will be enabled (in tick method) after reaching max height
			this.particleBurst.setAttribute("spe-particles", "enabled", false);

			this.el.appendChild(this.particleBurst);

			this.elapsedTime = 0;
			this.burstStart = false;

			// audio effects
			this.launchSound = document.getElementById("launchSound");
			this.launchSound.components.sound.playSound();
			if (this.burstDuration < 1.6 || particleCount < 300)
				this.burstSound = document.getElementById("burst1Sound");
			else if (this.burstDuration < 2.4)
				this.burstSound = document.getElementById("burst2Sound");
			else // this.burstDuration < 3.0
				this.burstSound = document.getElementById("burst3Sound");
		},

		tick: function (time, deltaTime) {

			this.elapsedTime += deltaTime / 1000;

			// firework has reached max height, start burst effect
			if (this.elapsedTime > this.data.riseTime && this.burstStart == false) {
				this.burstStart = true;
				this.particleBurst.setAttribute("spe-particles", "enabled", true);

				this.el.removeChild(this.particleTrail);

				this.burstSound.components.sound.playSound();
			}

			// firework finished; remove self from scene
			//  need to take into account particle age variation (1.25 factor)
			if (this.elapsedTime > this.data.riseTime + this.burstDuration * 1.25) {
				let element = this.el;
				element.parentNode.removeChild(element);
			}
		}

	});

}());
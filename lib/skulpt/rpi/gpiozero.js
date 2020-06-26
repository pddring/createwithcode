var $builtinmodule = function(name) {
	var mod = {};
	var colors = [
		"#3366CC",
		"#DC3912",
		"#FF9900",
		"#109618",
		"#990099",
		"#3B3EAC",
		"#0099C6",
		"#DD4477",
		"#66AA00",
		"#B82E2E",
		"#316395",
		"#994499",
		"#22AA99",
		"#AAAA11",
		"#6633CC",
		"#E67300",
		"#8B0707",
		"#329262",
		"#5574A6",
		"#3B3EAC"];
	var wires = 0;
	var pinNames = ["", "3v3 Power",
			"5v Power",
			"BCM 2",
			"5v Power",
			"BCM 3",
			"Ground", 
			"BCM 4",
			"BCM 14",
			"Ground", 
			"BCM 15",
			"BCM 17",
			"BCM 18",
			"BCM 27",
			"Ground", 
			"BCM 22",
			"BCM 23",
			"3v3 Power",
			"BCM 24",
			"BCM 10",
			"Ground", 
			"BCM 9",
			"BCM 25",
			"BCM 11",
			"BCM 8",
			"Ground", 
			"BCM 7",
			"BCM 0",
			"BCM 1",
			"BCM 5",
			"Ground", 
			"BCM 6",
			"BCM 12",
			"BCM 13",
			"Ground", 
			"BCM 19",
			"BCM 16",
			"BCM 26",
			"BCM 20",
			"Ground", 
			"BCM 21"];

	function getPin(name) {
		var pin = {
			index: 0,
			name: name,
			x: 0,
			y: 0

		};
		for(var i = 0; i < pinNames.length; i++) {
			if(name == pinNames[i]) {
				pin.index = i;
				pin.physicalNumber = i - 1;
				pin.x = 17 + (pin.physicalNumber % 2) * 10;
				pin.y = 37 + Math.floor(pin.physicalNumber / 2) * 10;
				break;
			}
		}
		return pin;
	}

	var html = '<div id="gpiozero"></div><small>Simulated gpiozero support is under development. <a href="https://twitter.com/pddring" target="_blank">Let me know</a> if there\'s a feature you\'d really like to see implemented. The gpiozero module was developed by Ben Nuttall and Dave Jones: <a target="_blank" href="https://gpiozero.readthedocs.io/en/latest/index.html">read the docs</a></small>';

	PythonIDE.python.output(html, true);
	var paper = Raphael(document.getElementById("gpiozero"), 600, 350);	
	PythonIDE.updateConsoleSize();
	var offset = {
		x: 50, y: 0
	};

	paper.rect(0, 0, 40, 280, 0).attr({
		fill: '#00935b'
	});

	paper.circle(20, 15, 10).attr({fill: '#ffb60c'});
	paper.circle(20, 15, 5).attr({fill: '#ffffff'});
	paper.circle(20, 250, 10).attr({fill: '#ffb60c'});
	paper.circle(20, 250, 5).attr({fill: '#ffffff'});
	paper.rect(0, 265, 20, 35).attr({fill:'#ccc'});

	paper.rect(10, 30, 25, 205).attr({
		fill: '#000'
	});
	for(var i = 0; i < 20; i++) {
		var pin = paper.rect(15, 35 + i*10, 5, 5).attr({
			fill: '#ffb60c'
		});
		pin.number = (i*2) + 1;
		pin.name = 'Pin ' + pin.number + ' ' + pinNames[pin.number];

		pin.hover(function() {
			PythonIDE.showHint(this.name);
			this.attr({stroke:'#fff'});
			this.g = this.glow({color: '#f00', width: 20});
		}, function() {
			this.attr({stroke:'unset'});
			this.g.remove();
		});
		
		pin = paper.rect(25, 35 + i*10, 5, 5).attr({
			fill: '#ffb60c'
		});

		pin.number = (i*2) + 2;
		pin.name = 'Pin ' + pin.number + ' ' + pinNames[pin.number];

		pin.hover(function() {
			PythonIDE.showHint(this.name);
			this.attr({stroke:'#fff'});
			this.g = this.glow({color: '#f00', width: 20});
		}, function() {
			this.attr({stroke:'unset'});
			this.g.remove();
		});
	}
	


	mod.Device = new Sk.misceval.buildClass(mod, function($gbl, $loc) {
		var __init__ = function(self, pin_factory) {
			self._closed = false;
			self.value = 0;
		};
		__init__.co_varnames = ["self", "pin_factory"];
		__init__.$defaults = [Sk.builtin.none.none$];

		$loc.__init__ = new Sk.builtin.func(__init__);

		$loc.close = new Sk.builtin.func(function(self) {
			self._closed = true;
		});

		$loc.closed = new Sk.builtin.func(function(self) {
			return new Sk.builtin.bool(self._closed);
		});

		$loc.is_active = new Sk.builtin.func(function(self) {
			return new Sk.builtin.bool(self.value);
		});
	}, "gpiozero.Device", []);

	mod.CompositeDevice = new Sk.misceval.buildClass(mod, function($gbl, $loc) {
		var __init__ = function(kwa, self) {
			var args = Array.prototype.slice.call(arguments, 2);
			self.devices = args;
			for(var i=0; i < kwa.length; i+=2) {
				var key = Sk.ffi.remapToJs(kwa[i]);
				self.devices[key] = kwa[i+1];
			}
			self.closed = false;
		};
		__init__['co_kwargs'] = true;

		$loc.__init__ = new Sk.builtin.func(__init__);

		$loc.__getitem__ = new Sk.builtin.func(function(self, key) {
			return self.devices[Sk.ffi.remapToJs(key)];
		});

		$loc.close = new Sk.builtin.func(function(self) {
			self.closed = true;
		});

		$loc.closed = new Sk.builtin.func(function(self) {
			return Sk.ffi.remapToPy(self.closed);
		});

		$loc.value = new Sk.builtin.func(function(self) {
			var values = [];
			for(var key in self.devices) {
				values.push(self.devices[key].value);
			}
			return new Sk.builtins['tuple'](values);
		});
	}, "gpiozero.CompositeDevice", [mod.Device]);

	function addHover(object, text) {
		if(arguments.length == 1) {
			for(var key in object) {
				addHover(object[key], key);
			}
		} else {
			object.hover(function() {
				PythonIDE.showHint(text);
				this.g = this.glow({color: '#f00', width: 20});
			}, function() {
				this.g.remove();
			});
		}
	}

	function addWire(piPin, components, name, description) {
		var cPin = components[name];
		var x = offset.x + Math.floor(Math.random() * 25) - 10;
		var y1 = offset.y + Math.floor(Math.random() * 50);
		var y2 = offset.y + Math.floor(Math.random() * 50);
		var wire = components["wire_" + name] = paper.path(["M", piPin.x || piPin.attrs.x, piPin.y || piPin.attrs.y, "C", offset.x, y1, x, y2, cPin.attrs.x+2, cPin.attrs.y+2]).attr({
			stroke: colors[wires++ % colors.length],
			"stroke-width": 3
		});
		addHover(wire, description);
	}

	var spareMotorController = undefined;

	mod.Motor = new Sk.misceval.buildClass(mod, function($gbl, $loc) {

		var __init__ = function(kwa, self, forward, backward) {
			self.forward = Sk.ffi.remapToJs(forward);
			self.backward = Sk.ffi.remapToJs(backward);
			if(spareMotorController) {
				self.controller = spareMotorController;
				offset.x += 120;
				offset.y -= 100;
				self.components = {
					motorBack: paper.rect(offset.x + 120, offset.y + 40, 60, 20).attr({
						fill: '#aaa'
					}),
					motorP1: paper.rect(offset.x + 125, offset.y + 60, 5, 10).attr({
						fill: '#888'
					}),
					motorP2: paper.rect(offset.x + 170, offset.y + 60, 5, 10).attr({
						fill: '#888'
					}),
					motor: paper.circle(offset.x + 150, offset.y + 30, 30).attr({
						fill:'#ccc'
					}),
					motorAxis: paper.circle(offset.x + 150, offset.y + 30, 5).attr({
						fill:'#888'
					}),
					cog: paper.image("lib/skulpt/rpi/components/cog.png", offset.x + 125, offset.y + 5, 50, 50)
				};

				addWire(self.controller.components.pin11, self.components, "motorP1", "Wire to Motor 2");
				addWire(self.controller.components.pin14, self.components, "motorP2", "Wire to Motor 2");
				addWire(self.controller.components.pin16, self.controller.components, "pin9", "Wire to enable Motor 2");
				offset.x -= 50;
				addWire(self.controller.components.pin12, self.controller.components, "pin13", "Wire to GND");
				addWire(self.controller.components.pin4, self.controller.components, "pin13", "Wire to GND");
				addWire(getPin("BCM " + self.forward), self.controller.components, "pin10", "Wire from pin " + self.forward + " to M2 forward");
				addWire(getPin("BCM " + self.backward), self.controller.components, "pin15", "Wire from pin " + self.backward + " to M2 backward");
				spareMotorController = undefined;
				offset.x -= 70;
				offset.y += 100;
			} else {
				spareMotorController = self;
				offset.x += 20;
				offset.y += 20;
				var gnd = getPin("Ground");
				var power = getPin("5v Power");
				self.components = {
					hbridge: paper.rect(offset.x + 30, offset.y, 40, 85).attr({
						fill:'#444'
					}),
					text: paper.text(offset.x + 50, offset.y+30, "SN54410").attr({
						fill:'#ccc'
					}).transform("r90"),
					motorBack: paper.rect(offset.x + 120, offset.y + 40, 60, 20).attr({
						fill: '#aaa'
					}),
					motorP1: paper.rect(offset.x + 125, offset.y + 60, 5, 10).attr({
						fill: '#888'
					}),
					motorP2: paper.rect(offset.x + 170, offset.y + 60, 5, 10).attr({
						fill: '#888'
					}),
					motor: paper.circle(offset.x + 150, offset.y + 30, 30).attr({
						fill:'#ccc'
					}),
					motorAxis: paper.circle(offset.x + 150, offset.y + 30, 5).attr({
						fill:'#888'
					}),
					cog: paper.image("lib/skulpt/rpi/components/cog.png", offset.x + 125, offset.y + 5, 50, 50)
				};
				for(pin = 0; pin < 8; pin++) {
					self.components["pin" + (pin+1)] = paper.rect(offset.x+25, offset.y + 5 + (pin * 10), 5, 5).attr({fill: '#ccc'});
					self.components["pin" + (pin+9)] = paper.rect(offset.x+25 + 45, offset.y - 85 + ((16 - pin) * 10), 5, 5).attr({fill: '#ccc'});
				}
				addWire(gnd, self.components, "pin4", "Wire to ground");
				
				addWire(power, self.components, "pin1", "Wire to enable Motor 1 (+5V)");
				addWire(getPin("BCM " + self.forward), self.components, "pin2", "Wire from pin " + self.forward + " to M1 forward");
				addWire(getPin("BCM " + self.backward), self.components, "pin7", "Wire from pin " + self.backward + " to M1 backward");
				
				offset.x += 50;
				addWire(self.components.pin4, self.components, "pin5", "Wire to ground");
				offset.y -= 30;
				addWire(self.components.pin1, self.components, "pin16", "Wire to +5v");
				offset.y += 30;
				addWire(self.components.pin1, self.components, "pin7", "Wire to +5v");

				addWire(self.components.motorP1, self.components, "pin3", "Motor 1");
				addWire(self.components.motorP2, self.components, "pin6", "Motor 1");

				addHover({
					"SN54410 HBridge Motor Controller": self.components.hbridge,
					"Pin 1 (Motor 1 Enable)": self.components.pin1,
					"Pin 2 (Motor 1 Forward)": self.components.pin2,
					"Pin 3 (Motor 1)": self.components.pin3,
					"Pin 4 (GND)": self.components.pin4,
					"Pin 5 (GND)": self.components.pin5,
					"Pin 6 (Motor 1)": self.components.pin6,
					"Pin 7 (Motor 1 Reverse)": self.components.pin7,
					"Pin 8 (Motor Power)": self.components.pin8,
					"Pin 9 (Motor 2 Enable)": self.components.pin9,
					"Pin 10 (Motor 2 Forward)": self.components.pin10,
					"Pin 11 (Motor 2)": self.components.pin11,
					"Pin 12 (GND)": self.components.pin12,
					"Pin 13 (GND)": self.components.pin13,
					"Pin 14 (Motor 2)": self.components.pin14,
					"Pin 15 (Motor 2 Reverse)": self.components.pin15,
					"Pin 16 (+5v)": self.components.pin16
				});

				offset.x -=70;
				offset.y += 100;
			}			
		};
		__init__['co_kwargs'] = true;
		function spinCW(c, time) {
			var degrees = 0;
			var t = c.transform();
			if(t[0])
				degress = Math.floor(t[0][1]) % 360;
			c.attr({transform:"R" + degrees}).stop().animate({transform:"R" + (degrees + 360)}, time, function() {spinCW(c, time)});
		}
		function spinCCW(c, time) {
			var degrees = 0;
			var t = c.transform();
			if(t[0])
				degrees = Math.floor(t[0][1]) % 360;
			c.attr({transform:"R" + (degrees + 360)}).stop().animate({transform:"R" + degrees}, time, function() {spinCCW(c, time)});
		}

		$loc.forward = new Sk.builtin.func(function(self, speed) {
			self.value = Sk.ffi.remapToJs(speed);
			if(speed == undefined) self.value = 1;
			if(self.value > 1)self.value = 1;
			if(self.value < 0)self.value = 0;
			if(self.value > 0) {
				var time = 5000-((self.value / 1.0) * 4000)
				spinCW(self.components.cog, time);	
			} else {
				self.components.cog.stop();
			}
		});

		$loc.backward = new Sk.builtin.func(function(self, speed) {			
			self.value = 0 -  Sk.ffi.remapToJs(speed);
			if(speed == undefined) self.value = -1;
			if(self.value < -1)self.value = -1;
			if(self.value > 0)self.value = 0;
			if(self.value < 0) {
				var time = 5000-((self.value / -1.0) * 4000)
				spinCCW(self.components.cog, time);	
			} else {
				self.components.cog.stop();
			}
		});

		$loc.stop = new Sk.builtin.func(function(self) {
			self.components.cog.stop();
			self.value = 0;
		});

		$loc.__init__ = new Sk.builtin.func(__init__);
	}, "gpiozero.Motor", [mod.CompositeDevice]);

	mod.GPIODevice = new Sk.misceval.buildClass(mod, function($gbl, $loc) {
		var __init__ = function(self, pin, pin_factory) {
			Sk.misceval.callsimArray(mod.Device.__init__, [self, pin_factory]);
			self.pin = pin;
		};
		__init__.co_varnames = ["self", "pin", "pin_factory"];
		__init__.$defaults = [Sk.builtin.none.none$];
		$loc.__init__ = new Sk.builtin.func(__init__);

		$loc.__getattr__ = new Sk.builtin.func(function(self, name) {
			name = Sk.ffi.remapToJs(name);
			switch(name) {
				case 'pin':
					return self.pin;
				break;
				case 'value':
					return self.ffi.remapToPy(self.value);
				break;
			}
		});
	}, "gpiozero.GPIODevice", [mod.Device]);

	mod.InputDevice = new Sk.misceval.buildClass(mod, function($gbl, $loc) {
		var __init__ = function(self, pin, pull_up, active_state, pin_factory) {
			Sk.misceval.callsimArray(mod.GPIODevice.__init__, [self, pin, pin_factory]);
			self.pull_up = pull_up;
			self.active_state = active_state;
		}
		__init__.co_varnames = ["self", "pin", "pull_up", "active_state", "pin_factory"];
		__init__.$defaults = [Sk.builtin.bool.false$, Sk.builtin.none.none$, Sk.builtin.none.none$];
		$loc.__init__ = new Sk.builtin.func(__init__);
	}, "gpiozero.InputDevice", [mod.GPIODevice]);

	mod.DigitalInputDevice = new Sk.misceval.buildClass(mod, function($gbl, $loc) {
		var __init__ = function(self, pin, pull_up, active_state, bounce_time, pin_factory) {
			Sk.misceval.callsimArray(mod.InputDevice.__init__, [self, pin, pull_up, active_state, pin_factory]);
			self.bounce_time = bounce_time;
		}
		__init__.co_varnames = ["self", "pin", "pull_up", "active_state", "bounce_time", "pin_factory"];
		__init__.$defaults = [Sk.builtin.bool.false$, Sk.builtin.none.none$, Sk.builtin.none.none$, Sk.builtin.none.none$];
		$loc.__init__ = new Sk.builtin.func(__init__);
	}, "gpiozero.DigitalInputDevice", [mod.InputDevice]);

	mod.OutputDevice = new Sk.misceval.buildClass(mod, function($gbl, $loc) {
		var __init__ = function(self, pin, active_high, initial_value, pin_factory) {
			Sk.misceval.callsimArray(mod.GPIODevice.__init__, [self, pin, pin_factory]);
			self.active_high = active_high;
			self.initial_value = initial_value;
		}
		__init__.co_varnames = ["self", "pin", "active_high", "initial_value", "pin_factory"];
		__init__.$defaults = [Sk.builtin.bool.true$, Sk.builtin.bool.false$, Sk.builtin.none.none$];
		$loc.__init__ = new Sk.builtin.func(__init__);
	}, "gpiozero.OutputDevice", [mod.GPIODevice]);

	mod.DigitalOutputDevice = new Sk.misceval.buildClass(mod, function($gbl, $loc) {
		var __init__ = function(self, pin, active_high, initial_value, pin_factory) {
			Sk.misceval.callsimArray(mod.OutputDevice.__init__, [self, pin, active_high, initial_value, pin_factory]);
		}
		__init__.co_varnames = ["self", "pin", "active_high", "initial_value", "pin_factory"];
		__init__.$defaults = [Sk.builtin.bool.true$, Sk.builtin.bool.false$, Sk.builtin.none.none$];
		$loc.__init__ = new Sk.builtin.func(__init__);

		var blink = function(self, on_time, off_time, n, background) {
			on_time = Sk.ffi.remapToJs(on_time);
			off_time = Sk.ffi.remapToJs(off_time);
			n = Sk.ffi.remapToJs(n);
			background = Sk.ffi.remapToJs(background);
			function nextBlink(resolve) {
				if(n > 0 || n == null) {
					setTimeout(function() {
						Sk.misceval.callsimArray(self.on, [self]);
						setTimeout(function() {
							Sk.misceval.callsimArray(self.off, [self]);
							if(n!==null)n--;
							nextBlink(resolve);
						}, off_time * 1000);
					}, on_time * 1000)
				} else {
					resolve();
				}
			}
			if(!background) {
				return PythonIDE.runAsync(function(resolve, reject) {
					nextBlink(resolve);
				});
			} else {
				nextBlink(function() {
				});
			}
		}
		blink.co_varnames = ["self", "on_time", "off_time", "n", "background"];
		blink.$defaults = [Sk.ffi.remapToPy(1), Sk.ffi.remapToPy(1), Sk.builtin.none.none$, Sk.builtin.bool.true$];
		$loc.blink = new Sk.builtin.func(blink);

		$loc.off = new Sk.builtin.func(function(self) {
			self.value = Sk.ffi.remapToJs(self.active_high)?0:1;
		});

		$loc.on = new Sk.builtin.func(function(self) {
			self.value = Sk.ffi.remapToJs(self.active_high)?1:0;
		});

	}, "gpiozero.DigitalOutputDevice", [mod.OutputDevice]);

	mod.Button = new Sk.misceval.buildClass(mod, function($gbl, $loc) {
		var __init__ = function(self, pin, pull_up, active_state, bounce_time, hold_time, hold_repeat, pin_factory) {
			Sk.misceval.callsimArray(mod.DigitalInputDevice.__init__, [self, pin, pull_up, active_state, bounce_time, pin_factory]);
			self.hold_time = hold_time;
			self.hold_repeat = hold_repeat;
			self.components = {
				wire1: paper.rect(offset.x + 20, offset.y + 65, 50, 3).attr({fill:'#989898'}),
				wire2: paper.rect(offset.x + 20, offset.y + 80, 50, 3).attr({fill:'#989898'}),
				base: paper.rect(offset.x + 30, offset.y + 60, 30, 30, 5).attr({fill:'#ccc'}),
				switch: paper.rect(offset.x + 35, offset.y + 65, 20, 20, 5).attr({fill:'#724a02'}).hover(function() {
					PythonIDE.showHint("Button");
					this.g = this.glow({color: '#f00', width: 20});
				}, function() {
					this.g.remove();
				}).mousedown(function() {
					if(self.onpress) {
						self.onpress();
					}
					self.holdTimeout = setTimeout(function() {
						///TODO
						if(self.when_held) {
							Sk.misceval.callsimAsync(null, self.when_held, self).then(function() {
							}, function(e) {
								window.onerror(e);
							});
						}
					}, Sk.ffi.remapToJs(self.hold_time) * 1000);
					self.lastPress = new Date();
				}).mouseup(function() {
					if(self.onrelease) {
						self.onrelease();
					}
					clearTimeout(self.holdTimeout);
					delete self.lastPress;
				})
			};
			var gnd = getPin("Ground");
			var pin = getPin("BCM " + Sk.ffi.remapToJs(pin));
			self.components.wireToGround = paper.path(["M", gnd.x, gnd.y, "C", offset.x, offset.y, offset.x, offset.y + 50, offset.x + 20, offset.y + 65]).attr({
				stroke: colors[wires++ % colors.length],
				"stroke-width": 3
			}).hover(function() {
				this.g = this.glow({color: '#f00', width: 20});
				PythonIDE.showHint("Wire connected to Ground");
			}, function() {
				this.g.remove();
			});
			self.components.wireToPin = paper.path(["M", pin.x, pin.y, "C", offset.x, offset.y, offset.x, offset.y + 80, offset.x + 20, offset.y + 80]).attr({
				stroke: colors[wires++ % colors.length],
				"stroke-width": 3
			}).hover(function() {
				this.g = this.glow({color: '#f00', width: 20});
				PythonIDE.showHint("Wire connected to " + pin.name);
			}, function() {
				this.g.remove();
			});
			offset.x += 130;
			if(offset.x > 500) {
				offset.x = 50;
				offset.y += 160;
			}
		}
		__init__.co_varnames = ["self", "pin", "pull_up", "active_state", "bounce_time", "hold_time", "hold_repeat", "pin_factory"];
		__init__.$defaults = [Sk.builtin.bool.true$, Sk.builtin.none.none$, Sk.builtin.none.none$, Sk.ffi.remapToPy(1), Sk.builtin.bool.false$, Sk.builtin.none.none$];
		$loc.__init__ = new Sk.builtin.func(__init__);

		var wait_for_press = function(self, timeout) {
			timeout = Sk.ffi.remapToJs(timeout);
			return PythonIDE.runAsync(function(resolve, reject) {
				if(timeout) {
					clearTimeout(self.timeout);
					self.timeout = setTimeout(resolve, timeout * 1000);	
				}
				self.onpress = function() {
					self.onpress = undefined;
					resolve();
				}
			});
		};
		wait_for_press.co_varnames = ["self", "timeout"];
		wait_for_press.$defaults = [Sk.builtin.none.none$];
		$loc.wait_for_press = new Sk.builtin.func(wait_for_press);
		
		var wait_for_release = function(self, timeout) {
			timeout = Sk.ffi.remapToJs(timeout);
			return PythonIDE.runAsync(function(resolve, reject) {
				if(timeout) {
					clearTimeout(self.timeout);
					self.timeout = setTimeout(resolve, timeout * 1000);	
				}
				self.onrelease = function() {
					self.onrelease = undefined;
					resolve();
				}
			});
		};
		wait_for_release.co_varnames = ["self", "timeout"];
		wait_for_release.$defaults = [Sk.builtin.none.none$];
		$loc.wait_for_release = new Sk.builtin.func(wait_for_release);
		
		$loc.__getattr__ = new Sk.builtin.func(function(self, name) {
			name = Sk.ffi.remapToJs(name);
			switch(name) {
				case 'held_time':
					if(self.lastPress) {
						var diff = new Date() - self.lastPress;
						return Sk.ffi.remapToPy(diff / 1000);
					} else {
						return Sk.builtin.none.none$;
					}
				break;
			}
		});
	}, "gpiozero.Button", [mod.DigitalInputDevice]);

	mod.LED = new Sk.misceval.buildClass(mod, function($gbl, $loc) {
		var __init__ = function(self, pin, active_high, initial_value, pin_factory) {
			Sk.misceval.callsimArray(mod.DigitalOutputDevice.__init__, [self, pin, active_high, initial_value, pin_factory]);
			self.components = {
				led: paper.image("lib/skulpt/rpi/components/led.png", offset.x + 80, offset.y, 41, 157).hover(function() {
					PythonIDE.showHint("Light Emitting Diode");
					this.g = this.glow({color: '#f00', width: 20});
				}, function() {
					this.g.remove();
				}),
				shine: paper.rect(offset.x + 90, offset.y + 10, 20, 30, 5).attr({
					fill: 'red',
					opacity: 1,
					'stroke-width': 0
				}),
				resistor: paper.image("lib/skulpt/rpi/components/resistor330.png", offset.x, offset.y + 127, 94, 14).hover(function() {
					PythonIDE.showHint("330 Ohm resistor");
					this.g = this.glow({color: '#f00', width: 20});
				}, function() {
					this.g.remove();
				})
			};
			var gnd = getPin("Ground");
			var anode = getPin("BCM " + Sk.ffi.remapToJs(pin));
			self.components.wireToResistor = paper.path(["M", gnd.x, gnd.y, "C", offset.x, offset.y, offset.x, offset.y + 50, offset.x, offset.y + 132]).attr({
				stroke: colors[wires++ % colors.length],
				"stroke-width": 3
			}).hover(function() {
				this.g = this.glow({color: '#f00', width: 20});
				PythonIDE.showHint("Wire connected to Ground");
			}, function() {
				this.g.remove();
			});
			self.components.wireToAnode = paper.path(["M", anode.x, anode.y, "C", offset.x, offset.y, offset.x, offset.y + 227, offset.x + 112, offset.y + 158]).attr({
				stroke: colors[wires++ % colors.length],
				"stroke-width": 3
			}).hover(function() {
				this.g = this.glow({color: '#f00', width: 20});
				PythonIDE.showHint("Wire connected to " + anode.name);
			}, function() {
				this.g.remove();
			});
			offset.x += 130;
			if(offset.x > 500) {
				offset.x = 50;
				offset.y += 160;
			}
		}
		__init__.co_varnames = ["self", "pin", "active_high", "initial_value", "pin_factory"];
		__init__.$defaults = [Sk.builtin.bool.true$, Sk.builtin.bool.false$, Sk.builtin.none.none$];
		$loc.__init__ = new Sk.builtin.func(__init__);

		$loc.off = new Sk.builtin.func(function(self) {
			self.value = Sk.ffi.remapToJs(self.active_high)?0:1;
			var s = self.components.shine.attr({
				opacity: 0.5,
				fill: 'black'
			});
			if(s.g) s.g.remove();
		});

		$loc.on = new Sk.builtin.func(function(self) {
			self.value = Sk.ffi.remapToJs(self.active_high)?1:0;
			var s = self.components.shine.attr({
				opacity: 1,
				fill: 'red'
			});
			s.g = s.glow({color: '#f00', width: 60});
			self.components.led.toFront();
		});
	}, "gpiozero.LED", [mod.DigitalOutputDevice]);
	return mod;
}
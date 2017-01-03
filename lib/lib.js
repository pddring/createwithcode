// nasty hacky animated title
var t;
function animateTitle(txt, id) {
	var chars = "0123456789ABCDEF";
	var finalChars = txt.split('');

	var jq = $('#' + id);

	var letterCount = -10;
	function onAnimTimeout() {
		var randomChars = "";
		if(letterCount >=0 ) {
			randomChars = txt.substring(0, letterCount);
		}

		randomChars += '<span class="randomChars">';
		for(var i = (letterCount < 0)?0:letterCount; i < txt.length; i++) {
			var c = Math.floor(Math.random() * chars.length);
			randomChars += chars[c];
		}
		randomChars += '</span>';


		jq.html(randomChars);
		letterCount++;
		clearTimeout(t);
		if(letterCount <= txt.length) {
			t = setTimeout(onAnimTimeout, 50);
		}
	}

	t = setTimeout(onAnimTimeout, 50);

}

// Main PythonIDE object
var PythonIDE = {
	// edit a file
	// filename: string (name of file to edit)
	editFile: function(filename) {
		if(PythonIDE.files[PythonIDE.currentFile])
			PythonIDE.files[PythonIDE.currentFile] = PythonIDE.editor.getValue();
		PythonIDE.currentFile = filename;
		PythonIDE.editor.setValue(PythonIDE.files[filename]);
		PythonIDE.editor.setCursor(0);
		PythonIDE.editor.focus();

		var extension = filename.match(/(\.[^.]+)/);
		if(extension.length > 1)
			extension = extension[1];
		switch(extension) {
			case '.py':
				PythonIDE.editor.setOption("mode", "python");
			break;
			case '.html':
				PythonIDE.editor.setOption("mode", "html");
			break;
			case '.js':
				PythonIDE.editor.setOption("mode", "javascript");
			break;
			case '.sql':
				PythonIDE.editor.setOption("mode", "sql");
				break;
			default:
				PythonIDE.editor.setOption("mode", "python");
			break;
		}

		PythonIDE.updateFileTabs();
	},

	// update the list of files at the top of the screen
	updateFileTabs: function() {
		var html = '';
		for(var file in PythonIDE.files){
			html += '<span class="file_tab';
			if(file == PythonIDE.currentFile) {
				html += ' file_tab_selected">'
				if(file != 'mycode.py'){
					html += '<img class="btn_file_settings" alt="File settings" title="File settings" src="media/settings.png">';
				}
			} else {
				html += '">';
			}
			html += file + '</span>';
		}
		html += '<span class="file_tab"><img class="btn_file_settings" alt="Create new file" title="Create new file" src="media/tools.png"></span>';
		$('#file_tabs').html(html);
		$('.file_tab').click(function(e) {
			var fileName = e.currentTarget.textContent;
			switch(fileName) {
				case "":
					fileName = 'newfile.txt';
					if(PythonIDE.files[fileName] === undefined){
						PythonIDE.files[fileName] = '';
					}
					PythonIDE.editFile('newfile.txt');
					break;
				case PythonIDE.currentFile:
					if(fileName != "mycode.py") {
						$('#file_settings').dialog("open");
						$('#txt_file_name').val(fileName).focus();
					}
					break;
				default:
					PythonIDE.editFile(e.currentTarget.textContent);
					break;
			}

		});
	},

	// file currently being edited
	currentFile: 'mycode.py',

	// returns the number of files in the current project
	countFiles: function() {
		var c = 0;
		for(var f in PythonIDE.files) {
			c++;
		}
		return c;
	},

	// stores each of the files in the project
	files: {'mycode.py':''},

	// callback function to allow python (skulpt) to read from a file
	readFile: function(filename) {
		return PythonIDE.files[filename];
	},

	// callback function to allow python (skulpt) to write to a file
	writeFile: function(filename, contents) {
		PythonIDE.files[filename] = contents;
		PythonIDE.updateFileTabs();
	},

	// message to display in the status bar at the bottom of the screen
	welcomeMessage: "Press Ctrl+Enter to run",

	// options are stored in browers's localstorage. Get the value of a specified option
	getOption: function(optionName, defaultValue) {
		if(localStorage && localStorage['OPT_' + optionName])
			return localStorage['OPT_' + optionName]
		return defaultValue;
	},

	// set the value of an option and store it in the browser's localstorage
	setOption: function(optionName, value) {
		localStorage['OPT_' + optionName] = value;
		return value;
	},

	// display text in the status bar
	showHint: function(msg) {
		if(PythonIDE.hideHintTimeout) {
			clearTimeout(PythonIDE.hideHintTimeout);
		}
		PythonIDE.hideHintTimeout = setTimeout(function(){
			delete PythonIDE.hideHintTimeout;
			$('#hintBar').fadeOut();
		}, 5000);
		$('#hintBar').html(msg).show();
	},

	// functions and data needed for running theh python code
	python: {
		outputListeners: [],

		output: function(text, header) {
			var id = header == undefined?'consoleOut': 'headerOut';
			var c = document.getElementById(id);
			c.innerHTML += text;

			var i = 0;
			while(i < PythonIDE.python.outputListeners.length) {
				var l = PythonIDE.python.outputListeners[i];
				try {
					l(text);
					i++;
				} catch(e) {
					PythonIDE.python.outputListeners.splice(i, 1);
				}
			}
			var c = c.parentNode.parentNode;
			c.scrollTop = c.scrollHeight;

		},

		clear: function() {
			var c = document.getElementById('consoleOut');
			c.innerHTML = '';
			var c = c.parentNode.parentNode;
			c.scrollTop = c.scrollHeight;
		},

		builtinread: function(x) {
			if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
			return Sk.builtinFiles["files"][x];
		}
	},

	// convenience function that allows modules to run syncronous code asyncrounously.
	// For example time.sleep needs to pause the python program but shouldn't make the browser unresponsive
	runAsync: function(asyncFunc) {
		var p = new Promise(asyncFunc);
		var result;
		var susp = new Sk.misceval.Suspension();
		susp.resume = function() {
			return result;
		}
		susp.data = {
			type: "Sk.promise",
			promise: p.then(function(value) {
				result = value;
				return value;
			}, function(err) {
				result = "";
				PythonIDE.handleError(err);
				return new Promise(function(resolve, reject){
				});
			})
		};
		return susp;
	},

	// used when displaying the contents of global variables that are too large to display on the screeen until clicked on to expand
	watchVariables: {
		expandHandlers:[]
	},

	// stores all code executed on this browser so the user can recover code from a previous session
	vault: localStorage.vault?JSON.parse(localStorage.vault):[],

	// recover code from a previous session in this browser. This is client side only. To save in the cloud, visit create.withcode.uk
	recover: function() {
		PythonIDE.saveSnapshot();
		var html = '<p>A copy of your code is saved in your browser every time you run it.</p>';
		html += '<p>Number of code backups currently stored in the vault:' + PythonIDE.vault.length + '</p>';
		html += '<div id="slider_recover"></div><span id="recover_time">Drag the slider to go back in time and recover your code</span>';

		html += '<p><button id="btn_recover">Recover</button></p>';
		html += '<p>If more than one person on this computer uses the same login you may wish to clear all of the code stored in the recovery vault.</p><p><i class="fa fa-warning"></i> Be careful: once you\'ve pressed Delete all you can\'t go back.</p>';
		html += '<p><button id="btn_recover_clear">Delete all</button></p>';


		$('#recover').html(html).dialog("open").parent().css({'opacity':0.8});
		$('#slider_recover').slider({
			min: 0,
			max: PythonIDE.vault.length - 1,
			value: PythonIDE.vault.length - 1,
			slide: function(event, ui) {
				var snapshot = PythonIDE.vault[ui.value];
				var d = new Date(snapshot.date);
				PythonIDE.files = JSON.parse(snapshot.files);
				PythonIDE.currentFile = "mycode.py";
				PythonIDE.editor.setValue(PythonIDE.files[PythonIDE.currentFile]);
				PythonIDE.updateFileTabs();
				PythonIDE.editor.setCursor(0); // clear selection
				var ds = "" + (d.getMonth() + 1) + "/" + (d.getDate()) + "/" + d.getFullYear();
				var hours = d.getHours() % 12;
				if(hours == 0) {
					hours = 12;
				}
				var days = "Sun,Mon,Tue,Wed,Thu,Fri,Sat,Sun".split(",");
				var months = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(",");
				function pad2(s){s = s.toString();return s.length < 2?"0"+s:s;}
				$('#recover_time').html('<p class="recover_date">' + days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear() + '</p><p class="recover_label">Recovery time:</p><span id="recover_time_hours">' + (pad2(hours)) + '</span><span id="recover_time_mins">' + pad2(d.getMinutes()) + '</span><span id="recover_time_ampm">' + ((d.getHours() >= 12)? "PM" : "AM") + '</span>');

			}
		});
		$('#btn_recover_clear').button().click(function(){
			PythonIDE.vault = [];
			PythonIDE.recover();
		});
		$('#btn_recover').button().click(function() {
			$('#recover').dialog("close");
		});
	},

	// save code to the vault (store it in the browser's local storage so it can be recovered at a later date / session)
	saveSnapshot: function() {
		var snapshot = {date: Date.now(), files: JSON.stringify(PythonIDE.files)};
		while(PythonIDE.vault.length > 50) {
			delete PythonIDE.vault[0];
		}
		var match = false;
		for(i = 0; i < PythonIDE.vault.length; i++) {
			if(i == PythonIDE.vault.length - 1 && PythonIDE.vault[i].files == snapshot.files) {
				PythonIDE.vault[i].date = snapshot.date;
				match = true;
			}
		}
		if(!match) {
			PythonIDE.vault.push(snapshot);
		}

		localStorage.vault = JSON.stringify(PythonIDE.vault);
	},

	// run the code in the editor
	// runMode can be "anim" to step through each line of python code or "normal" to run the whole code as fast as possible
	runCode: function(runMode) {
		if(PythonIDE.unhandledError)
			delete PythonIDE.unhandledError;

		if(PythonIDE.animTimeout && runMode != "anim") {
			clearTimeout(PythonIDE.animTimeout);
			delete PythonIDE.animTimeout;
			return;
		}

		if(PythonIDE.continueDebug) {
			if(runMode != "normal") {
				PythonIDE.continueDebug();
				return;
			}
		}

		if(runMode === undefined)
			runMode = "normal";

		PythonIDE.runMode = runMode;
		PythonIDE.python.outputListeners = [];

		PythonIDE.showHint("Running code...");
		$('#btn_stopRunning').addClass('visibleButton');

		var code = PythonIDE.files['mycode.py'];
		localStorage.lastRunCode = code;

		PythonIDE.saveSnapshot();


		var html = '';
		html += '<div id="headerOut"></div>';
		html += '<pre id="consoleOut"><div id="watch"><h2>Variables:</h2></div></pre>';
		html += '</pre>';
		if(code.indexOf("turtle") > 0) {
			html += '<div id="canvas"></div>';
		}
		html += '<div><button id="btn_stop">Stop</button><button id="btn_hideConsole">Hide</button></div>';



		$('#output').html(html);
		$('#dlg').dialog("open");

		$('#btn_stop').button().click(function() {
			localStorage.loadAction = "restoreCode";
			window.location = window.location.href.replace('run/', 'python/');
		});

		if(!PythonIDE.whenFinished) {
			$('#btn_hideConsole').button().click(function() {
				$('#dlg').dialog("close");
			});
		} else {
			$('#btn_hideConsole').hide();
		}

		var handlers = [];
		if(runMode != "normal") {
			handlers["Sk.debug"] = function(susp) {
				// globals
				//console.log(susp.child);
				var html = '<h2>Global variables:</h2><table><tr><th>Name</th><th>Data type</th><th>Value</th></tr>';
				PythonIDE.watchVariables.expandHandlers = [];
				for(var key in susp.child.$gbl) {
					var pyVal = susp.child.$gbl[key];
					var val = JSON.stringify(Sk.ffi.remapToJs(pyVal));

					if(val === undefined) {
						val = "";
					}

					if(val && val.length && val.length > 20) {
						var eH = {"id":PythonIDE.watchVariables.expandHandlers.length, "fullText": val, "shortText": val.substring(0,17)};

						PythonIDE.watchVariables.expandHandlers.push(eH);
						val = '<span class="debug_expand_zone" id="debug_expand_' + eH.id + '">' + val.substring(0, 17) + '<img src="media/tools.png" class="debug_expand" title="Click to see full value"></span>';
					}

					var type = pyVal.skType?pyVal.skType : pyVal.__proto__.tp$name;
					if(type == "function") {
						continue;
					}
					if(type == "str") {
						type = "string";
					}
					if(type === undefined) {
						//console.log(pyVal, val, type);
						continue;
					}
					html += '<tr><td>' + key + '</td><td>' + type + '</td><td>' + val + '</td></tr>';
				}
				html += '</table>';



				$('#watch').html(html);

				$('span.debug_expand_zone').click(function(e) {
					var id = e.currentTarget.id;
					var idNum = id.replace("debug_expand_", "");
					$('#' + id).html(PythonIDE.watchVariables.expandHandlers[idNum].fullText);
				});

				var p = new Promise(function(resolve,reject){
					PythonIDE.continueDebug = function() {
						return resolve(susp.resume());
					}

					PythonIDE.abortDebug = function() {
						delete PythonIDE.abortDebug;
						delete PythonIDE.continueDebug;
						return reject("Program aborted");
					}

				});
				return p;
			}
			setTimeout(function() {PythonIDE.runCode(runMode); }, 100);
			$('#watch').show();
		} else {

			// if code contains a while loop
			if((code.indexOf("while ") > -1) && (code.indexOf("sleep") == -1)) {
				console.log("Crash prevention mode enabled: This happens when your code includes an infinite loop without a sleep() function call. Your code will run much more slowly in this mode.");

				var startTime = new Date().getTime();
				var lineCount = 0;
				handlers["Sk.debug"] = function(susp) {
					lineCount++;
					if(new Date().getTime() - startTime > 100) {
						if(lineCount < 100) {
							return;
						}
						startTime = new Date().getTime();
						var p = new Promise(function(resolve, reject) {
							setTimeout(function() {
								PythonIDE.showHint("Limiting speed to avoid crashing the browser: " + (lineCount * 10) +  " lines per second");
								lineCount = 0;
								return resolve(susp.resume());
							}, 50);

						});
						return p;
					}


				};
			}
		}



		Sk.misceval.callsimAsync(handlers, function() {
			return Sk.importMainWithBody("mycode",false,code,true);
		}).then(function(module){
			PythonIDE.showHint('Program finished running');
			if(PythonIDE.continueDebug)
				delete PythonIDE.continueDebug;
			if(PythonIDE.abortDebug)
				delete PythonIDE.abortDebug;
			$('#btn_stop').hide();
			$('#btn_stopRunning').removeClass('visibleButton').addClass('hiddenButton');
			if(PythonIDE.whenFinished) {
				PythonIDE.whenFinished();
			}
		}, PythonIDE.handleError);

	},

	// display errors caught when the python code runs
	handleError:function (err){

		console.log(err);

		if(!PythonIDE.unhandledError && PythonIDE.continueDebug) {
			PythonIDE.unhandledError = err;
			return;
		}

		var html = '<span class="error">' + err.toString() + '</span>';
		PythonIDE.showHint(html);
		PythonIDE.python.output(html);
	},

	// not used in client side code
	showShare: function(){

		if(!PythonIDE.shareMode)
			PythonIDE.shareMode = "code";

		var link = "" + window.location;
		var embed = ('https://create.withcode.uk' + window.location.pathname).replace('python/', 'embed/');

		if(PythonIDE.shareMode == "run") {
			link = link.replace('python/', 'run/');
			embed = embed.replace('embed/', 'run/');
		}
		$('#share_link_val').val(link);
		$('#share_embed_val').val('<iframe frameborder="0" width="100%" height="400px" src="' + embed + '"><a target="_blank" href="' + link + '">create.withcode.uk</a></iframe>');
		$('#share_qr_val').html('<a target="_blank" href="' + link + '"><img src="https://chart.googleapis.com/chart?cht=qr&chs=400x400&chl=' + link + '"></a>');
		$('#share_tweet_val').attr({href:'http://twitter.com/home/?status=' + encodeURIComponent("My python code: " + link)});
		$('#share').dialog("open");
	},

	// not used in client side code
	save: function() {
		PythonIDE.showHint("Saving...");
		var code = PythonIDE.files['mycode.py'];
		if(PythonIDE.countFiles() > 1) {
			code = JSON.stringify(PythonIDE.files);
		}
		$.getJSON('/lib/api.php', {
			cmd: 'save',
			code: encodeURIComponent(btoa(code))
		}, function(data) {
			//console.log(data);
			var link = 'https://create.withcode.uk/python/'+data.hash;
			window.location=link;
		});
	},

	// event handler that responds when the browser resizes
	autoSize: function(e) {
		if(e && e.target.localName == "div")
			return;
		// expand editor to fit height of the screen.
		$('.holder').css({height: window.innerHeight - 80});
		$('#dlg,#settings,#login,#share,#file_settings, #recover').dialog({
			width: window.innerWidth * 0.8,
			height: window.innerHeight * 0.7
		});
	},

	// initialise the python ide
	init: function(style) {
		PythonIDE.showHint(PythonIDE.welcomeMessage);
		window.onresize = PythonIDE.autoSize;
		PythonIDE.updateFileTabs();

		$('#share_tabs').tabs();

		animateTitle('create.withcode.uk', 'title_text');

		PythonIDE.editor = CodeMirror(document.getElementById('editor'), {
			value: PythonIDE.files['mycode.py'],
			mode: 'python',
			lineNumbers: true,
			styleActiveLine: true,
			inputStyle: "textarea"
		});
		if(style != "embed" && style != "run") {
			PythonIDE.editor.focus();
		}
		PythonIDE.editor.on("change", function(e) {
			if(PythonIDE.abortDebug) {
				PythonIDE.abortDebug();
			}
			PythonIDE.files[PythonIDE.currentFile] = PythonIDE.editor.getValue();
		});



		$('#file_settings button').button().click(function(e) {
			switch(e.currentTarget.id) {
				case 'btn_file_rename':
					var newFileName = $('#txt_file_name').val();
					if(!newFileName.match(/^[A-Za-z0-9_.]+$/)){
						PythonIDE.showHint("Invalid file name");
						break;
					}
					if(PythonIDE.files[newFileName]) {
						PythonIDE.showHint('A file with this name already exists');
						break;
					}
					var fileContents = PythonIDE.files[PythonIDE.currentFile]
					delete PythonIDE.files[PythonIDE.currentFile];
					PythonIDE.currentFile = newFileName;
					PythonIDE.files[PythonIDE.currentFile] = fileContents;
					PythonIDE.updateFileTabs();
					$('#file_settings').dialog("close");
					PythonIDE.editFile(newFileName);

				break;
				case 'btn_file_delete':
					delete PythonIDE.files[PythonIDE.currentFile];
					PythonIDE.editFile("mycode.py");

				case 'btn_file_cancel':
					$('#file_settings').dialog("close");
				break;
			}
			//console.log(e.currentTarget.id);
		});

		if(localStorage && !localStorage.options) {
			localStorage.options = {
				codeSize:12,
				outputSize: 12,
				outputTransparency: 0,
				stepAnimtime: 1000
			}
		}

		$('#slider_code_size').slider({
			value: PythonIDE.getOption('codeSize', 12),
			min: 6,
			max: 40,
			slide: function(e, ui) {
				$('#txt_code_size').val(ui.value + "pt");
				$('#editor').css({'font-size':ui.value + 'pt'});
				PythonIDE.setOption('codeSize', ui.value);
			}
		});
		$('#txt_code_size').val(PythonIDE.getOption('codeSize', 12) + "pt");
		$('#editor').css({'font-size':PythonIDE.getOption('codeSize', 12) + 'pt'});

		$('#slider_output_size').slider({
			value: PythonIDE.getOption('outputSize', 12),
			min: 6,
			max: 40,
			slide: function(e, ui) {
				$('#txt_output_size').val(ui.value + "pt");
				$('#output').css({'font-size':ui.value + 'pt'});
				PythonIDE.setOption('outputSize', ui.value)
			}
		});
		$('#txt_output_size').val(PythonIDE.getOption('outputSize', 12) + "pt");
		$('#output').css({'font-size':PythonIDE.getOption('outputSize', 12) + 'pt'});

		$('#slider_output_transparency').slider({
			value: PythonIDE.getOption('outputTransparency', 0),
			min: 0,
			max: 100,
			slide: function(e, ui) {
				$('#txt_output_transparency').val(ui.value + "%");
				$('#dlg').parent().css({'opacity':1 - (ui.value / 100)});
				PythonIDE.setOption('outputTransparency', ui.value);
			}
		});
		$('#txt_output_transparency').val(PythonIDE.getOption('outputTransparency', 0) + "%");

		$('#slider_step_anim_time').slider({
			value: PythonIDE.getOption('stepAnimTime', 500),
			min: 500,
			max: 5000,
			step: 500,
			slide: function(e, ui) {
				$('#txt_step_anim_time').val(ui.value / 1000 + "s");
				PythonIDE.setOption('stepAnimtime', ui.value)
			}
		});
		$('#txt_step_anim_time').val(PythonIDE.getOption('stepAnimTime', 500) + "ms");

		window.onerror=function(err) {
			var msg = err.toString().replace("Uncaught ", "");
			var html = '<span class="error">' + msg + '</span>';
			PythonIDE.showHint(html);
			PythonIDE.python.output(html);
			console.log(err);

			return true;
		}

		// setup keyboard shortcutts
		$(window).keydown(function(e) {
			if(e.ctrlKey) {
				switch(e.keyCode) {
					case 13: // CTRL + ENTER = run / stop
						PythonIDE.runCode("normal");
						e.preventDefault();
					break;

					case 83: // CTRL + S = save
						PythonIDE.save();
						e.preventDefault();
						break;

					case 190: // CTRL + . = step | CTRL SHIFT + . = anim
						if(e.altKey) {
							if(PythonIDE.abortDebug) {
								PythonIDE.abortDebug();
							}
						} else {
							if(e.shiftKey) {
								PythonIDE.runCode("anim");
							} else {
								PythonIDE.runCode("step");
							}
						}
						e.preventDefault();
						break;

					case 79: // CTRL + O settings
						$('#settings').dialog("open");
						e.preventDefault();
						break;

					default:
						//console.log("Control + keycode:" + e.keyCode);
					break;
				}
			}
		});

		$('#dlg,#settings,#login,#share,#file_settings, #recover').dialog({
			autoOpen:false,
			width: window.innerWidth * 0.8,
			height: window.innerHeight * 0.7
		});

		$('#btn_login').button().click(function() {
			var username = $('#txt_username').val();
			var password = $('#txt_password').val();
			//console.log(username, password);
		});

		$('#radio_share_mode').buttonset().change(function(e) {
			var id = $('#radio_share_mode :radio:checked').attr('id');
			switch(id) {
				case 'radio_share_mode_code':
					PythonIDE.shareMode = 'code';
				break;
				case 'radio_share_mode_run':
					PythonIDE.shareMode = 'run';
				break;
			}
			PythonIDE.showShare();
		});

		$('#radio_run_mode').buttonset().change(function(e) {
			var id = $('#radio_run_mode :radio:checked').attr('id');
			switch(id) {
				case 'radio_run_mode_all':
					PythonIDE.runMode = "normal";
				break;
				case 'radio_run_mode_single':
					PythonIDE.runMode = "step";
				break;
				case 'radio_run_mode_anim':
					PythonIDE.runMode = "anim";
				break;
			}
		});

		$('#radio_code_style').buttonset().change(function(e) {
			var id = $('#radio_code_style :radio:checked').attr('id');
			switch(id) {
				case 'radio_code_style_light':
					PythonIDE.editor.setOption("theme", "default");
					$('body').css({'background-color': '#FFF'});
					PythonIDE.setOption('code_style', 'light')
				break;
				case 'radio_code_style_dark':
					PythonIDE.editor.setOption("theme", "blackboard");
					$('body').css({'background-color': '#000'});
					PythonIDE.setOption('code_style', 'dark')
				break;
				case 'radio_code_style_dusk':
					PythonIDE.editor.setOption("theme", "cobalt");
					$('body').css({'background-color': '#002240'});
					PythonIDE.setOption('code_style', 'dusk')
				break;
			}
		});
		$('#radio_code_style_' + PythonIDE.getOption('code_style', 'light')).prop('checked', true).change();

		$('#radio_output_style').buttonset().change(function(e) {
			var id = $('#radio_output_style :radio:checked').attr('id');
			switch(id) {
				case 'radio_output_style_light':
					$('#dlg').css({'background-color': '#FFF','color':'#000'});
					PythonIDE.setOption('output_style', 'light')
				break;
				case 'radio_output_style_dark':
					$('#dlg').css({'background-color': '#222','color':'#CCC'});
					PythonIDE.setOption('output_style', 'dark')
				break;
				case 'radio_output_style_dusk':
					$('#dlg').css({'background-color': '#002240','color':'#CCC'});
					PythonIDE.setOption('output_style', 'dusk')
				break;
			}
		});
		$('#radio_output_style_' + PythonIDE.getOption('output_style', 'dark')).prop('checked', true).change();

		$('#userDetails').button().click(function() {
			$('#login').dialog("open");
		});




		if(localStorage.loadAction) {
			switch(localStorage.loadAction) {
				case 'showShare':
					PythonIDE.showShare();
				break;
				case 'restoreCode':
					PythonIDE.editor.setValue(localStorage.lastRunCode);
				break;
			}
			delete localStorage.loadAction;
			PythonIDE.editor.setCursor(0);
			PythonIDE.editor.focus();
		}

		(Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'canvas';

		Sk.inputfun = function(prompt) {
			//return window.prompt(prompt);
			var p = new Promise(function(resolve, reject) {
				if($('#raw_input_holder').length > 0) {
					return;
				}
				PythonIDE.python.output('<form><div id="raw_input_holder"><label for="raw_input">' + prompt + '</label><input type="text" name="raw_input" id="raw_input" value=""/><button id="raw_input_accept" type="submit">OK</button></div></form>');

				var btn = $('#raw_input_accept').button().click(function() {
					var val = $('#raw_input').val();
					$('#raw_input_holder').remove();
					PythonIDE.python.output(prompt + ' <span class="console_input">' + val + "</span>\n");
					resolve(val);
				});
				$('#raw_input').focus();
			});
			return p;
		}

		Sk.configure({
			breakpoints:function(filename, line_number, offset, s) {
				//console.log(line_number, PythonIDE.runMode);
				if(PythonIDE.runMode == "anim") {
					if(PythonIDE.continueDebug) {
						PythonIDE.animTimeout = setTimeout(function() {
							PythonIDE.runCode("anim");
						}, $( "#slider_step_anim_time" ).slider( "value" ));
					}
				}
				PythonIDE.editor.setCursor(line_number - 1);

				// check for errors in external libraries
				if(PythonIDE.unhandledError) {
					throw PythonIDE.unhandledError;
				}
				return true;
			},
			debugging: true,
			output: PythonIDE.python.output,
			readFile: PythonIDE.readFile,
			writeFile: PythonIDE.writeFile,
			read: PythonIDE.python.builtinread});

		// add in additional libraries.
		// not all of these are complete but they serve as an example of how you can code your own modules.
		Sk.externalLibraries = {
			// added as a farewell message to a school direct student
			schooldirect: {
				path: 'lib/skulpt/schooldirect/__init__.js'
			},

			os: {
				path: 'lib/skulpt/os/__init__.js'
			},
			speech: {
				path: 'lib/skulpt/speech/__init__.js',
				dependencies: ['lib/skulpt/speech/sam.js']
			},
			radio: {
				path: 'lib/skulpt/radio/__init__.js'
			},


			// easy data visualisation functions unique to withcode.uk
			withcode: {
				path: 'lib/skulpt/withcode/__init__.js'
			},

			// not quite complete implementation of sqlite3
			sqlite3: {
				path: 'lib/skulpt/sqlite3/__init__.js'
			},

			// microbit simulator
			microbit: {
				path: 'lib/skulpt/microbit/__init__.js'
			},

			// music module compatible with microbit music module
			music: {
				path: 'lib/skulpt/music/__init__.js'
			},

			// anyone fancy implementing this?! Imagine the possibilities!
			py3d: {
				path: 'lib/skulpt/py3d/__init__.js',
				dependencies: ['/lib/skulpt/py3d/three.js'],
			},
			RPi: {
				path: 'lib/skulpt/rpi/__init__.js'
			},
			"RPi.GPIO": {
				path: 'lib/skulpt/rpi/__init__.js'
			}
		};

		// expand editor to fit height of the screen.
		$('.holder').css({height: window.innerHeight - 80});

		$('#footer').css({bottom: 0});

		$('.toolButton').hover(function(e) {
			// mouse over tool button
			PythonIDE.showHint($('#' + e.currentTarget.id).attr('alt'));
		}, function(e) {
			// mouse out tool button
			PythonIDE.showHint(PythonIDE.welcomeMessage);
		}).click(function(e) {
			// tool button click
			switch(e.currentTarget.id) {
				case 'btn_edit':
					window.open(window.location.href.replace('embed', 'python').replace('run', 'python'));
				break;

				case 'btn_show_recover':
					PythonIDE.recover();
				break;

				case 'btn_stopRunning':
					localStorage.loadAction = "restoreCode";
					window.location = window.location.href.replace('run/', 'python/');
				break;

				case 'btn_tools':
					toolsVisible = !toolsVisible;
					if(toolsVisible) {
						$('.toolButton').addClass('visibleButton');
					} else {
						$('.toolButton').removeClass('visibleButton');
					}
				break;

				case 'btn_show_output':
					//$('#btn_group_console').toggleClass('hiddenButtonPanel');
					$('#dlg').dialog("open");
				break;

				case 'btn_show_settings':
					$('#settings').dialog("open");
				break;

				case 'btn_show_share':
					localStorage.loadAction="showShare";
					PythonIDE.save();
				break;

				case 'btn_run':
					PythonIDE.runCode(PythonIDE.runMode);
				break;
			}
		});
		if(style == "run") {

			$('#editor').hide();
			var output = $('#output').detach();
			$('#holder').append(output);
			$('#dlg').remove();
			PythonIDE.whenFinished = function() {
				var link = window.location.href.replace('run/', 'python/');
				var html = '<div><a class="nounderline" href="http://withcode.uk" target="_blank"><h1 id="title" onmouseover="animateTitle(\'create.withcode.uk\', \'title_text\')"><span class="brackets">{</span><span id="title_text">withcode.uk</span><span class="brackets">}</span></h1></a></div>';
				PythonIDE.python.output(html + '<p>This python app was written using <a href="https://create.withcode.uk">create.withcode.uk</a>. <a href="' + link + '">Click here to edit the python code and create/share your own version</a> or check out <a href="http://blog.withcode.uk">blog.withcode.uk</a> for ideas, tips and resources</p> <button id="btn_run_again">Run again</button>');
				$('#btn_run_again').button().click(function() {PythonIDE.runCode()});
			}
			PythonIDE.runCode();
		}
	}
}

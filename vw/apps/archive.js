var archives = [];
var archive_haswindow = false;
var archive_trackdata = "Loading.."
var archive_stream = "";
var archive_cover = "";
var archive_identifier = "";

var archive_domain = "";
var getarchiveurl = archive_domain + "/vpr/newwaves.txt";

var archive_restricted = false;
var archive_playlist = [];

var archive_nexttrack = {};
var archive_nexttrack_loaded = false;
var archive_nexttrack_loading = false;
var archive_bufferingallowed = true;

var archive_duration = 0;
var archive_currtime = 0;
var archive_volume = "100";

var archive_allowmp3 = true;
var archive_allowogg = true;

var archive_hassettings = false;
var archive_haslastplayed = false;

var archive_paused = false;

var loading = false;
var archive_hastrack = false;

var nexttrack = "";

var fixonended_int = null;
var archive_firsttimeloading = true;


var alreadyloaded = {};

function getarchive() {
	if (window.localStorage['storedArchive'] == "TRUE") {
		if (archive_firsttimeloading) {
			var l = JSON.parse(window.localStorage['vapor']);
			/* Checking if identifier list has updated */
			if (Object.keys(l).length < Object.keys(alreadyloaded).length) {
				window.localStorage['storedArchive'] == "fff";
				return false;
			} else {
				alreadyloaded = l;
				return true;
			}
			archive_firsttimeloading = false;
		} else {
			alreadyloaded = JSON.parse(window.localStorage['vapor']);
			return true;
		}
	} else {
		return false;
	}
}

function savearchive() {
    window.localStorage['vapor'] = JSON.stringify(alreadyloaded);
}

function saveexplorer() {
    window.localStorage['vapor'] = JSON.stringify(alreadyloaded);
    window.localStorage['storedArchive'] = "TRUE";
}

function archive_init() {
	//TODO: replace with local file
	 if (!archive_haswindow) {
		
		playopen();
		
		fixonended_int = setInterval(archive_fixonended, 1000);
		
		archive_haswindow = true;
		
		function success(data) {
			
			if (archives.length == 0) {
				archives = data.split("/").clean('');
			}
			
			archives.forEach(function(i) {
				alreadyloaded[i] = {'loaded': false, 'cover': null, 'tracks':null, 'album':i, 'artist':null, 'id':i};
			});
			
			
			getarchive();
			archive_choosetrack();
		}
	
		$.ajax({
			type: "get", url: getarchiveurl,
			success: success,
			error: function (request, status, error) {
				makemsgbox('We' + "'" + 're currently under maintenance, but you can still check out our archive at <a href="https://archive.org/details/vaporwave">archive.org</a>.', 'Vaporwave Machine Broke');
			}
		});
	
	}

}


function archive_choosetrack() {
	loading = true;
	if (archives.length == 0) {
		return null;
	}
	
	if (archive_nexttrack_loaded) {
		archive_nexttrack_loaded = false;
		
		archive_identifier = archive_nexttrack['id'];
		
		archive_trackdata = archive_nexttrack['trackdata'];
		archive_stream = archive_nexttrack['stream'];
		archive_length = archive_nexttrack['length'];
		archive_cover = archive_nexttrack['cover'];
		archive_settrack();
		
		loading = false;
		
		return null;
	}
	
	archive_hastrack = false;
	archive_cover = "img/nocover.png";
	
	document.getElementById("archive_player").pause();
	document.getElementById("archive_progress").setAttribute("style", 'transition: 1.5s; width: 99%; background-color: #aa00aa');

	
	var URL = "https://archive.org/metadata/undefined";
	var meta = "";
	if (archive_restricted) {
			meta = archive_playlist.random();
		} else {
			meta = archives.random();
	}
	
	URL = "https://archive.org/metadata/" + meta;
	
	if (!alreadyloaded[meta]['loaded']) {
	
	alreadyloaded[meta]['cover'] = "img/nocover.png";
	
	$.getJSON(URL, function(data) {
		var tracks = [];
		$(jQuery.parseJSON(JSON.stringify(data["files"]))).each(function() {
			if (this.format == "JPEG Thumb") {
				archive_cover ="https://"+data["d1"]+data["dir"]+"/"+this.name;
				alreadyloaded[meta]['cover'] = archive_cover;
			}
		
			else if ((this.format.includes("MP3") && archive_allowmp3) || (this.format.toUpperCase().includes("OGG") && archive_allowogg)) {
				if (!(this.artist == null || this.album == null || this.title == null)) {
					archive_trackdata = this.artist + " - "+this.album+" - "+this.title;
					
					alreadyloaded[meta]['artist'] = this.artist;
					alreadyloaded[meta]['album'] = this.album;
					alreadyloaded[meta]['loaded'] = true;
					
					archive_stream = "https://"+data["d1"]+data["dir"]+"/"+encodeURIComponent(this.name);
					archive_length = parseInt(this.length);
					tracks.push({'trackdata':archive_trackdata, 'stream':archive_stream, 'length':archive_length});
				}
			}
		}).error(function() {
			archive_choosetrack();
			return null;
		});
		
		alreadyloaded[meta]['tracks'] = tracks;
		
		var b = tracks.random();
		
		if (b == undefined) {
			archive_choosetrack();
			return null;
		}

		archive_identifier = meta;
		
		archive_trackdata = b['trackdata'];
		archive_stream = b['stream'];
		archive_length = b['length'];
		archive_settrack();
		loading = false;
	});
	
	} else { //album data has already been gotten
		archive_cover = alreadyloaded[meta]['cover'];
		
		console.log("[[DEBUG]]: Using cached album data in choosetrack()");
		
		var b = alreadyloaded[meta]['tracks'].random();
		
		if (b == undefined) {
			archive_choosetrack();
			return null;
		}		
		
		archive_identifier = meta;
		
		archive_trackdata = b['trackdata'];
		archive_stream = b['stream'];
		archive_length = b['length'];
		archive_settrack();
		loading = false;
	}
}

function archive_preload() {
	if (archives.length == 0 || !archive_bufferingallowed) {
		return null;
	}
	
	archive_nexttrack['cover'] = "img/nocover.png";
	console.log("[[BUFFER]]: Preloading next track...");
	archive_updatenextup("Loading...");
	
	archive_nexttrack_loading = true;

	var URL = "https://archive.org/metadata/undefined";
	
	
	var meta = "";
	if (archive_restricted) {
			meta = archive_playlist.random();
		} else {
			meta = archives.random();
	}
	
	URL = "https://archive.org/metadata/" + meta;
	
	if (!alreadyloaded[meta]['loaded']) {
	
	alreadyloaded[meta]['cover'] = "img/nocover.png";
	
	$.getJSON(URL, function(data) {
		var tracks = [];
		$(jQuery.parseJSON(JSON.stringify(data["files"]))).each(function() {
			if (this.format == "JPEG Thumb") {
				archive_nexttrack['cover'] ="https://"+data["d1"]+data["dir"]+"/"+this.name;
				alreadyloaded[meta]['cover'] = archive_nexttrack['cover'];
			}
		
			else if ((this.format.includes("MP3") && archive_allowmp3) || (this.format.toUpperCase().includes("OGG") && archive_allowogg)) {
				if (!(this.artist == null || this.album == null || this.title == null)) {
					var d = this.artist + " - "+this.album+" - "+this.title;
					
					alreadyloaded[meta]['artist'] = this.artist;
					alreadyloaded[meta]['album'] = this.album;
					alreadyloaded[meta]['loaded'] = true;
					
					var s = "https://"+data["d1"]+data["dir"]+"/"+encodeURIComponent(this.name);
					var l = parseInt(this.length);
					tracks.push({'trackdata':d, 'stream':s, 'length':l});
				}
			}
		}).error(function() {
			archive_preload();
			return null;
		});
		var b = tracks.random();
		alreadyloaded[meta]['tracks'] = tracks;
		
		if (b == undefined) {
			archive_preload();
			return null;
		}		
		
		var cover = archive_nexttrack['cover'];
		archive_nexttrack = b;
		archive_nexttrack['cover'] = cover;
		archive_nexttrack['id'] = meta;

	
		var nextSong = document.createElement('audio');
		nextSong.autoplay = 'true';
		nextSong.preload = 'auto';
		nextSong.volume = 0;
		nextSong.src = archive_nexttrack['stream'];
		nextSong.oncanplay = function() {console.log("[[BUFFER]]: Finished buffering!")};
		
		//console.log("[[BUFFER]]: Preloading finished...");
		console.log("[[BUFFER]]: Next Up: " + archive_nexttrack['trackdata']+"...");
		archive_updatenextup(archive_nexttrack['trackdata']);
		
		archive_nexttrack_loaded = true;
		archive_nexttrack_loading = false;
	}).error(function() {
			archive_preload();
			return null;
	});
	
	} else { //Album data has already been loaded
		var b = alreadyloaded[meta]['tracks'].random();

		if (b == undefined) {
			archive_preload();
			return undefined;
		}		
		
		archive_nexttrack = b;
		archive_nexttrack['cover'] = alreadyloaded[meta]['cover'];
		
		archive_nexttrack['id'] = meta;
	
		var nextSong = document.createElement('audio');
		nextSong.autoplay = 'true';
		nextSong.preload = 'auto';
		nextSong.volume = 0;
		nextSong.src = archive_nexttrack['stream'];
		nextSong.oncanplay = function() {console.log("[[BUFFER]]: Finished buffering!")};
		
		archive_updatenextup(archive_nexttrack['trackdata']);
		
		console.log("[[BUFFER]]: Using cached album data in preload()");
		
		archive_nexttrack_loaded = true;
		archive_nexttrack_loading = false;
	}
}

function archive_settrack() {
	if (!archive_haswindow) {
		return null;
	}
	
	console.log("[[PLAYER]]: Now playing " + archive_trackdata + "...")
		
	document.getElementById("archive_player").setAttribute("src", archive_stream);
	document.getElementById("archive_player").play();
	
	if (archive_paused) {
		archive_pause(document.getElementById("archive_pausebtn"));
	}
	
	document.getElementById("artistinfo").setAttribute("style", "display:auto");
	document.getElementById("artistinfo2").setAttribute("style", "display:none");
	
	document.getElementById("artistinfo").innerHTML = archive_trackdata;
	document.getElementById("artistinfo2").innerHTML = archive_trackdata;
	if (document.getElementById("artistinfo").offsetWidth > 393) {
		document.getElementById("artistinfo").setAttribute("style", "display:none");
		document.getElementById("artistinfo2").setAttribute("style", "display:auto");
		//document.getElementById("artistinfo").innerHTML = document.getElementById("artistinfo").innerHTML.substr(0,document.getElementById("artistinfo").innerHTML.length -1);
		$('.marquee').marquee();
	}
	
	document.getElementById("archive-cover").setAttribute("src", archive_cover);
	document.getElementById("archive_timer").innerHTML = "0:00/"+archive_timestr(archive_length);
	
	document.getElementById("archive_progress").setAttribute("style", 'transition: 1.5s; width: 99%; background-color: #aa00aa');

	archive_addoption();
	savearchive();
}

function archive_timestr(dur) {
	var secs = (Math.round(dur) % 60).toString();
	if (secs.length < 2) {
		secs = "0"+secs;
	}

	return Math.floor(dur / 60).toString() + ":"+secs;
}

function archive_updatetime() {
	if (!loading && archive_haswindow) {
		archive_currtime = $('#archive_player')[0].currentTime;
		document.getElementById("archive_timer").innerHTML = archive_timestr(archive_currtime)+"/"+archive_timestr(archive_length);
		document.getElementById("archive_progress").setAttribute("style", 'width:' + ((archive_currtime / archive_length) * 100).toString()+"%; transition: 0.2s");
	}
	
	if (!archive_nexttrack_loaded && !archive_nexttrack_loading && document.getElementById('archive_player').readyState == 4) {
		archive_preload();
	}
}

function archive_about() {
	makemsgbox("<i>Archiving lost & lesser-known vaporwave.</i><br>The Vaporwave Archive plays Vaporwave pieces hosted on <a href='https://archive.org' onclick='window.open("+'"https://archive.org/details/vaporwave"'+"); return false;'>archive.org</a>.", "About the Vaporwave Archive", 23);
}

function archive_contrib() {
	makemsgbox("The Vaporwave Archive plays Vaporwave pieces hosted on <a href='https://archive.org' onclick='window.open("+'"https://archive.org"'+"); return false;'>archive.org</a>.<br><br>You can learn how to get your music playing here by clicking the "+'"'+"Contribute"+'"'+" tab", "About the Vaporwave Archive", 23);
}

function archive_showsettings() {
	
	if (!archive_hassettings) {
		document.getElementById("msgboxes").append(stringtonode(document.getElementById("dummyarchivesettings").innerHTML));
		document.getElementById("volumeslider").value = archive_volume;
		triggerMouseEvent (document.getElementById("archive-settings"), "mousedown");
		archive_hassettings = true;
		playopen();
	} else {
		triggerMouseEvent (document.getElementById("archive-settings"), "mousedown");
	}
}



function archive_download() {
	//window.open(archive_stream);
	window.open("https://archive.org/details/"+archive_identifier);
}

function archive_pause(t) {
	if (archive_paused) {
		document.getElementById("archive_player").play();
		archive_paused = !archive_paused;
		t.innerHTML = "Pause";
	} else {
		document.getElementById("archive_player").pause();
		archive_paused = !archive_paused;
		t.innerHTML = "Play";
	}
}

function archive_setvolume(v) {
	document.getElementById("archive_player").volume = v/100;
	archive_volume = v;
}

function archive_updatenextup(t) {
	document.getElementById("archive_nextup").innerHTML = "Next Up: "+t;
	while (document.getElementById("archive_nextup").offsetWidth > 393) {
		document.getElementById("archive_nextup").innerHTML = document.getElementById("archive_nextup").innerHTML.substr(0,document.getElementById("archive_nextup").innerHTML.length -1);
	}
}

function archive_addoption() {
	var sel = document.getElementById("archive-prevplay");
	var val = escape(JSON.stringify({'stream': archive_stream, 'cover':archive_cover, 'trackdata':archive_trackdata, 'length':archive_length, 'id':archive_identifier}));
	var b = '<option value="'+val+'" onclick="archive_playagain(this.value)">' + archive_trackdata + '</option>';
	
	try {
		sel.innerHTML = sel.innerHTML.replace(b, '');
	} catch(ex) {}
	sel.innerHTML = b + sel.innerHTML;
}

function archive_playagain(val) {
	var b = JSON.parse(unescape(val));
	
	if (archive_stream == b['stream']) {
		makemsgbox("No", '');
	} else {
		archive_cover = b['cover'];
		archive_trackdata = b['trackdata'];
		archive_stream = b['stream'];
		archive_length = b['length'];
		archive_identifier = b['id'];
		archive_settrack();
		loading = false;
	}
	
	console.log(b);
}

function archive_showlastplayed() {
	if (!archive_haslastplayed) {
		$("#archive_prevplaymsg").show();
		triggerMouseEvent (document.getElementById("archive-prevplay"), "mousedown");
		archive_haslastplayed= true;
		playopen();
	} else {
		triggerMouseEvent (document.getElementById("archive-prevplay"), "mousedown");
	}
}

function archive_fixonended() {
	if (archive_haswindow) {
		if (archive_length <= archive_currtime) {
			archive_choosetrack();
		}
	} else {
		fixonended_int = null;
	}
}
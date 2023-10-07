var archive_explorer_loaded = false;
var archive_explorer_window = false;

var archive_explorer_incookies = false;

var archive_explorer_back = "";
var archive_explorer_scroll = {'artist': 0, 'album':0, 'tracks':0};

var archive_explorer_inartist = true;

function archive_explorer_init() {
	archive_explorer_window = true;
	
	archive_explorer_getnames();
	archive_explorer_scroll = {'artist': 0, 'album':0, 'tracks':0};
}

function archive_explorer_getnames(forced = false) {
	if (!archive_explorer_loaded && !getarchive()) {
	
	if (!forced) {
		$.getJSON(archive_domain + "vpr/artists.txt", function(ret) {
			Object.keys(ret).forEach(function(i){
				alreadyloaded[i].artist = ret[i];
			});
			
			document.getElementById("archive_explorer_progress_container").setAttribute("style", 'display:none;');
			saveexplorer();
			archive_explorer_fillartist();
			
		});
	} else {
	
	var n = 0;
		archives.forEach(function (i) {
			$.getJSON("https://archive.org/metadata/"+i+"/metadata/creator", function(data) {
				
				if (data['result'] == undefined) {
					alreadyloaded[i]['artist'] = "Undefined Artist";
				} else {
					alreadyloaded[i]['artist'] = data['result'];
				}
				
				var val = i;
				var txt = '<option val="'+val+'">' + alreadyloaded[i]['artist'] + '</option>';
				
				archive_explorer_loaded = true;
				
				n += 1;
				document.getElementById("archive_explorer_progress").setAttribute("style", 'width:'+((n/(archives.length))*100).toString()+'%');

				if (n >= archives.length) {
					document.getElementById("archive_explorer_progress_container").setAttribute("style", 'display:none;');
					saveexplorer();
					archive_explorer_fillartist();
				}
			},
		).error(function() {
			alreadyloaded[i]['artist'] = "Error";
		}).async = true;
		
		
	});
	}
	} else {
		document.getElementById("archive_explorer_progress_container").setAttribute("style", 'display:none;');
		archive_explorer_fillartist();
	}
}

function archive_explorer_fillartist(term="") {
	
	document.getElementById("archive-exp").innerHTML = "";
	document.getElementById("archive-exp").setAttribute("class", 'loading')
	document.getElementById("archive_path").innerHTML = "Loading...";

	
	var creators = [];
	var added = [];
	var n = 0;
	
	archive_explorer_back = ";"
	
	for(var index = 0; index < archives.length; index++) {
		var i = alreadyloaded[archives[index]];
		if (!added.contains(i.artist.toUpperCase().trim())) {
			creators[n] = [i.artist, i.id];
			n += 1;
		}
		
		added[added.length] = i.artist.toUpperCase().trim();
	}
	
	//creators.sort();
	creators.sort(function (a, b) {
		return a[0].toLowerCase().localeCompare(b[0].toLowerCase());
	});
	
	var re = new RegExp(term, 'gi');
	
	creators.forEach(function(i) {
		if (i[0].match(re)) {
			var txt = '<option onclick="archive_explorer_fillalbums(this.value)" value="'+i[0]+'">' + i[0] + '</option>';
			document.getElementById("archive-exp").innerHTML = document.getElementById("archive-exp").innerHTML + txt;
		}
	});
	
	document.getElementById("archive-exp").setAttribute("class", '')
	document.getElementById("archive_path").innerHTML = "Vaporwave Archive";
	
	restorescroll("artist");
	
	archive_explorer_inartist = true;
	archive_explorer_togglesearchbar();
}

function archive_explorer_search(term) {
	if (archive_explorer_inartist) {
		archive_explorer_fillartist(term);
	}
}

function archive_explorer_goback() {
	eval(archive_explorer_back);
}

function archive_explorer_fillalbums(val, fromartist = true) {
	
	if (fromartist) {
		rememberscroll("artist");
	} else {
		rememberscroll("tracks");
	}
	
	document.getElementById("archive-exp").innerHTML = "";
	document.getElementById("archive-exp").setAttribute("class", 'loading')
	document.getElementById("archive_path").innerHTML = "Loading...";
	
	
	var albums = [];
	var num = 0;
	
	archive_explorer_back = "archive_explorer_fillartist();"
	
	
	for(var index = 0; index < archives.length; index++) {
		if (alreadyloaded[archives[index]].artist.toUpperCase().trim() == val.toUpperCase().trim()) {
			albums[albums.length] = alreadyloaded[archives[index]].id;
		}
	}
	
	
	albums.forEach(function (i) {
			$.getJSON("https://archive.org/metadata/"+i+"/metadata/title", function(data) {
				
				if (data['result'] == undefined) {
					alreadyloaded[i]['album'] = "Error";
				} else {
					alreadyloaded[i]['album'] = data['result'];
				}
				
				document.getElementById("archive_path").innerHTML = alreadyloaded[i]['artist'];
				
				var val = i;
				var txt = '<option onclick="archive_explorer_filltracks(this.value);" value="'+val+'">' + alreadyloaded[i]['album'] + '</option>';
				
				num += 1;
								
				if (num > albums.length-1) {
					albums.forEach(function(i) {
						var txt = '<option onclick="archive_explorer_filltracks(this.value);" value="'+alreadyloaded[i]['id']+'">' + alreadyloaded[i]['album'] + '</option>';
						document.getElementById("archive-exp").innerHTML = document.getElementById("archive-exp").innerHTML + txt;
					});
					
					var txt = '<option onclick="playartist(unescape(this.value))" style="color:rgb(126,126,126);" value="'+escape(alreadyloaded[i]['artist'])+'">' + "Add to Playlist" + '</option>';
					document.getElementById("archive-exp").innerHTML = document.getElementById("archive-exp").innerHTML + txt;

					
					document.getElementById("archive-exp").setAttribute("class", '')
					
					restorescroll("album");
					
				}
			}
		).error(function() {
			alreadyloaded[i]['album'] = "Error";
		});
	});
	
	archive_explorer_inartist = false;
	archive_explorer_togglesearchbar();
	
}

function archive_explorer_filltracks(val) {
	
	rememberscroll("album");
	
	document.getElementById("archive-exp").innerHTML = "";
	document.getElementById("archive-exp").setAttribute("class", 'loading')
	document.getElementById("archive_path").innerHTML = "Loading...";
	
	
	
	var tracks = [];
	
	archive_explorer_back = "archive_explorer_fillalbums('"+alreadyloaded[val]['artist']+"', false);";
	
	if (!alreadyloaded[val]['loaded']) {
		var meta = val;
	
	$.getJSON("https://archive.org/metadata/"+val, function(data) {
		var tracks = [];
		$(jQuery.parseJSON(JSON.stringify(data["files"]))).each(function() {
			if (this.format == "JPEG Thumb") {
				ac ="https://"+data["d1"]+data["dir"]+"/"+this.name;
				alreadyloaded[meta]['cover'] = ac;
			}
		
			else if ((this.format.includes("MP3") && archive_allowmp3) || (this.format.toUpperCase().includes("OGG") && archive_allowogg)) {
				//the track having an album is not as important seeing this archive also includes singles
				if (!(this.artist == null || /*this.album == null ||*/ this.title == null)) {
					if (this.album == undefined) { this.album = this.artist; }
					at = this.artist + " - "+this.album+" - "+this.title;
					
					//alreadyloaded[meta]['artist'] = this.artist;
					//alreadyloaded[meta]['album'] = this.album;
					//alreadyloaded[meta]['loaded'] = true;
					
					as = "https://"+data["d1"]+data["dir"]+"/"+encodeURIComponent(this.name);
					al = parseInt(this.length);
					tracks.push({'trackdata':at, 'stream':as, 'length':al});
				}
			}
		}).error(function() {
			archive_explorer_goback();
			makemsgbox("Could not load this album", 'Archive Error');
			return null;
		});
		
		alreadyloaded[meta]['tracks'] = tracks;
		
		tracks.forEach(function(i) {
			var txt = '<option onclick="archive_explorer_clicktrack(this.value);" value="'+escape(JSON.stringify([i, val]))+'">' + i['trackdata'] + '</option>';
			document.getElementById("archive-exp").innerHTML = document.getElementById("archive-exp").innerHTML + txt;
		});
		
		var txt = '<option onclick="playalbum(this.value)" style="color:rgb(126,126,126);" value="'+val+'">' + "Add to Playlist" + '</option>';
		document.getElementById("archive-exp").innerHTML = document.getElementById("archive-exp").innerHTML + txt;
	
		txt = '<option onclick="makeimg(this.value)" style="color:rgb(126,126,126);" value="'+alreadyloaded[meta]['cover']+'">' + "Show Cover" + '</option>';
		document.getElementById("archive-exp").innerHTML = document.getElementById("archive-exp").innerHTML + txt;

		
	});
	
	} else {
		alreadyloaded[val]['tracks'].forEach(function(i) {
			var txt = '<option onclick="archive_explorer_clicktrack(this.value);" value="'+escape(JSON.stringify([i, val]))+'">' + i['trackdata'] + '</option>';
			document.getElementById("archive-exp").innerHTML = document.getElementById("archive-exp").innerHTML + txt;
		});
	}
	
	document.getElementById("archive_path").innerHTML = alreadyloaded[val]['artist']+" - " + alreadyloaded[val]['album'];
	document.getElementById("archive-exp").setAttribute("class", '')
	
	archive_explorer_inartist = false;
	archive_explorer_togglesearchbar();
}

function archive_explorer_clicktrack(trackdata) {
	trackdata = JSON.parse(unescape(trackdata));
	
	var meta = trackdata[1];
	trackdata = trackdata[0];
	
	if (!(trackdata['stream'] == archive_stream)) {
	
		archive_nexttrack = trackdata;
		archive_nexttrack['cover'] = alreadyloaded[meta]['cover'];
		archive_nexttrack['id'] = meta;
	
		archive_nexttrack_loaded = false;
		archive_nexttrack_loading = false;
		loading = false;
		
		archive_identifier = archive_nexttrack['id'];
		
		archive_trackdata = archive_nexttrack['trackdata'];
		archive_stream = archive_nexttrack['stream'];
		archive_length = archive_nexttrack['length'];
		archive_cover = archive_nexttrack['cover'];
		archive_settrack();
	}
}

function archive_explorer_showcover(meta) {
	makeimg(alreadyloaded[meta]['album'], alreadyloaded[meta]['cover'], 203,222);
}

function rememberscroll(s) {
	var sel = document.getElementById('archive-exp');

	var optionTop = sel.scrollTop;
	
	archive_explorer_scroll[s] = optionTop;
}

function restorescroll(s) {
	var sel = document.getElementById('archive-exp');

	var optionTop = archive_explorer_scroll[s];

	sel.scrollTop = optionTop;
}

function archive_resetplaylist() {
	archive_restricted = false;
	archive_playlist = [];
	playlist_update();
}

function playartist(s) {
	var newplaylist = !archive_restricted;
	archive_restricted = true;
	
	archives.forEach(function(i) {
		if (alreadyloaded[i].artist == s) {
			if (!archive_playlist.contains(i)) {
				archive_playlist[archive_playlist.length] = i;
			}
		}
	});
	
	if (newplaylist) {
		archive_nexttrack_loaded = false;
		archive_choosetrack();
		playlist_show()
	}
	playlist_update();
}

function playalbum(s) {
	var newplaylist = !archive_restricted;
	archive_restricted = true;
	
	if (!archive_playlist.contains(s)) {
		archive_playlist[archive_playlist.length] = s;
	}
	
	if (newplaylist) {
		archive_nexttrack_loaded = false;
		archive_choosetrack();
		playlist_show()
	}
	
	playlist_update();
}

function updateartists() {
	archive_explorer_getnames(true);
	var ret = {};
	Object.keys(alreadyloaded).forEach(function(i) {ret[i] = alreadyloaded[i].artist});
	console.log(ret);
	return ret;
}

function archive_explorer_togglesearchbar() {
	//$("#archive_explorer_searchfield").value = "";
	if (archive_explorer_inartist) {
		$("#archive_explorer_searchfield_container").show(); 
	} else {
		document.getElementById("archive_explorer_searchfield").value = "";
		$("#archive_explorer_searchfield_container").hide();
	}
}

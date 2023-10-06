
function playlist_close() {
	if (archive_playlist.length > 0) {
		makemsgbox('You cannot close this window while a playlist is active', 'Playlist Explorer');
	} else {
		playlist_hide();
	}
}

function playlist_update() {
	document.getElementById("archive-playlist").innerHTML = "";
	
	archive_playlist.forEach(function(i) {
		var s = alreadyloaded[i].album;
		if (!(s.split(" - ")[0] == alreadyloaded[i].artist)) {
			s = alreadyloaded[i].artist + " - " + s;
		}
		var txt = '<option onclick="playlist_remove(this.value);" value="'+i+'">' + s+ "</option>"
		document.getElementById("archive-playlist").innerHTML += txt;
	});
}

function playlist_remove(s) {
	var index = archive_playlist.indexOf(s);
	archive_playlist.splice(index,1);
	
	if (archive_playlist.length == 0) {
		archive_restricted = false;
	}
	
	archive_nexttrack_loaded = false;
	
	playlist_update();
}

function playlist_show() {
	$('#archive_playlist').show();
	playopen();
}

function playlist_hide() {
	$('#archive_playlist').hide();
}
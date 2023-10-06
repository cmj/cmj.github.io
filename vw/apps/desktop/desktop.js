var wallpaper_id = 0;
var max_wallpapers = 61;
var desktop_haswindow = false;

class DesktopWallpaperWindow {
	constructor(x = 40, y=40) {
		if (!desktop_haswindow) {
		
			this.x = x;
			this.y = y;
			var m = document.getElementById("dummydesktopbackgroundwindow").innerHTML;
			var b = document.getElementById('applications');
			this.pid = "wallp" + (Math.floor(Math.random() * 10000) + 1).toString();
			m = m.replace("--ID--", this.pid);
	
			b.appendChild(stringtonode(m));
			playopen();
		
			triggerMouseEvent (document.getElementById(this.pid), "mousedown");
		
			document.getElementById("wallpaper_next").onclick = this.nextWallpaper;
			document.getElementById("wallpaper_last").onclick = this.lastWallpaper;
			document.getElementById("wallpaper_rand").onclick = this.randWallpaper;
			document.getElementById("wallpaper_clear").onclick = this.clearWallpaper;
		
			setWallpaper_id();
			
			desktop_haswindow = true;
		}
	}
	
	
	lastWallpaper()  {
		wallpaper_id -= 1;
		if (wallpaper_id < 0) {
			wallpaper_id = max_wallpapers;
		} else if (wallpaper_id > max_wallpapers) {
			wallpaper_id = 0;
		}
		setWallpaper();
		setWallpaper_id();
	}
	
	nextWallpaper() {
		wallpaper_id += 1;
		if (wallpaper_id < 0) {
			wallpaper_id = max_wallpapers;
		} else if (wallpaper_id > max_wallpapers) {
			wallpaper_id = 0;
		}
		setWallpaper();
		setWallpaper_id();
	}
	
	randWallpaper() {
		wallpaper_id = randRange(1, max_wallpapers);
		setWallpaper();
		setWallpaper_id();
	}
	
	clearWallpaper() {
		wallpaper_id = 0;
		setWallpaper();
		setWallpaper_id();
	}
	
}

function setWallpaper_id() {
	document.getElementById("wallpaper_number").innerHTML = ("o" + wallpaper_id.toString()).replace("o0", "Default").replace("o", "");
}

function setWallpaper(s = undefined) {
	var b = true;
	if (s == undefined) {
		b = false;
		s = "img/backgrounds/"+ wallpaper_id.toString() +".gif";
	}
	
	if (wallpaper_id == 0 && !b) {
		document.getElementById("wallpaper").setAttribute("style", "");
	} else {
		document.getElementById("wallpaper").setAttribute("style", "background: url("+s+") no-repeat center center fixed;background-size:cover");
	}
}	

function wallpaper_about() {
	makemsgbox('This is a selection of backgrounds as seen on <a href="https://plaza.one">plaza.one</a>.', "About");
}

function wallpaper_custom() {
	var c = prompt("inputurl");
	setWallpaper(c);
	console.log(c);
}
Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}

Array.prototype.random = function() {
	
	return this[Math.floor(Math.random() * this.length-1)+1];
}

Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

Array.prototype.contains = function(obj) {
    var i;
    for (i = 0; i < this.length; i++) {
        if (this[i] === obj) {
            return true;
        }
    }

    return false;
}

function randRange(min,max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function triggerMouseEvent (node, eventType) {
    var clickEvent = document.createEvent ('MouseEvents');
    clickEvent.initEvent (eventType, true, true);
    node.dispatchEvent (clickEvent);
}

$(document).ready( function() {
	
  $("#archive_prevplaymsg").hide();
	makemsgbox("Welcome to the vaporwave archive", "Welcome", 40, 40, "startarchive_main();");
	$('.marquee').marquee();
	});

function startarchive_main() {
	archive();
}


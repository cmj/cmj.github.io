function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('clock').innerHTML =
    h + ":" + m;
    var t = setTimeout(startTime, 5000);
}

function checkTime(i) {
    if (i < 10) {i = "0" + i}; 
    return i;
}

function hidestartmenu() {
	var container = $(".startdiv");

	container.removeClass('slidein');
    container.addClass("slideout");
}

$(document).mouseup(function(e) 
{
    var container = $(".startdiv");

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target) && container.has(e.target).length === 0 && container.hasClass('slidein')) 
    {
		container.removeClass('slidein');
        container.addClass("slideout");
    }
});
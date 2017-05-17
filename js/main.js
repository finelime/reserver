var name;
var dates = new Array();
var dates2 = new Array();
var reservations = new Array();

setName();
populate();

/*
 * Set the name variable based on the cookie
 */
function setName(){
	var cookie = readCookie("name");
	if(cookie){
		name = cookie;
	}else{
		$("#main").hide();
		$("#enter_name").show();
	}
}

/*
 * Set the cookie and name variable
 */
function submitName(){
	var entered = $("#name").val();
	if(entered.length > 0){
		document.activeElement.blur();
		createCookie("name", entered);
		name = entered;
		$("#enter_name").hide();
		$("#main").show();
	}else{
		$("#name").shake();
	}
}

/*
 * Populate the dropdown menu with times
 */
function populate(){
	$.ajax({
		type: "GET",
		url: "reservations.php",
		success: function(result){
			/* Get existing reservations */
			if(result != "none"){
				var obj = $.parseJSON($.parseJSON(result));
				for(var i = 0; i < obj.length; i++){
					reservations.push(obj[i]);
				}
			}
			
			/* Update the gym's availability */
			setAvailability();
			
			/* Populate dropdown accordingly */
			var now = moment();
			var hours = now.hours() > 12 ? now.hours() - 12 : now.hours();
			var mins = now.minutes();
			var add = Math.ceil(mins/15.0) * 15 - mins;
			
			for(var i = 0; i < (1440 * 2) / 15; i++){
				var disabled = isReserved(now);
				var reserved = getReservedName(now);
				var text = reserved ? " (" + reserved + ")" : "";
				
				$("#dropdown1").append("<option id='" + i + "'" + (disabled ? " disabled" : "") + ">" + now.format('dddd h:mm a') + (disabled ? text : "") + "</option>");
				
				dates.push({id: i, time: now.clone()});
				now = now.add(add, 'minute');
				add = 15;
			}
			
			populateUntil();
		}
	});
}

/*
 * Populate the "until" dropdown menu
 */
function populateUntil(){
	var id = parseInt($("#dropdown1 :selected").attr("id"));
	var now = dates[id].time.clone();
	
	var hours = now.hours() > 12 ? now.hours() - 12 : now.hours();
	var mins = now.minutes();
	var add = Math.ceil(mins/15.0) * 15 - mins;
	
	dates2 = new Array();
	$("#dropdown2").html("");
	for(var i = 0; i < (1440 * 2) / 15; i++){
		var disabled = isReserved(now.clone().add(10, 'minute'));
		var reserved = getReservedName(now.clone().add(10, 'minute'));
		var text = reserved ? " (" + reserved + ")" : "";
		
		now = now.add(add, 'minute');
		$("#dropdown2").append("<option id='" + i + "'" + (disabled ? " disabled" : "") + ">" + now.format('dddd h:mm a') + (disabled ? text : "") + "</option>");
		
		dates2.push({id: i, time: now.clone()});
		add = 15;
	}
}

/*
 * Submit the user's selected reservation
 */
function go(){
	var from = dates[parseInt($("#dropdown1 :selected").attr("id"))].time;
	var to = dates2[parseInt($("#dropdown2 :selected").attr("id"))].time;
	
	for(var i = 1; i < 10; i++){
		var time = from.clone().add(15, 'minute');
		if(time.valueOf() + 450000 >= from.valueOf() && time.valueOf() - 450000 <= to.valueOf()){
			if(isReserved(time)){
				$("#button").shake();
				return;
			}
		}else{
			break;
		}
	}
	
	$("#reserve").html("<p class='reserved'>You have reserved the gym from " + from.calendar().toLowerCase() + " to " + to.calendar().toLowerCase() + "</p>");
	
	$.ajax({
		type: "POST",
		url: "reserve.php",
		data: {"obj": JSON.stringify({from: from.toJSON(), to: to.toJSON(), name: name, millis: to.valueOf()})},
		success: function(result){
			console.log(result);
		}
	});
}

/*
 * Check if a moment() is reserved
 */
function isReserved(time){
	for(var i = 0; i < reservations.length; i++){
		var res = reservations[i];
		var from = moment(res.from);
		var to = moment(res.to);
		if(time.valueOf() + 450000 >= from.valueOf() && time.valueOf() - 450000 <= to.valueOf()){
			return true;
		}
	}
	return false;
}

/*
 * Get the name of the person who reserved a time
 */
function getReservedName(time){
	for(var i = 0; i < reservations.length; i++){
		var res = reservations[i];
		var from = moment(res.from);
		var to = moment(res.to);
		if(time.valueOf() + 450000 >= from.valueOf() && time.valueOf() - 450000 <= to.valueOf()){
			return res.name;
		}
	}
}

/*
 * Set the availability of the gym
 */
function setAvailability(){
	if(!isReserved(moment())){
		$("#icon").css("color", "green");
		$("#icon").addClass("glyphicon").addClass("glyphicon-ok-sign");
		$("#status").html("The gym is available");
	}else{
		$("#icon").css("color", "red");
		$("#icon").addClass("glyphicon").addClass("glyphicon-remove-sign");
		$("#status").html("The gym is not available");
	}
}

function createCookie(name, value) {
    var date = new Date();
	date.setTime(date.getTime() + (365*24*60*60*1000));
	var expires = "; expires=" + date.toUTCString();
	
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name){
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
}

function eraseCookie(name){
    createCookie(name,"",-1);
}

jQuery.fn.shake = function() {
    this.each(function(i) {
        $(this).css({
            "position" : "relative"
        });
        for (var x = 1; x <= 3; x++) {
            $(this).animate({
                left : -25
            }, 10).animate({
                left : 0
            }, 50).animate({
                left : 25
            }, 10).animate({
                left : 0
            }, 50);
        }
    });
    return this;
}
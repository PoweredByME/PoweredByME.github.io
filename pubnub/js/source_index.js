var video_out;
var phone
var numberOfSessions = 0;
var listOfSessions = [];
    
function indexJS_onWindowLoad(){
    console.log("Hello World");
    video_out = document.getElementById("vid-box");
    setupWebRTC();
    mutePage();
}

// Mute a singular HTML5 element
function muteMe(elem) {
    elem.muted = true;
    elem.pause();
}

// Try to mute all video and audio elements on the page
function mutePage() {
    var videos = document.querySelectorAll("video"),
        audios = document.querySelectorAll("audio");

    [].forEach.call(videos, function(video) { muteMe(video); });
    [].forEach.call(audios, function(audio) { muteMe(audio); });
}


function setupWebRTC(){
    // making the phone object to make the computer available for 
    // webRTC broadcast
    
    phone = window.phone = PHONE({ 
        number : "source_" + makeId(10),
        publish_key : 'pub-c-c904a156-f71f-4800-a8ac-500c05061cc5',
        subscribe_key : 'sub-c-eeeb0938-aa9b-11e7-9eb5-def16b84ebc1',
        ssl : true,
        media : {audio : false, video : true},
    });
    
    //PHONE.disconnect(function(){ var v = $(".connection-status-cell");v.empty();v.append("DISCONNECTED");});
    //PHONE.reconnect(function(){  var v = $(".connection-status-cell");v.empty();v.append("RECONNECTED"); })
    
    phone.ready(function(){
        
        phone.unable(function(details){
            var v = $(".connection-status-cell");v.empty();v.append("UNABLE : " + details); 
        });
    
        phone.debug(function(details){
            console.log(details);
        });
    
        
        $(".waiting-for-connection-div").addClass("hide");
        $(".success-connection").removeClass("hide");
        var v = $(".connection-status-cell");v.empty();v.append("CONNECTED"); 
        v = $(".connection-id-cell");v.empty();v.append(phone.number()); 
        $(".my-video-div").append(phone.video);
    });
    
    
    
    
    phone.receive(function(session){
        session.connected(function(session){
            numberOfSessions++;
            listOfSessions.push(session);
            showAudience();
            mutePage();
            // The MESSAGE Handler
            session.message(function(session, msg){
                var m = msg.text;
                console.log(msg);
                $(".msg").empty();
                $(".msg").append(m);
            });
        });
        session.ended(function(session){
            listOfSessions.splice(listOfSessions.indexOf(session), 1);
            showAudience();
        });
    });
    
}


function makeId(lenght){
    return Array(lenght+1).join((Math.random().toString(36)+'00000000000000000').slice(2, 18)).slice(0, lenght)
}

function webRTCDisconnect(){
    phone.hangup();
}

function showAudience(){
    var ele = $(".session-list-tbody");
    ele.empty();
    listOfSessions.forEach(function(session, index){
        var HTML = "<tr class=\"the-tbody-"+ session.number +"\"><td class= \"center\">"+index+"</td><td class= \"center\">"+session.number+"</td></tr>";
        ele.append(HTML);
    });
}


function disconnectSession(form){
    
}





/*

function login(form) {
    console.log("login");
    
	var phone = window.phone = PHONE({
	    number        : form.username.value || "Anonymous", // listen on username line else Anonymous
	    publish_key   : 'pub-c-c904a156-f71f-4800-a8ac-500c05061cc5',
	    subscribe_key : 'sub-c-eeeb0938-aa9b-11e7-9eb5-def16b84ebc1',
	});	
	phone.ready(function(){ form.username.style.background="#55ff5b"; });
	phone.receive(function(session){
	    session.connected(function(session) { video_out.appendChild(session.video); });
	    session.ended(function(session) { video_out.innerHTML=''; });
	});
    return false; 	// So the form does not submit.
}



function makeCall(form){
	if (!window.phone) alert("Login First!");
	else phone.dial(form.number.value);
	return false;
}
*/

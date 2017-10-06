var video_out;
var phone
var numberOfSessions = 0;
var listOfSessions = [];
    
function indexJS_onWindowLoad(){
    console.log("Hello World");
    video_out = document.getElementById("vid-box");
    setupWebRTC();
}

function setupWebRTC(){
    // making the phone object to make the computer available for 
    // webRTC broadcast
    
    phone = window.phone = PHONE({ 
        number : "source_" + makeId(10),
        publish_key : 'pub-c-c904a156-f71f-4800-a8ac-500c05061cc5',
        subscribe_key : 'sub-c-eeeb0938-aa9b-11e7-9eb5-def16b84ebc1',
        ssl : true,
        media : {audio : false, video : true} 
    });
    
    
    
    //PHONE.disconnect(function(){ var v = $(".connection-status-cell");v.empty();v.append("DISCONNECTED");});
    //PHONE.reconnect(function(){  var v = $(".connection-status-cell");v.empty();v.append("RECONNECTED"); })
    
    phone.unable(function(details){
        var v = $(".connection-status-cell");v.empty();v.append("UNABLE : " + details); 
    });
    
    phone.debug(function(details){
        console.log("Debug Information : " + details);
    });
    
    phone.ready(function(){
        $(".waiting-for-connection-div").addClass("hide");
        $(".success-connection").removeClass("hide");
        var v = $(".connection-status-cell");v.empty();v.append("CONNECTED"); 
        v = $(".connection-id-cell");v.empty();v.append(phone.number()); 
        $(".my-video-div").append(phone.video);
    });
    
    phone.receive(function(session){
        session.connected(function(session){
            numberOfSessions++;
            listOfSessions.push({
                key:   "_" + numberOfSessions,
                value: session
            });
            var HTML = "<tr class=\"the-tbody-"+ session.number +"\"><td>"+numberOfSessions+"</td><td>"+session.number+"</td></tr>";
            $(".session-list-tbody").append(HTML);
        });
        session.ended(function(session){
            $(".session-list-tbody").remove(".the-tbody-"+ session.number);
            
        });
    });
    
}


function makeId(lenght){
    return Array(lenght+1).join((Math.random().toString(36)+'00000000000000000').slice(2, 18)).slice(0, lenght)
}

function webRTCDisconnect(){
    phone.hangup();
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
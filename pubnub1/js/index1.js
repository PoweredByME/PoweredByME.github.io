var video_out = document.getElementById("vid-box");

function onLoad(){
    
}

function watch(form){
	var num = form.number.value;  // Stream to join
    var myID = "Viewer" + Math.floor(Math.random()*100000);
	var phone = window.phone = PHONE({
	    number        : myID,
	    publish_key   : 'pub-c-c904a156-f71f-4800-a8ac-500c05061cc5',
        subscribe_key : 'sub-c-eeeb0938-aa9b-11e7-9eb5-def16b84ebc1',
        oneway        : true,	// One way streaming enabled
        ssl           : true
	});
    
    $(".connection-id").empty();
    $(".connection-id").append("My ID : " + myID);
    
	var ctrl = window.ctrl = CONTROLLER(phone, true);
	ctrl.ready(function(){
        console.log("num -> " + num);
		ctrl.isStreaming(num, function(isOn){
            console.log(isOn);
            ctrl.joinStream(num);
		});
        
        
        
	});
	ctrl.receive(function(session){
        console.log(session);
	    session.connected(function(session){ 
            video_out.appendChild(session.video); 
            $(".vid-container").removeClass("hide");
            $(".watch-form").addClass("hide");
            $(".vid-cont-1").removeClass("hide");
            $(".vid-cont-2").removeClass("hide");
        });
        session.ended(function(session){
            $(".video-container").addClass("hide");
            $(".watch-form").removeClass("hide");
            $(".vid-cont-1").addClass("hide");
            $(".vid-cont-2").addClass("hide");
            video_out.innerHTML = "";
        })
	});
	ctrl.streamPresence(function(m){ 
        here_now.innerHTML=m.occupancy; 
    });
	return false;  // Prevent form from submitting
}

function onLoad(){
    
}

var video_out = document.getElementById("vid-box");

function stream(form){
    console.log("stram");
    var id = form.streamname.value;
    streamname = id;
    var phone = window.phone = PHONE({
        number : "streamer_" + id,
        publish_key   : 'pub-c-c904a156-f71f-4800-a8ac-500c05061cc5',
        subscribe_key : 'sub-c-eeeb0938-aa9b-11e7-9eb5-def16b84ebc1',
        broadcast     : true,
        oneway        : true,
        ssl           : true,
        media         : {video : true, audio: false}
    });
    var ctrl = window.ctrl = CONTROLLER(phone, true);
    ctrl.ready(function(){
        console.log("hello");
        ctrl.addLocalStream(video_out);
        ctrl.stream();
        console.log("streaming to " + streamname);
        ctrl.receive(function(session){
            session.connected(function(session){
                console.log(session.number + " has joined");
            });
            session.ended(function(session){
                console.log(session.number + " has left");
            });
        });
        ctrl.streamPresence(function(m){
            console.log(m.occupancy + " currently watching.");
        });
    });
    return false;
}

/*function watch(form){
    var num = form.number.value;
    var phone = window.phone = PHONE({
        number : "viewer_" + num + Math.floor(Math.random() * 100),
        publish_key   : 'pub-c-c904a156-f71f-4800-a8ac-500c05061cc5',
        subscribe_key : 'sub-c-eeeb0938-aa9b-11e7-9eb5-def16b84ebc1',
        oneway        : true,
        ssl	      : true
    });
    var ctrl = window.ctrl = CONTROLLER(phone, true);
    ctrl.ready(function(){
        ctrl.isStreaming(num, function(isOn){
            if(isOn) ctrl.joinStream(num);
            else alert("Not streming");
        });
        
        ctrl.receive(function(session){
            session.connected(function(session){
                video_out.appendChild(session.video);
                console.log(session.number + " has joined");
            });
            session.ended(function(session){
                console.log(session.number + " has left");
            });
        });
        
    });
    return false;
}*/


function watch(form){
	var num = form.number.value;  // Stream to join
	var phone = window.phone = PHONE({
	    number        : "Viewer" + Math.floor(Math.random()*100), // Random name
	    publish_key   : 'pub-c-c904a156-f71f-4800-a8ac-500c05061cc5',
        subscribe_key : 'sub-c-eeeb0938-aa9b-11e7-9eb5-def16b84ebc1',
        oneway        : true,	// One way streaming enabled
        ssl           : true
	});
	var ctrl = window.ctrl = CONTROLLER(phone, true);
	ctrl.ready(function(){
		ctrl.isStreaming(num, function(isOn){
            console.log(isOn);
            ctrl.joinStream(num);
		});
	});
	ctrl.receive(function(session){
	    session.connected(function(session){ 
            video_out.appendChild(session.video); 
        });
	});
	ctrl.streamPresence(function(m){ 
        here_now.innerHTML=m.occupancy; 
    });
	return false;  // Prevent form from submitting
}

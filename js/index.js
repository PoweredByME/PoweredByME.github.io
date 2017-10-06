var video_out;

function indexJS_onWindowLoad(){
    console.log("Hello World");
    video_out = document.getElementById("vid-box");
    //setupWebRTC();
}


function login(form) {
    console.log("login");
	var phone = window.phone = PHONE({
	    number        : form.username.value || "Anonymous", // listen on username line else Anonymous
	    publish_key   : 'pub-c-c904a156-f71f-4800-a8ac-500c05061cc5',
	    subscribe_key : 'sub-c-eeeb0938-aa9b-11e7-9eb5-def16b84ebc1',
        ssl : true
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


/*function setupWebRTC(){
    skylink = new Skylink();
    
    skylink.on('peerJoined', function(peerId, peerInfo, isSelf) {
        console.log("Peer joined = " + peerInfo);
        if(isSelf) return; // We already have a video element for our video and don't need to create a new one.
        var vid = document.createElement('video');
        vid.autoplay = true;
        vid.muted = true; // Added to avoid feedback when testing locally
        vid.id = peerId;
        document.body.appendChild(vid);
    });
    
    skylink.on('incomingStream', function(peerId, stream, isSelf) {
        if(isSelf) return;
        var vid = document.getElementById(peerId);
        attachMediaStream(vid, stream);
    });
    
    skylink.on('peerLeft', function(peerId, peerInfo, isSelf) {
        var vid = document.getElementById(peerId);
        document.body.removeChild(vid);
    });
    
    skylink.on('mediaAccessSuccess', function(stream) {
        var vid = document.getElementById('myvideo');
        attachMediaStream(vid, stream);
    });
    
    skylink.init({
        apiKey: '3e850fd6-c814-4610-b1d1-81f0b1dd1841',
        defaultRoom: 'room12'
        }, function() {
            skylink.joinRoom({
                audio: true,
                video: true
        });
    });
    
    SkylinkLogs.printAllLogs();
    
} // end setupWebRTC


*/
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

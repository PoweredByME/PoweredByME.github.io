var servername = "";  // To be set when the ajax call to a server via this script 
                     // is to be made.

var pubnub_publish_key = 'pub-c-c904a156-f71f-4800-a8ac-500c05061cc5'; // The two API keys
var pubnub_subscribe_key = 'sub-c-eeeb0938-aa9b-11e7-9eb5-def16b84ebc1'; 
var video_out = document.getElementById("vid-box");
var phone;
var messenger,messengerChannel, myID, num;
var MSG_connection_interval;
var videoLatancyMS = 0;
var ctrl_data;
var ctrlSendInterval;
// This function gets called whenever the page is 
// loaded in the browser.
function onLoad(){
    // code here...
}


// When the Watch button on the UI is press this function gets
// called. This function accepts the form DOM object. 
// Then the value to the input feild number is extracted
// and is connects to the broadcaster whose ID is provided.
function watch(form){
	num = form.number.value;  // Stream to join (this is the ID of the broadcaster)
    myID = "Viewer" + Math.floor(Math.random()*100000);  // makes a random user ID. 
                                                             // must be specified in the 
    phone = window.phone = PHONE({
	    number        : myID,
	    publish_key   : pubnub_publish_key,
        subscribe_key : pubnub_subscribe_key,
        oneway        : true,	// One way streaming enabled
        ssl           : true
	});
    
    
    $(".connection-id").empty();
    $(".connection-id").append("My ID : " + myID);
    
	var ctrl = window.ctrl = CONTROLLER(phone, true);
    
    $(".waiting-for-connection-div").removeClass("hide");
    $(".watch-form").addClass("hide");
    
    // When the the controller is ready to connect/trying to
    // connect to the broadcaster. 
	ctrl.ready(function(){
        console.log("num -> " + num);
		ctrl.isStreaming(num, function(isOn){
            console.log(isOn);
            ctrl.joinStream(num);
		});
	});
    
    // When the controller starts receiving the video feed.
    ctrl.receive(function(session){
        ses = session;
        console.log(session);
	    session.connected(function(session){ 
            video_out.appendChild(session.video); 
            $(".vid-container").removeClass("hide");
            $(".waiting-for-connection-div").addClass("hide");
            $(".vid-cont-1").removeClass("hide");
            $(".vid-cont-2").removeClass("hide");
            setupControlDataChannal(num);
            
            
            
        });
        
        // When broadcaster disconnects from the viewer
        session.ended(function(session){
            $(".video-container").addClass("hide");
            $(".watch-form").removeClass("hide");
            $(".vid-cont-1").addClass("hide");
            $(".vid-cont-2").addClass("hide");
            video_out.innerHTML = "";
            $(".control-input").addClass("hide");
            messenger.unsubscribe(messengerChannel);
            clearInterval(ctrlSendInterval);
        })
	});
    

	ctrl.streamPresence(function(m){ 
        here_now.innerHTML=m.occupancy; 
    });
	return false;  // Prevent form from submitting
}

// This function is used to set up the controller data channel
function setupControlDataChannal(id){
    messengerChannel = id + "msg";
    messenger = PUBNUB.init({ publish_key: pubnub_publish_key, subscribe_key: pubnub_subscribe_key , ssl : true});
    messenger.subscribe({channel : messengerChannel, message : onMsg_messenger})
    tryToCreatMsgConnection();
}

// When the message os recieved via the data channel
// This is used to autheticate that broadcaster has 
// setup the control messenger.
function onMsg_messenger(msg){
    //console.log("I got msg = " + msg.text);
    if(msg.id == num && msg.text == "acceptToConnect_MSG"){
        startControlFeed();
    }if(msg.id == myID && msg.text == "cmd_done"){
        var ut = msg.dispatchTime;
        updateExecutedCmdHistory(ut);
    }
}

// This function trys to make a control data feed/stream
// connection to broadcaster
function tryToCreatMsgConnection(){
    MSG_connection_interval = setInterval(function(){
        console.log("Trying to setup control connection");
        pnPublish(messenger, messengerChannel, {id:myID, text: "requestToConnect_MSG"});
    }, 500);
}


// This function is fired when the control data feed is setup.
function startControlFeed(){
    clearInterval(MSG_connection_interval);
    $(".control-input").removeClass("hide");
    ctrlSendInterval = setInterval(sendCtrlDataToServer, 1500);
    
    getCtrlDataFromLocalServer()
    getStats(ses.pc, function(result){
            videoLatancyMS = result;
            result.results.forEach(function(item){
                if(item.googCurrentDelayMs){
                    videoLatancyMS = item.googCurrentDelayMs;   
                    return;        
                }
            });
            $(".vid-lat").empty();
            $(".vid-lat").append("Video Latancy : " + videoLatancyMS + "ms");
            
        },500);
            
}


// This function send the message to the broadcaster
function sendMessage(val){
    var ut = getUnixTimeStamp();
    pnPublish(messenger, messengerChannel, {id:myID, text: val, dispatchTime: ut, videoLatancy:videoLatancyMS });
    return ut;
}


function getUnixTimeStamp(){
    return (new Date()).getTime();
}

var old_resp = "";
function sendCtrlDataToServer(){
    getCtrlDataFromLocalServer();
    resp = ctrl_data; 
    var r = "X = " + ctrl_data[0] + " | Y = " + ctrl_data[1] + " | Z = " + ctrl_data[2] + " | U = " + ctrl_data[3] + " | V = " + ctrl_data[4] + " | W = " + ctrl_data[5];
    if(old_resp == r){}else{
        var ut = sendMessage(resp);
        updateCmdHistory(ut, r);   
    }
    old_resp = r;
}


function createCtrlDataArr(resp){
    ctrl_data = resp.split(",");
    resp = "X = " + ctrl_data[0] + " | Y = " + ctrl_data[1] + " | Z = " + ctrl_data[2] + " | U = " + ctrl_data[3] + " | V = " + ctrl_data[4] + " | W = " + ctrl_data[5]; 
    $(".ctrl-input").empty();
    $(".ctrl-input").append(resp);
}

function getCtrlDataFromLocalServer(){
    $.ajax({
        url : "http://localhost:3070",
        success : function(resp){
            createCtrlDataArr(resp);
            
        },
        error : function (err){
            console.log(err);
        }
    });
}








// For messenger
// --------------------------------
//  This function published the 
//  message to the given channel
//  and connection.
//  INPUT : 
//  ... 1. connection -> the pubnub 
//  .................... connection
//  ... 2. channel
//  ... 3. message -> key/value pair.
// --------------------------------
function pnPublish(connection, theChannel, msg) {
    connection.publish({ channel: theChannel, message: msg });
}





var cmdHistory = [];
function updateCmdHistory(dispatchTime, cmd){
    var obj = {};
    cmdHistory.push({
            dispatchTime : dispatchTime,
            cmd : cmd,
            done : false
    });
    showCmdHistory()
}

function showCmdHistory(){
    var htmlString = "";
    cmdHistory.forEach(function(item, index){
        var s = applyCmdHistHTML_temp(index + 1, item.dispatchTime, item.cmd, item.done);
        htmlString = s + htmlString;
    });
    $(".cmd-hist-list").html(htmlString);
}

function updateExecutedCmdHistory(dispatchTime){
    cmdHistory.forEach(function(item, index){
        if(item.dispatchTime == dispatchTime){
            item.done = true;
            console.log(cmdHistory);
            return;
        }
    });
    showCmdHistory();
}

function applyCmdHistHTML_temp(SRNO, stamp, cmd, done){
    var s = "<div class=\"card\" style = \"margin:0px !important;\">";
    if(done == true){
        var s = "<div class=\"card green\" style = \"margin:0px !important;\">";
    }
    s = s + "<div class=\"row\">";
    s = s + "<div class=\"col l4 m4 s4 center\"><p>"+SRNO+"</p></div>"
    s = s + "<div class=\"col l4 m4 s4 center\"><p>"+stamp+"</p></div>"
    s = s + "<div class=\"col l4 m4 s4 center\"><p>"+cmd+"</p></div></div></div>"
    return s;
}
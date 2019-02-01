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
var ctrlTimer;  // The timer object which call the function for collecting the data from the localhost(Desktop API).
var dataPollingTime = 50;  // 2000 (actual max polling time)// The time in milli-seconds after which data is polled from the localhost.
var localhost_port = "3070";  // The defualt localhost port.
var cmdHistory = [];
var ackReceiveTimeOut_time = 10000; //ms
var presenceMessageDispatchTime = 0;
var presenceResponceReceived = false;
var connectionWasBroken = false;



// This function gets called whenever the page is 
// loaded in the browser.
function onLoad(){
    checkLocalHost();
}


// This function is used to return a ID for the user.
function getMyID(){
    return "Viewer" + Math.floor(Math.random()*100000);  // makes a random user ID. 
}

// This function checks the local host server (Desktop API). If it is online or not.
function checkLocalHost(){
    console.log("Checking for localhost:"+localhost_port);
    $.ajax({
        url : "http://localhost:3070",
        async : true,
        success : function(resp){console.log("Local Host -> Online")},
        error : function (err){
            alert("Could not connect to the Desktop API. To rectify : \n 1. Check if the browser you are using is Google Chrome."+
                  "\n 2. Check if the Desktop API is running. \n 3. Check if you have given the browser permission to connect to the Desktop API"
                 );
            console.log(err);
        }
    });
}

// When the Watch button on the UI is press this function gets
// called. This function accepts the form DOM object. 
// Then the value to the input feild number is extracted
// and is connects to the broadcaster whose ID is provided.
function watch(form){
	num = form.number.value;  // Stream to join (this is the ID of the broadcaster)
    myID = getMyID();
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
            ctrlTimer.stop();
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
    console.log( msg)
    if(msg.id == num && msg.text == "acceptToConnect_MSG"){
        startControlFeed();
    }if(msg.id == myID && msg.text == "cmd_done"){
        // The command has been recieved by the source. It has sent 
        // an ACK -> cmd_done.
        onCommandAck(msg);
    }else if(msg.id == myID && msg.text == "RESP_PRESENCE"){
        var originTimeOfPrecenseMsg = msg.originTimeOfPrecenseMsg;
        console.log("Hello = " + msg)
        if (presenceMessageDispatchTime == originTimeOfPrecenseMsg){
            var time_diff = getUnixTimeStamp() - presenceMessageDispatchTime;
            console.log(time_diff);
            if (time_diff < 5000){
                presenceResponceReceived = true;
            }
        }
    }
}


// When the command ack is recieved -> update the command history list (that specific command has been executed).
// Show the command latency.
function onCommandAck(msg){
    var ut = msg.dispatchTime;
    updateExecutedCmdHistory(ut);
    $(".command-lat").empty()
    $(".command-lat").append("Command Latancy : " + msg.commnand_lat + "ms");
}




// This function trys to make a control data feed/stream
// connection to broadcaster.
function tryToCreatMsgConnection(){
    MSG_connection_interval = setInterval(function(){
        console.log("Trying to setup control connection");
        pnPublish(messenger, messengerChannel, {id:myID, text: "requestToConnect_MSG"});
    }, 500);
}

var presenceSignalEmitterHasStart_flag = false;
// This function is fired when the control data feed is setup.
function startControlFeed(){
    clearInterval(MSG_connection_interval);  // stop trying to create MSG Connection as it has been created.
    $(".control-input").removeClass("hide");
    mqtt_Connect_with_Broker();
    ctrlTimer = new timer();   // Set the timer for data polling
    ctrlTimer.start(function(){
        get_CtrlData_FromLocalServer_And_SendToSource();
    }, dataPollingTime, true);
    
    getStats(ses.pc, function(result){    // get stats of the video feed latency.
            videoLatancyMS = result;
            result.results.forEach(function(item){
                if(item.googCurrentDelayMs){
                    videoLatancyMS = item.googCurrentDelayMs;   
                    return;        
                }
            });
            $(".vid-lat").empty();
            $(".vid-lat").append("Latancy : " + videoLatancyMS + "ms");
            
    },500);

    // Once the control feed is established on the Pubnub WebRTC Data Stream. 
    // An infinite loop kicks in with an interval of 10 seconds. It send a WebRTC message
    // to the source and checks if the response of the last message came back.
    if (presenceSignalEmitterHasStart_flag == false){
        setInterval(function (){
            console.log("ddddd");
            if (presenceResponceReceived == false){
                console.log("aaaaa");
                console.log("Connection ended.");
                connectionWasBroken = true;
                alert("Error! The connection has broken. Please check your internet connection.");
            }
            sendMessage("PRESENCE");

            if(connectionWasBroken && presenceResponceReceived){
                mqtt_Connect_with_Broker();
                connectionWasBroken = false;
                presenceResponceReceived = true;
            }

            presenceResponceReceived = false;


        }, 5000);
        presenceSignalEmitterHasStart_flag = true;
    }
            
}




// These functions fetch data from localhost and send it to the source.
var old_resp = "";
var X_DAT = 0, Y_DAT = 1, Z_DAT = 2, U_DAT = 3, V_DAT = 4, W_DAT = 5, LP_DAT = 6, RP_DAT = 7;
function createCtrlDataArr(resp){
    if(resp == old_resp){return;}else{old_resp = resp;}
    ctrl_data = resp.split(",");
    resp = "X = " + ctrl_data[X_DAT] 
        + " | Y = " + ctrl_data[Y_DAT]
        + " | Z = " + ctrl_data[Z_DAT]
        + " | U = " + ctrl_data[U_DAT]
        + " | V = " + ctrl_data[V_DAT]
        + " | W = " + ctrl_data[W_DAT]
        + " | <br> LP = " + ctrl_data[LP_DAT]
        + " | RP = " + ctrl_data[RP_DAT]; 
    $(".ctrl-input").empty();
    $(".ctrl-input").append(resp);
    resp = ctrl_data; 
    var r = ctrl_data[X_DAT]
            + "," + ctrl_data[Y_DAT]
            + "," + ctrl_data[Z_DAT]
            + "," + ctrl_data[U_DAT]
            + "," + ctrl_data[V_DAT]
            + "," + ctrl_data[W_DAT]
            + "," + ctrl_data[LP_DAT]
            + "," + ctrl_data[RP_DAT]; 
    var cmdDispatchTime = mqtt_sendMessage("ctrl",r);
    updateCmdHistory(cmdDispatchTime, r); 
}


// These functions fetch data from localhost and send it to the source.
function get_CtrlData_FromLocalServer_And_SendToSource(){
    $.ajax({
        url : "http://localhost:"+localhost_port+"/",
        async : false,
        success : function(resp){
            createCtrlDataArr(resp);
            if($(".local_port").hasClass("hide")){}else{
                $(".local_port").addClass("hide");
           }
        },
        error : function (err){
            console.log(err);
        }
    });
}


// This function maintains the list of all the commands which have been
// sent to the source.
function updateCmdHistory(dispatchTime, cmd){
    var obj = {};
    cmdHistory.push({
            dispatchTime : dispatchTime,
            cmd : cmd,
            done : false
    });
    if(cmdHistory.length > 2){
        cmdHistory.shift();
    }
    //showCmdHistory()
}


// This function shows all the commands which have been sent to the source.
function showCmdHistory(){
    var htmlString = "";
    cmdHistory.forEach(function(item, index){
        var s = applyCmdHistHTML_temp(index + 1, item.dispatchTime, item.cmd, item.done);
        htmlString = s + htmlString;
    });
    $(".cmd-hist-list").html(htmlString);
}


// This function updates the commands which have been executed. (recieved ack).
function updateExecutedCmdHistory(dispatchTime){
    cmdHistory.forEach(function(item, index){
        if(item.dispatchTime == dispatchTime){
            item.done = true;
            //console.log(cmdHistory);
            return;
        }
    });
   //showCmdHistory();
}


// returns the array of command history. 
// it is of the form.
// [
//      {dispatchTime : dispatchTime,
//            cmd : cmd,
//            done : false/true}, ....
//  ]
function getCmdHistory(){
    return cmdHistory;
}





////////////////////////////////////////////////////////////////////////
////////////////////////////////UTILS///////////////////////////////////
////////////////////////////////////////////////////////////////////////



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





// This function send the message to the broadcaster
function sendMessage(val){
    var ut = getUnixTimeStamp();
    if (val == "PRESENCE"){
        presenceMessageDispatchTime = ut;
    }
    pnPublish(messenger, messengerChannel, {id:myID, text: val, dispatchTime: ut, videoLatancy:videoLatancyMS });
    return ut;
}

function changePollingTime(form){
    localhost_port = form.lport.value;
    dataPollingTime = form.number.value * 2000 / 100;
    $(".poll_t").empty();
    $(".poll_t").append(dataPollingTime);
    ctrlTimer.set_interval(dataPollingTime);
    return false;
}


function timer()
{
    var timer = {
        running: false,
        iv: 5000,
        timeout: false,
        cb : function(){},
        start : function(cb,iv,sd){
            var elm = this;
            clearInterval(this.timeout);
            this.running = true;
            if(cb) this.cb = cb;
            if(iv) this.iv = iv;
            if(sd) elm.execute(elm);
            this.timeout = setTimeout(function(){elm.execute(elm)}, this.iv);
        },
        execute : function(e){
            if(!e.running) return false;
            e.cb();
            e.start();
        },
        stop : function(){
            this.running = false;
        },
        set_interval : function(iv){
            console.log(iv);
            clearInterval(this.timeout);
            this.start(false, iv);
        }
    };
    return timer;
}


function getUnixTimeStamp(){
    return (new Date()).getTime();
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




///////////////////////////////////////////////////////////////
// MQTT MESSAGING CODE
///////////////////////////////////////////////////////////////
var WebSocket_MQTT_Broker_URL = "ws://test.mosquitto.org:8081/mqtt";
var MQTT_Client_ID = "";
var MQTT_Subscribe_Topic = "";
var MQTT_Client = null;
var mqtt_connected = false;

function mqtt_Connect_with_Broker(){
    // Set variables
    MQTT_Client_ID = "Client-" + Math.floor(Math.random()*100000).toString();

    // Create a MQTT Client nstance 
    MQTT_Client = new Paho.MQTT.Client(WebSocket_MQTT_Broker_URL, MQTT_Client_ID);

    // set callback handlers
    MQTT_Client.onConnectionLost = onConnectionLost;
    MQTT_Client.onMessageArrived = onMessageArrived;

    options = {
        onSuccess : onConnect,
        useSSL : true,
    }
    console.log("Attempting to connect with MQTT Broker: " + "\"" + WebSocket_MQTT_Broker_URL + "\"");
    MQTT_Client.connect(options);
}

// called when the client connects
function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    //Set_New_Console_Msg("Connected with MQTT Broker: " + "\"" + document.getElementById("txt_MQTT_Broker_URL").value + "\"");
    console.log("Connected with MQTT Broker: " + "\"" + WebSocket_MQTT_Broker_URL + "\"");
    mqtt_Subscribe_to_Topic(myID);
    mqtt_connected = true;
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      //Set_New_Console_Msg("Connection Lost with MQTT Broker. Error: " + "\"" +responseObject.errorMessage + "\"");
      console.log("Connection Lost with MQTT Broker. Error: " + "\"" +responseObject.errorMessage + "\"");
    }
}

// called when a message arrives
function onMessageArrived(message) {
    console.log("MQTT Message Recieved. "  + " Message: " + "\"" +  message.payloadString + "\"" + " MQTT Topic: " + "\"" + message.destinationName + "\"" + " QoS Value: " + "\"" + message.qos + "\"");
    msgData = message.payloadString.split("#");
    dataType = msgData[0];
    if(dataType == "ctrl"){
        return;
    }else if(dataType == "cmd_done"){
        msg = {
            id : msgData[1],
            commnand_lat : msgData[2],
            dispatchTime : msgData[3],
        }
        onCommandAck(msg);
    }
    
} 


function mqtt_Subscribe_to_Topic(topic){
    MQTT_Subscribe_Topic = topic;
    MQTT_Client.subscribe(MQTT_Subscribe_Topic);
    console.log("Subscribed to MQTT Topic: " + "\"" + MQTT_Subscribe_Topic + "\"" );
}

// Send MQTT Message 
function mqtt_Publish_Message(mqtt, message0){
    message = new Paho.MQTT.Message(message0);
    message.destinationName = MQTT_Subscribe_Topic;
    MQTT_Client.send(message);
    console.log("Published " + "\"" + message0 + "\"");    
}


/*

    Format of the high level MCI control feed is as follows;
    dataType # string (control data) # string (ID) # string (time stamp) # string (video latancy)
    I dont know    
    Control data formate is:
    X,Y,Z,U,V,W,LP,RP

    Note: 
    It can be extended.
*/
function mqtt_sendMessage(dataType,msg){
    var ut = getUnixTimeStamp();
    msg = dataType + "#" + msg + "#" + myID + "#" + ut.toString() + "#" + videoLatancyMS.toString();
    mqtt_Publish_Message(MQTT_Client, msg);
}
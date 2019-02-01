var servername = "";  // To be set when the ajax call to a server via this script 
                     // is to be made.

var pubnub_publish_key = 'pub-c-c904a156-f71f-4800-a8ac-500c05061cc5';  // The two API keys
var pubnub_subscribe_key = 'sub-c-eeeb0938-aa9b-11e7-9eb5-def16b84ebc1';
var video_out = document.getElementById("vid-box");//local video box
var streamname;
var sessionsList = [];
var ctrl;
var phone,messenger, messengerChannel,id;

// This function gets called whenever the page is 
// loaded in the browser.
function onLoad(){
    stream();
}

// this function sets up the stream for broadcasting
function stream(){
    console.log("setting up the stream");
    id = "source_" + makeId(10);
    streamname = id;
    
    // Setting up the phone object for oneway broadcast
    phone = window.phone = PHONE({
        number        : id,
        publish_key   : pubnub_publish_key,
        subscribe_key : pubnub_subscribe_key,
        broadcast     : true,
        oneway        : true,
        ssl           : true,
        media         : {video : true, audio: false}
    });
    
    // Setting up the stream controller object
    ctrl = window.ctrl = CONTROLLER(phone, true);
    
    // When the controller gets ready for streaming via webRTC
    ctrl.ready(function(){
        ctrl.addLocalStream(video_out);
        ctrl.stream();
        $(".waiting-for-connection-div").addClass("hide");
        $(".vid-container").removeClass("hide");
        $(".connection-status-cell").empty();
        $(".connection-status-cell").append("Connected");
        $(".connection-id-cell").empty();
        $(".connection-id-cell").append(streamname);
        setupControlDataChannal(id);
        console.log(phone);
        
        phone.debug(function(details){
            console.log(details);
        });
    });
    
    // when the ctrl will receive request for connection 
    // or disconnect.
    ctrl.receive(function(session){
        session.ended(function(session) { 
            console.log(session.number + " -> end");
            onSessionDisconnect(session);
            showAllSession();
            
        });
	    // when the session is connected.
        if(session.status != "routing"){
            onAddSession(session);
        }
    });
    
    ctrl.streamPresence(function(m){
        console.log(m.occupancy + " currently watching.");
    });
        
    
}

function endAllConnections(){
    ctrl.hangup();
}


// when a new session is added to the source this function is called
function onAddSession(session){
    sessionsList.push({theSession : session, startTime: Date.now()/ 1000});
    showAllSession();
}

// this function prints all the sessions on the table with class
// name (connections-logs-table);
function showAllSession(){
    var t = $(".connections-logs-table");
    t.empty();
    console.log(sessionsList);
    sessionsList.forEach(function(item, index){
        var str = "<tr><td class=\"center\">"+item.theSession.number+"</td><td class=\"center\">"+timeConverter(item.startTime)+"</td><td class=\"center\"><button class=\"red btn\" onclick=\"onclick_endSession("+index+")\">End</button></td><td class=\""+item.theSession.number+"-class center\"></td><td class=\""+item.theSession.number+"-class-vid-lat center\"></td><td class=\""+item.theSession.number+"-class-ctrl-lat center\"></td></tr>"    
        t.append(str);
    })
}


// when a session gets disconnected this function seaches for it and
// and removes it from the sessions list.
function onSessionDisconnect(session){
    var i = null;
    sessionsList.forEach(function(item, index){
        if(item.theSession.number == session.number){
            i = index;
        }
    });
    if(i != null){
        sessionsList.splice(i,1);
    }
}


// this function when the button is clicked it ends the
// connection.
function onclick_endSession(index){
    console.log("ending session on " + index);
    endSession(sessionsList[index].theSession);
}

// this function ends the session with the selected client
function endSession(session){
    session.hangup();
}

// This function is used to set up the controller data channel
function setupControlDataChannal(id){
    messengerChannel = id + "msg";
    console.log(messengerChannel);
    messenger = PUBNUB.init({ publish_key: pubnub_publish_key, subscribe_key: pubnub_subscribe_key, ssl: true });
    messenger.subscribe({channel : messengerChannel, message : onMsg_messenger})
}


var X_DAT = 0, Y_DAT = 1, Z_DAT = 2, U_DAT = 3, V_DAT = 4, W_DAT = 5, LP_DAT = 6, RP_DAT = 7;
var command_latancy;
// When a message is received via the control data stream

function onMsg_messenger(msg){
    if(msg.text == "requestToConnect_MSG"){
        var sessionFound = false;
        sessionsList.forEach(function(item, index){
           if(item.theSession.number == msg.id) {
               sessionFound = true;
               return;
           }
        });
        if(sessionFound){
            mqtt_Connect_with_Broker()
            MQTT_Subscribe_Topic = msg.id;
            pnPublish(messenger, messengerChannel, {id:id, text:"acceptToConnect_MSG"});
        }
    }else if(msg.text=="PRESENCE"){
        pnPublish(messenger, messengerChannel, {senderID:id, id:msg.id, text:"RESP_PRESENCE", originTimeOfPrecenseMsg:msg.dispatchTime});
    }else if(msg.text=='RESP_PRESENCE'){
        
    }else{
        //console.log(msg);
        if(msg.text == "cmd_done") return;
        
        $("."+msg.id+"-class-vid-lat").empty();
        $("."+msg.id+"-class-ctrl-lat").empty();
        var regex = /[a-z]/;
        var resp = msg.text;
        if(!regex.test(resp)){
            ctrl_data = resp.split(",");
            var t = "X = " + ctrl_data[X_DAT] + " | Y = " + ctrl_data[Y_DAT] + " | Z = " + ctrl_data[Z_DAT] + " | U = " + ctrl_data[U_DAT] + " | V = " + ctrl_data[V_DAT] + " | W = " + ctrl_data[W_DAT] + " | <br> Left Pressure = " + ctrl_data[LP_DAT] + " | Right Pressure = " + ctrl_data[RP_DAT]; 
            $("."+msg.id+"-class").empty();
            $("."+msg.id+"-class").append(t);
            sendCtrlDataToLocalServer(msg, ctrl_data);
        }
        $("."+msg.id+"-class-vid-lat").append("Latancy : " + msg.videoLatancy + "ms");
        command_latancy = (- msg.dispatchTime + getUnixTimeStamp());
        //$("."+msg.id+"-class-ctrl-lat").append("Command Lat : " + command_latancy + "ms");
    }
    
    
    
}



function messangerIsConnected(){
    console.log("Messager Is CONNECTD");
}






// For messenger
// --------------------------------
//  This function publishes the 
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

function sendCtrlDataToLocalServer(msg,resp){
    
    resp = resp[0]+","+resp[1]+","+resp[2]+","+resp[3]+","+resp[4]+","+resp[5]+","+resp[6]+","+resp[7];
    $.ajax({
        url : "http://localhost:3333/",
        data : resp,
        type : "POST",
        success : function(r){
            console.log(r)
            mqtt_Publish_Message(
                "cmd_done#" + msg.id + "#" + command_latancy.toString() + "#" + msg.dispatchTime
            );
            //pnPublish(messenger, messengerChannel, {id:msg.id, text:"cmd_done", commnand_lat : command_latancy,dispatchTime: msg.dispatchTime});
        },error: function(jqXHR, textStatus, errorThrown){
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}


// helper functions.
function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}


function getUnixTimeStamp(){
    return (new Date()).getTime();
}


function makeId(lenght){
    return Array(lenght+1).join((Math.random().toString(36)+'00000000000000000').slice(2, 18)).slice(0, lenght)
};



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
    mqtt_connected = true
    mqtt_Subscribe_to_Topic(MQTT_Subscribe_Topic);
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
        // When control data is recieved.
        data = msgData[1];
        device_id = msgData[2];
        timeStamp = msgData[3];
        video_latancy_ms = msgData[4];

        msg = {
            id : device_id,
            text : data,
            dispatchTime : parseFloat(timeStamp),
            videoLatancy : video_latancy_ms   
        };

        $("."+msg.id+"-class-vid-lat").empty();
        $("."+msg.id+"-class-ctrl-lat").empty();
        var regex = /[a-z]/;
        var resp = msg.text;
        $("."+msg.id+"-class-vid-lat").append("Latancy : " + msg.videoLatancy + "ms");
        command_latancy = (- msg.dispatchTime + getUnixTimeStamp());
        if(!regex.test(resp)){
            ctrl_data = resp.split(",");
            var t = "X = " + ctrl_data[X_DAT] + " | Y = " + ctrl_data[Y_DAT] + " | Z = " + ctrl_data[Z_DAT] + " | U = " + ctrl_data[U_DAT] + " | V = " + ctrl_data[V_DAT] + " | W = " + ctrl_data[W_DAT] + " | <br> Left Pressure = " + ctrl_data[LP_DAT] + " | Right Pressure = " + ctrl_data[RP_DAT]; 
            $("."+msg.id+"-class").empty();
            $("."+msg.id+"-class").append(t);
            sendCtrlDataToLocalServer(msg, ctrl_data);
        }
        
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
    
    Control data formate is:
    X,Y,Z,U,V,W,LP,RP

    Note: 
    It can be extended.
*/
function mqtt_sendMessage(datatype,msg){
    var ut = getUnixTimeStamp();
    msg = dataType + "#" + msg + "#" + myID + "#" + ut.toString() + "#" + videoLatancyMS.toString();
    mqtt_Publish_Message(MQTT_Client, msg);
}
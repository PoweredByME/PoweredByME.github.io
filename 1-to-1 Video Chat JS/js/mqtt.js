var WebSocket_MQTT_Broker_URL = "ws://test.mosquitto.org:8081/mqtt";
var MQTT_Client_ID = "";
var MQTT_Subscribe_Topic = "";
var MQTT_Client = null;
var mqtt_connected = false;

function initMQTT(){
    mqtt_Connect_with_Broker();
}

function mqtt_Connect_with_Broker(){
    // Set variables
    MQTT_Client_ID = "Client-" + Math.floor(Math.random()*100000).toString();
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
    onMessage(message.payloadString);
} 


function mqtt_Subscribe_to_Topic(topic){
    MQTT_Subscribe_Topic = topic;
    MQTT_Client.subscribe(MQTT_Subscribe_Topic);
    console.log("Subscribed to MQTT Topic: " + "\"" + MQTT_Subscribe_Topic + "\"" );
}

// Send MQTT Message 
function mqtt_Publish_Message(destination, msg){
    message = new Paho.MQTT.Message(msg);
    message.destinationName = destination;
    MQTT_Client.send(message);
    console.log("Published " + "\"" + msg + "\"");    
}


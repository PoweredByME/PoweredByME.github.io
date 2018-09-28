function onWindowLoad(){
    console.log("hi");
    MQTTConnect();
}

var mqtt;
var host = "broker.hivemq.com:8000/mqtt";
var reconnectTimeout = 2000;
var port = 9001;
var topic = "clientJS";
var clientID = "Client-";

function mqtt_onConnect(){
    console.log("Connected");
    mqtt_sendMessage(mqtt, "Hello World");
}

function MQTTConnect(){
    console.log("Connecting to " + host + ":" + port);
    mqtt = new Paho.MQTT.Client(host, port, clientID);
    var options = {
        timeout : 3,
        onSuccess : mqtt_onConnect
    }
    mqtt.connect(options);
}

function mqtt_sendMessage(MQTT, message){
    mqtt_msg = new Paho.MQTT.Message(message);
    mqtt_msg.destinationName = topic;
    MQTT.send(mqtt_msg);
}
//  Types of messages 
//  1) '0' : For sharing messageing credential.
//  2) '1' : Ack from remote client that message credentials have been arrived
//  3) '2' : WebRTC Communication.

var myID = null;
var remoteID = null;
var remoteCredsAck = false;

function makeId(lenght){
    return Array(lenght+1).join((Math.random().toString(9)+'00000000000000000').slice(2, 18)).slice(0, lenght)
}

function initMessenger(){
    initMQTT();
}

function getMyID(){
    // This function is used to get the current clients ID.
    // Customize it according to you platform.
    myID = makeId(4);
    $(".my-id-span").html(myID);
}

function getRemoteID(){
    // This function is used to
    // get the remote id of the remote
    // client. 
    // Customize it according to your code/platform.
    remoteID = $("#remoteID-field").val();
}

function onMessage(msg){
    // When the message arrive
    // Customize it to your code/platform 
    // if needed.
    // ----------------------------------
    // This code is using MQTT and MQTT broker
    // for messaging
    msg = JSON.parse(msg);
    
    if(msg.type == 0){
        remoteID = msg.remoteID;
        remoteCredsAck = true;
        $("#remoteID-field").val(remoteID);
        sendMessage({'type' : 1});
    }else if (msg.type == 1){
        remoteCredsAck = true;
    }else if (msg.type == 2){
        webrtcMessageHandler(msg.data);
    }

}

function sendMessage(msg){
    // Sending the message to the remote client
    // Customize it to your code/platform 
    // if needed.
    // ----------------------------------
    // This code is using MQTT and MQTT broker
    // for messaging
    msg = JSON.stringify(msg);
    mqtt_Publish_Message(remoteID, msg);
}


var shareMessagingCredentialCount = 0;

function shareMessagingCredential(){
    console.log('Attempting to send messeging credentials to the remote client... Attempt ' + shareMessagingCredentialCount);
    sendMessage({
        'type' : 0,
        'remoteID' : myID,
    });
}

var setupVideoChat = function (){
    if(remoteCredsAck){
        offerRemoteStream();
        return true;
    }else{
        if(shareMessagingCredentialCount > 4){
            alert('Cannot connect to the remote client because it does not exist or something has happened to the connection');
            shareMessagingCredentialCount = 0;
            return false;
        }
        shareMessagingCredentialCount++;
        shareMessagingCredential();
        setTimeout(setupVideoChat, 1000);
    }
}
var localVideo = document.getElementById('localVideo');
var localStream = null;
var remoteVideo = document.getElementById('remoteVideo');
var remoteStream = null;
var isCaller = null;
var connection = null;

function setUpLocalStream(){
    navigator.mediaDevices.getUserMedia(settings.streamConstraints)
    .then(function(stream){
        localStream = stream;
        localVideo.srcObject = stream;
    })
    .catch(function(err){
        console.log('Error while setting up local stream');
        console.log(err);
    });
}

function offerRemoteStream(){
    connection = new RTCPeerConnection(settings.iceServers);

    connection.onicecandidate = function(event){
        if(event.candidate){
            webrtcMessenger({
                'type' : 'con_candidate',
                'data' : {
                    type:'candidate',
                    label:event.candidate.sdpMLineIndex,
                    id:event.candidate.sdpMid,
                    candidate:event.candidate.candidate,
                },
            })
        }
    }

    connection.onaddstream = function(event){
        // offer on add stream
        console.log('on add stream');
        $(".vid-container").addClass('webrtc-connection-done');
        remoteStream = event.stream;
        remoteVideo.srcObject = remoteStream;
    }

    connection.addStream(localStream);
    connection.createOffer(function (sessionDescription){
        connection.setLocalDescription(sessionDescription);
        webrtcMessenger({
            'type' : 'con_offer',
            'data' : {
                type:'offer',
                sdp:sessionDescription,
            },
        });
    }, function(e){console.log(e);});
}

function answerRemoteStream(data){
    connection = new RTCPeerConnection(settings.iceServers);

    connection.onicecandidate = function(event){
        if(event.candidate){
            webrtcMessenger({
                'type' : 'con_candidate',
                'data' : {
                    type:'candidate',
                    label:event.candidate.sdpMLineIndex,
                    id:event.candidate.sdpMid,
                    candidate:event.candidate.candidate,
                },
            })
        }
    }

    connection.onaddstream = function(event){
        // answer on add stream
        console.log('on add stream');
        $(".vid-container").addClass('webrtc-connection-done');
        remoteStream = event.stream;
        remoteVideo.srcObject = remoteStream;
    }

    connection.addStream(localStream);
    connection.setRemoteDescription(new RTCSessionDescription(data.sdp));

    connection.createAnswer(function (sessionDescription){
        connection.setLocalDescription(sessionDescription);
        webrtcMessenger({
            'type' : 'con_answer',
            'data' : {
                type:'answer',
                sdp:sessionDescription,
            },
        });
    }, function(e){console.log(e);});
}




function webrtcMessenger(msg){
    // This function is based on the messenging.js 
    // It sends WebRTC messages on the MQTT messenger.
    // The type of WebRTC messages is '2';
    sendMessage(
        {
            "type" : 2,
            "data" : msg,
        }
    );
}

function webrtcMessageHandler(msg){
    // This function deals with all the webrtc
    // messages.
    var data = msg.data;
    if(msg.type == "con_candidate"){
        var candidate = new RTCIceCandidate({
            sdpMLineIndex:data.label,
            candidate:data.candidate
        });
        connection.addIceCandidate(candidate);
    }else if(msg.type == "con_offer"){
        answerRemoteStream(data);
    }else if(msg.type == "con_answer"){
        connection.setRemoteDescription(new RTCSessionDescription(data.sdp));
    }
}


function initVideoChat(){
    setUpLocalStream();
}
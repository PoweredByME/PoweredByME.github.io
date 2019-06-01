window.onload = function(){
    getMyID();
    initMessenger(); // from messaging.js
    initVideoChat(); // from webrtc.js
}

function connectVideoChat(){
    console.log('dasd');
    getRemoteID(); // from messaging.js
    setupVideoChat()
    
}
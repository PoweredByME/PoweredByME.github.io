var peer, peerConn;

function indexJS_onWindowLoad(){
    console.log("Hello World");
    setupPeerJS();
}

function setupPeerJS(){
    console.log("Setting up PeerJS");
    peer = new Peer({key : '2wa2nwzh865pzaor',  debug : 3, ssl: true});
    
    peer.on('open', function(id){
        $(".p-span-id-class").empty();
        $(".p-span-id-class").append(id);
    }); // end peer.on('open', function(id){});
    
    peer.on('connection', function(conn){
       conn.on('data', function(data){
           console.log("recved data = " + data);
           $(".recv-span-id-class").empty();
           $(".recv-span-id-class").append(data);
       });
    });
    
} // end setupPeerJS

function connectToRemotePeer(peerId){
    console.log("peerId = " + peerId)
    peerConn =  peer.connect(peerId);
    peerConn.on('open', function(){
        console.log("connection Opened");
        peerConn.send('hi!');
    });
}


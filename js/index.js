var peer;

function indexJS_onWindowLoad(){
    console.log("Hello World");
    setupPeerJS();
}

function setupPeerJS(){
    console.log("Setting up PeerJS");
    peer = new Peer({key : '2wa2nwzh865pzaor'});
    
    peer.on('open', function(id){
        $(".id-class").empty();
        $(".id-class").append(id);
    }); // end peer.on('open', function(id){});
} // end setupPeerJS
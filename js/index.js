var peer;

function indexJS_onWindowLoad(){
    console.log("Hello World");
    setupPeerJS();
}

function setupPeerJS(){
    console.log("Setting up PeerJS");
    peer = new Peer({key : '2wa2nwzh865pzaor',  debug : 3});
    
    peer.on('open', function(id){
        $(".p-span-id-class").empty();
        $(".p-span-id-class").append(id);
    }); // end peer.on('open', function(id){});
} // end setupPeerJS
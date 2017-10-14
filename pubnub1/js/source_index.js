var video_out = document.getElementById("vid-box");//local video box
var streamname;
var pubnub_publish_key = 'pub-c-c904a156-f71f-4800-a8ac-500c05061cc5';
var pubnub_subscribe_key = 'sub-c-eeeb0938-aa9b-11e7-9eb5-def16b84ebc1';
var sessionsList = [];
var ctrl;
var phone;
function onLoad(){
    stream();
}

// this function sets up the stream for broadcasting
function stream(){
    console.log("setting up the stream");
    var id = "source_" + makeId(10);
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
        var str = "<tr><td class=\"center\"> ID : "+item.theSession.number+"</td><td class=\"center\">"+timeConverter(item.startTime)+"</td><td class=\"center\"><button class=\"red btn\" onclick=\"onclick_endSession("+index+")\">End</button></td></tr>"    
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

function makeId(lenght){
    return Array(lenght+1).join((Math.random().toString(36)+'00000000000000000').slice(2, 18)).slice(0, lenght)
};
var settings = {

    iceServers : {
        'iceServers':[
            {'urls':'stun:stun.services.mozilla.com'},
            {'urls':'stun:stun.1.google.com:19302'},
            {
                'urls': 'turn:numb.viagenie.ca',
                'username' : 'saxkwi12@outlook.com',
                'credential' : '123456',
            }
        ]
    },

    streamConstraints : { audio:true, video:true},



}
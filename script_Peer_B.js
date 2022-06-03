const offerBox = document.querySelector("#remote_address");
        const answerBox = document.querySelector("#local_address");
        const inBox = document.querySelector("#incoming");
        const outBox = document.querySelector("#outgoing");
        const confirmButton = document.querySelector(".offer_entered");

       
        const configuration = { 'iceServers': [
            {
                'urls': 'stun:stun.l.google.com:19302'
            },
        //      {
        //       'urls': "turn:openrelay.metered.ca:80",
        //       'username': "openrelayproject",
        //       'credential': "openrelayproject",
        //      },
        //     {
        //       'urls': "turn:openrelay.metered.ca:443",
        //       'username': "openrelayproject",
        //       'credential': "openrelayproject",
        //     },
        //     {
        //       'urls': "turn:openrelay.metered.ca:443?transport=tcp",
        //       'username': "openrelayproject",
        //       'credential': "openrelayproject",
        //     },
        //     {
        //     'url': 'turn:numb.viagenie.ca',
        //     'credential': 'muazkh',
        //     'username': 'webrtc@live.com'
        // },
        // {
        //     'url': 'turn:192.158.29.39:3478?transport=udp',
        //     'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        //     'username': '28224511:1379330808'
        // },
        // {
        //     'url': 'turn:192.158.29.39:3478?transport=tcp',
        //     'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        //     'username': '28224511:1379330808'
        // },
        // {
        //     'url': 'turn:turn.bistri.com:80',
        //     'credential': 'homeo',
        //     'username': 'homeo'
        //  },
        //  {
        //     'url': 'turn:turn.anyfirewall.com:443?transport=tcp',
        //     'credential': 'webrtc',
        //     'username': 'webrtc'
        // }
          ] };
        const localConnection = new RTCPeerConnection(configuration);

        // adding event listeners for icecandidate
        const iceCandidates = [];
        localConnection.addEventListener('icecandidate', (event) => {
            if (event.candidate)
                iceCandidates.push(event.candidate);
            else setTimeout(() => {
                console.log('icecandidate search complete');
                answerBox.value = JSON.stringify({
                    description: localConnection.localDescription,
                    icecandidates: iceCandidates
                });
                answerBox.setAttribute('readonly', 'true');
            }, 100);
        });

        // creating the local videochannel
        const constraint = {
            audio: true,
            video: true,
        };
        navigator.mediaDevices.getUserMedia(constraint)
            .then((stream) => {
                outBox.srcObject = stream;
                stream.getTracks().forEach(track => {
                    localConnection.addTrack(track, stream);
                })
            }).catch((err) => {
                console.log(err);
                alert("Some error occured!!!");
            });

        // capturing the remote videochannel
        localConnection.addEventListener('track', async (event) => {
            console.log('Receiver: media channel opened');
            const [remoteStream] = event.streams;
            inBox.srcObject = remoteStream;
        });

        confirmButton.onclick = (event) => {
            const { description, icecandidates } = JSON.parse(offerBox.value);
            offerBox.setAttribute('readonly', 'true');

            // accepting the offer
            localConnection.setRemoteDescription(description).then(() => { console.log("Receiver: offer accepted") });

            // adding proposed icecandidates
            icecandidates.forEach(candidate => {
                localConnection.addIceCandidate(new RTCIceCandidate(candidate));
            });
            localConnection.createAnswer().then((answer) => localConnection.setLocalDescription(answer)).then(() => { console.log("Receiver: answer initiated") });

        };



        (function () {
  var old = console.log;
  var logger = document.querySelector(".chat");
  console.log = function (message) {
    if (typeof message == "object") {
      logger.innerHTML +=
        (JSON && JSON.stringify ? JSON.stringify(message) : message) + "<br />";
    } else {
      logger.innerHTML += message + "<br />";
    }
  };
})();
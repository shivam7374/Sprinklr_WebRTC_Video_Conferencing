const offerBox = document.querySelector("#local_address");
        const answerBox = document.querySelector("#remote_address");
        const inBox = document.querySelector("#incoming");
        const outBox = document.querySelector("#outgoing");
        const confirmButton = document.querySelector(".accept_answer");
        


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
                offerBox.value = JSON.stringify({
                    description: localConnection.localDescription,
                    icecandidates: iceCandidates
                });
                offerBox.setAttribute('readonly', 'true');
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
            console.log('Sender: media channel opened');
            const [remoteStream] = event.streams;
            inBox.srcObject = remoteStream;
        });

        setTimeout(()=>{
            // creating an offer for the new datachannel
            localConnection.createOffer().then(offer => { localConnection.setLocalDescription(offer) }).then(() => { console.log("Sender: offer initiated") });
        },1000)
        confirmButton.onclick = (event) => {
            const { description, icecandidates } = JSON.parse(answerBox.value);
            answerBox.setAttribute('readonly', 'true');

            // accepting the offer
            localConnection.setRemoteDescription(description).then(() => { console.log("Sender: answer accepted") });

            // adding proposed icecandidates
            icecandidates.forEach(candidate => {
                localConnection.addIceCandidate(new RTCIceCandidate(candidate));
            });

            confirmButton.disabled = true;
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
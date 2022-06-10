const offerBox = document.querySelector("#remote_address");
const answerBox = document.querySelector("#local_address");
const inBox = document.querySelector("#incoming");
const outBox = document.querySelector("#outgoing");
const confirmButton = document.querySelector(".offer_entered");

const configuration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      url: "turn:numb.viagenie.ca",
      credential: "muazkh",
      username: "webrtc@live.com",
    },
    {
      url: "turn:192.158.29.39:3478?transport=udp",
      credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      username: "28224511:1379330808",
    },
    {
      url: "turn:192.158.29.39:3478?transport=tcp",
      credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      username: "28224511:1379330808",
    },
    {
      url: "turn:turn.bistri.com:80",
      credential: "homeo",
      username: "homeo",
    },
    {
      url: "turn:turn.anyfirewall.com:443?transport=tcp",
      credential: "webrtc",
      username: "webrtc",
    },
  ],
};
const remoteConnection = new RTCPeerConnection(configuration);

// adding event listeners for icecandidate
const iceCandidates = [];
remoteConnection.addEventListener("icecandidate", (event) => {
  if (event.candidate) iceCandidates.push(event.candidate);
  else
    setTimeout(() => {
      console.log("icecandidate search complete");
      answerBox.value = JSON.stringify({
        description: remoteConnection.localDescription,
        icecandidates: iceCandidates,
      });
    }, 100);
});

// creating the local videochannel
const constraint = {
  audio: false,
  video: true,
};
navigator.mediaDevices
  .getUserMedia(constraint)
  .then((stream) => {
    outBox.srcObject = stream;
    stream.getTracks().forEach((track) => {
      remoteConnection.addTrack(track, stream);
    });
  })
  .catch((err) => {
    console.log(err);
    alert("Some error occured!!!");
  });

// capturing the remote videochannel
remoteConnection.addEventListener("track", async (event) => {
  console.log("Receiver: media channel opened");
  const [remoteStream] = event.streams;
  inBox.srcObject = remoteStream;
});

confirmButton.onclick = (event) => {
  const { description, icecandidates } = JSON.parse(offerBox.value);
  offerBox.setAttribute("readonly", "true");

  // accepting the offer
  remoteConnection.setRemoteDescription(description).then(() => {
    console.log("Receiver: offer accepted");
  });

  // adding proposed icecandidates
  icecandidates.forEach((candidate) => {
    remoteConnection.addIceCandidate(new RTCIceCandidate(candidate));
  });
  var receiveChannel;
  remoteConnection.ondatachannel = (e) => {
    console.log("b pe channel dhundo");
    receiveChannel = e.channel;
    receiveChannel.onmessage = (e) =>
      console.log("Message Recieved From Device A : " + e.data);
    receiveChannel.onopen = (e) => {
      console.log("Communication Established Now you can Chat !!!");
      document.querySelector(".send_response").disabled = false;
    };
    receiveChannel.onclose = (e) => {
      console.log("closed!!!!!!");
    };
    remoteConnection.channel = receiveChannel;
  };
  remoteConnection
    .createAnswer()
    .then((answer) => remoteConnection.setLocalDescription(answer))
    .then(() => {
      console.log("Receiver: answer initiated");
    });
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
document.querySelector(".send_response").addEventListener("click", async () => {
  const response = document.getElementById("chat_text").value;
  const text = document.createElement("div");
  text.innerHTML =
    "Message Sent By You : " + document.getElementById("chat_text").value;
  document.querySelector(".chat").appendChild(text);
  remoteConnection.channel.send(response);
});

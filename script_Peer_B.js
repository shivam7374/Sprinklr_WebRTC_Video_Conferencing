// This function prints everything that is to be console logged.
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
document.querySelector(".send_response").disabled = true;

var remoteConnection;
document.querySelector(".offer_entered").addEventListener("click", async () => {
  // console.log("here at peer b");
  const offer = JSON.parse(document.getElementById("remote_address").value);
  // console.log(offer);
  remoteConnection = await new RTCPeerConnection();
  remoteConnection.onicecandidate = (e) => {
    // console.log(" NEW ice candidnat!! on localconnection reprinting SDP ");
    // console.log(JSON.stringify(remoteConnection.localDescription));
    const local_address = document.getElementById("local_address");
    local_address.value = JSON.stringify(remoteConnection.localDescription);
  };
  var receiveChannel;
  remoteConnection.ondatachannel = (e) => {
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
  // console.log(typeof offer + offer);
  await remoteConnection.setRemoteDescription(offer);

  //create answer
  await remoteConnection
    .createAnswer()
    .then((a) => remoteConnection.setLocalDescription(a))
    .then((a) => {
      // console.log(JSON.stringify(remoteConnection.localDescription));
    });
  //send the answer to the client
});

document.querySelector(".send_response").addEventListener("click", async () => {
  const response = document.getElementById("chat_text").value;
  const text = document.createElement("div");
  text.innerHTML =
    "Message Sent By You : " + document.getElementById("chat_text").value;
  document.querySelector(".chat").appendChild(text);
  remoteConnection.channel.send(response);
});

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
const localConnection = new RTCPeerConnection();

localConnection.onicecandidate = (e) => {
  // console.log(" NEW ice candidnat!! on localconnection reprinting SDP ");
  // console.log(JSON.stringify(localConnection.localDescription));
  const local_address = document.getElementById("local_address");
  local_address.value = JSON.stringify(localConnection.localDescription);
};

const sendChannel = localConnection.createDataChannel("sendChannel");
sendChannel.onmessage = (e) =>
  console.log("Message Recieved From Device B : " + e.data);
sendChannel.onopen = (e) => {
  console.log("Communication Established Now you can Chat !!!");
  document.querySelector(".send_response").disabled = false;
};
sendChannel.onclose = (e) => console.log("closed!!!!!!");

localConnection
  .createOffer()
  .then((o) => localConnection.setLocalDescription(o));

document.querySelector(".accept_answer").addEventListener("click", async () => {
  const answer = JSON.parse(document.getElementById("remote_address").value);
  localConnection.setRemoteDescription(answer).then((a) => {
    // console.log("done");
  });
  // console.log("bro hogya");
});

document.querySelector(".send_response").addEventListener("click", async () => {
  const response = document.getElementById("chat_text").value;
  const text = document.createElement("div");
  text.innerHTML =
    "Message Sent By You : " + document.getElementById("chat_text").value;
  document.querySelector(".chat").appendChild(text);
  sendChannel.send(response);
});

// import { SimpleUser, SimpleUserOptions } from "sip.js/lib/platform/web";
// const server = "wss://stagingtelephony.saarthi.ai:8089/ws";
// const destination = "sip:5000@stagingtelephony.saarthi.ai:5060";
// const aor = "sip:5000@stagingtelephony.saarthi.ai:5060";
// const authorizationUsername = "5000";
// const authorizationPassword = "12345";
// const options = {
//   aor,

//   userAgentOptions: {
//     authorizationPassword,
//     authorizationUsername,
//   },
// };

// // Construct a SimpleUser instance
// const simpleUser = new SimpleUser(server, options);
import * as SIPml from "./node_modules/sipml/sipml.js";
let listenerFunc = function (e) {
  console.info("stack event = " + e.type);
  // Please check this link for more information on all supported events.
};

let o_stack = SIPml.Stack({
  realm: "stagingtelephony.saarthi.ai",
  impi: "5000",
  impu: "sip:5000@stagingtelephony.saarthi.ai:5060",
  password: "12345", // optional
  display_name: "5000", // optional
  websocket_proxy_url: "wss://stagingtelephony.saarthi.ai:8089/ws", // optional
  outbound_proxy_url: "sip:5000@stagingtelephony.saarthi.ai:5060", // optional
  ice_servers: [{ url: "stun:stun.l.google.com:19302" }], // optional
  bandwidth: { audio: 64, video: 512 }, // optional
  video_size: {
    minWidth: 640,
    minHeight: 480,
    maxWidth: 1920,
    maxHeight: 1080,
  }, // optional
  enable_rtcweb_breaker: true, // optional
  enable_click2call: false, // optional
  events_listener: { events: "*", listener: listenerFunc }, //optional
  sip_headers: [
    //optional
    { name: "User-Agent", value: "IM-client/OMA1.0 sipML5-v1.0.89.0" },
    { name: "Organization", value: "saarthi" },
  ],
});

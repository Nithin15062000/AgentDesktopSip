import { Socket } from "jssip";
import { UAConfiguration } from "jssip/lib/UA";

const callConfig = {
  RTCaddress: "wss://stagingtelephony.saarthi.ai:8089/ws",
  user: "sip:5000@stagingtelephony.saarthi.ai:5060",
  password: "12345",
  call: "1004@52.172.94.114:5060",
  display_name: "5000",
  trace_sip: "true",
  realm: "sip:5000@stagingtelephony.saarthi.ai",
};
// ws_servers: [{'ws_uri':'wss://callukr.ua:8088/ws','sip_uri':'<sip:sip:1...@callukr.ua;transport=wss;lr>','weight':0,'status':0,'scheme':'WSS'}],
const sipConfig: { rtc: string; UAconfig: Omit<UAConfiguration, "sockets"> } = {
  rtc: "",
  UAconfig: {
    uri: callConfig.user,
    password: callConfig.password,
    display_name: callConfig.display_name,
    authorization_user: "5000",
  },
};
export default callConfig;
export { sipConfig };

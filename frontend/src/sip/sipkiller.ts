import jsSip, { WebSocketInterface } from "jssip";
import { ConnectedEvent, IncomingRTCSessionEvent } from "jssip/lib/UA";
import { AnswerOptions } from "jssip/lib/RTCSession";
/**
 * username = 1000
 *  password = 1000
 *  sipIp /proxy= 52.172.94.114
 * webrtc = wss://stagingtelephony.saarthi.ai:8089/ws
 * pport 123456
 */

interface events {
  eventConnected: CallableFunction;
  eventDisconnected: CallableFunction;
}
class SipKiller {
  private webrtc: string;
  private uri: string;
  private password: string;
  private coolPhone: jsSip.UA;
  public jsSoc: WebSocketInterface;
  public isConnected: boolean;
  private events: events;
  private session: IncomingRTCSessionEvent | undefined;
  constructor(webrtc: string, uri: string, password: string, events: events) {
    this.webrtc = webrtc;
    this.password = password;
    this.uri = uri;
    this.jsSoc = new jsSip.WebSocketInterface(this.webrtc);
    this.events = events;
    const configuration = {
      sockets: [this.jsSoc],
      uri: this.uri,
      password: this.password,
      register_expires: 60000, // 15hrs
      session_timers_refresh_method: "invite",
      //   session_timers_force_refresher:true,
    };
    console.log("init");
    // this.onConnected = this.onConnected.bind(this);
    this.coolPhone = new jsSip.UA(configuration);

    // this.coolPhone.ke
    this.isConnected = false;
    this.coolPhone.on("registrationExpiring", (e) => {
      console.log("regestration expering");
    });
    this.coolPhone.on("connected", (e) => {
      this.onConnected(e);
    });
    this.coolPhone.on("disconnected", (e) => {
      this.onDisconnected(e);
    });
    this.coolPhone.on("newRTCSession", (e: IncomingRTCSessionEvent) => {
      this.newRTCSession(e);
    });
    this.coolPhone.on("registered", (e) => {
      console.log("registered", e);
    });
    this.coolPhone.on("unregistered", function (e) {
      /* Your code here */
      console.log("unregistered", e);
    });

    this.coolPhone.on("registrationFailed", function (e) {
      /* Your code here */
      console.log("registration failed", e);
    });
  }
  //WebSocket connection events//
  private onConnected(e: ConnectedEvent) {
    console.log("connected", e);
    this.isConnected = true;
    this.events.eventConnected();
  }
  //WebSocket connection events//
  private onDisconnected(e: ConnectedEvent) {
    console.error("sip disconnected", e);
    this.isConnected = false;
    this.events.eventDisconnected();
  }
  /**
   * New incoming or outgoing call event
   * @param e
   */
  private newRTCSession(e: IncomingRTCSessionEvent) {
    console.log("callevent", e);
    this.session = e;
    if (e.originator == "remote") {
      //todo
      // session_incoming.answer(options);
    }
    e.session.connection.addEventListener("addstream", function (k: any) {
      // set remote audio stream
      console.log(k, "addstream");
      const remoteAudio = document.createElement("audio");
      remoteAudio.srcObject = k.stream as MediaStream;
      remoteAudio.play();
    });
    e.session.on("peerconnection", function (data) {
      data.peerconnection.addEventListener("addstream", function (k: any) {
        // set remote audio stream
        console.log(k, "peerconnection");
        const remoteAudio = document.createElement("audio");
        remoteAudio.src = window.URL.createObjectURL(k.stream);
        remoteAudio.play();
      });
    });
  }
  public start() {
    this.coolPhone.start();
    this.coolPhone.register();
  }
  public call(address: string) {
    const eventHandlers = {
      progress: function (e: any) {
        console.log("call is in progress", e);
      },
      failed: function (e: any) {
        console.log("call failed with cause: ", e);
      },
      ended: function (e: any) {
        console.log("call ended with cause: ", e);
      },
      confirmed: function (e: any) {
        console.log("call confirmed", e);
      },
    };

    const options = {
      eventHandlers: eventHandlers,
      mediaConstraints: { audio: true, video: false },
    };
    this.coolPhone.call(address, options);
  }
  public receiveCall() {
    let options: AnswerOptions = {
      mediaConstraints: {
        audio: true,
        video: false,
      },
    };
    this.session?.session.answer(options);
  }
  public endCall() {
    this.session?.session.terminate();
    this.session = undefined;
  }
  public kill() {
    this.jsSoc.disconnect();
  }
}
export default SipKiller;

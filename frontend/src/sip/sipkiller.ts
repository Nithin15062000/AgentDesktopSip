import jsSip, { WebSocketInterface } from "jssip";
import { ConnectedEvent, IncomingRTCSessionEvent } from "jssip/lib/UA";
/**
 * username = 1000
 *  password = 1000
 *  sipIp /proxy= 52.172.94.114
 * webrtc = wss://stagingtelephony.saarthi.ai:8089/ws
 * pport 123456
 */
class SipKiller {
  private webrtc: string;
  private uri: string;
  private password: string;
  private coolPhone: jsSip.UA;
  public jsSoc: WebSocketInterface;
  constructor(webrtc: string, uri: string, password: string) {
    this.webrtc = webrtc;
    this.password = password;
    this.uri = uri;
    this.jsSoc = new jsSip.WebSocketInterface(this.webrtc);
    const configuration = {
      sockets: [this.jsSoc],
      uri: this.uri,
      password: this.password,
      // register_expires: 5000000,
      session_timers_refresh_method: "invite",
      //   session_timers_force_refresher:true,
    };
    console.log("init");
    // this.onConnected = this.onConnected.bind(this);
    this.coolPhone = new jsSip.UA(configuration);

    // this.coolPhone.ke
    this.coolPhone.on("registrationExpiring", (e) => {
      console.log("regestration expering");
    });
    this.coolPhone.on("connected", this.onConnected);
    this.coolPhone.on("disconnected", this.onDisconnected);
    this.coolPhone.on("newRTCSession", this.newRTCSession);
    this.coolPhone.on("registered", (e) => {
      console.log("registered", e);
      // const eventHandlers = {
      //   progress: function (e: any) {
      //     console.log("call is in progress", e);
      //   },
      //   failed: function (e: any) {
      //     console.log("call failed with cause: ", e);
      //   },
      //   ended: function (e: any) {
      //     console.log("call ended with cause: ", e);
      //   },
      //   confirmed: function (e: any) {
      //     console.log("call confirmed", e);
      //   },
      // };

      // const options = {
      //   eventHandlers: eventHandlers,
      //   mediaConstraints: { audio: true, video: false },
      // };

      //   const session = this.coolPhone.call("1004@52.172.94.114:5060", options);
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
  }
  //WebSocket connection events//
  private onDisconnected(e: ConnectedEvent) {
    console.error("sip disconnected", e);
  }
  /**
   * New incoming or outgoing call event
   * @param e
   */
  private newRTCSession(e: IncomingRTCSessionEvent) {
    console.log("callevent", e);
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
  public kill() {
    this.jsSoc.disconnect();
  }
}
export default SipKiller;

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
  eventRegistered: CallableFunction;
  eventUnregistered: CallableFunction;
  eventOnCallReceive: CallableFunction;
  eventOnCallDisconnected: CallableFunction;
}
interface AudioRecorder {
  stream: undefined | MediaStream;
  recorder: undefined | MediaRecorder;
  chunks: any[];
}
class SipKiller {
  private webrtc: string;
  private uri: string;
  private password: string;
  private coolPhone: jsSip.UA;
  private jsSoc: WebSocketInterface;
  public stream: {
    incomming: AudioRecorder;

    outgoing: AudioRecorder;
  } = {
    incomming: { stream: undefined, recorder: undefined, chunks: [] },
    outgoing: { stream: undefined, recorder: undefined, chunks: [] },
  };
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
    // console.log("init");
    // this.onConnected = this.onConnected.bind(this);
    this.coolPhone = new jsSip.UA(configuration);

    // this.coolPhone.ke

    this.coolPhone.on("registrationExpiring", (e) => {
      console.log("regestration expering");
    });
    this.coolPhone.on("connected", (e) => {
      this.onConnected(e);
    });
    this.coolPhone.on("disconnected", (e) => {
      this.onDisconnected(e);
      this.events.eventUnregistered();
    });
    this.coolPhone.on("newRTCSession", (e: IncomingRTCSessionEvent) => {
      this.newRTCSession(e);
    });
    this.coolPhone.on("registered", (e) => {
      console.log("registered", e);
      this.events.eventRegistered();
    });
    this.coolPhone.on("unregistered", (e) => {
      /* Your code here */
      console.log("unregistered", e);
      this.events.eventUnregistered();
    });

    this.coolPhone.on("registrationFailed", (e) => {
      /* Your code here */
      this.events.eventUnregistered();
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
    this.events.eventUnregistered();
  }
  /**
   * New incoming or outgoing call event
   * @param e
   */
  private newRTCSession(e: IncomingRTCSessionEvent) {
    // console.log("callevent", e);
    this.session = e;
    if (e.originator == "remote") {
      //todo

      console.log("incomming call");
      this.events.eventOnCallReceive();
      // session_incoming.answer(options);
    }
    e.session.connection.addEventListener("addstream", (k: any) => {
      // set remote audio stream
      // console.log(k, "addstream");

      const remoteAudio = document.createElement("audio");
      remoteAudio.srcObject = k.stream as MediaStream;
      remoteAudio.play();
      // alert("peer connection");

      this.stream.incomming.stream = k.stream;
      this.stream.incomming.recorder = new MediaRecorder(k.stream);
      this.stream.incomming.recorder.start();
    });
    e.session.on("accepted", () => {
      // alert("call accepted");
    });
    e.session.on("ended", async () => {
      this.stream.incomming.recorder?.stop();
      this.stream.outgoing.recorder?.stop();
      if (this.stream.incomming.recorder) {
        this.stream.incomming.recorder.ondataavailable = (ev) => {
          this.setAudio(ev.data, "incomming_call");
        };
      }
      if (this.stream.outgoing.recorder) {
        this.stream.outgoing.recorder.ondataavailable = (ev) => {
          this.setAudio(ev.data, "outgoing_call");
        };
      }
      // this.stream = { incomming: undefined, outgoing: undefined };
      this.events.eventOnCallDisconnected();
    });

    e.session.on("peerconnection", (data) => {
      data.peerconnection.addEventListener("addstream", (k: any) => {
        // set remote audio stream

        // console.log(k, "peerconnection");
        // alert("peer connection");

        this.stream.incomming.stream = k.stream;
        this.stream.incomming.recorder = new MediaRecorder(k.stream);
        this.stream.incomming.recorder.start();
        // this.stream.incomming.recorder.ondataavailable = (ev) => {
        //   this.stream.incomming.chunks.push(ev.data);
        // };

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
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        const options = {
          eventHandlers: eventHandlers,
          // mediaConstraints: { audio: true, video: false },
          mediaStream: stream,
        };

        this.stream.outgoing.stream = stream;
        this.stream.outgoing.recorder = new MediaRecorder(stream);
        this.stream.outgoing.recorder.start();
        // this.stream.outgoing.recorder.ondataavailable = (e) => {
        //   this.stream.outgoing.chunks.push(e.data);
        //   console.log("chunnnk", e.data);
        // };
        this.coolPhone.call(address, options);
      });
  }
  /**
   * this is to record audio files
   * @param stream t
   */
  private setAudio(blob: Blob, element: string) {
    // const bloburl = URL.createObjectURL(
    //   new Blob(blob, {
    //     type: "audio/ogg; codecs=opus",
    //   })
    // );
    console.log(blob, element);
    const bloburl = URL.createObjectURL(blob);

    let audiotag = document.getElementById(element) as HTMLAudioElement;
    audiotag.src = bloburl;
  }
  /**
   *  accepts the incomming call
   */
  public acceptCall() {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        let options: AnswerOptions = {
          mediaConstraints: {
            audio: true,
            video: false,
          },
          mediaStream: stream,
        };

        this.stream.outgoing.stream = stream;
        this.stream.outgoing.recorder = new MediaRecorder(stream);
        this.stream.outgoing.recorder.start();
        // this.stream.outgoing.recorder.ondataavailable = (e) => {
        //   this.stream.outgoing.chunks.push(e.data);
        // };
        this.session?.session.answer(options);
      });

    //todo
  }
  /**
   * end the call (both incomming and outgoing)
   */
  public endCall() {
    this.session?.session.terminate();
    this.session = undefined;
  }
  /**
   * hold the call
   */
  public hold() {
    this.session?.session.hold();
  }
  /**
   * unhold the call
   */
  public unhold() {
    this.session?.session.unhold();
  }
  /**
   * mute the call
   */
  public mute() {
    this.session?.session.mute();
  }
  /**
   * unmute the call
   */
  public unmute() {
    this.session?.session.unmute();
  }
  /**
   * the connection of webrtc (cleanup)
   */
  public kill() {
    this.coolPhone.unregister();
    this.jsSoc.disconnect();
  }
}
export default SipKiller;

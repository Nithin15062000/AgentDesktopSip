import { Web, Inviter, SessionState, UserAgent } from "sip.js";

import callConfig from "./sip.config";
class SipConnector {
  constructor() {
    const userAgent = new UserAgent({
      authorizationUsername: callConfig.display_name,
      authorizationPassword: callConfig.password,
      contactName: callConfig.display_name,
      //   userAgentString: "5000",
      uri: UserAgent.makeURI(callConfig.user),
      transportOptions: {
        server: callConfig.RTCaddress,
      },
    });

    // Connect the user agent
    // userAgent.start().then(() => {
    //   alert("connected");

    //   // Set target destination (callee)
    //   const target = UserAgent.makeURI("sip:bob@example.com");
    //   if (!target) {
    //     throw new Error("Failed to create target URI.");
    //   }

    //   // Create a user agent client to establish a session
    //   const inviter = new Inviter(userAgent, target, {
    //     sessionDescriptionHandlerOptions: {
    //       constraints: { audio: true, video: false },
    //     },
    //   });

    //   // Handle outgoing session state changes
    //   inviter.stateChange.addListener((newState) => {
    //     switch (newState) {
    //       case SessionState.Establishing:
    //         // Session is establishing
    //         break;
    //       case SessionState.Established:
    //         // Session has been established
    //         break;
    //       case SessionState.Terminated:
    //         // Session has terminated
    //         break;
    //       default:
    //         break;
    //     }
    //   });

    //   // Send initial INVITE request
    //   //   inviter
    //   //     .invite()
    //   //     .then(() => {
    //   //       // INVITE sent
    //   //     })
    //   //     .catch((error: Error) => {
    //   //       // INVITE did not send
    //   //     });
    // });

    // Helper function to get an HTML audio element
    function getAudioElement(id: string): HTMLAudioElement {
      const el = document.getElementById(id);
      if (!(el instanceof HTMLAudioElement)) {
        throw new Error(`Element "${id}" not found or not an audio element.`);
      }
      return el;
    }

    // Helper function to wait
    async function wait(ms: number): Promise<void> {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    }

    // Main function
    async function main(): Promise<void> {
      // SIP over WebSocket Server URL
      // The URL of a SIP over WebSocket server which will complete the call.
      // FreeSwitch is an example of a server which supports SIP over WebSocket.
      // SIP over WebSocket is an internet standard the details of which are
      // outside the scope of this documentation, but there are many resources
      // available. See: https://tools.ietf.org/html/rfc7118 for the specification.
      const server = callConfig.RTCaddress;

      // SIP Request URI
      // The SIP Request URI of the destination. It's "Who you wanna call?"
      // SIP is an internet standard the details of which are outside the
      // scope of this documentation, but there are many resources available.
      // See: https://tools.ietf.org/html/rfc3261 for the specification.
      //   const destination = "sip:bob@example.com";

      // SIP Address of Record (AOR)
      // This is the user's SIP address. It's "Where people can reach you."
      // SIP is an internet standard the details of which are outside the
      // scope of this documentation, but there are many resources available.
      // See: https://tools.ietf.org/html/rfc3261 for the specification.
      const aor = callConfig.user;

      // Configuration Options
      // These are configuration options for the `SimpleUser` instance.
      // Here we are setting the HTML audio element we want to use to
      // play the audio received from the remote end of the call.
      // An audio element is needed to play the audio received from the
      // remote end of the call. Once the call is established, a `MediaStream`
      // is attached to the provided audio element's `src` attribute.
      const options: Web.SimpleUserOptions = {
        userAgentOptions: {
          authorizationUsername: callConfig.display_name,
          authorizationPassword: callConfig.password,
          contactName: callConfig.display_name,
          //   userAgentString: "5000",
          uri: UserAgent.makeURI(callConfig.user),
          transportOptions: {
            server: callConfig.RTCaddress,
          },
        },
      };

      // Construct a SimpleUser instance
      const simpleUser = new Web.SimpleUser(server, options);

      // Supply delegate to handle inbound calls (optional)
      simpleUser.delegate = {
        onCallReceived: async () => {
          await simpleUser.answer();
        },
      };

      // Connect to server
      await simpleUser.connect();

      // Register to receive inbound calls (optional)
      await simpleUser.register();
      alert("success ");
      // Place call to the destination

      // Wait some number of milliseconds

      // Hangup call
    }

    // Run it
    main()
      .then(() => console.log(`Success`))
      .catch((error: Error) => console.error(`Failure`, error));
  }
}
// Create user agent instance (caller)
export default SipConnector;

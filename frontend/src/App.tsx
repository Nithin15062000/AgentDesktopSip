import { useEffect, useReducer, useState } from "react";

import "./App.css";
import SipKiller from "./sip/sipkiller";
import styles from "./app.module.scss";
interface connection_state {
  resistration_status: "unregistered" | "registered";
  call_status: "incomming" | "outgoing" | "on_call" | "call_ended" | undefined;
}
const initial_state: connection_state = {
  resistration_status: "unregistered",
  call_status: undefined,
};
function connection_status_reducer(
  state: connection_state,
  action: {
    type:
      | "register"
      | "unregister"
      | "call/incomming"
      | "call/outgoing"
      | "call/connected"
      | "call/ended";
  }
): connection_state {
  switch (action.type) {
    case "register": {
      return {
        ...state,
        resistration_status: "registered",
      };
    }
    case "unregister": {
      return {
        ...state,
        resistration_status: "unregistered",
      };
    }
    case "call/incomming": {
      return {
        ...state,
        call_status: "incomming",
      };
    }
    case "call/outgoing": {
      return {
        ...state,
        call_status: "outgoing",
      };
    }
    case "call/connected": {
      return {
        ...state,
        call_status: "on_call",
      };
    }
    case "call/ended": {
      return {
        ...state,
        call_status: "call_ended",
      };
    }
    default: {
      return state;
    }
  }
}
function App() {
  const [sip, setSip] = useState<SipKiller | undefined>();
  const [connectionState, updateConnection] = useReducer(
    connection_status_reducer,
    initial_state
  );
  const [details, updateDetails] = useReducer(
    (
      prev: {
        RTCaddress: string;
        user: string;
        password: string;
        call: string;
      },
      action: {
        type: "RTCaddress" | "user" | "password" | "callAddress";
        payload: string;
      }
    ) => {
      switch (action.type) {
        case "RTCaddress": {
          return { ...prev, RTCaddress: action.payload };
        }
        case "callAddress": {
          return { ...prev, call: action.payload };
        }
        case "password": {
          return { ...prev, password: action.payload };
        }
        case "user": {
          return { ...prev, call: action.payload };
        }
        default: {
          return prev;
        }
      }
    },
    {
      RTCaddress: "wss://stagingtelephony.saarthi.ai:8089/ws",
      user: "1000@52.172.94.114:5060",
      password: "123456",
      call: "1004@52.172.94.114:5060",
    }
  );

  function eventConnected() {}
  function connectSip() {
    if (details) {
      const sipTemp = new SipKiller(
        details.RTCaddress,
        details.user,
        details.password,
        {
          eventRegistered: () => {
            console.log(" connected call event");
            updateConnection({
              type: "register",
            });
          },
          eventUnregistered: () => {
            console.log(" disconnected call event");
            updateConnection({
              type: "unregister",
            });
          },
          eventOnCallReceive: () => {
            console.log("call receiving");
            alert("call receiving");
            //todo
          },
          eventOnCallDisconnected: () => {
            console.log("call disconnected");
            alert("call disconnected");
          },
        }
      );
      sipTemp.start();
      setSip(sipTemp);
    } else {
      setSip(undefined);
    }
  }
  function call() {
    if (details.call) {
      sip?.call(details.call);
    }
  }

  useEffect(() => {
    return () => {
      sip?.kill();
    };
  }, []);
  return (
    <div className="App">
      <div className={styles.connection_status}>
        connection status :{" "}
        <span
          data-success={connectionState.resistration_status === "registered"}
        >
          {" "}
          {connectionState.resistration_status}
        </span>
      </div>
      <div className={styles.connect}>
        <label htmlFor="rtc">RTCaddress :</label>
        <input
          type="text"
          placeholder="wss://stagingtelephony.saarthi.ai:8089/ws"
          value={details.RTCaddress}
          onChange={(e) => {
            updateDetails({ type: "RTCaddress", payload: e.target.value });
          }}
        />
        <label htmlFor="rtc">user :</label>
        <input
          type="text"
          placeholder="1000@52.172.94.114:5060"
          value={details.user}
          onChange={(e) => {
            updateDetails({ type: "user", payload: e.target.value });
          }}
        />
        <label htmlFor="password">password :</label>
        <input
          type="text"
          placeholder="123456"
          value={details.password}
          onChange={(e) => {
            updateDetails({ type: "password", payload: e.target.value });
          }}
        />
        <button
          onClick={() => {
            connectSip();
          }}
        >
          {" "}
          connect
        </button>
        <button
          onClick={() => {
            sip?.kill();
          }}
        >
          disconnect
        </button>
      </div>
      <div>
        <label htmlFor="call"> call :</label>
        <input
          type="text"
          placeholder="1004@52.172.94.114:5060"
          value={details.call}
          onChange={(e) => {
            updateDetails({ type: "callAddress", payload: e.target.value });
          }}
        />
        <button
          disabled={connectionState.resistration_status === "unregistered"}
          onClick={call}
        >
          Call
        </button>
        <div>
          <button
            onClick={() => {
              sip?.endCall();
            }}
          >
            End Call
          </button>
          <button
            onClick={() => {
              sip?.mute();
            }}
          >
            mute
          </button>
          <button
            onClick={() => {
              sip?.unmute();
            }}
          >
            unmute
          </button>
          <button
            onClick={() => {
              sip?.hold();
            }}
          >
            hold
          </button>
          <button
            onClick={() => {
              sip?.unhold();
            }}
          >
            unhold
          </button>
        </div>
      </div>
      <div>
        {" "}
        receive call event TODO!
        <button
          onClick={() => {
            sip?.acceptCall();
          }}
        >
          Accept call
        </button>
      </div>
    </div>
  );
}

export default App;

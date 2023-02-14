import {
  MutableRefObject,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import SipKiller from "./sip/sipkiller";
import styles from "./app.module.scss";
interface connection_state {
  connection_status: "disconnected" | "connected";
  resistration_status: "unregistered" | "registered";
}
const initial_state: connection_state = {
  connection_status: "disconnected",
  resistration_status: "registered",
};
function connection_status_reducer(
  state: connection_state,
  action: {
    type:
      | "status/connected"
      | "status/disconnected"
      | "register"
      | "unregister";
  }
): connection_state {
  switch (action.type) {
    case "status/connected": {
      return { ...state, connection_status: "connected" };
    }
    case "status/disconnected":
      return {
        ...state,
        connection_status: "disconnected",
        resistration_status: "unregistered",
      };
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
          eventConnected: () => {
            console.log(" connected call event");
            updateConnection({
              type: "status/connected",
            });
          },
          eventDisconnected: () => {
            console.log(" disconnected call event");
            updateConnection({
              type: "status/disconnected",
            });
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
        <span data-success={connectionState.connection_status === "connected"}>
          {" "}
          {connectionState.connection_status}
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
          disabled={
            connectionState.connection_status === "disconnected" ||
            connectionState.resistration_status === "unregistered"
          }
          onClick={call}
        >
          Call
        </button>
        <button
          onClick={() => {
            sip?.endCall();
          }}
        >
          End Call
        </button>
      </div>
    </div>
  );
}

export default App;

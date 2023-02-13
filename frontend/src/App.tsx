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
function App() {
  const [sip, setSip] = useState<SipKiller | undefined>();
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
  const RTCaddress = useRef<undefined | any>(undefined);
  const user = useRef<undefined | any>(undefined);
  const password = useRef<undefined | any>(undefined);
  const callAddress = useRef<any>(null);
  function connectSip() {
    if (RTCaddress.current && user.current && password.current) {
      const sipTemp = new SipKiller(
        details.RTCaddress,

        details.user,
        details.password
      );
      sipTemp.start();
      setSip(sipTemp);
    } else {
      setSip(undefined);
    }
  }
  function call() {
    if (callAddress.current) {
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
      <div className={styles.connect}>
        <label htmlFor="rtc">RTCaddress :</label>
        <input
          type="text"
          placeholder="wss://stagingtelephony.saarthi.ai:8089/ws"
          ref={RTCaddress}
          value={details.RTCaddress}
          onChange={(e) => {
            updateDetails({ type: "RTCaddress", payload: e.target.value });
          }}
        />
        <label htmlFor="rtc">user :</label>
        <input
          type="text"
          placeholder="1000@52.172.94.114:5060"
          ref={user}
          value={details.user}
          onChange={(e) => {
            updateDetails({ type: "user", payload: e.target.value });
          }}
        />
        <label htmlFor="password">password :</label>
        <input
          type="text"
          placeholder="123456"
          ref={password}
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
          ref={callAddress}
        />
        <button onClick={call}>Call</button>
      </div>
    </div>
  );
}

export default App;

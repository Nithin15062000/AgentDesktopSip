import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import SipConnector from "./sip/sip_module";
function App() {
  const [count, setCount] = useState(new SipConnector());

  return <div className="App"></div>;
}

export default App;

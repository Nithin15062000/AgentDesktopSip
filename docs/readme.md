-[front end](#front-end)

## todo

- [ ] on incomming call implimentation
- [ ] to test with real phone

# technologies required

- sip (Session Initiation Protocol)
- webRtc (Real time communication)
-

# front end

- jssip
  - <https://jssip.net/documentation/3.3.x/api/ua_configuration_parameters/>

# Main Architecture

```mermaid
stateDiagram
login: login
start : start Connection
register : register
callEvent: call (incomming/outgoing)
acceptCall : init websocket for transcript
backend : backend agent desktop server
note left of acceptCall
Send the audio data of agent and user
end note
note left of start
Connect webRTC over sip
{
    webrtc address : "wss://stagingtelephony.saarthi.ai:8089/ws",
    user address : "1000@52.172.94.114:5060",
    password : "123456"
}
end note
login --> start
start -->  register : connected
register --> callEvent : listen
backend--> callEvent
callEvent --> acceptCall : accept
acceptCall -->backend : agent audio
acceptCall -->backend : customer audio


```

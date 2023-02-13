-[front end](#front-end)

# technologies required

- sip (Session Initiation Protocol)
- webRtc (Real time communication)
-

# front end

- jssip
  - <https://jssip.net/documentation/3.3.x/api/ua_configuration_parameters/>

# Architecture

```mermaid
stateDiagram
start : start Connection
register : register
handle_notConnected : handle_notConnected
note left of start
{
    webrtc address : "wss://stagingtelephony.saarthi.ai:8089/ws",
    user address : "1000@52.172.94.114:5060",
    password : "123456"
}
end note

start -->  register : connected
start --> handle_notConnected : connection failed
handle_notConnected --> start : retry

```

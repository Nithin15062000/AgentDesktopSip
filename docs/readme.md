-[front end](#front-end)

# technologies required

- sip (Session Initiation Protocol)
- webRtc (Real time communication)
-

# front end

- jssip
  - <https://jssip.net/documentation/3.3.x/api/ua_configuration_parameters/>

# architecture

```mermaid
flowchart TB
A[start connection]
B{register}
C[handle unsuccessful register]
A --> B
B --> |successful| D
B --> |unsuccessful| C
C --> |retry| B
```

```mermaid
stateDiagram
start : start Connection
note left of start
{
    webrtc address : "wss://stagingtelephony.saarthi.ai:8089/ws",
    user address : "1000@52.172.94.114:5060",
    password : "123456"
}
end note
register : register
handle_notConnected : handle_notConnected
start -->  register : connected
start --> handle_notConnected : connection failed
handle_notConnected --> start : retry
```

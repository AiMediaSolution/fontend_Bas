function connectWebSocket(userName, apiUrl, onMessageCallback) {
  let ws = new WebSocket(apiUrl);

  ws.onopen = () => {
    console.log("Connected to WebSocket server.");
    const joinRoomMessage = JSON.stringify({ type: "join", room: userName });
    ws.send(joinRoomMessage);
    console.log(`Sent join room request for room: ${userName}`);
    const fetchCurrentDataMessage = JSON.stringify({
      type: "fetch_current_data",
    });
    ws.send(fetchCurrentDataMessage);
    console.log("Sent request to fetch current data.");
  };

  ws.onmessage = (event) => {
    try {
      console.log("Received:", event.data);
      const data = JSON.parse(event.data);
      onMessageCallback(data);
    } catch (err) {
      console.error("Error processing message:", err);
    }
  };

  ws.onclose = () => {
    console.log(
      "Disconnected from WebSocket server. Reconnecting in 5 seconds..."
    );
    setTimeout(
      () => connectWebSocket(userName, apiUrl, onMessageCallback),
      5000
    );
  };

  ws.onerror = (err) => {
    console.error("WebSocket error:", err);
  };

  return ws;
}

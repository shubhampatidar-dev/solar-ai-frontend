import conversationManager from "../conversation/conversationManager";
import { playPCM, stopAudio } from "../audio/audioPlayer";

let socket = null;

export async function connectWebSocket() {
  return new Promise((resolve, reject) => {
    if (
      socket &&
      socket.readyState === WebSocket.OPEN
    ) {
      resolve(socket);
      return;
    }

    socket = new WebSocket("wss://solar-ai-agent-mlsl.onrender.com");

    socket.binaryType = "arraybuffer";

    socket.onopen = () => {
      console.log("✅ WebSocket Connected");

      conversationManager.setConnected(true);

      resolve(socket);
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket Error", err);

      reject(err);
    };

    socket.onclose = () => {
      console.log("❌ WebSocket Closed");

      conversationManager.setConnected(false);

      socket = null;
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {

        case "TEXT":

          console.log("🤖", message.text);

          conversationManager.addAIMessage(
            message.text
          );

          break;

        case "AUDIO":

          conversationManager.onAISpeaking();

          playPCM(message.data);

          break;

        case "TURN_COMPLETE":

          conversationManager.onAIFinished();

          break;

        case "INTERRUPTED":

          stopAudio();

          conversationManager.onInterrupted();

          break;

        case "PONG":

          console.log("🏓 Pong");

          break;

        default:

          console.log(
            "Unknown Message:",
            message
          );
      }
    };
  });
}

// ----------------------------
// Send Binary Audio
// ----------------------------

export function sendAudioChunk(buffer) {

  if (!socket) return;

  if (socket.readyState !== WebSocket.OPEN)
    return;

  socket.send(buffer);

}

// ----------------------------
// Tell backend current speech ended
// ----------------------------

export function endAudioStream() {

  if (!socket) return;

  socket.send(
    JSON.stringify({
      type: "AUDIO_END",
    })
  );

}

// ----------------------------
// Start Session
// ----------------------------

export function startSession() {

  if (!socket) return;

  socket.send(
    JSON.stringify({
      type: "START_SESSION",
    })
  );

}

// ----------------------------
// Close
// ----------------------------

export function disconnectWebSocket() {

  if (!socket) return;

  socket.close();

}

export function isConnected() {

  return (
    socket &&
    socket.readyState === WebSocket.OPEN
  );

}
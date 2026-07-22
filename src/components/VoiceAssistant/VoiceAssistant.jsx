import useConversation from "../../hooks/useConversation.js";
import ChatWindow from "../ChatWindow/ChatWindow";

export default function VoiceAssistant() {
  const {
    started,
    connected,
    listening,
    speaking,
    messages,
    startConversation,
  } = useConversation();

  function getStatus() {
    if (!connected) return "🔴 Disconnected";
    if (speaking) return "🔊 AI Speaking...";
    if (listening) return "🎤 Listening...";
    return "😴 Waiting...";
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <h1>Solar Voice AI</h1>

      <h3>{getStatus()}</h3>

      {!started && (
        <button
          onClick={startConversation}
          style={{
            padding: "12px 25px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          🎤 Start Conversation
        </button>
      )}

      {/* <ChatWindow messages={messages} /> */}
    </div>
  );
}
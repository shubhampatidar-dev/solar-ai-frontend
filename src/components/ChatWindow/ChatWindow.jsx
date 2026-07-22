import ChatBubble from "../ChatBubble/ChatBubble";

function ChatWindow({ messages }) {
  return (
    <div
      style={{
        height: "400px",
        overflowY: "auto",
        border: "1px solid #ddd",
        padding: "20px",
        borderRadius: "12px",
        marginTop: "20px",
      }}
    >
      {messages.map((message) => (
        <ChatBubble
          key={message.id}
          message={message}
        />
      ))}
    </div>
  );
}

export default ChatWindow;
function ChatBubble({ message }) {
  const isUser = message.sender === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "12px",
      }}
    >
      <div
        style={{
          background: isUser ? "#2563eb" : "#e5e7eb",
          color: isUser ? "#fff" : "#000",
          padding: "12px 16px",
          borderRadius: "16px",
          maxWidth: "70%",
          whiteSpace: "pre-wrap",
        }}
      >
        {message.text}
      </div>
    </div>
  );
}

export default ChatBubble;
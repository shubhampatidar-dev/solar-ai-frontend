class conversationManager {
  constructor() {
    this.started = false;
    this.connected = false;
    this.listening = false;
    this.speaking = false;

    this.messages = [];

    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);

    callback(this.getState());

    return () => {
      this.listeners = this.listeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  notify() {
    const state = this.getState();

    this.listeners.forEach((listener) => listener(state));
  }

  getState() {
    return {
      started: this.started,
      connected: this.connected,
      listening: this.listening,
      speaking: this.speaking,
      messages: this.messages,
    };
  }

  startConversation() {
    if (this.started) return;

    this.started = true;

    console.log("🟢 Conversation Started");

    this.notify();
  }

  stopConversation() {
    this.started = false;
    this.listening = false;
    this.speaking = false;

    this.notify();
  }

  setConnected(value) {
    this.connected = value;
    this.notify();
  }

  setListening(value) {
    this.listening = value;
    this.notify();
  }

  onAISpeaking() {
    this.speaking = true;
    this.listening = false;

    this.notify();
  }

  onAIFinished() {
    this.speaking = false;
    this.listening = true;

    this.notify();
  }

  onInterrupted() {
    this.speaking = false;
    this.listening = true;

    this.notify();
  }

  addAIMessage(text) {
    this.messages.push({
      id: Date.now(),
      sender: "ai",
      text,
    });

    this.notify();
  }

  addUserMessage(text) {
    this.messages.push({
      id: Date.now(),
      sender: "user",
      text,
    });

    this.notify();
  }

  clearMessages() {
    this.messages = [];
    this.notify();
  }
}

export default new ConversationManager();
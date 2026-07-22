import { useEffect, useState } from "react";

import ConversationManager from "../conversation/conversationManager";

import {
  connectWebSocket,
  startSession,
} from "../services/websocket";

import { startWorklet } from "../audio/worklet";

export default function useConversation() {

  const [state, setState] = useState(
    ConversationManager.getState()
  );

  useEffect(() => {

    const unsubscribe =
      ConversationManager.subscribe(setState);

    return () => {
      unsubscribe();
    };

  }, []);

  async function startConversation() {

    if (state.started) return;

    try {

      // 1. Connect Backend
      await connectWebSocket();

      // 2. Open Microphone
      await startWorklet();

      // 3. Update State
      ConversationManager.startConversation();

      ConversationManager.setListening(true);

      // 4. Create Gemini Session
      startSession();

    } catch (err) {

      console.error(err);

    }

  }

  return {

    ...state,

    startConversation,

  };

}
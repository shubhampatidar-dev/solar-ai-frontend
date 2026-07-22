import { float32ToPCM16 } from "./pcmEncoder";
import { sendAudioChunk } from "../services/websocket";

let audioContext = null;
let mediaStream = null;
let sourceNode = null;
let workletNode = null;

export async function startWorklet() {
  if (audioContext) {
    console.log("🎤 AudioWorklet already running");
    return;
  }

  mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  audioContext = new AudioContext({
    sampleRate: 16000,
  });

  console.log(
    "🎤 AudioContext Sample Rate:",
    audioContext.sampleRate
  );

  await audioContext.audioWorklet.addModule(
    "/src/audio/recorder.worklet.js"
  );

  sourceNode =
    audioContext.createMediaStreamSource(mediaStream);

  workletNode =
    new AudioWorkletNode(
      audioContext,
      "recorder-processor"
    );

  workletNode.port.onmessage = (event) => {
    const pcmBuffer = float32ToPCM16(event.data);

    if (pcmBuffer.byteLength > 0) {
      sendAudioChunk(pcmBuffer);
    }
  };

  sourceNode.connect(workletNode);

  // We don't connect to destination so the user's
  // microphone isn't played back through speakers.
  // Some browsers require the worklet to be connected
  // into the graph, so use a GainNode with zero gain.
  const silentGain = audioContext.createGain();
  silentGain.gain.value = 0;

  workletNode.connect(silentGain);
  silentGain.connect(audioContext.destination);

  console.log("✅ AudioWorklet Started");
}

export function stopWorklet() {
  try {
    if (workletNode) {
      workletNode.disconnect();
      workletNode = null;
    }

    if (sourceNode) {
      sourceNode.disconnect();
      sourceNode = null;
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }

    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }

    console.log("🛑 AudioWorklet Stopped");
  } catch (err) {
    console.error("Failed to stop AudioWorklet:", err);
  }
}
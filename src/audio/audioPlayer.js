// import ConversationManager from "../conversation/conversationManager";

// let audioContext = null;
// let nextPlayTime = 0;
// let finishTimer = null;

// function getAudioContext() {
//   if (!audioContext) {
//     audioContext = new AudioContext({
//       sampleRate: 24000,
//     });
//   }

//   return audioContext;
// }

// export async function playPCM(base64PCM) {
//   if (!base64PCM) return;

//   const ctx = getAudioContext();

//   // Resume if browser suspended AudioContext
//   if (ctx.state === "suspended") {
//     await ctx.resume();
//   }

//   // Base64 -> bytes
//   const binary = atob(base64PCM);

//   const pcm = new Int16Array(binary.length / 2);

//   for (let i = 0; i < pcm.length; i++) {
//     pcm[i] =
//       binary.charCodeAt(i * 2) |
//       (binary.charCodeAt(i * 2 + 1) << 8);
//   }

//   // Int16 -> Float32
//   const float = new Float32Array(pcm.length);

//   for (let i = 0; i < pcm.length; i++) {
//     float[i] = pcm[i] / 32768;
//   }

//   const buffer = ctx.createBuffer(
//     1,
//     float.length,
//     24000
//   );

//   buffer.copyToChannel(float, 0);

//   const source = ctx.createBufferSource();
//   source.buffer = buffer;
//   source.connect(ctx.destination);

//   // Queue playback
//   if (nextPlayTime < ctx.currentTime) {
//     nextPlayTime = ctx.currentTime;
//   }

//   source.start(nextPlayTime);

//   nextPlayTime += buffer.duration;

//   // AI is speaking
//   ConversationManager.onAISpeaking();

//   // Reset finish timer whenever a new chunk arrives
//   clearTimeout(finishTimer);

//   finishTimer = setTimeout(() => {

//     nextPlayTime = ctx.currentTime;

//     ConversationManager.onAIFinished();

//   }, 350);
// }

import ConversationManager from "../conversation/conversationManager";

let currentSource = null;
let audioContext = null;

let audioQueue = [];

let isPlaying = false;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext({
      sampleRate: 24000,
    });
  }

  return audioContext;
}

export function playPCM(base64PCM) {
  if (!base64PCM) return;

  audioQueue.push(base64PCM);

  if (!isPlaying) {
    playNext();
  }
}

function playNext() {
  if (audioQueue.length === 0) {
    isPlaying = false;

    if (ConversationManager.turnComplete) {
      ConversationManager.onAIFinished();
    }

    return;
  }

  isPlaying = true;

  const base64PCM = audioQueue.shift();

  const ctx = getAudioContext();

  const binary = atob(base64PCM);

  const pcm = new Int16Array(binary.length / 2);

  for (let i = 0; i < pcm.length; i++) {
    pcm[i] = binary.charCodeAt(i * 2) | (binary.charCodeAt(i * 2 + 1) << 8);
  }

  const float32 = new Float32Array(pcm.length);

  for (let i = 0; i < pcm.length; i++) {
    float32[i] = pcm[i] / 32768;
  }

  const buffer = ctx.createBuffer(1, float32.length, 24000);

  buffer.copyToChannel(float32, 0);

  const source = ctx.createBufferSource();
  currentSource = source;

  source.buffer = buffer;

  source.connect(ctx.destination);

  source.onended = () => {
    playNext();
  };

  source.start();
}

export function stopAudio() {
  audioQueue = [];

  if (currentSource) {
    try {
      currentSource.stop();
    } catch {}

    currentSource.disconnect();

    currentSource = null;
  }

  isPlaying = false;

  console.log("🛑 AI Audio Stopped");
}

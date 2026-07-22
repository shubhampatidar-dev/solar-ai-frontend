class RecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.buffer = new Float32Array(2048);
    this.offset = 0;
  }

  process(inputs) {
    const input = inputs[0];

    if (!input.length) {
      return true;
    }

    const channel = input[0];

    for (let i = 0; i < channel.length; i++) {
      this.buffer[this.offset++] = channel[i];

      if (this.offset >= this.buffer.length) {
        this.port.postMessage(this.buffer);

        this.buffer = new Float32Array(2048);

        this.offset = 0;
      }
    }

    return true;
  }
}

registerProcessor(
  "recorder-processor",
  RecorderProcessor
);
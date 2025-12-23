import Peer from 'simple-peer';

export const callService = {
  createPeer(initiator, stream, onSignal, onStream) {
    const peer = new Peer({
      initiator,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });

    if (onSignal) peer.on('signal', onSignal);
    if (onStream) peer.on('stream', onStream);

    return peer;
  },

  async getMediaStream(constraints = { video: true, audio: true }) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Unable to access camera/microphone');
    }
  },

  stopMediaStream(stream) {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  },

  createCallId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
};
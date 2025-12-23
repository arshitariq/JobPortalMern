import { useState, useRef, useCallback, useEffect } from 'react';
import Peer from 'simple-peer';

export default function useCallManagement({ socket, currentUserId }) {
  const [call, setCall] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState(null);
  
  const myVideoRef = useRef();
  const userVideoRef = useRef();
  const peerRef = useRef();

  // Initialize media stream
  useEffect(() => {
    const initMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setStream(mediaStream);
        
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    initMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCall = useCallback((chat, type = 'video') => {
    if (!chat || !socket || !stream) return;

    const otherParticipant = chat.participants?.find(
      p => p.user?._id !== currentUserId && p.user !== currentUserId
    );
    
    if (!otherParticipant) return;

    const callId = Date.now().toString();
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream
    });

    peer.on('signal', (signal) => {
      socket.emit('call-user', {
        userToCall: otherParticipant.user?._id || otherParticipant.user,
        signalData: signal,
        from: currentUserId,
        name: 'You',
        type,
        callId
      });
    });

    peer.on('stream', (remoteStream) => {
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = remoteStream;
      }
    });

    peer.on('close', () => {
      endCall();
    });

    peerRef.current = peer;

    setCall({
      isReceivingCall: false,
      from: otherParticipant.user?._id || otherParticipant.user,
      name: otherParticipant.user?.name || 'User',
      type,
      callId
    });
  }, [socket, stream, currentUserId]);

  const answerCall = useCallback(() => {
    if (!call || !stream || !socket) return;

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream
    });

    peer.on('signal', (signal) => {
      socket.emit('answer-call', {
        to: call.from,
        signal,
        callId: call.callId
      });
    });

    peer.on('stream', (remoteStream) => {
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = remoteStream;
      }
    });

    peer.on('close', () => {
      endCall();
    });

    peer.signal(call.signal);
    peerRef.current = peer;
    setCallAccepted(true);
  }, [call, stream, socket]);

  const endCall = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach(track => {
        if (track.readyState === 'live') {
          track.stop();
        }
      });
    }

    if (socket && call?.from) {
      socket.emit('end-call', {
        to: call.from,
        callId: call.callId
      });
    }

    setCall(null);
    setCallAccepted(false);
    setCallEnded(true);
  }, [call, socket, stream]);

  return {
    call,
    callAccepted,
    callEnded,
    stream,
    startCall,
    answerCall,
    endCall,
    myVideoRef,
    userVideoRef,
    setCall
  };
}
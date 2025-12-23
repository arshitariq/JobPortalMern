import React, { useState, useEffect } from 'react';
import { X, Phone, PhoneOff } from 'lucide-react';
import CallControls from './CallControls';

const CallTimer = ({ startTime }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setSeconds(elapsed);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return <span className="text-white text-sm">{formatTime(seconds)}</span>;
};

export default function CallUI({ 
  call,
  callAccepted,
  callEnded,
  myVideoRef,
  userVideoRef,
  stream,
  onAnswer,
  onEnd,
  socket
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callStartTime, setCallStartTime] = useState(null);

  useEffect(() => {
    if (callAccepted && !callEnded) {
      setCallStartTime(Date.now());
    } else {
      setCallStartTime(null);
    }
  }, [callAccepted, callEnded]);

  const handleToggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const handleToggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // You would typically handle speakerphone logic here
    // This depends on your specific audio routing requirements
  };

  const handleEndCall = () => {
    onEnd();
    setIsMuted(false);
    setIsVideoOff(false);
    setIsSpeakerOn(true);
  };

  const handleRejectCall = () => {
    if (socket && call?.from) {
      socket.emit('reject-call', { to: call.from, callId: call.callId });
    }
    onEnd();
  };

  if (!call && !callAccepted) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={handleEndCall}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="max-w-6xl w-full h-full p-4 flex flex-col">
        {/* Call info */}
        <div className="text-white text-center mb-4">
          <h2 className="text-2xl font-bold mb-1">
            {call?.isReceivingCall && !callAccepted
              ? `Incoming ${call.type} call`
              : callAccepted
              ? call?.type === 'video' ? 'Video Call' : 'Audio Call'
              : 'Calling...'}
          </h2>
          <p className="text-lg text-gray-300">
            {call?.isReceivingCall && !callAccepted
              ? `${call.name} is calling...`
              : call?.name || 'Connecting...'}
          </p>
          {callAccepted && callStartTime && (
            <div className="mt-2">
              <CallTimer startTime={callStartTime} />
            </div>
          )}
        </div>

        {/* Video streams */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* My video */}
          {stream && call?.type === 'video' && (
            <div className="relative bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-700">
              <video
                playsInline
                muted
                ref={myVideoRef}
                autoPlay
                className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
              />
              {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">
                      {call?.name?.charAt(0) || 'Y'}
                    </span>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                <span className="text-white text-sm">You {isMuted && '(Muted)'}</span>
              </div>
            </div>
          )}

          {/* Other user's video */}
          {callAccepted && !callEnded && call?.type === 'video' && (
            <div className="relative bg-gray-900 rounded-xl overflow-hidden border-2 border-green-500">
              <video
                playsInline
                ref={userVideoRef}
                autoPlay
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                <span className="text-white text-sm">{call?.name}</span>
              </div>
            </div>
          )}

          {/* Audio call UI */}
          {call?.type === 'audio' && (
            <div className="col-span-2 flex flex-col items-center justify-center">
              <div className="w-48 h-48 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-4xl">
                    {call?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{call?.name}</h3>
              <p className="text-gray-300">
                {callAccepted ? 'Audio call in progress' : 'Audio call...'}
              </p>
            </div>
          )}
        </div>

        {/* Call controls */}
        <div className="flex flex-col items-center">
          {call?.isReceivingCall && !callAccepted ? (
            <div className="flex items-center gap-4">
              <button
                onClick={handleRejectCall}
                className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                title="Decline"
              >
                <PhoneOff className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={onAnswer}
                className="p-4 bg-green-500 hover:bg-green-600 rounded-full transition-colors"
                title="Answer"
              >
                <Phone className="h-6 w-6 text-white" />
              </button>
            </div>
          ) : (
            <CallControls
              onEndCall={handleEndCall}
              onToggleAudio={handleToggleAudio}
              onToggleVideo={handleToggleVideo}
              onToggleSpeaker={handleToggleSpeaker}
              isMuted={isMuted}
              isVideoOff={isVideoOff}
              isSpeakerOn={isSpeakerOn}
              callType={call?.type}
            />
          )}
        </div>
      </div>
    </div>
  );
}
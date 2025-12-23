import React from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX } from 'lucide-react';

export default function CallControls({ 
  onEndCall, 
  onToggleAudio, 
  onToggleVideo, 
  onToggleSpeaker,
  isMuted = false,
  isVideoOff = false,
  isSpeakerOn = true,
  callType = 'video'
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Audio Toggle */}
      <button
        onClick={onToggleAudio}
        className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <MicOff className="h-6 w-6 text-white" />
        ) : (
          <Mic className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Video Toggle (only for video calls) */}
      {callType === 'video' && (
        <button
          onClick={onToggleVideo}
          className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
          title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
        >
          {isVideoOff ? (
            <VideoOff className="h-6 w-6 text-white" />
          ) : (
            <Video className="h-6 w-6 text-white" />
          )}
        </button>
      )}

      {/* Speaker Toggle */}
      <button
        onClick={onToggleSpeaker}
        className={`p-4 rounded-full ${isSpeakerOn ? 'bg-green-500' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
        title={isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
      >
        {isSpeakerOn ? (
          <Volume2 className="h-6 w-6 text-white" />
        ) : (
          <VolumeX className="h-6 w-6 text-white" />
        )}
      </button>

      {/* End Call */}
      <button
        onClick={onEndCall}
        className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
        title="End call"
      >
        <PhoneOff className="h-6 w-6 text-white" />
      </button>
    </div>
  );
}
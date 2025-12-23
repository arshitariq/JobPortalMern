import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Smile, Paperclip, Mic, Image, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useDropzone } from 'react-dropzone';

export default function MessageInput({ onSend, disabled, onTyping, chatId, socket, currentUserId }) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [voicePreview, setVoicePreview] = useState(null);
  const [voiceError, setVoiceError] = useState('');
  
  const textareaRef = useRef();
  const audioChunksRef = useRef([]);
  const typingTimeoutRef = useRef();

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setAttachments(prev => [...prev, ...acceptedFiles]);
    },
    multiple: true,
    noClick: true
  });

  const handleTyping = (isTyping) => {
    if (!socket || !chatId || !currentUserId) return;

    socket.emit('typing', { chatId, isTyping });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => handleTyping(false), 3000);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    handleTyping(value.length > 0);
  };

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;

    if (onSend) {
      onSend(message, attachments.length > 0 ? 'media' : 'text', attachments);
      setMessage('');
      setAttachments([]);
      setShowEmojiPicker(false);
      handleTyping(false);
      if (voicePreview) {
        URL.revokeObjectURL(voicePreview.url);
        setVoicePreview(null);
      }
      if (voiceError) setVoiceError('');
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    
    if (e.key === 'Enter' && e.shiftKey) {
      // Allow new line
      const cursorPos = e.target.selectionStart;
      const newValue = message.substring(0, cursorPos) + '\n' + message.substring(cursorPos);
      setMessage(newValue);
      
      setTimeout(() => {
        e.target.selectionStart = cursorPos + 1;
        e.target.selectionEnd = cursorPos + 1;
      }, 0);
    }
  };

  const getSupportedAudioMimeType = () => {
    const preferredTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg'
    ];
    return preferredTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';
  };

  const getAudioDuration = (url) => new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = url;

    const cleanup = () => {
      audio.src = '';
    };

    const finalize = (duration) => {
      cleanup();
      resolve(Number.isFinite(duration) ? duration : 0);
    };

    audio.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(audio.duration) && audio.duration !== Infinity) {
        finalize(audio.duration);
        return;
      }

      const handleTimeUpdate = () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        finalize(audio.duration);
      };
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.currentTime = 1e101;
    }, { once: true });

    audio.addEventListener('error', () => finalize(0), { once: true });
  });

  const formatDuration = (seconds) => {
    const totalSeconds = Math.max(0, Math.floor(seconds || 0));
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const startRecording = useCallback(async () => {
    if (recording) return;
    try {
      setVoiceError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedAudioMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      audioChunksRef.current = [];
      if (voicePreview) {
        URL.revokeObjectURL(voicePreview.url);
        setVoicePreview(null);
      }

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const chunks = audioChunksRef.current;
        if (!chunks.length) {
          setVoiceError('No audio captured. Try again.');
          stream.getTracks().forEach(track => track.stop());
          setMediaRecorder(null);
          return;
        }

        const blobType = mimeType || 'audio/webm';
        const audioBlob = new Blob(chunks, { type: blobType });
        if (!audioBlob.size) {
          setVoiceError('No audio captured. Try again.');
          stream.getTracks().forEach(track => track.stop());
          setMediaRecorder(null);
          return;
        }

        const url = URL.createObjectURL(audioBlob);
        const duration = await getAudioDuration(url);
        setVoicePreview({ blob: audioBlob, url, duration });
        
        stream.getTracks().forEach(track => track.stop());
        setMediaRecorder(null);
      };

      recorder.start(250);
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (error) {
      console.error('Error recording audio:', error);
      setVoiceError('Microphone access failed. Check permission.');
    }
  }, [recording, voicePreview]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      if (typeof mediaRecorder.requestData === 'function') {
        mediaRecorder.requestData();
      }
      mediaRecorder.stop();
    }
    setRecording(false);
  }, [mediaRecorder]);

  const handleGlobalRelease = useCallback(() => {
    if (recording) {
      stopRecording();
    }
  }, [recording, stopRecording]);

  useEffect(() => {
    window.addEventListener('mouseup', handleGlobalRelease);
    window.addEventListener('touchend', handleGlobalRelease);
    return () => {
      window.removeEventListener('mouseup', handleGlobalRelease);
      window.removeEventListener('touchend', handleGlobalRelease);
    };
  }, [handleGlobalRelease]);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  const addEmoji = (emojiObject) => {
    setMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendVoice = () => {
    if (!voicePreview || !onSend) return;
    onSend('Voice message', 'voice', [{ blob: voicePreview.blob, duration: voicePreview.duration }]);
    URL.revokeObjectURL(voicePreview.url);
    setVoicePreview(null);
    if (voiceError) setVoiceError('');
  };

  const handleCancelVoice = () => {
    if (!voicePreview) return;
    URL.revokeObjectURL(voicePreview.url);
    setVoicePreview(null);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  useEffect(() => {
    return () => {
      if (voicePreview) {
        URL.revokeObjectURL(voicePreview.url);
      }
    };
  }, [voicePreview]);

  return (
    <div {...getRootProps()} className="border-t border-gray-200 bg-white">
      <input {...getInputProps()} />
      
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-b bg-gray-50">
          <div className="flex items-center gap-2 overflow-x-auto">
            {attachments.map((file, index) => (
              <div key={index} className="relative">
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Attachment"
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <Paperclip className="h-6 w-6 text-gray-500" />
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(index)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-3">
        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={disabled}
            type="button"
          >
            <Smile className="h-5 w-5 text-gray-600" />
          </button>

          <button
            onClick={() => document.getElementById('file-input').click()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={disabled}
            type="button"
          >
            <Paperclip className="h-5 w-5 text-gray-600" />
          </button>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
            rows={1}
            disabled={disabled}
          />

          <input
            id="file-input"
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                setAttachments(prev => [...prev, ...Array.from(e.target.files)]);
              }
            }}
          />

          {message.trim() || attachments.length > 0 ? (
            <button
              onClick={handleSend}
              className="p-3 bg-green-500 hover:bg-green-600 rounded-full transition-colors"
              disabled={disabled}
              type="button"
            >
              <Send className="h-5 w-5 text-white" />
            </button>
          ) : (
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              onTouchCancel={stopRecording}
              className={`p-3 rounded-full transition-colors ${
                recording ? 'bg-red-500' : 'bg-gray-200 hover:bg-gray-300'
              }`}
              disabled={disabled || !!voicePreview}
              type="button"
            >
              <Mic className={`h-5 w-5 ${recording ? 'text-white' : 'text-gray-600'}`} />
            </button>
          )}
        </div>

        {recording && (
          <div className="mt-2 flex items-center gap-2 text-sm text-red-500">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Recording... Release to preview</span>
          </div>
        )}

        {voiceError && (
          <div className="mt-2 text-sm text-red-500">
            {voiceError}
          </div>
        )}

        {voicePreview && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
            <audio controls src={voicePreview.url} className="flex-1" />
            <span className="text-xs text-gray-600">
              {formatDuration(voicePreview.duration)}
            </span>
            <button
              onClick={handleCancelVoice}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              type="button"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={handleSendVoice}
              className="p-2 bg-green-500 hover:bg-green-600 rounded-full transition-colors"
              type="button"
            >
              <Send className="h-4 w-4 text-white" />
            </button>
          </div>
        )}

        {showEmojiPicker && (
          <div className="absolute bottom-20 left-4 z-50">
            <EmojiPicker onEmojiClick={addEmoji} theme="light" />
          </div>
        )}
      </div>
    </div>
  );
}

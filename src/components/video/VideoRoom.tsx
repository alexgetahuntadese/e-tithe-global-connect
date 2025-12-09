import React, { useEffect, useRef, useState, useCallback } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users, MessageSquare, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoRoomProps {
  roomUrl: string;
  onLeave?: () => void;
  userName?: string;
}

const VideoRoom: React.FC<VideoRoomProps> = ({ roomUrl, onLeave, userName }) => {
  const { toast } = useToast();
  const callRef = useRef<DailyCall | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [participantCount, setParticipantCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const updateParticipantCount = useCallback(() => {
    if (callRef.current) {
      const participants = callRef.current.participants();
      setParticipantCount(Object.keys(participants).length);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || !roomUrl) return;

    const initCall = async () => {
      try {
        setIsLoading(true);
        
        const call = DailyIframe.createCallObject({
          showLeaveButton: false,
          showFullscreenButton: true,
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: '0',
            borderRadius: '12px',
          },
        });

        callRef.current = call;

        call.on('joined-meeting', () => {
          setIsJoined(true);
          setIsLoading(false);
          updateParticipantCount();
          toast({
            title: "Connected",
            description: "You've joined the video call",
          });
        });

        call.on('left-meeting', () => {
          setIsJoined(false);
          onLeave?.();
        });

        call.on('participant-joined', updateParticipantCount);
        call.on('participant-left', updateParticipantCount);

        call.on('error', (error) => {
          console.error('Daily error:', error);
          toast({
            title: "Connection Error",
            description: error?.errorMsg || "Failed to connect to video call",
            variant: "destructive",
          });
          setIsLoading(false);
        });

        await call.join({
          url: roomUrl,
          userName: userName || 'Guest',
        });

      } catch (error) {
        console.error('Error initializing call:', error);
        toast({
          title: "Error",
          description: "Failed to initialize video call",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    initCall();

    return () => {
      if (callRef.current) {
        callRef.current.leave();
        callRef.current.destroy();
      }
    };
  }, [roomUrl, userName, onLeave, toast, updateParticipantCount]);

  const toggleVideo = async () => {
    if (callRef.current) {
      await callRef.current.setLocalVideo(!isVideoOn);
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleAudio = async () => {
    if (callRef.current) {
      await callRef.current.setLocalAudio(!isAudioOn);
      setIsAudioOn(!isAudioOn);
    }
  };

  const leaveCall = async () => {
    if (callRef.current) {
      await callRef.current.leave();
      onLeave?.();
    }
  };

  const startScreenShare = async () => {
    if (callRef.current) {
      try {
        await callRef.current.startScreenShare();
        toast({
          title: "Screen Sharing",
          description: "You are now sharing your screen",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to start screen share",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="w-full h-full bg-card border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Video Call
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{participantCount} participant{participantCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        {isLoading && (
          <div className="flex items-center justify-center h-[400px] bg-muted/30 rounded-lg">
            <div className="text-center space-y-3">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-muted-foreground">Connecting to video call...</p>
            </div>
          </div>
        )}
        
        <div 
          ref={containerRef} 
          className={`relative bg-black rounded-lg overflow-hidden ${isLoading ? 'hidden' : ''}`}
          style={{ height: '400px' }}
        >
          {callRef.current && (
            <iframe
              title="Daily Video Call"
              src={roomUrl}
              allow="camera; microphone; fullscreen; speaker; display-capture"
              className="w-full h-full border-0 rounded-lg"
            />
          )}
        </div>

        {isJoined && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <Button
              variant={isVideoOn ? "secondary" : "destructive"}
              size="icon"
              onClick={toggleVideo}
              className="h-12 w-12 rounded-full"
            >
              {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
            
            <Button
              variant={isAudioOn ? "secondary" : "destructive"}
              size="icon"
              onClick={toggleAudio}
              className="h-12 w-12 rounded-full"
            >
              {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>

            <Button
              variant="secondary"
              size="icon"
              onClick={startScreenShare}
              className="h-12 w-12 rounded-full"
            >
              <Monitor className="h-5 w-5" />
            </Button>

            <Button
              variant="destructive"
              size="icon"
              onClick={leaveCall}
              className="h-12 w-12 rounded-full"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoRoom;

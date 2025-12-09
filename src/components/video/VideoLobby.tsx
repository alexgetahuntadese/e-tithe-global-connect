import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Users, Shield, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import VideoRoom from './VideoRoom';

const VideoLobby: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [joinRoomUrl, setJoinRoomUrl] = useState('');

  const createRoom = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-daily-room', {
        body: { 
          roomName: `tithe-${Date.now()}`,
          expiryMinutes: 120 
        },
      });

      if (error) throw error;

      setRoomUrl(data.url);
      toast({
        title: "Room Created",
        description: "Your video room is ready. Share the link with others!",
      });
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: "Failed to create video room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = () => {
    if (!joinRoomUrl.trim()) {
      toast({
        title: "Missing URL",
        description: "Please enter a room URL to join",
        variant: "destructive",
      });
      return;
    }
    setRoomUrl(joinRoomUrl.trim());
  };

  const handleLeave = () => {
    setRoomUrl(null);
    setJoinRoomUrl('');
  };

  if (roomUrl) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-4 p-3 bg-muted/50 rounded-lg flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">Room URL: </span>
            <code className="text-xs bg-background px-2 py-1 rounded">{roomUrl}</code>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigator.clipboard.writeText(roomUrl)}
          >
            Copy Link
          </Button>
        </div>
        <VideoRoom 
          roomUrl={roomUrl} 
          userName={userName || 'Guest'}
          onLeave={handleLeave}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader className="text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Video className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Video Consultation</CardTitle>
          <CardDescription>
            Connect with church leaders or support through secure video calls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Your Name</label>
            <Input
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Create New Room
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start a new video call and invite others
                </p>
                <Button 
                  onClick={createRoom} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Room'
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-secondary" />
                  Join Existing Room
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter a room URL to join a call
                </p>
                <div className="space-y-2">
                  <Input
                    placeholder="https://..."
                    value={joinRoomUrl}
                    onChange={(e) => setJoinRoomUrl(e.target.value)}
                  />
                  <Button 
                    variant="secondary"
                    onClick={joinRoom}
                    className="w-full"
                  >
                    Join Room
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-4 border-t">
            <Shield className="h-3 w-3" />
            <span>End-to-end encrypted video calls powered by Daily.co</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoLobby;

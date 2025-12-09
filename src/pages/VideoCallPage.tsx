import React from 'react';
import VideoLobby from '@/components/video/VideoLobby';

const VideoCallPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 md:py-12">
        <VideoLobby />
      </div>
    </div>
  );
};

export default VideoCallPage;

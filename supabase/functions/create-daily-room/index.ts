import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY');
    if (!DAILY_API_KEY) {
      throw new Error('DAILY_API_KEY is not set');
    }

    const { roomName, expiryMinutes = 60 } = await req.json();

    console.log('Creating Daily room:', roomName);

    // Create a new room
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName || undefined,
        properties: {
          exp: Math.floor(Date.now() / 1000) + expiryMinutes * 60,
          enable_chat: true,
          enable_screenshare: true,
          enable_knocking: true,
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Daily API error:', data);
      throw new Error(data.error || 'Failed to create room');
    }

    console.log('Room created successfully:', data.url);

    return new Response(JSON.stringify({
      url: data.url,
      name: data.name,
      id: data.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

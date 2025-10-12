/**
 * Cloudflare Worker API for NormalDance
 * Handles backend services for the music platform
 */

export interface Env {
  // Environment bindings from Cloudflare
  DATABASE_URL: string;
  JWT_SECRET: string;
  SENTRY_DSN?: string;
  REDIS_URL?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname, method } = request;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route handling
      switch (pathname) {
        case '/api/health':
          return handleHealthCheck(env, corsHeaders);
          
        case '/api/tracks':
          if (method === 'GET') return handleGetTracks(env, request, corsHeaders);
          if (method === 'POST') return handleCreateTrack(env, request, corsHeaders);
          break;
          
        case '/api/artists':
          if (method === 'GET') return handleGetArtists(env, request, corsHeaders);
          break;
          
        case '/api/grave/donations':
          if (method === 'POST') return handleGraveDonation(env, request, corsHeaders);
          break;
          
        default:
          return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal Server Error' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
};

// Health check endpoint
async function handleHealthCheck(env: Env, headers: HeadersInit): Promise<Response> {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'grave-api',
    environment: 'production',
  };

  return new Response(JSON.stringify(health), {
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}

// Get tracks endpoint
async function handleGetTracks(env: Env, request: Request, headers: HeadersInit): Promise<Response> {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  // Mock data for now
  const tracks = [
    {
      id: '1',
      title: 'Sample Track 1',
      artist: 'Artist 1',
      duration: 180,
      genre: 'Electronic',
      url: 'https://example.com/track1.mp3'
    },
    {
      id: '2', 
      title: 'Sample Track 2',
      artist: 'Artist 2',
      duration: 240,
      genre: 'House',
      url: 'https://example.com/track2.mp3'
    }
  ];

  return new Response(JSON.stringify({ 
    tracks: tracks.slice(offset, offset + limit),
    total: tracks.length
  }), {
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}

// Create track endpoint
async function handleCreateTrack(env: Env, request: Request, headers: HeadersInit): Promise<Response> {
  try {
    const trackData = await request.json();
    
    // Here you would typically save to database
    const newTrack = {
      id: Date.now().toString(),
      ...trackData,
      createdAt: new Date().toISOString()
    };

    return new Response(JSON.stringify(newTrack), {
      status: 201,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON data' }), 
      { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  }
}

// Get artists endpoint
async function handleGetArtists(env: Env, request: Request, headers: HeadersInit): Promise<Response> {
  const artists = [
    { id: '1', name: 'Artist 1', genre: 'Electronic', tracks: 12 },
    { id: '2', name: 'Artist 2', genre: 'House', tracks: 8 }
  ];

  return new Response(JSON.stringify({ artists }), {
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}

// Grave donation endpoint
async function handleGraveDonation(env: Env, request: Request, headers: HeadersInit): Promise<Response> {
  try {
    const donationData = await request.json();
    
    // Process donation logic
    const donation = {
      id: Date.now().toString(),
      amount: donationData.amount,
      memorialId: donationData.memorialId,
      message: donationData.message,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(donation), {
      status: 201,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Invalid donation data' }), 
      { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  }
}

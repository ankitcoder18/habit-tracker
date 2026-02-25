import app from '../server.js';

// Handle both CommonJS and ESM
let server;

export default async (req, res) => {
  try {
    // Make sure app is initialized
    if (!server) {
      server = app;
    }
    
    // Call the express app
    return server(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

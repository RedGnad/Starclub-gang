import { Router } from 'express';

const router = Router();

// Stockage temporaire en mémoire (en attendant la vraie DB)
const userSessions = new Map<string, any>();
const userVerifications = new Map<string, any>();
const userMissions = new Map<string, any>();

// POST /api/sessions/:address/auth - Stocker signature SIWE
router.post('/:address/auth', async (req, res) => {
  try {
    const { address } = req.params;
    const { signature, message, timestamp } = req.body;
    
    if (!address || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Address and signature required'
      });
    }

    const normalizedAddress = address.toLowerCase();
    const sessionData = {
      address: normalizedAddress,
      signature,
      message,
      timestamp: timestamp || Date.now(),
      lastSeen: Date.now(),
      isAuthenticated: true
    };
    
    userSessions.set(normalizedAddress, sessionData);
    console.log(`✅ SIWE session stored for ${normalizedAddress}`);
    
    res.json({
      success: true,
      data: {
        address: normalizedAddress,
        authenticated: true,
        timestamp: sessionData.timestamp
      }
    });

  } catch (error) {
    console.error('Error storing session:', error);
    res.status(500).json({
      success: false,
      error: 'Error storing session'
    });
  }
});

// GET /api/sessions/:address/auth - Vérifier session SIWE
router.get('/:address/auth', async (req, res) => {
  try {
    const { address } = req.params;
    const normalizedAddress = address.toLowerCase();
    
    const session = userSessions.get(normalizedAddress);
    
    res.json({
      success: true,
      data: {
        address: normalizedAddress,
        authenticated: !!session,
        timestamp: session?.timestamp || null,
        lastSeen: session?.lastSeen || null
      }
    });

  } catch (error) {
    console.error('Error checking session:', error);
    res.status(500).json({
      success: false,
      error: 'Error checking session'
    });
  }
});

// POST /api/sessions/:address/verification - Stocker état vérification
router.post('/:address/verification', async (req, res) => {
  try {
    const { address } = req.params;
    const { dappId, dappName, initialCount, startTime } = req.body;
    
    const normalizedAddress = address.toLowerCase();
    const verificationData = {
      dappId,
      dappName,
      initialCount,
      startTime,
      address: normalizedAddress,
      timestamp: Date.now()
    };
    
    userVerifications.set(`${normalizedAddress}_${dappId}`, verificationData);
    
    res.json({
      success: true,
      data: verificationData
    });

  } catch (error) {
    console.error('Error storing verification:', error);
    res.status(500).json({
      success: false,
      error: 'Error storing verification'
    });
  }
});

// GET /api/sessions/:address/verification/:dappId - Récupérer état vérification
router.get('/:address/verification/:dappId', async (req, res) => {
  try {
    const { address, dappId } = req.params;
    const normalizedAddress = address.toLowerCase();
    
    const verification = userVerifications.get(`${normalizedAddress}_${dappId}`);
    
    res.json({
      success: true,
      data: verification || null
    });

  } catch (error) {
    console.error('Error getting verification:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting verification'
    });
  }
});

// DELETE /api/sessions/:address/verification/:dappId - Supprimer vérification
router.delete('/:address/verification/:dappId', async (req, res) => {
  try {
    const { address, dappId } = req.params;
    const normalizedAddress = address.toLowerCase();
    
    const key = `${normalizedAddress}_${dappId}`;
    const existed = userVerifications.has(key);
    userVerifications.delete(key);
    
    res.json({
      success: true,
      data: {
        deleted: existed,
        key
      }
    });

  } catch (error) {
    console.error('Error deleting verification:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting verification'
    });
  }
});

export { router as sessionsRoutes };

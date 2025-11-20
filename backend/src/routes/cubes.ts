import { Router } from 'express';

const router = Router();

// Stockage temporaire en mémoire (en attendant la vraie DB)
const userCubes = new Map<string, number>();

// GET /api/cubes/:address - Récupérer les cubes d'un utilisateur
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Address required'
      });
    }

    const cubes = userCubes.get(address.toLowerCase()) || 0;
    
    res.json({
      success: true,
      data: {
        address: address.toLowerCase(),
        cubes,
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Error getting user cubes:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting user cubes'
    });
  }
});

// POST /api/cubes/:address/increment - Ajouter un cube
router.post('/:address/increment', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Address required'
      });
    }

    const normalizedAddress = address.toLowerCase();
    const currentCubes = userCubes.get(normalizedAddress) || 0;
    const newCubes = currentCubes + 1;
    
    userCubes.set(normalizedAddress, newCubes);
    
    console.log(`🎲 Cube earned! ${normalizedAddress}: ${currentCubes} -> ${newCubes}`);
    
    res.json({
      success: true,
      data: {
        address: normalizedAddress,
        cubes: newCubes,
        increment: 1,
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Error incrementing user cubes:', error);
    res.status(500).json({
      success: false,
      error: 'Error incrementing user cubes'
    });
  }
});

// GET /api/cubes - Leaderboard des cubes (top 10)
router.get('/', async (req, res) => {
  try {
    const leaderboard = Array.from(userCubes.entries())
      .map(([address, cubes]) => ({ address, cubes }))
      .sort((a, b) => b.cubes - a.cubes)
      .slice(0, 10);
    
    res.json({
      success: true,
      data: {
        leaderboard,
        total: userCubes.size
      }
    });

  } catch (error) {
    console.error('Error getting cubes leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting cubes leaderboard'
    });
  }
});

export { router as cubesRoutes };

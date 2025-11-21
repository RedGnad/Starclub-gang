import { Router } from 'express';
import { prisma, getOrCreateUser } from '../services/database.js';

const router = Router();

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

    const user = await getOrCreateUser(address);
    
    res.json({
      success: true,
      data: {
        address: user.address,
        cubes: user.cubes,
        lastUpdated: user.updatedAt
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

    const user = await getOrCreateUser(address);
    
    // Incrémenter les cubes dans la database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { cubes: user.cubes + 1 }
    });
    
    console.log(`🎲 Cube earned! ${user.address}: ${user.cubes} -> ${updatedUser.cubes}`);
    
    res.json({
      success: true,
      data: {
        address: updatedUser.address,
        cubes: updatedUser.cubes,
        increment: 1,
        lastUpdated: updatedUser.updatedAt
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
    const leaderboard = await prisma.user.findMany({
      where: { cubes: { gt: 0 } },
      orderBy: { cubes: 'desc' },
      take: 10,
      select: {
        address: true,
        cubes: true
      }
    });
    
    const total = await prisma.user.count({
      where: { cubes: { gt: 0 } }
    });
    
    res.json({
      success: true,
      data: {
        leaderboard,
        total
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

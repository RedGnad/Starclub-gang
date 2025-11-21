import { Router } from 'express';
import { prisma } from '../services/database.js';

const router = Router();

// Endpoint de debug pour tester la connexion DB
router.get('/db-test', async (req, res) => {
  try {
    // Test simple de connexion
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    res.json({
      success: true,
      message: 'Database connection OK',
      result: result
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

// Test de création d'utilisateur simple
router.get('/create-test-user', async (req, res) => {
  try {
    const testAddress = '0x1234567890123456789012345678901234567890';
    
    const user = await prisma.user.upsert({
      where: { address: testAddress },
      update: {},
      create: { address: testAddress }
    });
    
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

export const debugRoutes = router;

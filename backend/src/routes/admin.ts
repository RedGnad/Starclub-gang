import express from 'express';
import { 
  updateRealFollowers, 
  getRealFollowersCache,
  cleanOldCacheData 
} from '../services/twitterFollowersCache.js';

const router = express.Router();

/**
 * GET /api/admin/followers
 * Récupère la liste des followers en cache
 */
router.get('/followers', (req, res) => {
  try {
    const cache = getRealFollowersCache();
    res.json({
      success: true,
      data: cache,
      count: Object.keys(cache).length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/followers
 * Ajoute ou met à jour des followers réels
 */
router.post('/followers', (req, res) => {
  try {
    const { username, followers, source = 'manual' } = req.body;
    
    if (!username || typeof followers !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Username and followers (number) are required'
      });
    }

    if (followers < 0 || followers > 10000000) {
      return res.status(400).json({
        success: false,
        error: 'Followers must be between 0 and 10M'
      });
    }

    updateRealFollowers(username, followers, source);
    
    res.json({
      success: true,
      message: `Updated @${username} with ${followers.toLocaleString()} followers`,
      data: {
        username,
        followers,
        source,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/followers/batch
 * Ajoute plusieurs followers en batch
 */
router.post('/followers/batch', (req, res) => {
  try {
    const { followers } = req.body;
    
    if (!Array.isArray(followers)) {
      return res.status(400).json({
        success: false,
        error: 'followers must be an array'
      });
    }

    const results = [];
    
    for (const item of followers) {
      const { username, count, source = 'manual' } = item;
      
      if (!username || typeof count !== 'number') {
        results.push({
          username: username || 'unknown',
          success: false,
          error: 'Invalid username or count'
        });
        continue;
      }

      try {
        updateRealFollowers(username, count, source);
        results.push({
          username,
          success: true,
          followers: count,
          source
        });
      } catch (error) {
        results.push({
          username,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    
    res.json({
      success: true,
      message: `Processed ${results.length} items, ${successCount} successful`,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/admin/followers/cleanup
 * Nettoie les données anciennes
 */
router.delete('/followers/cleanup', (req, res) => {
  try {
    cleanOldCacheData();
    
    res.json({
      success: true,
      message: 'Old cache data cleaned successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/admin/stats
 * Statistiques du système
 */
router.get('/stats', (req, res) => {
  try {
    const cache = getRealFollowersCache();
    const entries = Object.values(cache);
    
    const stats = {
      totalAccounts: entries.length,
      realData: entries.filter(e => e.isReal).length,
      sources: entries.reduce((acc, entry) => {
        acc[entry.source] = (acc[entry.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      lastUpdated: entries.length > 0 ? 
        Math.max(...entries.map(e => e.lastUpdated.getTime())) : null,
      totalFollowers: entries.reduce((sum, e) => sum + e.followers, 0)
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as adminRoutes };

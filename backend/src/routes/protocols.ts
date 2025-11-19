import { Router } from 'express';
import { syncDApps } from '../services/discoveryApi.js';

// CACHE EN MÉMOIRE
let protocolsCache: any[] = [];
let lastSync: Date | null = null;

const router = Router();

// GET /api/protocols - Retourne le cache ou lance sync si vide
router.get('/', async (req, res) => {
  try {
    // Si cache existe et récent (moins de 1h), le retourner
    if (protocolsCache.length > 0 && lastSync && Date.now() - lastSync.getTime() < 3600000) {
      console.log(`📦 Returning cached protocols: ${protocolsCache.length}`);
      return res.json({
        success: true,
        data: {
          protocols: protocolsCache,
          total: protocolsCache.length,
          source: 'Cache',
          lastSync: lastSync
        }
      });
    }
    
    // Sinon sync en arrière-plan et retourner cache existant ou vide
    if (protocolsCache.length > 0) {
      // Sync en background
      syncDApps().then((dapps: any[]) => {
        protocolsCache = dapps;
        lastSync = new Date();
        console.log(`🔄 Background sync complete: ${dapps.length} protocols`);
      }).catch((err: any) => console.error('❌ Background sync error:', err));
      
      // Retourner cache existant immédiatement
      return res.json({
        success: true,
        data: {
          protocols: protocolsCache,
          total: protocolsCache.length,
          source: 'Cache (syncing in background)',
          lastSync: lastSync
        }
      });
    }
    
    // Premier call - pas de cache, sync bloquant
    console.log('🔄 First sync - no cache, syncing...');
    const dapps = await syncDApps();
    protocolsCache = dapps;
    lastSync = new Date();
    
    res.json({
      success: true,
      data: {
        protocols: dapps,
        total: dapps.length,
        source: 'Fresh sync'
      }
    });
  } catch (error) {
    console.error('❌ Discovery API error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des protocoles'
    });
  }
});

// POST /api/protocols/sync - Force sync des protocoles
router.post('/sync', async (req, res) => {
  try {
    console.log('🔄 Force syncing dApps...');
    
    const dapps = await syncDApps();
    
    res.json({
      success: true,
      data: {
        synced: dapps.length,
        message: 'Synchronisation forcée terminée'
      }
    });

  } catch (error) {
    console.error('Error force syncing protocols:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la synchronisation forcée'
    });
  }
});

export { router as protocolsRoutes };

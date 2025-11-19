// Cache intelligent pour les followers Twitter
// Système hybride : vrais followers + estimations blockchain

interface FollowerData {
  username: string;
  followers: number;
  lastUpdated: Date;
  isReal: boolean; // true = données réelles, false = estimation
  source: 'manual' | 'api' | 'estimated';
}

interface BlockchainMetrics {
  contractCount: number;
  totalTxCount: number;
  uniqueUsers: number;
  activityScore: number;
  qualityScore: number;
  category: string;
}

// Cache des vrais followers (données manuelles ou API)
const REAL_FOLLOWERS_CACHE: Record<string, FollowerData> = {
  // Top DeFi Projects
  'uniswap': {
    username: 'uniswap',
    followers: 1200000,
    lastUpdated: new Date('2025-11-18'),
    isReal: true,
    source: 'manual'
  },
  'balancer': {
    username: 'balancer',
    followers: 180000,
    lastUpdated: new Date('2025-11-18'),
    isReal: true,
    source: 'manual'
  },
  'aave': {
    username: 'aave',
    followers: 520000,
    lastUpdated: new Date('2025-11-18'),
    isReal: true,
    source: 'manual'
  },
  
  // Monad Ecosystem - Données réelles récupérées
  'madnessexchange': {
    username: 'madnessexchange',
    followers: 12500,
    lastUpdated: new Date('2025-11-18'),
    isReal: true,
    source: 'manual'
  },
  'pinguexchange': {
    username: 'pinguexchange',
    followers: 8900,
    lastUpdated: new Date('2025-11-18'),
    isReal: true,
    source: 'manual'
  },
  'tadle_com': {
    username: 'tadle_com',
    followers: 15200,
    lastUpdated: new Date('2025-11-18'),
    isReal: true,
    source: 'manual'
  },
  'kuruexchange': {
    username: 'kuruexchange',
    followers: 24500,
    lastUpdated: new Date('2025-11-18'),
    isReal: true,
    source: 'manual'
  },
  'atlantisdex_xyz': {
    username: 'atlantisdex_xyz',
    followers: 18200,
    lastUpdated: new Date('2025-11-18'),
    isReal: true,
    source: 'manual'
  },
  'eulerfinance': {
    username: 'eulerfinance',
    followers: 127000,
    lastUpdated: new Date('2025-11-18'),
    isReal: true,
    source: 'manual'
  },
  'eoracle_network': {
    username: 'eoracle_network',
    followers: 45200,
    lastUpdated: new Date('2025-11-18'),
    isReal: true,
    source: 'manual'
  },
  'hashflow': {
    username: 'hashflow',
    followers: 98500,
    lastUpdated: new Date('2025-11-18'),
    isReal: true,
    source: 'manual'
  }
};

/**
 * Algorithme d'estimation intelligent basé sur les métriques blockchain
 */
function estimateFollowersFromBlockchain(metrics: BlockchainMetrics): number {
  const {
    contractCount,
    totalTxCount,
    uniqueUsers,
    activityScore,
    qualityScore,
    category
  } = metrics;

  // Base par catégorie (followers de base attendus)
  const categoryBase = {
    'DEFI': 8000,
    'DEX': 12000,
    'BRIDGE': 10000,
    'NFT_MARKETPLACE': 6000,
    'LENDING': 7000,
    'GAMEFI': 5000,
    'SOCIAL': 15000,
    'INFRA': 4000,
    'GOVERNANCE': 5500,
    'TOKEN': 2500,
    'UNKNOWN': 1500,
  };

  const baseFollowers = categoryBase[category as keyof typeof categoryBase] || 1500;
  
  // Facteurs d'ajustement basés sur l'activité réelle
  const uniqueUsersFactor = Math.min(Math.sqrt(uniqueUsers / 100), 3.0); // Max 3x
  const activityFactor = Math.min(activityScore / 5.0, 2.5); // Max 2.5x
  const qualityFactor = Math.min(qualityScore / 5.0, 2.0); // Max 2x
  const contractFactor = Math.min(Math.log10(contractCount + 1), 1.5); // Max 1.5x
  const txFactor = Math.min(Math.log10(totalTxCount / 1000 + 1), 2.0); // Max 2x
  
  // Calcul composite
  const estimated = Math.round(
    baseFollowers * 
    uniqueUsersFactor * 
    activityFactor * 
    qualityFactor * 
    contractFactor * 
    txFactor * 
    (0.8 + Math.random() * 0.4) // Variation aléatoire ±20%
  );

  return Math.max(100, Math.min(estimated, 500000)); // Entre 100 et 500k
}

/**
 * Extrait le nom d'utilisateur depuis une URL Twitter
 */
function extractUsername(twitterUrl: string): string | null {
  if (!twitterUrl) return null;
  
  const match = twitterUrl.match(/(?:twitter\.com|x\.com)\/([^\/\?]+)/);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Obtient le nombre de followers pour un projet
 */
export function getFollowersCount(
  twitterUrl: string | null, 
  blockchainMetrics: BlockchainMetrics
): { count: number; isReal: boolean; source: string } {
  
  if (!twitterUrl) {
    const estimated = estimateFollowersFromBlockchain(blockchainMetrics);
    return {
      count: estimated,
      isReal: false,
      source: 'blockchain_estimation'
    };
  }

  const username = extractUsername(twitterUrl);
  
  if (!username) {
    const estimated = estimateFollowersFromBlockchain(blockchainMetrics);
    return {
      count: estimated,
      isReal: false,
      source: 'blockchain_estimation'
    };
  }

  // Chercher dans le cache des vrais followers
  const cached = REAL_FOLLOWERS_CACHE[username];
  
  if (cached) {
    // Vérifier si les données ne sont pas trop anciennes (7 jours)
    const daysSinceUpdate = (Date.now() - cached.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate <= 7) {
      return {
        count: cached.followers,
        isReal: true,
        source: cached.source
      };
    }
  }

  // Fallback : estimation basée sur la blockchain
  const estimated = estimateFollowersFromBlockchain(blockchainMetrics);
  
  return {
    count: estimated,
    isReal: false,
    source: 'blockchain_estimation'
  };
}

/**
 * Ajoute ou met à jour des données de followers réelles
 */
export function updateRealFollowers(
  username: string, 
  followers: number, 
  source: 'manual' | 'api' = 'manual'
): void {
  REAL_FOLLOWERS_CACHE[username.toLowerCase()] = {
    username: username.toLowerCase(),
    followers,
    lastUpdated: new Date(),
    isReal: true,
    source
  };
  
  console.log(`✅ Updated real followers for @${username}: ${followers.toLocaleString()} (${source})`);
}

/**
 * Obtient la liste de tous les comptes avec des données réelles
 */
export function getRealFollowersCache(): Record<string, FollowerData> {
  return { ...REAL_FOLLOWERS_CACHE };
}

/**
 * Nettoie le cache des données anciennes (> 30 jours)
 */
export function cleanOldCacheData(): void {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  for (const [username, data] of Object.entries(REAL_FOLLOWERS_CACHE)) {
    if (data.lastUpdated.getTime() < thirtyDaysAgo) {
      delete REAL_FOLLOWERS_CACHE[username];
      console.log(`🧹 Removed old cache data for @${username}`);
    }
  }
}

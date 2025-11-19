// Utilitaires pour nettoyer complètement la session wallet

/**
 * Nettoie tous les caches liés à wagmi et aux wallets
 */
export function clearWalletCache(): void {
  // Clés wagmi connues
  const wagmiKeys = [
    'wagmi.wallet',
    'wagmi.connected',
    'wagmi.store',
    'wagmi.cache',
    'wagmi.recentConnector',
    'wagmi.recentWallet',
    'wagmi.injected.shimDisconnect'
  ];
  
  // Clés spécifiques à l'app
  const appKeys = Object.keys(localStorage).filter(key => 
    key.startsWith('sherlock_auth_') ||
    key.startsWith('wagmi.') ||
    key.includes('wallet') ||
    key.includes('connector')
  );
  
  // Nettoyer toutes les clés
  [...wagmiKeys, ...appKeys].forEach(key => {
    try {
      localStorage.removeItem(key);
      console.log(`🧹 Cleaned: ${key}`);
    } catch (error) {
      console.warn(`⚠️ Could not clean: ${key}`, error);
    }
  });
  
  // Nettoyer aussi sessionStorage
  try {
    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('wagmi') || key.includes('wallet')) {
        sessionStorage.removeItem(key);
        console.log(`🧹 Cleaned session: ${key}`);
      }
    });
  } catch (error) {
    console.warn('⚠️ Could not clean sessionStorage', error);
  }
  
  console.log('✅ Wallet cache completely cleared');
}

/**
 * Vérifie s'il y a des traces de connexion précédente
 */
export function checkWalletCache(): { hasCache: boolean; keys: string[] } {
  const wagmiKeys = Object.keys(localStorage).filter(key => 
    key.includes('wagmi') || 
    key.includes('wallet') || 
    key.startsWith('sherlock_auth_')
  );
  
  return {
    hasCache: wagmiKeys.length > 0,
    keys: wagmiKeys
  };
}

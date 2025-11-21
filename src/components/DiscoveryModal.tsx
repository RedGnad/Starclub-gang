// Discovery Modal CLEAN - Backend only avec VRAIS followers Twitter
import React, { useState } from "react";
import { DappGridCard } from "./DappGridCard";
import { DappDetailModal } from "./DappDetailModal";
import { useProtocols, useSuperDApps } from "../hooks/useStarclubAPI";

// Fonction pour obtenir la couleur de la catégorie
function getCategoryColor(category: string): string {
  const colors = {
    NFT: "bg-purple-600",
    GAMEFI: "bg-pink-600",
    DEFI: "bg-blue-600",
    LENDING: "bg-green-600",
    STAKING: "bg-orange-600",
    INFRA: "bg-gray-600",
    BRIDGE: "bg-cyan-600",
    DEPIN: "bg-indigo-600",
    SOCIAL: "bg-rose-600",
    GOVERNANCE: "bg-amber-600",
    TOKEN: "bg-emerald-600",
    AI: "bg-violet-600",
  };
  return colors[category as keyof typeof colors] || "bg-slate-600";
}

interface DApp {
  id: string;
  name: string | null;
  description: string | null;
  logoUrl: string | null;
  banner: string | null;
  symbol: string | null;
  category: string;
  website: string | null;
  github: string | null;
  twitter: string | null;
  twitterFollowers: number | null;
  contractCount: number;
  totalTxCount: number;
  totalEventCount: number;
  uniqueUsers: number;
  activityScore: number;
  qualityScore: number;
  firstActivity: Date | null;
  lastActivity: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulateKeyM?: () => void;
}

export function DiscoveryModal({
  isOpen,
  onClose,
  simulateKeyM,
}: DiscoveryModalProps) {
  // BACKEND HOOKS - Plus de fake data !
  const {
    protocols: dapps,
    loading,
    backgroundLoading,
    error,
    sync: handleRefresh,
  } = useProtocols();
  const { dapps: superDapps } = useSuperDApps();

  const [selectedDapp, setSelectedDapp] = useState<DApp | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // États pour filtres et recherche
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Ouvrir modal détail
  const openDetailModal = (dapp: DApp) => {
    setSelectedDapp(dapp);
    setDetailModalOpen(true);
  };

  // Fermer modal détail
  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedDapp(null);
  };

  // Obtenir les catégories uniques avec leurs comptes
  const categories = React.useMemo(() => {
    if (!dapps) return [];

    const categoryCount = dapps.reduce((acc, dapp: any) => {
      acc[dapp.category] = (acc[dapp.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [dapps]);

  // Filtrer les dApps
  const filteredDapps = React.useMemo(() => {
    if (!dapps) return [];

    return dapps.filter((dapp: any) => {
      // Filtre par catégorie
      const matchesCategory =
        selectedCategory === "ALL" || dapp.category === selectedCategory;

      // Filtre par recherche
      const matchesSearch =
        searchTerm === "" ||
        dapp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dapp.description?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [dapps, selectedCategory, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Liquid Glass Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-lg"
        onClick={() => {
          onClose();
          simulateKeyM?.();
        }}
        style={{
          backdropFilter: "blur(12px) saturate(150%)",
          background:
            "linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(30, 30, 60, 0.2))",
        }}
      />

      {/* Liquid Glass Modal Container */}
      <div className="glass-discovery-modal relative max-w-5xl w-full max-h-[90vh] flex flex-col rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
        {/* Glass gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/70 to-gray-900/90"
          style={{ backdropFilter: "blur(16px)" }}
        />

        {/* Header */}
        <div className="relative p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              DISCOVERY ARCADE
            </h2>
          </div>
          <div className="flex gap-3 items-center">
            {/* Loading indicator */}
            {backgroundLoading && (
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                Loading dApps...
              </div>
            )}

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={backgroundLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              title="Fetch new dApps from GitHub"
            >
              {backgroundLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
              {backgroundLoading ? "Syncing..." : "Sync"}
            </button>

            <button
              onClick={() => {
                onClose();
                simulateKeyM?.();
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-y-auto p-6">
          {/* Filtres et Recherche */}
          <div className="mb-6 space-y-4">
            {/* Barre de recherche */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a dApp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Filtres de catégories */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("ALL")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === "ALL"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                ALL ({dapps?.length || 0})
              </button>

              {categories.map(({ category, count }) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {category} ({count})
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Protocols ({filteredDapps.length}/{dapps?.length || 0})
            </h3>
          </div>

          {loading && dapps.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mx-auto mb-4" />
              <p>First loading from backend...</p>
              <p className="text-sm mt-2">
                GitHub + Google Sheets + Puppeteer scraper
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p>❌ Backend error: {error}</p>
            </div>
          ) : dapps.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">🌌</div>
              <p className="text-lg mb-2">No protocols loaded</p>
              <p className="text-sm mb-4">
                Click "Sync" to load the latest protocols
              </p>
            </div>
          ) : filteredDapps.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-lg mb-2">No results found</p>
              <p className="text-sm mb-4">
                Try modifying your search or filters
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("ALL");
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(filteredDapps || [])
                .sort((a: any, b: any) => {
                  // SuperDApps en premier
                  const aIsSuper =
                    superDapps?.some(
                      (sd: any) =>
                        sd?.name?.toLowerCase() === a?.name?.toLowerCase()
                    ) || false;
                  const bIsSuper =
                    superDapps?.some(
                      (sd: any) =>
                        sd?.name?.toLowerCase() === b?.name?.toLowerCase()
                    ) || false;

                  if (aIsSuper && !bIsSuper) return -1;
                  if (!aIsSuper && bIsSuper) return 1;
                  return 0; // Garde l'ordre original pour le reste
                })
                .map((dapp: any, index: number) => {
                  // Check SuperDApp avec vérifications de sécurité
                  const isSuper =
                    superDapps?.some(
                      (sd: any) =>
                        sd?.name?.toLowerCase() === dapp?.name?.toLowerCase()
                    ) || false;

                  return (
                    <div
                      key={dapp?.id || `dapp-${index}`}
                      className={`relative ${
                        isSuper ? "super-dapp-container" : ""
                      }`}
                    >
                      {/* SuperDApp Badge */}
                      {isSuper && (
                        <div className="absolute -top-2 -right-2 z-20 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-bold px-2 py-1 rounded-md shadow-xl">
                          SUPER
                        </div>
                      )}

                      <DappGridCard
                        dapp={dapp}
                        index={index}
                        onClick={() => openDetailModal(dapp)}
                      />
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <DappDetailModal
        dapp={selectedDapp}
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
      />

      <style>{`
        .glass-discovery-modal {
          backdrop-filter: blur(20px) saturate(180%);
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.1),
            rgba(255, 255, 255, 0.05)
          );
          box-shadow: 
            0 0 0 1px rgba(255, 255, 255, 0.1),
            0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: glass-modal-appear 0.4s ease-out;
        }
        
        @keyframes glass-modal-appear {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
            backdrop-filter: blur(20px);
          }
        }
        
        .glass-discovery-modal::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.3), 
            transparent
          );
          pointer-events: none;
        }
        
        .super-dapp-container {
          position: relative;
          border-radius: 16px;
          border: 2px solid rgba(255, 215, 0, 0.8);
          animation: super-glow 3s ease-in-out infinite;
          box-shadow: 
            0 0 15px rgba(255, 215, 0, 0.2),
            0 0 30px rgba(255, 215, 0, 0.1);
        }
        
        
        @keyframes super-glow {
          0%, 100% {
            border-color: rgba(255, 215, 0, 0.6);
            box-shadow: 
              0 0 15px rgba(255, 215, 0, 0.2),
              0 0 30px rgba(255, 215, 0, 0.1);
          }
          50% {
            border-color: rgba(255, 215, 0, 1);
            box-shadow: 
              0 0 20px rgba(255, 215, 0, 0.3),
              0 0 40px rgba(255, 215, 0, 0.15);
          }
        }
      `}</style>
    </div>
  );
}

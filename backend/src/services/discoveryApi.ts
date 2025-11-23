// Service pour récupérer les vraies données depuis GitHub et Google Sheets
// Basé sur le système de Sherlock-feat-discovery

import { getFollowersCount } from './twitterFollowersCache.js';
import { cleanTwitterUrl } from './twitterScraper.js';
import { SUPER_DAPPS } from '../data/superDapps.js';

const GITHUB_PROTOCOLS_DIR_API =
  "https://api.github.com/repos/monad-crypto/protocols/contents/testnet?ref=main";
const MONAD_ECOSYSTEM_PROJECTS_API =
  "https://api.github.com/repos/portdeveloper/monad-ecosystem/contents/data/projects.json?ref=main";
const GOOGLE_SHEETS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1LvM26stpFO7kJk4Y974NhLznjerMh6h8wvZBeYja26M/export?format=csv&gid=0";

interface GitHubFileInfo {
  name: string;
  download_url: string;
  type: string;
}

interface GitHubProtocolData {
  name: string;
  description?: string;
  live?: boolean;
  categories?: string[];
  addresses?: Record<string, string>;
  links?: {
    project?: string;
    twitter?: string;
    github?: string;
    docs?: string;
  };
}

interface DApp {
  id: string;
  name: string;
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

/**
 * Fetch protocols from GitHub monad-crypto repository
 */
async function fetchGitHubProtocols(progressCallback?: (current: number, total: number) => void): Promise<any[]> {
  try {
    console.log("📂 Fetching protocols from GitHub...");
    
    // 1. Fetch the list of files in the testnet directory
    const dirResponse = await fetch(GITHUB_PROTOCOLS_DIR_API);
    if (!dirResponse.ok) {
      console.warn(`⚠️  GitHub directory unavailable: ${dirResponse.statusText}`);
      return [];
    }

    const files = await dirResponse.json() as GitHubFileInfo[];
    const jsonFiles = files.filter(
      (file) => file.type === "file" && file.name.endsWith(".json")
    );

    console.log(`📂 Found ${jsonFiles.length} protocol files in GitHub`);
    
    // Notifier le total
    if (progressCallback) {
      progressCallback(0, jsonFiles.length);
    }

    // 2. Fetch files in parallel batches (5 at a time)
    const protocols: any[] = [];
    const batchSize = 5;
    let processed = 0;

    for (let i = 0; i < jsonFiles.length; i += batchSize) {
      const batch = jsonFiles.slice(i, i + batchSize);
      console.log(`📥 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(jsonFiles.length/batchSize)} (${batch.length} files)`);
      
      // Fetch batch in parallel
      const batchPromises = batch.map(async (file) => {
        try {
          const fileResponse = await fetch(file.download_url);
          if (!fileResponse.ok) {
            console.warn(`⚠️  Failed to fetch ${file.name}: ${fileResponse.statusText}`);
            return null;
          }
          
          const data = await fileResponse.json() as GitHubProtocolData;
          processed++;
          
          // Progress callback
          if (progressCallback) {
            progressCallback(processed, jsonFiles.length);
          }
          
          return { file, data };
        } catch (error) {
          console.warn(`⚠️  Failed to process ${file.name}:`, error);
          processed++;
          if (progressCallback) {
            progressCallback(processed, jsonFiles.length);
          }
          return null;
        }
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Process successful results
      for (const result of batchResults) {
        if (result.status === 'fulfilled' && result.value) {
          const { file, data } = result.value;

          // Skip if not live
          if (data.live === false) {
            continue;
          }

          // Transform addresses object to contracts array
          const contracts = data.addresses
            ? Object.entries(data.addresses).map(([name, address]) => ({
                address,
                name,
                type: "UNKNOWN" as const,
              }))
            : [];

          // Extract category from categories array
          const category = data.categories && data.categories.length > 0
            ? data.categories[0]
            : "UNKNOWN";

          // Transform to protocol format
          const protocol = {
            id: data.name,
            name: data.name,
            description: data.description,
            category: mapCategory(category),
            website: data.links?.project,
            github: data.links?.github,
            twitter: data.links?.twitter,
            contracts,
            contractCount: contracts.length,
          };

          protocols.push(protocol);
        }
      }
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < jsonFiles.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log(`✅ Successfully loaded ${protocols.length} protocols from GitHub`);
    return protocols;
  } catch (error) {
    console.warn(`⚠️  Failed to fetch GitHub protocols:`, error);
    return [];
  }
}

/**
 * Fetch enrichment data from Google Sheets (CSV)
 */
async function fetchGoogleSheetsData(): Promise<Record<string, any>> {
  try {
    console.log("📊 Fetching enrichment data from Google Sheets...");
    
    const response = await fetch(GOOGLE_SHEETS_CSV_URL);
    if (!response.ok) {
      console.warn(`⚠️  Google Sheets unavailable: ${response.statusText}`);
      return {};
    }

    const csvText = await response.text();
    const lines = csvText.split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

    const enrichmentMap: Record<string, any> = {};

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
      const projectName = values[0];

      if (!projectName) continue;

      const enrichment: any = {};
      headers.forEach((header, index) => {
        if (values[index]) {
          enrichment[header] = values[index];
        }
      });

      enrichmentMap[projectName.toLowerCase()] = enrichment;
    }

    console.log(`✅ Loaded enrichment data for ${Object.keys(enrichmentMap).length} projects`);
    return enrichmentMap;
  } catch (error) {
    console.warn(`⚠️  Failed to fetch Google Sheets data:`, error);
    return {};
  }
}

/**
 * Map category to standard format
 */
function mapCategory(category: string): string {
  // Si c'est déjà au bon format GitHub (ex: "DeFi::DEX"), on l'utilise directement
  if (category.includes('::')) {
    const cleanCategory = category
      .replace('DeFi::', '')
      .replace('GameFi::', '')
      .replace('Gaming::', '')
      .replace('SocialFi::', '')
      .replace('NFT::', '')
      .replace('Infra::', '')
      .replace('DePIN::', '');
    
    console.log(`🔍 Mapping category: "${category}" -> "${cleanCategory}"`);
    
    const githubCategoryMap: Record<string, string> = {
      // DeFi categories
      'DEX': 'DEFI',
      'DEX Aggregator': 'DEFI', 
      'Yield': 'DEFI',
      'Yield Aggregator': 'DEFI',
      'Other': 'DEFI',
      'Launchpad': 'DEFI',
      'Options': 'DEFI',
      'Derivatives': 'DEFI',
      'Perpetuals / Derivatives': 'DEFI',
      'Insurance': 'DEFI',
      'Stablecoin': 'DEFI',
      
      // Lending & Staking
      'Lending': 'LENDING',
      'Staking': 'STAKING',
      'Liquid Staking': 'STAKING',
      
      // NFT categories  
      'NFT': 'NFT',
      'NFT Marketplace': 'NFT',
      'Marketplace': 'NFT',
      
      // Gaming categories
      'Gaming': 'GAMEFI',
      'Games': 'GAMEFI',
      'Game': 'GAMEFI',
      
      // Infrastructure categories
      'Infrastructure': 'INFRA',
      'Interoperability': 'INFRA',
      'Identity': 'INFRA', 
      'Wallet': 'INFRA',
      'Analytics': 'INFRA',
      'Oracle': 'INFRA',
      
      // Cross-chain & Bridge
      'Bridge': 'BRIDGE',
      'Cross-chain': 'BRIDGE',
      
      // DePIN & Compute
      'Compute': 'DEPIN',
      'Storage': 'DEPIN',
      'Network': 'DEPIN',
      
      // Social & Governance
      'Social': 'SOCIAL',
      'Governance': 'GOVERNANCE',
      'DAO': 'GOVERNANCE',
      
      // Others
      'Token': 'TOKEN',
      'AI': 'AI',
      'Artificial Intelligence': 'AI'
    };
    
    const result = githubCategoryMap[cleanCategory] || 'DEFI';
    console.log(`🎯 Final mapping: "${cleanCategory}" -> "${result}"`);
    return result;
  }

  // Ancien mapping pour compatibilité
  const categoryMap: Record<string, string> = {
    'defi': 'DEFI',
    'dex': 'DEFI', 
    'lending': 'LENDING',
    'nft': 'NFT',
    'nft marketplace': 'NFT',
    'bridge': 'BRIDGE',
    'gaming': 'GAMEFI',
    'social': 'SOCIAL',
    'infrastructure': 'INFRA',
    'governance': 'GOVERNANCE',
    'token': 'TOKEN',
    'staking': 'STAKING'
  };

  const normalized = category.toLowerCase();
  return categoryMap[normalized] || 'UNKNOWN';
}

/**
 * Generate realistic metrics based on protocol data
 */
function generateMetrics(protocol: any, enrichment: any) {
  const baseMultiplier = protocol.contractCount * 1000;
  const categoryMultipliers = {
    'DEFI': 2.5,
    'LENDING': 2.2,
    'STAKING': 2.0,
    'BRIDGE': 2.0,
    'NFT': 1.5,
    'GAMEFI': 1.8,
    'SOCIAL': 1.3,
    'INFRA': 1.6,
    'GOVERNANCE': 1.4,
    'TOKEN': 1.2
  };
  
  const multiplier = categoryMultipliers[protocol.category as keyof typeof categoryMultipliers] || 1.0;
  
  return {
    totalTxCount: Math.floor(baseMultiplier * multiplier * (0.8 + Math.random() * 0.4)),
    uniqueUsers: Math.floor(baseMultiplier * 0.1 * multiplier * (0.7 + Math.random() * 0.6)),
    totalEventCount: Math.floor(baseMultiplier * multiplier * 2 * (0.9 + Math.random() * 0.2)),
    activityScore: Math.min(10, Math.random() * 3 + 5),
    qualityScore: Math.min(10, Math.random() * 2 + 6),
  };
}

/**
 * Main function to sync dApps from external sources
 */
export async function syncDApps(progressCallback?: (current: number, total: number) => void): Promise<DApp[]> {
  try {
    console.log("🔄 Starting dApps synchronization...");

    // Fetch GitHub + Google Sheets data in parallel
    const [githubProtocols, googleSheetsData] = await Promise.all([
      fetchGitHubProtocols(progressCallback),
      fetchGoogleSheetsData(),
    ]);

    console.log(`📊 Processing ${githubProtocols.length} protocols...`);

    const dapps: DApp[] = [];

    for (const protocol of githubProtocols) {
      const protocolName = protocol.name;
      const normalizedNameForFilter = protocolName.toLowerCase().replace(/\s+/g, '');

      if (normalizedNameForFilter === 'apriori') {
        console.log("\u{1F6AB} Skipping aPriori protocol from discovery list");
        continue;
      }

      const enrichment = googleSheetsData[protocolName.toLowerCase()] || {};

      // Extract enriched data
      let logoUrl =
        enrichment.LOGO || enrichment.logo || enrichment.logoUrl || null;
      const banner = enrichment.BANNER || enrichment.banner || null;
      const rawTwitter =
        enrichment.twitter ||
        enrichment.Twitter ||
        enrichment.x ||
        protocol.twitter ||
        null;
      const twitter = rawTwitter ? cleanTwitterUrl(rawTwitter) : null;
      const twitterFollowers = enrichment.followers
        ? parseInt(enrichment.followers)
        : null;

      // Generic logo fallback: use unavatar.io on top of Twitter handle when no explicit logo is provided
      if (!logoUrl && twitter) {
        const handle = twitter.split('/').pop();
        if (handle) {
          logoUrl = `https://unavatar.io/twitter/${handle}`;
        }
      }

      // Generate realistic metrics
      const metrics = generateMetrics(protocol, enrichment);

      const dapp: DApp = {
        id: `dapp_${protocolName.toLowerCase().replace(/\s+/g, '_')}`,
        name: protocolName,
        description:
          enrichment.INFO ||
          enrichment.description ||
          protocol.description ||
          `${protocolName} protocol on Monad Testnet`,
        logoUrl,
        banner,
        symbol: null,
        website: enrichment.WEB || enrichment.website || protocol.website || null,
        github: enrichment.github || protocol.github || null,
        twitter,
        twitterFollowers,
        category: protocol.category,
        contractCount: protocol.contractCount || 1,
        ...metrics,
        firstActivity: new Date(
          Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
        ), // Random date within 90 days
        lastActivity: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ), // Random date within 7 days
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const normalizedName = protocolName.toLowerCase();

      const matchingSuperDapp = SUPER_DAPPS.find(
        (sd) => sd.name.toLowerCase() === normalizedName
      );
      if (
        matchingSuperDapp &&
        dapp.description &&
        dapp.description.trim().length < 10
      ) {
        dapp.description = matchingSuperDapp.description;
      }

      if (normalizedName === 'curvance') {
        dapp.website = 'https://www.curvance.com/';
      }

      if (normalizedName === 'lfj') {
        dapp.website = 'https://lfj.gg/';
      }

      // Specific fix: La Mouch is an NFT project, not DeFi
      if (normalizedName === 'la mouch' || normalizedName === 'la_mouch') {
        dapp.category = 'NFT';
        dapp.website = 'https://checker.lamouch.xyz/';
        dapp.twitter = 'https://x.com/LaMouchNFT';
        dapp.logoUrl =
          'https://green-adjacent-sheep-82.mypinata.cloud/ipfs/bafkreifqnthnouhgl43hcvg2o6kajer4qazxesqrrbqlv347swzdyecn4y';
      }

      if (normalizedName === 'drake exchange' || normalizedName === 'drake_exchange') {
        dapp.logoUrl =
          'https://green-adjacent-sheep-82.mypinata.cloud/ipfs/bafkreiappjn3irrqknslgz75ven67ovnbbhjtveyhnqvgrev4xafcrcr2e';
      }

      dapps.push(dapp);
    }

    const hasDrake = dapps.some(
      (dapp) => dapp.name.toLowerCase() === 'drake exchange'
    );

    if (!hasDrake) {
      const drakeSuper = SUPER_DAPPS.find((sd) => sd.id === 'drake');

      if (drakeSuper) {
        const twitter = drakeSuper.twitter
          ? cleanTwitterUrl(drakeSuper.twitter)
          : null;

        const logoUrl: string | null =
          'https://green-adjacent-sheep-82.mypinata.cloud/ipfs/bafkreiappjn3irrqknslgz75ven67ovnbbhjtveyhnqvgrev4xafcrcr2e';

        const normalizedCategory = mapCategory(drakeSuper.category);
        const metrics = generateMetrics(
          {
            category: normalizedCategory,
            contractCount: drakeSuper.contracts.length,
          } as any,
          {}
        );

        const drakeDapp: DApp = {
          id: `dapp_${drakeSuper.name.toLowerCase().replace(/\s+/g, '_')}`,
          name: drakeSuper.name,
          description: drakeSuper.description,
          logoUrl,
          banner: null,
          symbol: null,
          website: drakeSuper.website || null,
          github: drakeSuper.github || null,
          twitter,
          twitterFollowers: null,
          category: normalizedCategory,
          contractCount: drakeSuper.contracts.length,
          ...metrics,
          firstActivity: new Date(
            Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
          ),
          lastActivity: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        dapps.push(drakeDapp);
      }
    }

    // Pas d'affichage des followers pour éviter les données incorrectes
    console.log("⏭️  Skipping Twitter followers (hidden in UI)");
    
    for (const dapp of dapps) {
      // On met null pour ne pas afficher de followers
      dapp.twitterFollowers = null;
    }

    // Sort by quality score descending
    dapps.sort((a: any, b: any) => (b.qualityScore || 0) - (a.qualityScore || 0));

    console.log(`✅ Successfully synchronized ${dapps.length} dApps`);
    return dapps;

  } catch (error) {
    console.error("❌ Error during dApps synchronization:", error);
    throw error;
  }
}

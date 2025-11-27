import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import des routes
import { setupApiRoutes } from './routes/index.js';
import { connectDatabase } from './services/database.js';

// Configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'https://starclub-rho.vercel.app',
    'https://starclub.vercel.app',
    'https://starclub-starclub-4.vercel.app',
    /https:\/\/.*\.vercel\.app$/  // Regex pour tous les domaines Vercel
  ],
  credentials: true
}));
app.use(express.json());

// Route racine
app.get('/', (req, res) => {
  res.json({ 
    message: 'Starclub Backend API - COMPLET', 
    version: '2.0.0',
    features: [
      'BlockVision Integration',
      'dApp Detection & Discovery', 
      'Contract Analysis',
      'User Interactions Tracking',
      'Intelligent Twitter Followers (Cache + Blockchain)',
      'Admin Interface for Manual Data',
      'Prisma Database'
    ],
    endpoints: {
      health: '/health',
      test: '/api/test',
      dapps: '/api/dapps/*',
      auth: '/api/auth/*',
      user: '/api/user/*',
      contracts: '/api/contracts/*',
      protocols: '/api/protocols/*',
      admin: '/api/admin/*'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.type('text/plain').send('OK');
});

// Setup des routes API
setupApiRoutes(app);

// Initialisation database et démarrage serveur
async function startServer() {
  try {
    // Connecter à la database
    await connectDatabase();
    
    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`🚀 Starclub Backend COMPLET sur http://localhost:${PORT}`);
      console.log(`📡 CORS autorisé pour http://localhost:3000`);
      console.log(`🔥 Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 Database: ${process.env.DATABASE_URL || 'sqlite://./dev.db'}`);
      console.log(`🔗 BlockVision: ${process.env.BLOCKVISION_API_KEY ? '✅' : '❌'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

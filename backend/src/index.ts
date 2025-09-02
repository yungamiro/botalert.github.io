import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { DatabaseService } from './services/DatabaseService';
import { ScrapingService } from './services/ScrapingService';
import { NotificationService } from './services/NotificationService';
import { MonitoringService } from './services/MonitoringService';
import { monitoringRoutes } from './routes/monitoring';
import { notificationRoutes } from './routes/notifications';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Initialize services
const databaseService = new DatabaseService();
const scrapingService = new ScrapingService();
const notificationService = new NotificationService();
const monitoringService = new MonitoringService(databaseService, scrapingService, notificationService);

// Routes
app.use('/api/monitoring', monitoringRoutes(databaseService, monitoringService));
app.use('/api/notifications', notificationRoutes(notificationService));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize database and start server
async function startServer() {
  try {
    await databaseService.initialize();
    console.log('Database initialized successfully');
    
    // Start monitoring service
    monitoringService.startMonitoring();
    console.log('Monitoring service started');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
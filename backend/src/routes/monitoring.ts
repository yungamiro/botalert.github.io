import { Router, Request, Response } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { MonitoringService } from '../services/MonitoringService';
import { MonitoringTarget } from '../types';

export function monitoringRoutes(
  databaseService: DatabaseService,
  monitoringService: MonitoringService
): Router {
  const router = Router();

  // Get all monitoring targets
  router.get('/targets', async (req: Request, res: Response) => {
    try {
      const targets = await databaseService.getMonitoringTargets();
      res.json({ success: true, data: targets });
    } catch (error) {
      console.error('Error fetching targets:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch monitoring targets' 
      });
    }
  });

  // Add new monitoring target
  router.post('/targets', async (req: Request, res: Response) => {
    try {
      const { url, keywords, selector, name } = req.body;

      if (!url || !keywords || !Array.isArray(keywords) || keywords.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'URL and keywords array are required'
        });
      }

      // Validate URL
      try {
        new URL(url);
      } catch {
        return res.status(400).json({
          success: false,
          error: 'Invalid URL format'
        });
      }

      const targetData: Omit<MonitoringTarget, 'id' | 'createdAt' | 'updatedAt'> = {
        url,
        keywords: keywords.map((k: string) => k.trim()).filter((k: string) => k.length > 0),
        selector: selector?.trim() || undefined,
        name: name?.trim() || undefined,
        isActive: true,
        lastChecked: undefined
      };

      const id = await databaseService.addMonitoringTarget(targetData);
      
      res.json({ 
        success: true, 
        data: { id, ...targetData } 
      });
    } catch (error) {
      console.error('Error adding target:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to add monitoring target' 
      });
    }
  });

  // Update monitoring target
  router.put('/targets/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Validate updates
      if (updates.url) {
        try {
          new URL(updates.url);
        } catch {
          return res.status(400).json({
            success: false,
            error: 'Invalid URL format'
          });
        }
      }

      if (updates.keywords && (!Array.isArray(updates.keywords) || updates.keywords.length === 0)) {
        return res.status(400).json({
          success: false,
          error: 'Keywords must be a non-empty array'
        });
      }

      await databaseService.updateMonitoringTarget(id, updates);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating target:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update monitoring target' 
      });
    }
  });

  // Delete monitoring target
  router.delete('/targets/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await databaseService.deleteMonitoringTarget(id);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting target:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete monitoring target' 
      });
    }
  });

  // Get alerts
  router.get('/alerts', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const alerts = await databaseService.getAlerts(limit);
      res.json({ success: true, data: alerts });
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch alerts' 
      });
    }
  });

  // Mark alert as read
  router.patch('/alerts/:id/read', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await databaseService.markAlertAsRead(id);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking alert as read:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to mark alert as read' 
      });
    }
  });

  // Get monitoring statistics
  router.get('/stats', async (req: Request, res: Response) => {
    try {
      const stats = await monitoringService.getMonitoringStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch monitoring statistics' 
      });
    }
  });

  // Test scraping a URL
  router.post('/test-scrape', async (req: Request, res: Response) => {
    try {
      const { url, keywords, selector } = req.body;

      if (!url || !keywords) {
        return res.status(400).json({
          success: false,
          error: 'URL and keywords are required'
        });
      }

      // Create a temporary target for testing
      const testTarget: MonitoringTarget = {
        id: 'test',
        url,
        keywords: Array.isArray(keywords) ? keywords : [keywords],
        selector,
        name: 'Test Target',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // You'll need to add this method to ScrapingService
      // const result = await scrapingService.scrapeTarget(testTarget);

      res.json({ 
        success: true, 
        data: { 
          message: 'Test scraping functionality will be available after ScrapingService initialization',
          target: testTarget 
        } 
      });
    } catch (error) {
      console.error('Error testing scrape:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to test scraping' 
      });
    }
  });

  return router;
}
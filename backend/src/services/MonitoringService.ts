import { DatabaseService } from './DatabaseService';
import { ScrapingService } from './ScrapingService';
import { NotificationService } from './NotificationService';
import { MonitoringTarget } from '../types';

export class MonitoringService {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private intervalMs = 5 * 60 * 1000; // 5 minutes

  constructor(
    private databaseService: DatabaseService,
    private scrapingService: ScrapingService,
    private notificationService: NotificationService
  ) {}

  startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    console.log('Starting monitoring service...');
    
    // Run immediately, then every interval
    this.runMonitoringCycle();
    
    this.monitoringInterval = setInterval(() => {
      this.runMonitoringCycle();
    }, this.intervalMs);
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('Monitoring service stopped');
    }
  }

  private async runMonitoringCycle(): Promise<void> {
    try {
      console.log('Running monitoring cycle...');
      const targets = await this.databaseService.getMonitoringTargets();
      const activeTargets = targets.filter(t => t.isActive);

      console.log(`Found ${activeTargets.length} active monitoring targets`);

      for (const target of activeTargets) {
        await this.checkTarget(target);
        // Add small delay between requests to be respectful
        await this.delay(2000);
      }

      console.log('Monitoring cycle completed');
    } catch (error) {
      console.error('Error in monitoring cycle:', error);
    }
  }

  private async checkTarget(target: MonitoringTarget): Promise<void> {
    try {
      console.log(`Checking target: ${target.name || target.url}`);
      
      const result = await this.scrapingService.scrapeTarget(target);
      
      // Update last checked timestamp
      await this.databaseService.updateMonitoringTarget(target.id, {
        lastChecked: new Date()
      });

      if (result.success && result.matches && result.matches.length > 0) {
        console.log(`Found ${result.matches.length} matches for target: ${target.name || target.url}`);
        
        // Get push subscriptions
        const subscriptions = await this.databaseService.getPushSubscriptions();
        
        for (const match of result.matches) {
          // Save alert to database
          const alertId = await this.databaseService.addAlert({
            targetId: target.id,
            keyword: match.keyword,
            matchedText: match.matchedText,
            url: target.url
          });

          // Send push notification
          if (subscriptions.length > 0) {
            const notification = this.notificationService.createAlertNotification(
              match.keyword,
              target.url,
              match.matchedText
            );

            const results = await this.notificationService.sendToAllSubscriptions(
              subscriptions,
              notification
            );

            console.log(`Notifications sent: ${results.sent}, failed: ${results.failed}`);
          }
        }
      } else if (!result.success) {
        console.error(`Failed to scrape target ${target.url}: ${result.error}`);
      }

    } catch (error) {
      console.error(`Error checking target ${target.url}:`, error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getMonitoringStats(): Promise<{
    totalTargets: number;
    activeTargets: number;
    totalAlerts: number;
    recentAlerts: number;
  }> {
    const targets = await this.databaseService.getMonitoringTargets();
    const alerts = await this.databaseService.getAlerts();
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentAlerts = alerts.filter(alert => alert.timestamp > oneDayAgo);

    return {
      totalTargets: targets.length,
      activeTargets: targets.filter(t => t.isActive).length,
      totalAlerts: alerts.length,
      recentAlerts: recentAlerts.length
    };
  }

  setMonitoringInterval(intervalMs: number): void {
    if (intervalMs < 60000) { // Minimum 1 minute
      throw new Error('Monitoring interval must be at least 1 minute');
    }
    
    this.INTERVAL_MS = intervalMs;
    
    if (this.monitoringInterval) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }
}
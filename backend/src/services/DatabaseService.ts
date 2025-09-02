import sqlite3 from 'sqlite3';
import { MonitoringTarget, Alert, PushSubscription } from '../types';

interface DatabaseRow {
  [key: string]: any;
}

export class DatabaseService {
  private db: sqlite3.Database;

  constructor(dbPath: string = './database.sqlite') {
    this.db = new sqlite3.Database(dbPath);
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Create monitoring targets table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS monitoring_targets (
            id TEXT PRIMARY KEY,
            url TEXT NOT NULL,
            keywords TEXT NOT NULL,
            selector TEXT,
            name TEXT,
            is_active BOOLEAN DEFAULT 1,
            last_checked DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Create alerts table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS alerts (
            id TEXT PRIMARY KEY,
            target_id TEXT NOT NULL,
            keyword TEXT NOT NULL,
            matched_text TEXT NOT NULL,
            url TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_read BOOLEAN DEFAULT 0,
            FOREIGN KEY (target_id) REFERENCES monitoring_targets (id)
          )
        `);

        // Create push subscriptions table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS push_subscriptions (
            id TEXT PRIMARY KEY,
            endpoint TEXT NOT NULL,
            p256dh TEXT NOT NULL,
            auth TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  async addMonitoringTarget(target: Omit<MonitoringTarget, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    
    return new Promise((resolve, reject) => {
      this.db.run(`
        INSERT INTO monitoring_targets (id, url, keywords, selector, name, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [id, target.url, JSON.stringify(target.keywords), target.selector, target.name, target.isActive], 
      function(err) {
        if (err) reject(err);
        else resolve(id);
      });
    });
  }

  async getMonitoringTargets(): Promise<MonitoringTarget[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM monitoring_targets ORDER BY created_at DESC', (err, rows: DatabaseRow[]) => {
        if (err) {
          reject(err);
          return;
        }
        
        const targets = rows.map(row => ({
          id: row.id,
          url: row.url,
          keywords: JSON.parse(row.keywords),
          selector: row.selector,
          name: row.name,
          isActive: Boolean(row.is_active),
          lastChecked: row.last_checked ? new Date(row.last_checked) : undefined,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        }));
        
        resolve(targets);
      });
    });
  }

  async updateMonitoringTarget(id: string, updates: Partial<MonitoringTarget>): Promise<void> {
    const fields = [];
    const values = [];

    if (updates.url !== undefined) {
      fields.push('url = ?');
      values.push(updates.url);
    }
    if (updates.keywords !== undefined) {
      fields.push('keywords = ?');
      values.push(JSON.stringify(updates.keywords));
    }
    if (updates.selector !== undefined) {
      fields.push('selector = ?');
      values.push(updates.selector);
    }
    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.isActive !== undefined) {
      fields.push('is_active = ?');
      values.push(updates.isActive);
    }
    if (updates.lastChecked !== undefined) {
      fields.push('last_checked = ?');
      values.push(updates.lastChecked.toISOString());
    }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    return new Promise((resolve, reject) => {
      this.db.run(`UPDATE monitoring_targets SET ${fields.join(', ')} WHERE id = ?`, values, function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async deleteMonitoringTarget(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('DELETE FROM monitoring_targets WHERE id = ?', [id]);
        this.db.run('DELETE FROM alerts WHERE target_id = ?', [id], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  async addAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'isRead'>): Promise<string> {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    
    return new Promise((resolve, reject) => {
      this.db.run(`
        INSERT INTO alerts (id, target_id, keyword, matched_text, url)
        VALUES (?, ?, ?, ?, ?)
      `, [id, alert.targetId, alert.keyword, alert.matchedText, alert.url], 
      function(err) {
        if (err) reject(err);
        else resolve(id);
      });
    });
  }

  async getAlerts(limit: number = 50): Promise<Alert[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM alerts ORDER BY timestamp DESC LIMIT ?', [limit], (err, rows: DatabaseRow[]) => {
        if (err) {
          reject(err);
          return;
        }
        
        const alerts = rows.map(row => ({
          id: row.id,
          targetId: row.target_id,
          keyword: row.keyword,
          matchedText: row.matched_text,
          url: row.url,
          timestamp: new Date(row.timestamp),
          isRead: Boolean(row.is_read)
        }));
        
        resolve(alerts);
      });
    });
  }

  async markAlertAsRead(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('UPDATE alerts SET is_read = 1 WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async addPushSubscription(subscription: Omit<PushSubscription, 'id' | 'createdAt'>): Promise<string> {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    
    return new Promise((resolve, reject) => {
      this.db.run(`
        INSERT OR REPLACE INTO push_subscriptions (id, endpoint, p256dh, auth)
        VALUES (?, ?, ?, ?)
      `, [id, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth], 
      function(err) {
        if (err) reject(err);
        else resolve(id);
      });
    });
  }

  async getPushSubscriptions(): Promise<PushSubscription[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM push_subscriptions', (err, rows: DatabaseRow[]) => {
        if (err) {
          reject(err);
          return;
        }
        
        const subscriptions = rows.map(row => ({
          id: row.id,
          endpoint: row.endpoint,
          keys: {
            p256dh: row.p256dh,
            auth: row.auth
          },
          createdAt: new Date(row.created_at)
        }));
        
        resolve(subscriptions);
      });
    });
  }
}
export interface MonitoringTarget {
  id: string;
  url: string;
  keywords: string[];
  selector?: string;
  name?: string;
  isActive: boolean;
  lastChecked?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  id: string;
  targetId: string;
  keyword: string;
  matchedText: string;
  url: string;
  timestamp: Date;
  isRead: boolean;
}

export interface PushSubscription {
  id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: Date;
}

export interface ScrapingResult {
  success: boolean;
  content?: string;
  error?: string;
  matches?: Array<{
    keyword: string;
    matchedText: string;
    context: string;
  }>;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  data?: any;
}
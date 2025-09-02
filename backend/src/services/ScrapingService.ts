import puppeteer, { Browser, Page } from 'puppeteer';
import { ScrapingResult, MonitoringTarget } from '../types';

export class ScrapingService {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ],
        headless: true
      });
    }
  }

  async scrapeTarget(target: MonitoringTarget): Promise<ScrapingResult> {
    try {
      if (!this.browser) {
        await this.initialize();
      }

      const page: Page = await this.browser!.newPage();
      
      // Set user agent and viewport
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });

      // Navigate to the target URL
      await page.goto(target.url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait a bit for dynamic content to load
      await page.waitForTimeout(2000);

      // Get page content based on selector or full page
      let content: string;
      if (target.selector) {
        try {
          content = await page.$eval(target.selector, el => el.textContent || '');
        } catch (error) {
          // If selector fails, fall back to body content
          content = await page.$eval('body', el => el.textContent || '');
        }
      } else {
        content = await page.$eval('body', el => el.textContent || '');
      }

      await page.close();

      // Check for keyword matches
      const matches = this.findKeywordMatches(content, target.keywords);

      return {
        success: true,
        content,
        matches
      };

    } catch (error) {
      console.error('Scraping error for target:', target.url, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private findKeywordMatches(content: string, keywords: string[]): Array<{
    keyword: string;
    matchedText: string;
    context: string;
  }> {
    const matches = [];
    const lowerContent = content.toLowerCase();

    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      let startIndex = 0;

      while (true) {
        const index = lowerContent.indexOf(lowerKeyword, startIndex);
        if (index === -1) break;

        // Get context around the match (100 characters before and after)
        const contextStart = Math.max(0, index - 100);
        const contextEnd = Math.min(content.length, index + keyword.length + 100);
        const context = content.substring(contextStart, contextEnd);

        // Get the actual matched text with original case
        const matchedText = content.substring(index, index + keyword.length);

        matches.push({
          keyword,
          matchedText,
          context: context.trim()
        });

        startIndex = index + 1;
      }
    }

    return matches;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
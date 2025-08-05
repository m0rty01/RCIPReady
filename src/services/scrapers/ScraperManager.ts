import { ThunderBayScraper } from './ThunderBayScraper';
import { NorthBayScraper } from './NorthBayScraper';
import { SudburyScraper } from './SudburyScraper';
import { TimminsScraper } from './TimminsScraper';
import { SaultSteMarieScraper } from './SaultSteMarieScraper';
import { VernonScraper } from './VernonScraper';
import { WestKootenayScraper } from './WestKootenayScraper';
import { MooseJawScraper } from './MooseJawScraper';
import { ClaresholmScraper } from './ClaresholmScraper';
import { BrandonScraper } from './BrandonScraper';
import { AltonaRhinelandScraper } from './AltonaRhinelandScraper';
import { ScrapedJob } from './BaseScraper';

export class ScraperManager {
  private static scrapers = [
    new ThunderBayScraper(),
    new NorthBayScraper(),
    new SudburyScraper(),
    new TimminsScraper(),
    new SaultSteMarieScraper(),
    new VernonScraper(),
    new WestKootenayScraper(),
    new MooseJawScraper(),
    new ClaresholmScraper(),
    new BrandonScraper(),
    new AltonaRhinelandScraper(),
  ];

  static async scrapeAllCommunities(): Promise<Record<string, ScrapedJob[]>> {
    const results: Record<string, ScrapedJob[]> = {};
    const errors: string[] = [];

    for (const scraper of this.scrapers) {
      try {
        const jobs = await scraper.scrapeJobs();
        results[scraper.constructor.name] = jobs;
      } catch (error) {
        console.error(`Error with ${scraper.constructor.name}:`, error);
        errors.push(scraper.constructor.name);
      }
    }

    if (errors.length > 0) {
      console.error('Failed scrapers:', errors);
    }

    return results;
  }

  static async scrapeCommunity(communityName: string): Promise<ScrapedJob[]> {
    const scraper = this.scrapers.find(s => 
      s.constructor.name.toLowerCase().includes(communityName.toLowerCase().replace(/\s+/g, ''))
    );

    if (!scraper) {
      throw new Error(`No scraper found for community: ${communityName}`);
    }

    return await scraper.scrapeJobs();
  }
}
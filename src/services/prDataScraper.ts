import axios from 'axios';
import * as cheerio from 'cheerio';
import { prisma } from '../lib/prisma';

interface PRCase {
  source: 'reddit' | 'immitracker';
  community: string;
  endorsementDate: Date;
  medicalDate?: Date;
  biometricsDate?: Date;
  decisionDate?: Date;
  processingTime: number; // in days
  hasWorkPermit: boolean;
  outcome: 'approved' | 'rejected' | 'pending';
  additionalNotes?: string;
}

export class PRDataScraper {
  private static readonly REDDIT_URLS = [
    'https://www.reddit.com/r/ImmigrationCanada/search/?q=RNIP%20OR%20RCIP&sort=new',
    'https://www.reddit.com/r/RNIP/',
  ];

  private static readonly IMMITRACKER_URL = 'https://www.immitracker.org/rnip-cases';

  static async scrapeAllSources(): Promise<PRCase[]> {
    try {
      const [redditCases, immitrackerCases] = await Promise.all([
        this.scrapeReddit(),
        this.scrapeImmitracker(),
      ]);

      const allCases = [...redditCases, ...immitrackerCases];
      await this.saveCases(allCases);

      return allCases;
    } catch (error) {
      console.error('Error scraping PR data:', error);
      throw new Error('Failed to scrape PR data');
    }
  }

  private static async scrapeReddit(): Promise<PRCase[]> {
    const cases: PRCase[] = [];

    for (const url of this.REDDIT_URLS) {
      try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Find relevant posts
        $('div[data-testid="post-container"]').each((_, element) => {
          const $post = $(element);
          const title = $post.find('h3').text();
          const content = $post.find('div[data-testid="post-content"]').text();
          
          // Only process RNIP/RCIP related posts
          if (this.isRelevantPost(title, content)) {
            const prCase = this.extractCaseFromReddit(title, content);
            if (prCase) {
              cases.push(prCase);
            }
          }
        });
      } catch (error) {
        console.error(`Error scraping Reddit URL ${url}:`, error);
      }
    }

    return cases;
  }

  private static async scrapeImmitracker(): Promise<PRCase[]> {
    try {
      const response = await axios.get(this.IMMITRACKER_URL);
      const $ = cheerio.load(response.data);
      const cases: PRCase[] = [];

      // Find case entries
      $('.case-entry').each((_, element) => {
        const $case = $(element);
        
        const prCase: PRCase = {
          source: 'immitracker',
          community: $case.find('.community').text().trim(),
          endorsementDate: new Date($case.find('.endorsement-date').text()),
          medicalDate: this.parseOptionalDate($case.find('.medical-date').text()),
          biometricsDate: this.parseOptionalDate($case.find('.biometrics-date').text()),
          decisionDate: this.parseOptionalDate($case.find('.decision-date').text()),
          processingTime: parseInt($case.find('.processing-time').text()),
          hasWorkPermit: $case.find('.work-permit').text().toLowerCase() === 'yes',
          outcome: this.determineOutcome($case.find('.status').text()),
          additionalNotes: $case.find('.notes').text().trim(),
        };

        cases.push(prCase);
      });

      return cases;
    } catch (error) {
      console.error('Error scraping Immitracker:', error);
      return [];
    }
  }

  private static isRelevantPost(title: string, content: string): boolean {
    const keywords = ['rnip', 'rcip', 'rural and northern', 'processing time'];
    const text = (title + ' ' + content).toLowerCase();
    return keywords.some(keyword => text.includes(keyword));
  }

  private static extractCaseFromReddit(title: string, content: string): PRCase | null {
    try {
      // Use regex to extract dates and other information
      const endorsementMatch = content.match(/endorsed(?:ment)?\s*(?:on|:)?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i);
      const medicalMatch = content.match(/medical(?:\s*passed)?\s*(?:on|:)?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i);
      const biometricsMatch = content.match(/biometrics\s*(?:on|:)?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i);
      const decisionMatch = content.match(/(?:approved|rejected)\s*(?:on|:)?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i);
      
      if (!endorsementMatch) {
        return null;
      }

      const endorsementDate = new Date(endorsementMatch[1]);
      const decisionDate = decisionMatch ? new Date(decisionMatch[1]) : undefined;
      
      const processingTime = decisionDate 
        ? Math.ceil((decisionDate.getTime() - endorsementDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        source: 'reddit',
        community: this.extractCommunity(content),
        endorsementDate,
        medicalDate: medicalMatch ? new Date(medicalMatch[1]) : undefined,
        biometricsDate: biometricsMatch ? new Date(biometricsMatch[1]) : undefined,
        decisionDate,
        processingTime,
        hasWorkPermit: content.toLowerCase().includes('work permit'),
        outcome: this.determineOutcome(content),
        additionalNotes: content,
      };
    } catch (error) {
      console.error('Error extracting case from Reddit post:', error);
      return null;
    }
  }

  private static extractCommunity(text: string): string {
    const communities = [
      'Thunder Bay', 'North Bay', 'Sudbury', 'Timmins', 'Sault Ste. Marie',
      'Vernon', 'West Kootenay', 'Moose Jaw', 'Claresholm', 'Brandon',
      'Altona', 'Rhineland',
    ];

    for (const community of communities) {
      if (text.toLowerCase().includes(community.toLowerCase())) {
        return community;
      }
    }

    return 'Unknown';
  }

  private static parseOptionalDate(dateStr: string): Date | undefined {
    try {
      return dateStr ? new Date(dateStr) : undefined;
    } catch {
      return undefined;
    }
  }

  private static determineOutcome(text: string): 'approved' | 'rejected' | 'pending' {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('approved') || lowerText.includes('accepted')) {
      return 'approved';
    }
    if (lowerText.includes('rejected') || lowerText.includes('denied')) {
      return 'rejected';
    }
    return 'pending';
  }

  private static async saveCases(cases: PRCase[]): Promise<void> {
    for (const prCase of cases) {
      try {
        const community = await prisma.community.findFirst({
          where: {
            name: {
              contains: prCase.community,
              mode: 'insensitive',
            },
          },
        });

        if (community) {
          await prisma.applicationProcess.create({
            data: {
              communityId: community.id,
              userId: 'system', // Special user ID for scraped data
              stage: prCase.outcome === 'approved' ? 'COMPLETED' : 'PR_APPLICATION',
              endorsementDate: prCase.endorsementDate,
              medicalDate: prCase.medicalDate,
              biometricsDate: prCase.biometricsDate,
              estimatedPRDate: prCase.decisionDate,
              source: prCase.source,
              additionalData: JSON.stringify({
                processingTime: prCase.processingTime,
                hasWorkPermit: prCase.hasWorkPermit,
                outcome: prCase.outcome,
                notes: prCase.additionalNotes,
              }),
            },
          });
        }
      } catch (error) {
        console.error('Error saving PR case:', error);
      }
    }
  }
}
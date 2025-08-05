import axios from 'axios';
import * as cheerio from 'cheerio';
import { OpenAI } from 'openai';
import { prisma } from '../../lib/prisma';

export interface ScrapedJob {
  title: string;
  description: string;
  noc: string;
  teerLevel: number;
  salary?: number;
  isRemote: boolean;
  location: string;
  employerName: string;
  employerWebsite?: string;
  sourceUrl: string;
  postedDate?: Date;
}

export abstract class BaseScraper {
  protected openai: OpenAI;
  protected communityName: string;
  protected baseUrl: string;

  constructor(communityName: string, baseUrl: string) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.communityName = communityName;
    this.baseUrl = baseUrl;
  }

  abstract scrapeJobs(): Promise<ScrapedJob[]>;

  protected async fetchPage(url: string): Promise<cheerio.CheerioAPI> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      return cheerio.load(response.data);
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw new Error(`Failed to fetch ${url}`);
    }
  }

  protected async extractNOCAndTEER(jobTitle: string, description: string): Promise<{ noc: string; teerLevel: number }> {
    const prompt = `
      Analyze this job posting and determine the most likely NOC code and TEER level.
      
      Job Title: ${jobTitle}
      Description: ${description}
      
      Return ONLY a JSON object with:
      {
        "noc": "5-digit NOC code",
        "teerLevel": number from 0-5
      }
    `;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in Canadian NOC (National Occupational Classification) codes.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return JSON.parse(completion.choices[0].message.content || '{"noc": "00000", "teerLevel": 0}');
  }

  protected async saveJobs(jobs: ScrapedJob[]): Promise<void> {
    const community = await prisma.community.findUnique({
      where: { name: this.communityName },
    });

    if (!community) {
      throw new Error(`Community ${this.communityName} not found`);
    }

    for (const job of jobs) {
      // Find or create employer
      const employer = await prisma.rCIPEmployer.upsert({
        where: {
          name_communityId: {
            name: job.employerName,
            communityId: community.id,
          },
        },
        create: {
          name: job.employerName,
          website: job.employerWebsite,
          communityId: community.id,
          isVerified: false,
        },
        update: {
          website: job.employerWebsite,
        },
      });

      // Create or update job
      await prisma.job.upsert({
        where: {
          sourceUrl_employerId: {
            sourceUrl: job.sourceUrl,
            employerId: employer.id,
          },
        },
        create: {
          ...job,
          employerId: employer.id,
        },
        update: {
          title: job.title,
          description: job.description,
          noc: job.noc,
          teerLevel: job.teerLevel,
          salary: job.salary,
          isRemote: job.isRemote,
          location: job.location,
          postedDate: job.postedDate,
        },
      });
    }
  }

  protected parseSalary(salaryText: string): number | undefined {
    const numbers = salaryText.match(/\d+([,.]\d+)?/g);
    if (!numbers) return undefined;
    
    // Convert all numbers to floats
    const salaries = numbers.map(n => parseFloat(n.replace(',', '')));
    
    // If there are two numbers, assume it's a range and take the average
    if (salaries.length === 2) {
      return (salaries[0] + salaries[1]) / 2;
    }
    
    // Otherwise take the first number
    return salaries[0];
  }

  protected parseDate(dateText: string): Date | undefined {
    const date = new Date(dateText);
    return isNaN(date.getTime()) ? undefined : date;
  }

  protected cleanText(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  }
}
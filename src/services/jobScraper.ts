import axios from 'axios';
import * as cheerio from 'cheerio';
import { Job, RCIPEmployer } from '@prisma/client';
import { prisma } from '../lib/prisma';

interface ScrapedJob {
  title: string;
  description: string;
  noc: string;
  teerLevel: number;
  salary?: number;
  isRemote: boolean;
  location: string;
  employerName: string;
  employerWebsite?: string;
}

export class JobScraper {
  private static readonly RCIP_COMMUNITIES = [
    {
      name: 'Thunder Bay',
      url: 'https://www.gotothunderbay.ca/en/immigration/rural-and-northern-immigration-pilot.aspx',
    },
    // Add other RCIP communities here
  ];

  static async scrapeAllCommunities(): Promise<void> {
    for (const community of this.RCIP_COMMUNITIES) {
      try {
        const jobs = await this.scrapeCommunity(community.url);
        await this.saveJobs(jobs, community.name);
      } catch (error) {
        console.error(`Error scraping ${community.name}:`, error);
      }
    }
  }

  private static async scrapeCommunity(url: string): Promise<ScrapedJob[]> {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const jobs: ScrapedJob[] = [];

    // Implementation will vary based on each community's website structure
    // This is a basic example
    $('.job-posting').each((_, element) => {
      const job: ScrapedJob = {
        title: $(element).find('.job-title').text().trim(),
        description: $(element).find('.job-description').text().trim(),
        noc: $(element).find('.noc-code').text().trim(),
        teerLevel: parseInt($(element).find('.teer-level').text().trim()),
        salary: parseFloat($(element).find('.salary').text().trim()),
        isRemote: $(element).find('.remote').text().trim().toLowerCase() === 'yes',
        location: $(element).find('.location').text().trim(),
        employerName: $(element).find('.employer-name').text().trim(),
        employerWebsite: $(element).find('.employer-website').attr('href'),
      };
      jobs.push(job);
    });

    return jobs;
  }

  private static async saveJobs(jobs: ScrapedJob[], communityName: string): Promise<void> {
    for (const job of jobs) {
      // Find or create employer
      const employer = await prisma.rCIPEmployer.upsert({
        where: {
          name_communityId: {
            name: job.employerName,
            communityId: (await this.getCommunityId(communityName)),
          },
        },
        create: {
          name: job.employerName,
          website: job.employerWebsite,
          community: {
            connect: {
              name: communityName,
            },
          },
          isVerified: false, // Requires manual verification
        },
        update: {
          website: job.employerWebsite,
        },
      });

      // Create or update job
      await prisma.job.upsert({
        where: {
          employerId_title: {
            employerId: employer.id,
            title: job.title,
          },
        },
        create: {
          ...job,
          employerId: employer.id,
        },
        update: {
          description: job.description,
          noc: job.noc,
          teerLevel: job.teerLevel,
          salary: job.salary,
          isRemote: job.isRemote,
          location: job.location,
        },
      });
    }
  }

  private static async getCommunityId(name: string): Promise<string> {
    const community = await prisma.community.findUnique({
      where: { name },
    });
    if (!community) {
      throw new Error(`Community ${name} not found`);
    }
    return community.id;
  }
}

export const rankJobMatch = async (
  jobId: string,
  userNoc: string,
  userTeerLevel: number
): Promise<number> => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { employer: true },
  });

  if (!job) {
    throw new Error('Job not found');
  }

  let score = 0;

  // NOC match
  if (job.noc === userNoc) {
    score += 40;
  } else if (job.noc.startsWith(userNoc.substring(0, 3))) {
    score += 20; // Related NOC
  }

  // TEER level match
  if (job.teerLevel === userTeerLevel) {
    score += 30;
  } else if (Math.abs(job.teerLevel - userTeerLevel) === 1) {
    score += 15; // Adjacent TEER level
  }

  // Employer verification bonus
  if (job.employer.isVerified) {
    score += 30;
  }

  return Math.min(score, 100); // Cap at 100
};
import { BaseScraper, ScrapedJob } from './BaseScraper';

export class SudburyScraper extends BaseScraper {
  constructor() {
    super(
      'Sudbury',
      'https://www.greatersudbury.ca/live/immigration-and-newcomers/rural-and-northern-immigration-pilot/'
    );
  }

  async scrapeJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];
    const $ = await this.fetchPage(this.baseUrl);

    // Find the job listings container
    $('.job-listing').each(async (_, element) => {
      const $job = $(element);
      
      const title = this.cleanText($job.find('.job-title').text());
      const description = this.cleanText($job.find('.job-description').text());
      const employerName = this.cleanText($job.find('.employer').text());
      const location = this.cleanText($job.find('.location').text());
      const salaryText = this.cleanText($job.find('.salary').text());
      const datePosted = this.cleanText($job.find('.date').text());
      const jobUrl = $job.find('a.job-link').attr('href');
      const employerUrl = $job.find('a.employer-link').attr('href');

      // Extract NOC and TEER level using AI
      const { noc, teerLevel } = await this.extractNOCAndTEER(title, description);

      const job: ScrapedJob = {
        title,
        description,
        noc,
        teerLevel,
        salary: this.parseSalary(salaryText),
        isRemote: description.toLowerCase().includes('remote'),
        location: location || 'Sudbury, ON',
        employerName,
        employerWebsite: employerUrl,
        sourceUrl: jobUrl || this.baseUrl,
        postedDate: this.parseDate(datePosted),
      };

      jobs.push(job);
    });

    await this.saveJobs(jobs);
    return jobs;
  }
}
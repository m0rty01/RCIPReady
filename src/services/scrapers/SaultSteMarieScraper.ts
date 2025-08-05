import { BaseScraper, ScrapedJob } from './BaseScraper';

export class SaultSteMarieScraper extends BaseScraper {
  constructor() {
    super(
      'Sault Ste. Marie',
      'https://welcometossm.com/rural-and-northern-immigration-pilot/'
    );
  }

  async scrapeJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];
    const $ = await this.fetchPage(this.baseUrl);

    // Find the job listings container
    $('.rnip-job').each(async (_, element) => {
      const $job = $(element);
      
      const title = this.cleanText($job.find('.position-title').text());
      const description = this.cleanText($job.find('.job-description').text());
      const employerName = this.cleanText($job.find('.employer-name').text());
      const location = this.cleanText($job.find('.location').text());
      const salaryText = this.cleanText($job.find('.compensation').text());
      const datePosted = this.cleanText($job.find('.posted-date').text());
      const jobUrl = $job.find('a.apply-link').attr('href');
      const employerUrl = $job.find('a.employer-website').attr('href');

      // Extract NOC and TEER level using AI
      const { noc, teerLevel } = await this.extractNOCAndTEER(title, description);

      const job: ScrapedJob = {
        title,
        description,
        noc,
        teerLevel,
        salary: this.parseSalary(salaryText),
        isRemote: description.toLowerCase().includes('remote'),
        location: location || 'Sault Ste. Marie, ON',
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
import { BaseScraper, ScrapedJob } from './BaseScraper';

export class VernonScraper extends BaseScraper {
  constructor() {
    super(
      'Vernon',
      'https://www.vernon.ca/immigration/rural-and-northern-immigration-pilot/'
    );
  }

  async scrapeJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];
    const $ = await this.fetchPage(this.baseUrl);

    // Find the job listings container
    $('.job-opportunity').each(async (_, element) => {
      const $job = $(element);
      
      const title = this.cleanText($job.find('.job-title').text());
      const description = this.cleanText($job.find('.description').text());
      const employerName = this.cleanText($job.find('.employer').text());
      const location = this.cleanText($job.find('.location').text());
      const salaryText = this.cleanText($job.find('.salary').text());
      const datePosted = this.cleanText($job.find('.date').text());
      const jobUrl = $job.find('a.apply').attr('href');
      const employerUrl = $job.find('a.employer-site').attr('href');

      // Extract NOC and TEER level using AI
      const { noc, teerLevel } = await this.extractNOCAndTEER(title, description);

      const job: ScrapedJob = {
        title,
        description,
        noc,
        teerLevel,
        salary: this.parseSalary(salaryText),
        isRemote: description.toLowerCase().includes('remote'),
        location: location || 'Vernon, BC',
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
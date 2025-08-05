import { BaseScraper, ScrapedJob } from './BaseScraper';

export class WestKootenayScraper extends BaseScraper {
  constructor() {
    super(
      'West Kootenay',
      'https://wk-rnip.ca/jobs/'
    );
  }

  async scrapeJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];
    const $ = await this.fetchPage(this.baseUrl);

    // Find all job listings
    const jobElements = $('.job-posting').toArray();

    // Process each job listing
    for (const element of jobElements) {
      const $job = $(element);
      
      const title = this.cleanText($job.find('.position').text());
      const description = this.cleanText($job.find('.description').text());
      const employerName = this.cleanText($job.find('.employer').text());
      const location = this.cleanText($job.find('.location').text());
      const salaryText = this.cleanText($job.find('.salary').text());
      const datePosted = this.cleanText($job.find('.posted').text());
      const jobUrl = $job.find('a.apply-now').attr('href');
      const employerUrl = $job.find('a.company-website').attr('href');

      // Extract NOC and TEER level using AI
      const { noc, teerLevel } = await this.extractNOCAndTEER(title, description);

      const job: ScrapedJob = {
        title,
        description,
        noc,
        teerLevel,
        salary: this.parseSalary(salaryText),
        isRemote: description.toLowerCase().includes('remote'),
        location: location || 'West Kootenay, BC',
        employerName,
        employerWebsite: employerUrl,
        sourceUrl: jobUrl || this.baseUrl,
        postedDate: this.parseDate(datePosted),
      };

      jobs.push(job);
    }

    await this.saveJobs(jobs);
    return jobs;
  }
}
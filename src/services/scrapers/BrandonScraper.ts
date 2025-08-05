import { BaseScraper, ScrapedJob } from './BaseScraper';

export class BrandonScraper extends BaseScraper {
  constructor() {
    super(
      'Brandon',
      'https://economicdevelopmentbrandon.com/rnip/'
    );
  }

  async scrapeJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];
    const $ = await this.fetchPage(this.baseUrl);

    // Find the job listings container
    $('.job-posting').each(async (_, element) => {
      const $job = $(element);
      
      const title = this.cleanText($job.find('.job-title').text());
      const description = this.cleanText($job.find('.description').text());
      const employerName = this.cleanText($job.find('.employer-name').text());
      const location = this.cleanText($job.find('.location').text());
      const salaryText = this.cleanText($job.find('.salary-info').text());
      const datePosted = this.cleanText($job.find('.post-date').text());
      const jobUrl = $job.find('a.apply-now').attr('href');
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
        location: location || 'Brandon, MB',
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
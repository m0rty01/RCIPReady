import { BaseScraper, ScrapedJob } from './BaseScraper';

export class ClaresholmScraper extends BaseScraper {
  constructor() {
    super(
      'Claresholm',
      'https://claresholm.ca/rnip/'
    );
  }

  async scrapeJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];
    const $ = await this.fetchPage(this.baseUrl);

    // Find the job listings container
    $('.rnip-job').each(async (_, element) => {
      const $job = $(element);
      
      const title = this.cleanText($job.find('.position-title').text());
      const description = this.cleanText($job.find('.job-details').text());
      const employerName = this.cleanText($job.find('.employer').text());
      const location = this.cleanText($job.find('.location').text());
      const salaryText = this.cleanText($job.find('.salary').text());
      const datePosted = this.cleanText($job.find('.post-date').text());
      const jobUrl = $job.find('a.apply').attr('href');
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
        location: location || 'Claresholm, AB',
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
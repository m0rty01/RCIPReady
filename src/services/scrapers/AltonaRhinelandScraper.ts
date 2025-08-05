import { BaseScraper, ScrapedJob } from './BaseScraper';

export class AltonaRhinelandScraper extends BaseScraper {
  constructor() {
    super(
      'Altona/Rhineland',
      'https://www.altona.ca/rnip/'
    );
  }

  async scrapeJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];
    const $ = await this.fetchPage(this.baseUrl);

    // Find the job listings container
    $('.job-opportunity').each(async (_, element) => {
      const $job = $(element);
      
      const title = this.cleanText($job.find('.position-title').text());
      const description = this.cleanText($job.find('.job-description').text());
      const employerName = this.cleanText($job.find('.company-name').text());
      const location = this.cleanText($job.find('.location').text());
      const salaryText = this.cleanText($job.find('.salary-range').text());
      const datePosted = this.cleanText($job.find('.date').text());
      const jobUrl = $job.find('a.apply-link').attr('href');
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
        location: location || 'Altona/Rhineland, MB',
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
import { BaseScraper, ScrapedJob } from './BaseScraper';

export class TimminsScraper extends BaseScraper {
  constructor() {
    super(
      'Timmins',
      'https://www.timminsedc.com/immigration/rural-and-northern-immigration-pilot/'
    );
  }

  async scrapeJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];
    const $ = await this.fetchPage(this.baseUrl);

    // Find the job listings container
    $('.rnip-position').each(async (_, element) => {
      const $job = $(element);
      
      const title = this.cleanText($job.find('.position-name').text());
      const description = this.cleanText($job.find('.position-details').text());
      const employerName = this.cleanText($job.find('.company').text());
      const location = this.cleanText($job.find('.job-location').text());
      const salaryText = this.cleanText($job.find('.salary-range').text());
      const datePosted = this.cleanText($job.find('.post-date').text());
      const jobUrl = $job.find('a.apply-now').attr('href');
      const employerUrl = $job.find('a.company-site').attr('href');

      // Extract NOC and TEER level using AI
      const { noc, teerLevel } = await this.extractNOCAndTEER(title, description);

      const job: ScrapedJob = {
        title,
        description,
        noc,
        teerLevel,
        salary: this.parseSalary(salaryText),
        isRemote: description.toLowerCase().includes('remote'),
        location: location || 'Timmins, ON',
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
import { BaseScraper, ScrapedJob } from './BaseScraper';

export class ThunderBayScraper extends BaseScraper {
  constructor() {
    super(
      'Thunder Bay',
      'https://www.gotothunderbay.ca/en/immigration/rural-and-northern-immigration-pilot.aspx'
    );
  }

  async scrapeJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];
    const $ = await this.fetchPage(this.baseUrl);

    // Find the job listings container
    $('.job-posting').each(async (_, element) => {
      const $job = $(element);
      
      const title = this.cleanText($job.find('.job-title').text());
      const description = this.cleanText($job.find('.job-description').text());
      const employerName = this.cleanText($job.find('.employer-name').text());
      const location = this.cleanText($job.find('.location').text());
      const salaryText = this.cleanText($job.find('.salary').text());
      const datePosted = this.cleanText($job.find('.date-posted').text());
      const jobUrl = $job.find('a.job-link').attr('href');
      const employerUrl = $job.find('a.employer-website').attr('href');
      
      // Extract NOC and TEER level using AI
      const { noc, teerLevel } = await this.extractNOCAndTEER(title, description);

      const job: ScrapedJob = {
        title,
        description,
        noc,
        teerLevel,
        salary: this.parseSalary(salaryText),
        isRemote: $job.find('.remote').text().toLowerCase().includes('remote'),
        location: location || 'Thunder Bay, ON',
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
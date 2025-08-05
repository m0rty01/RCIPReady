import Card from '../ui/Card';

interface CommunityInsightsProps {
  insights: {
    livingCosts: {
      housing: string;
      utilities: string;
      transportation: string;
      groceries: string;
    };
    jobMarket: {
      topIndustries: string[];
      growthSectors: string[];
      averageSalary: string;
    };
    education: {
      schools: string;
      postSecondary: string[];
      specialPrograms: string[];
    };
    healthcare: {
      facilities: string[];
      specialistAccess: string;
      waitTimes: string;
    };
    integration: {
      immigrantServices: string[];
      culturalGroups: string[];
      languages: string[];
    };
    lifestyle: {
      recreation: string[];
      climate: string;
      events: string[];
    };
  };
}

export default function CommunityInsights({ insights }: CommunityInsightsProps) {
  return (
    <div className="space-y-6">
      <Card title="Cost of Living">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Housing</h4>
            <p className="mt-2 text-sm text-gray-600">{insights.livingCosts.housing}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Utilities</h4>
            <p className="mt-2 text-sm text-gray-600">{insights.livingCosts.utilities}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Transportation</h4>
            <p className="mt-2 text-sm text-gray-600">{insights.livingCosts.transportation}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Groceries</h4>
            <p className="mt-2 text-sm text-gray-600">{insights.livingCosts.groceries}</p>
          </div>
        </div>
      </Card>

      <Card title="Job Market">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Top Industries</h4>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-600">
              {insights.jobMarket.topIndustries.map((industry, index) => (
                <li key={index}>{industry}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Growth Sectors</h4>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-600">
              {insights.jobMarket.growthSectors.map((sector, index) => (
                <li key={index}>{sector}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Average Salary</h4>
            <p className="mt-2 text-sm text-gray-600">{insights.jobMarket.averageSalary}</p>
          </div>
        </div>
      </Card>

      <Card title="Healthcare">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Medical Facilities</h4>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-600">
              {insights.healthcare.facilities.map((facility, index) => (
                <li key={index}>{facility}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Specialist Access</h4>
            <p className="mt-2 text-sm text-gray-600">{insights.healthcare.specialistAccess}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Wait Times</h4>
            <p className="mt-2 text-sm text-gray-600">{insights.healthcare.waitTimes}</p>
          </div>
        </div>
      </Card>

      <Card title="Cultural Integration">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Immigrant Services</h4>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-600">
              {insights.integration.immigrantServices.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Cultural Groups</h4>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-600">
              {insights.integration.culturalGroups.map((group, index) => (
                <li key={index}>{group}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Languages</h4>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-600">
              {insights.integration.languages.map((language, index) => (
                <li key={index}>{language}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <Card title="Lifestyle">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Recreation</h4>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-600">
              {insights.lifestyle.recreation.map((activity, index) => (
                <li key={index}>{activity}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Climate</h4>
            <p className="mt-2 text-sm text-gray-600">{insights.lifestyle.climate}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Events</h4>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-600">
              {insights.lifestyle.events.map((event, index) => (
                <li key={index}>{event}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
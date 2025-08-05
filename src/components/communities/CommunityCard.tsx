import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface CommunityCardProps {
  community: {
    id: string;
    name: string;
    province: string;
    matchScore: number;
    jobOpportunities: number;
    costOfLivingIndex: number;
    immigrantSupportScore: number;
    reasons: string[];
    considerations: string[];
    restrictions?: string[];
  };
  onViewDetails: (communityId: string) => void;
}

export default function CommunityCard({
  community,
  onViewDetails,
}: CommunityCardProps) {
  const [showMore, setShowMore] = useState(false);

  const scoreToColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow duration-200"
      title={
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {community.name}, {community.province}
            </h3>
            <div className="mt-1 text-sm text-gray-500">
              {community.jobOpportunities} active job opportunities
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Match Score</div>
            <div className={`text-2xl font-bold ${scoreToColor(community.matchScore)}`}>
              {community.matchScore}%
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-between items-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? 'Show Less' : 'Show More'}
          </Button>
          <Button size="sm" onClick={() => onViewDetails(community.id)}>
            View Details
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Cost of Living</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              {community.costOfLivingIndex}/100
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">
              Immigrant Support
            </div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              {community.immigrantSupportScore}/100
            </div>
          </div>
        </div>

        {showMore && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            {community.reasons.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Why This Community?
                </h4>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-600">
                  {community.reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {community.considerations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Key Considerations
                </h4>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-600">
                  {community.considerations.map((consideration, index) => (
                    <li key={index}>{consideration}</li>
                  ))}
                </ul>
              </div>
            )}

            {community.restrictions && community.restrictions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Current Restrictions
                </h4>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-red-600">
                  {community.restrictions.map((restriction, index) => (
                    <li key={index}>{restriction}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    employer: {
      name: string;
      isVerified: boolean;
      community: {
        name: string;
      };
    };
    noc: string;
    teerLevel: number;
    salary?: number;
    isRemote: boolean;
    location: string;
    matchScore?: number;
  };
  onApply: (jobId: string) => void;
}

export default function JobCard({ job, onApply }: JobCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card
      className="hover:shadow-lg transition-shadow duration-200"
      title={
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
            <div className="mt-1 flex items-center">
              <span className="text-sm text-gray-500">{job.employer.name}</span>
              {job.employer.isVerified && (
                <svg
                  className="ml-1 h-5 w-5 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>
          {job.matchScore !== undefined && (
            <div className="flex items-center">
              <div className="text-sm font-medium text-gray-500">Match Score</div>
              <div className="ml-2 text-lg font-semibold text-indigo-600">
                {job.matchScore}%
              </div>
            </div>
          )}
        </div>
      }
      footer={
        <div className="flex justify-between items-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </Button>
          <Button size="sm" onClick={() => onApply(job.id)}>
            Apply Now
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-500">Location:</span>
            <span className="ml-2 text-gray-900">
              {job.location} {job.isRemote && '(Remote Available)'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-500">Community:</span>
            <span className="ml-2 text-gray-900">{job.employer.community.name}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500">NOC Code:</span>
            <span className="ml-2 text-gray-900">{job.noc}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500">TEER Level:</span>
            <span className="ml-2 text-gray-900">{job.teerLevel}</span>
          </div>
          {job.salary && (
            <div>
              <span className="font-medium text-gray-500">Salary:</span>
              <span className="ml-2 text-gray-900">
                ${job.salary.toLocaleString()} CAD
              </span>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900">Job Description</h4>
            <p className="mt-2 text-sm text-gray-500">{job.description}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
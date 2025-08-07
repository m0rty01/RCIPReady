'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface Job {
  id: string;
  title: string;
  location: string;
  employer: {
    name: string;
  };
  salary?: string;
  noc?: string;
  teer?: string;
}

export default function JobsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState({
    title: '',
    location: '',
    teerLevel: '',
    noc: '',
    isRemote: false,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              RCIP Job Search
            </h1>
            <p className="text-xl text-gray-300">
              Find RCIP-eligible jobs in participating communities
            </p>
          </div>

          {/* Search Form */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <form onSubmit={handleSearch} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Job Title"
                  placeholder="e.g. Software Developer"
                  value={filters.title}
                  onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                  icon={
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />
                <Input
                  label="Location"
                  placeholder="e.g. Thunder Bay"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  icon={
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                />
                <Input
                  label="TEER Level"
                  type="number"
                  min="0"
                  max="5"
                  placeholder="0-5"
                  value={filters.teerLevel}
                  onChange={(e) => setFilters({ ...filters, teerLevel: e.target.value })}
                  icon={
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                />
                <Input
                  label="NOC Code"
                  placeholder="e.g. 21231"
                  value={filters.noc}
                  onChange={(e) => setFilters({ ...filters, noc: e.target.value })}
                  icon={
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                <label className="flex items-center space-x-3 text-gray-300">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 rounded border-gray-600 bg-gray-700 text-indigo-500 
                             focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800
                             transition-colors duration-200"
                    checked={filters.isRemote}
                    onChange={(e) => setFilters({ ...filters, isRemote: e.target.checked })}
                  />
                  <span className="text-base">Remote Only</span>
                </label>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="px-8 py-3 text-base font-medium"
                >
                  Search Jobs
                </Button>
              </div>
            </form>
          </Card>

          {/* Results */}
          {jobs.length === 0 && !isLoading && (
            <div className="text-center py-16 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <p className="mt-4 text-lg text-gray-300">
                No jobs found. Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import Button from '../ui/Button';

interface JobSearchProps {
  onSearch: (filters: JobSearchFilters) => void;
}

export interface JobSearchFilters {
  title?: string;
  location?: string;
  teerLevel?: number;
  isRemote?: boolean;
  noc?: string;
}

export default function JobSearch({ onSearch }: JobSearchProps) {
  const [filters, setFilters] = useState<JobSearchFilters>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Job Title
          </label>
          <input
            type="text"
            id="title"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g. Software Developer"
            value={filters.title || ''}
            onChange={(e) => setFilters({ ...filters, title: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            id="location"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g. Thunder Bay"
            value={filters.location || ''}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="teerLevel" className="block text-sm font-medium text-gray-700">
            TEER Level
          </label>
          <select
            id="teerLevel"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={filters.teerLevel || ''}
            onChange={(e) => setFilters({ ...filters, teerLevel: Number(e.target.value) })}
          >
            <option value="">Any</option>
            {[0, 1, 2, 3, 4, 5].map((level) => (
              <option key={level} value={level}>
                TEER {level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="noc" className="block text-sm font-medium text-gray-700">
            NOC Code
          </label>
          <input
            type="text"
            id="noc"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g. 21231"
            value={filters.noc || ''}
            onChange={(e) => setFilters({ ...filters, noc: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="remote"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          checked={filters.isRemote || false}
          onChange={(e) => setFilters({ ...filters, isRemote: e.target.checked })}
        />
        <label htmlFor="remote" className="ml-2 block text-sm text-gray-700">
          Remote Only
        </label>
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          Search Jobs
        </Button>
      </div>
    </form>
  );
}
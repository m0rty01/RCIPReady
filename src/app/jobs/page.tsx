'use client';

import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

interface Job {
  id: string;
  title: string;
  description: string;
  noc: string;
  teerLevel: number;
  salary: number | null;
  isRemote: boolean;
  location: string;
  employer: {
    name: string;
    community: {
      name: string;
      province: string;
    };
  };
}

export default function JobFinder() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    query: '',
    location: '',
    teerLevel: '',
    remote: false,
    noc: '',
  });
  const [resume, setResume] = useState<File | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [matchScore, setMatchScore] = useState<{ score: number; feedback: string } | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setResume(acceptedFiles[0]);
    },
  });

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters as any);
      const response = await fetch(`/api/jobs?${queryParams}`);
      const data = await response.json();
      setJobs(data.jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMatch = async (jobId: string) => {
    if (!resume) return;

    try {
      const formData = new FormData();
      formData.append('resume', resume);
      formData.append('jobId', jobId);

      const response = await fetch('/api/jobs', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setMatchScore(data);
      setSelectedJob(jobId);
    } catch (error) {
      console.error('Error calculating match:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">RCIP Job & Employer Finder</h1>
      
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search jobs..."
            className="border rounded p-2"
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          />
          <input
            type="text"
            placeholder="Location"
            className="border rounded p-2"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          />
          <select
            className="border rounded p-2"
            value={filters.teerLevel}
            onChange={(e) => setFilters({ ...filters, teerLevel: e.target.value })}
          >
            <option value="">All TEER Levels</option>
            <option value="0">TEER 0</option>
            <option value="1">TEER 1</option>
            <option value="2">TEER 2</option>
            <option value="3">TEER 3</option>
          </select>
        </div>
        
        <div className="mt-4 flex items-center">
          <label className="flex items-center mr-4">
            <input
              type="checkbox"
              checked={filters.remote}
              onChange={(e) => setFilters({ ...filters, remote: e.target.checked })}
              className="mr-2"
            />
            Remote Only
          </label>
          <input
            type="text"
            placeholder="NOC Code"
            className="border rounded p-2 w-32"
            value={filters.noc}
            onChange={(e) => setFilters({ ...filters, noc: e.target.value })}
          />
        </div>
      </div>

      {/* Resume Upload */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Resume for AI Match Score</h2>
        <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer">
          <input {...getInputProps()} />
          <p>{resume ? resume.name : 'Drag & drop your resume here, or click to select'}</p>
        </div>
      </div>

      {/* Job Listings */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center">No jobs found</div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{job.title}</h3>
                  <p className="text-gray-600">{job.employer.name} - {job.employer.community.name}, {job.employer.community.province}</p>
                  <div className="mt-2 space-x-2">
                    <span className="inline-block bg-gray-100 px-2 py-1 rounded text-sm">NOC: {job.noc}</span>
                    <span className="inline-block bg-gray-100 px-2 py-1 rounded text-sm">TEER {job.teerLevel}</span>
                    {job.isRemote && (
                      <span className="inline-block bg-green-100 px-2 py-1 rounded text-sm">Remote</span>
                    )}
                    {job.salary && (
                      <span className="inline-block bg-gray-100 px-2 py-1 rounded text-sm">
                        ${job.salary.toLocaleString()} /year
                      </span>
                    )}
                  </div>
                </div>
                {resume && (
                  <button
                    onClick={() => calculateMatch(job.id)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500"
                  >
                    Calculate Match
                  </button>
                )}
              </div>
              
              <p className="mt-4">{job.description}</p>
              
              {selectedJob === job.id && matchScore && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <h4 className="font-semibold">AI Match Score: {matchScore.score}%</h4>
                  <p className="mt-2 text-sm">{matchScore.feedback}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
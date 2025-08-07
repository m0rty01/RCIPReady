'use client';

import { useState, useEffect } from 'react';
import CommunityCard from '@/components/communities/CommunityCard';
import CommunityInsights from '@/components/communities/CommunityInsights';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface Community {
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
}

export default function CommunitiesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [insights, setInsights] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/communities/recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // TODO: Replace with actual user profile data
            occupation: 'Software Developer',
            noc: '21231',
            teerLevel: 1,
            familySize: 2,
            languageScores: {
              speaking: 7,
              listening: 7,
              reading: 7,
              writing: 7,
            },
            workExperience: 5,
            education: 'Bachelor\'s Degree',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch communities');
        }

        const data = await response.json();
        setCommunities(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching communities:', error);
        setError(error instanceof Error ? error.message : 'Failed to load communities');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const handleViewDetails = async (communityId: string) => {
    try {
      setSelectedCommunity(communityId);
      const response = await fetch('/api/communities/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          communityId,
          // TODO: Replace with actual profile data
          profile: {
            occupation: 'Software Developer',
            familySize: 2,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch community insights');
      }

      const data = await response.json();
      setInsights(data.insights);
    } catch (error) {
      console.error('Error fetching community insights:', error);
      setError(error instanceof Error ? error.message : 'Failed to load community insights');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-64 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center text-red-600 py-8">{error}</div>
      </Card>
    );
  }

  if (selectedCommunity && insights) {
    return (
      <div>
        <Button
          variant="secondary"
          className="mb-6"
          onClick={() => {
            setSelectedCommunity(null);
            setInsights(null);
          }}
        >
          ← Back to Communities
        </Button>
        <CommunityInsights insights={insights} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="prose max-w-none mb-6">
          <h1>RCIP Communities</h1>
          <p>
            Find the best RCIP community for your profile. Communities are ranked
            based on job opportunities, cost of living, and immigration support.
          </p>
        </div>
      </Card>

      {communities.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {communities.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">No communities found</p>
          </div>
        </Card>
      )}
    </div>
  );
}
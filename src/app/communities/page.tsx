'use client';

import { useState, useEffect } from 'react';
import CommunityCard from '@/components/communities/CommunityCard';
import CommunityInsights from '@/components/communities/CommunityInsights';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function CommunitiesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [communities, setCommunities] = useState<any[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [insights, setInsights] = useState<any | null>(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
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
        const data = await response.json();
        setCommunities(data);
      } catch (error) {
        console.error('Error fetching communities:', error);
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
      const data = await response.json();
      setInsights(data.insights);
    } catch (error) {
      console.error('Error fetching community insights:', error);
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
      <Card title="Recommended Communities">
        <p className="text-sm text-gray-500 mb-6">
          These communities are ranked based on your profile, job opportunities,
          and success potential.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {communities.map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import PredictionForm, { PredictionData } from '@/components/pr/PredictionForm';
import PredictionResult from '@/components/pr/PredictionResult';
import Card from '@/components/ui/Card';

export default function PRPredictionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: PredictionData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/pr-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction');
      }

      const result = await response.json();
      setPrediction(result);
    } catch (error) {
      console.error('Error getting prediction:', error);
      setError('Failed to get prediction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <div className="prose max-w-none">
          <h2>PR Processing Time Predictor</h2>
          <p>
            Get an estimated timeline for your PR application based on your current
            status and historical data from similar cases.
          </p>
          <ul>
            <li>AI-powered prediction using historical RCIP data</li>
            <li>Considers community-specific processing times</li>
            <li>Provides personalized recommendations</li>
            <li>Updated with latest processing trends</li>
          </ul>
        </div>
      </Card>

      <PredictionForm onSubmit={handleSubmit} isLoading={isLoading} />

      {error && (
        <Card>
          <div className="text-red-600">{error}</div>
        </Card>
      )}

      {prediction && <PredictionResult prediction={prediction} />}
    </div>
  );
}
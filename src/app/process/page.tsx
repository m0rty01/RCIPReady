'use client';

import { useState, useEffect } from 'react';
import ProcessTimeline from '@/components/process/ProcessTimeline';
import AlertList from '@/components/process/AlertList';
import Card from '@/components/ui/Card';

export default function ProcessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [process, setProcess] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch process data
        const processResponse = await fetch('/api/process?userId=123');
        if (!processResponse.ok) {
          throw new Error('Failed to fetch process data');
        }
        const processData = await processResponse.json();
        setProcess(processData);

        // Fetch alerts
        const alertsResponse = await fetch('/api/alerts?userId=123');
        if (!alertsResponse.ok) {
          throw new Error('Failed to fetch alerts');
        }
        const alertsData = await alertsResponse.json();
        setAlerts(Array.isArray(alertsData) ? alertsData : []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMarkAlertRead = async (alertId: string) => {
    try {
      const response = await fetch('/api/alerts/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alertId }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark alert as read');
      }

      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-96 bg-gray-200 rounded-lg"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
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

  if (!process) {
    return (
      <Card>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No Process Found</h3>
          <p className="mt-2 text-sm text-gray-500">
            Please start your RCIP application process.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="prose max-w-none mb-6">
          <h1>RCIP Application Process</h1>
          <p>
            Track your progress through the RCIP application process. Follow the
            checklist for each stage and stay updated with important alerts.
          </p>
        </div>
      </Card>

      <ProcessTimeline
        currentStage={process.currentStage}
        stages={process.stages}
      />
      
      <AlertList
        alerts={alerts}
        onMarkRead={handleMarkAlertRead}
      />
    </div>
  );
}
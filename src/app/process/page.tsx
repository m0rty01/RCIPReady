'use client';

import { useState, useEffect } from 'react';
import ProcessTimeline from '@/components/process/ProcessTimeline';
import AlertList from '@/components/process/AlertList';
import Card from '@/components/ui/Card';

export default function ProcessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [process, setProcess] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // TODO: Replace with actual API calls
    const fetchData = async () => {
      try {
        // Fetch process data
        const processResponse = await fetch('/api/process?userId=123');
        const processData = await processResponse.json();
        setProcess(processData);

        // Fetch alerts
        const alertsResponse = await fetch('/api/alerts?userId=123');
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMarkAlertRead = async (alertId: string) => {
    try {
      await fetch('/api/alerts/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alertId }),
      });

      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
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
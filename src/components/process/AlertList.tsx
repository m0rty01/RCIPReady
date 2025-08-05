import { useState } from 'react';
import Card from '../ui/Card';
import Alert from '../ui/Alert';

interface AlertListProps {
  alerts: {
    id: string;
    type: 'deadline' | 'action' | 'update' | 'warning';
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
    dueDate?: Date;
    actionRequired?: string;
    isRead: boolean;
  }[];
  onMarkRead: (alertId: string) => void;
}

export default function AlertList({ alerts, onMarkRead }: AlertListProps) {
  const [showRead, setShowRead] = useState(false);

  const filteredAlerts = alerts.filter((alert) => showRead || !alert.isRead);
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    // Sort by priority first
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by due date if available
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return 0;
  });

  const alertTypeToVariant = {
    deadline: 'warning',
    action: 'info',
    update: 'success',
    warning: 'error',
  } as const;

  return (
    <Card title="Alerts & Notifications">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            {filteredAlerts.length} Alert{filteredAlerts.length !== 1 && 's'}
          </h3>
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={showRead}
              onChange={(e) => setShowRead(e.target.checked)}
              className="h-4 w-4 text-indigo-600 rounded border-gray-300"
            />
            <span className="ml-2">Show read alerts</span>
          </label>
        </div>

        <div className="space-y-3">
          {sortedAlerts.map((alert) => (
            <Alert
              key={alert.id}
              type={alertTypeToVariant[alert.type]}
              title={alert.title}
              onClose={() => onMarkRead(alert.id)}
            >
              <div className="space-y-2">
                <p>{alert.message}</p>
                {alert.dueDate && (
                  <p className="text-sm font-medium">
                    Due: {new Date(alert.dueDate).toLocaleDateString()}
                  </p>
                )}
                {alert.actionRequired && (
                  <p className="text-sm font-medium">
                    Action Required: {alert.actionRequired}
                  </p>
                )}
                {alert.isRead && (
                  <p className="text-sm text-gray-500 italic">Read</p>
                )}
              </div>
            </Alert>
          ))}

          {filteredAlerts.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No alerts to display
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
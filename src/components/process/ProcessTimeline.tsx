import { ProcessStage } from '@prisma/client';
import Card from '../ui/Card';

interface ProcessTimelineProps {
  currentStage: ProcessStage;
  stages: {
    stage: ProcessStage;
    completed: boolean;
    startDate?: Date;
    endDate?: Date;
    checklist: {
      id: string;
      title: string;
      completed: boolean;
    }[];
  }[];
}

export default function ProcessTimeline({ currentStage, stages }: ProcessTimelineProps) {
  const getStageLabel = (stage: ProcessStage): string => {
    return stage.toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <div className="flow-root">
        <ul className="-mb-8">
          {stages.map((stage, index) => (
            <li key={stage.stage}>
              <div className="relative pb-8">
                {index < stages.length - 1 && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                        ${
                          stage.completed
                            ? 'bg-green-500'
                            : stage.stage === currentStage
                            ? 'bg-blue-500'
                            : 'bg-gray-300'
                        }
                      `}
                    >
                      {stage.completed ? (
                        <svg
                          className="h-5 w-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <span className="h-2.5 w-2.5 rounded-full bg-white" />
                      )}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {getStageLabel(stage.stage)}
                    </div>
                    {(stage.startDate || stage.endDate) && (
                      <div className="mt-1 text-sm text-gray-500">
                        {stage.startDate && (
                          <span>
                            Started: {new Date(stage.startDate).toLocaleDateString()}
                          </span>
                        )}
                        {stage.endDate && (
                          <span className="ml-2">
                            Completed: {new Date(stage.endDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                    {stage.checklist.length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-900">Checklist</h4>
                        <ul className="mt-2 space-y-2">
                          {stage.checklist.map((item) => (
                            <li
                              key={item.id}
                              className="flex items-center text-sm text-gray-500"
                            >
                              <input
                                type="checkbox"
                                checked={item.completed}
                                readOnly
                                className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                              />
                              <span className="ml-2">{item.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
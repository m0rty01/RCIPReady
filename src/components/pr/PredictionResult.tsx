import Card from '../ui/Card';
import Alert from '../ui/Alert';

interface PredictionResultProps {
  prediction: {
    estimatedWaitTime: number;
    estimatedDecisionDate: string;
    confidence: number;
    factors: {
      name: string;
      impact: string;
      description: string;
    }[];
    recommendations: string[];
  };
}

export default function PredictionResult({ prediction }: PredictionResultProps) {
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-blue-600';
    return 'text-yellow-600';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card title="Processing Time Prediction">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm font-medium text-gray-500">
              Estimated Wait Time
            </div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">
              {prediction.estimatedWaitTime} days
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500">
              Estimated Decision Date
            </div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">
              {formatDate(prediction.estimatedDecisionDate)}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500">
              Prediction Confidence
            </div>
            <div
              className={`mt-1 text-3xl font-semibold ${getConfidenceColor(
                prediction.confidence
              )}`}
            >
              {Math.round(prediction.confidence * 100)}%
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">
            Factors Affecting Processing Time
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prediction.factors.map((factor, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 bg-gray-50"
              >
                <h5 className="text-sm font-medium text-gray-900">
                  {factor.name}
                </h5>
                <div className="mt-1 text-sm text-gray-500">
                  {factor.description}
                </div>
                <div className="mt-2 text-sm font-medium text-indigo-600">
                  Impact: {factor.impact}
                </div>
              </div>
            ))}
          </div>
        </div>

        {prediction.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Recommendations
            </h4>
            <Alert type="info">
              <ul className="list-disc pl-5 space-y-1">
                {prediction.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </Alert>
          </div>
        )}
      </div>
    </Card>
  );
}
import Card from '../ui/Card';
import Alert from '../ui/Alert';
import Button from '../ui/Button';

interface ValidationResultProps {
  result: {
    isValid: boolean;
    score: number;
    issues: string[];
    suggestions: string[];
  };
  onRequestEmail?: () => void;
}

export default function ValidationResult({
  result,
  onRequestEmail,
}: ValidationResultProps) {
  return (
    <Card
      title="Document Validation Results"
      className="max-w-2xl mx-auto"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-500">Validation Score</div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">
              {result.score}%
            </div>
          </div>
          <div className={`text-lg font-medium ${
            result.isValid ? 'text-green-600' : 'text-red-600'
          }`}>
            {result.isValid ? 'Valid' : 'Invalid'}
          </div>
        </div>

        {result.issues.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Issues Found</h4>
            <Alert type="warning">
              <ul className="list-disc pl-5 space-y-1">
                {result.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </Alert>
          </div>
        )}

        {result.suggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Improvement Suggestions
            </h4>
            <div className="bg-blue-50 rounded-md p-4">
              <ul className="list-disc pl-5 space-y-1 text-blue-700">
                {result.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {onRequestEmail && !result.isValid && (
          <div className="flex justify-end">
            <Button onClick={onRequestEmail}>
              Get Detailed Improvement Email
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
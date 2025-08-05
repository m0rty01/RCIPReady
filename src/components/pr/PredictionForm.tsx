import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface PredictionFormProps {
  onSubmit: (data: PredictionData) => void;
  isLoading?: boolean;
}

export interface PredictionData {
  endorsementDate: string;
  medicalPassed?: string;
  biometricsDone?: string;
  communityName: string;
  hasWorkPermit: boolean;
}

export default function PredictionForm({
  onSubmit,
  isLoading = false,
}: PredictionFormProps) {
  const [formData, setFormData] = useState<PredictionData>({
    endorsementDate: '',
    communityName: '',
    hasWorkPermit: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card title="PR Processing Time Prediction">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="endorsementDate"
              className="block text-sm font-medium text-gray-700"
            >
              Endorsement Date *
            </label>
            <input
              type="date"
              id="endorsementDate"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.endorsementDate}
              onChange={(e) =>
                setFormData({ ...formData, endorsementDate: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="communityName"
              className="block text-sm font-medium text-gray-700"
            >
              RCIP Community *
            </label>
            <select
              id="communityName"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.communityName}
              onChange={(e) =>
                setFormData({ ...formData, communityName: e.target.value })
              }
            >
              <option value="">Select a community</option>
              <option value="Thunder Bay">Thunder Bay</option>
              <option value="North Bay">North Bay</option>
              <option value="Sudbury">Sudbury</option>
              <option value="Timmins">Timmins</option>
              <option value="Sault Ste. Marie">Sault Ste. Marie</option>
              <option value="Vernon">Vernon</option>
              <option value="West Kootenay">West Kootenay</option>
              <option value="Moose Jaw">Moose Jaw</option>
              <option value="Claresholm">Claresholm</option>
              <option value="Brandon">Brandon</option>
              <option value="Altona/Rhineland">Altona/Rhineland</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="medicalPassed"
              className="block text-sm font-medium text-gray-700"
            >
              Medical Exam Passed Date
            </label>
            <input
              type="date"
              id="medicalPassed"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.medicalPassed || ''}
              onChange={(e) =>
                setFormData({ ...formData, medicalPassed: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="biometricsDone"
              className="block text-sm font-medium text-gray-700"
            >
              Biometrics Completed Date
            </label>
            <input
              type="date"
              id="biometricsDone"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.biometricsDone || ''}
              onChange={(e) =>
                setFormData({ ...formData, biometricsDone: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="hasWorkPermit"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            checked={formData.hasWorkPermit}
            onChange={(e) =>
              setFormData({ ...formData, hasWorkPermit: e.target.checked })
            }
          />
          <label htmlFor="hasWorkPermit" className="ml-2 block text-sm text-gray-900">
            I have a work permit
          </label>
        </div>

        <div className="flex justify-end">
          <Button type="submit" isLoading={isLoading}>
            Get Prediction
          </Button>
        </div>
      </form>
    </Card>
  );
}
'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface DocumentType {
  id: string;
  title: string;
  description: string;
  acceptedFormats: string[];
}

const documentTypes: DocumentType[] = [
  {
    id: 'language',
    title: 'Language Test Results',
    description: 'Must be less than 2 years old',
    acceptedFormats: ['pdf'],
  },
  {
    id: 'eca',
    title: 'ECA Report',
    description: 'Educational Credential Assessment from a designated organization',
    acceptedFormats: ['pdf'],
  },
  {
    id: 'financial',
    title: 'Proof of Funds',
    description: 'Bank statements or certificates showing required settlement funds',
    acceptedFormats: ['pdf'],
  },
  {
    id: 'employment',
    title: 'Employment Documents',
    description: 'Reference letters, employment contracts, pay stubs',
    acceptedFormats: ['pdf'],
  },
];

export default function DocumentsPage() {
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File | null }>({});
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<{ [key: string]: string | null }>({});

  const handleFileChange = (docType: string, file: File | null) => {
    setSelectedFiles(prev => ({
      ...prev,
      [docType]: file
    }));
    // Clear validation result when new file is selected
    setValidationResults(prev => ({
      ...prev,
      [docType]: null
    }));
  };

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      // Create FormData with all selected files
      const formData = new FormData();
      Object.entries(selectedFiles).forEach(([type, file]) => {
        if (file) {
          formData.append(type, file);
        }
      });

      const response = await fetch('/api/documents/validate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Validation failed');

      const results = await response.json();
      setValidationResults(results);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              RCIP Document Validator
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Upload your documents for validation against RCIP requirements
            </p>
          </div>

          {/* Document Upload Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documentTypes.map((doc) => (
              <Card key={doc.id} className="relative">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {doc.description}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Accepted formats: {doc.acceptedFormats.join(', ')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      className={`
                        relative block w-full rounded-lg border-2 border-dashed p-4 text-center
                        hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                        ${selectedFiles[doc.id] 
                          ? 'border-green-500 dark:border-green-600' 
                          : 'border-gray-300 dark:border-gray-600'}
                        ${validationResults[doc.id] === 'error' ? 'border-red-500 dark:border-red-600' : ''}
                        cursor-pointer
                      `}
                    >
                      <input
                        type="file"
                        className="sr-only"
                        accept=".pdf"
                        onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)}
                      />
                      <div className="space-y-1">
                        {selectedFiles[doc.id] ? (
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            {selectedFiles[doc.id]?.name}
                          </div>
                        ) : (
                          <>
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 14v20c0 4.418 3.582 8 8 8h16c4.418 0 8-3.582 8-8V14M8 14c0-4.418 3.582-8 8-8h16c4.418 0 8 3.582 8 8M8 14h32"
                              />
                            </svg>
                            <span className="mt-2 block text-sm text-gray-600 dark:text-gray-400">
                              Click to upload or drag and drop
                            </span>
                          </>
                        )}
                      </div>
                    </label>

                    {validationResults[doc.id] && (
                      <div className={`text-sm ${
                        validationResults[doc.id] === 'error' 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {validationResults[doc.id]}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Validation Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleValidate}
              isLoading={isValidating}
              disabled={Object.keys(selectedFiles).length === 0}
              size="lg"
            >
              Validate Documents
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
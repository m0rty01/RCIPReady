'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface ValidationResult {
  isValid: boolean;
  issues: string[];
  expiryDate: string | null;
  scores?: Record<string, number>;
  suggestions: string[];
  confidence: number;
}

const DOCUMENT_TYPES = [
  {
    id: 'IELTS',
    name: 'IELTS Test Results',
    description: 'Language test results (must be less than 2 years old)',
    acceptedFormats: ['.pdf'],
  },
  {
    id: 'ECA',
    name: 'Educational Credential Assessment',
    description: 'ECA report from a designated organization',
    acceptedFormats: ['.pdf'],
  },
  {
    id: 'PROOF_OF_FUNDS',
    name: 'Proof of Funds',
    description: 'Bank statements or certificates showing required settlement funds',
    acceptedFormats: ['.pdf'],
  },
  {
    id: 'WORK_EXPERIENCE',
    name: 'Work Experience Documents',
    description: 'Reference letters, employment contracts, pay stubs',
    acceptedFormats: ['.pdf'],
  },
];

export default function DocumentValidator() {
  const [selectedType, setSelectedType] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      setValidationResult(null);
      setError(null);
    },
  });

  const validateDocument = async () => {
    if (!file || !selectedType) {
      setError('Please select a document type and upload a file');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', selectedType);

      const response = await fetch('/api/documents/validate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to validate document');
      }

      const result = await response.json();
      setValidationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">RCIP Document Validator</h1>

      {/* Document Type Selection */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Select Document Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOCUMENT_TYPES.map((type) => (
            <div
              key={type.id}
              className={`p-4 border rounded-lg cursor-pointer ${
                selectedType === type.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
              onClick={() => setSelectedType(type.id)}
            >
              <h3 className="font-semibold">{type.name}</h3>
              <p className="text-sm text-gray-600">{type.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: {type.acceptedFormats.join(', ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
        <div
          {...getRootProps()}
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
        >
          <input {...getInputProps()} />
          <p>{file ? file.name : 'Drag & drop your document here, or click to select'}</p>
        </div>
      </div>

      {/* Validation Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={validateDocument}
          disabled={loading || !file || !selectedType}
          className={`px-6 py-3 rounded-md text-white font-semibold ${
            loading || !file || !selectedType
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500'
          }`}
        >
          {loading ? 'Validating...' : 'Validate Document'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-700">
          {error}
        </div>
      )}

      {/* Validation Results */}
      {validationResult && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Validation Results</h2>
          
          {/* Overall Status */}
          <div className={`p-4 rounded-lg mb-4 ${
            validationResult.isValid ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <p className={`font-semibold ${
              validationResult.isValid ? 'text-green-700' : 'text-red-700'
            }`}>
              {validationResult.isValid ? 'Document Valid' : 'Document Invalid'}
            </p>
            <p className="text-sm text-gray-600">
              Confidence Score: {validationResult.confidence}%
            </p>
          </div>

          {/* Issues */}
          {validationResult.issues.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Issues Found:</h3>
              <ul className="list-disc list-inside space-y-1">
                {validationResult.issues.map((issue, index) => (
                  <li key={index} className="text-red-600">{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Expiry Date */}
          {validationResult.expiryDate && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Expiry Date:</h3>
              <p>{new Date(validationResult.expiryDate).toLocaleDateString()}</p>
            </div>
          )}

          {/* Scores */}
          {validationResult.scores && Object.keys(validationResult.scores).length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Scores:</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(validationResult.scores).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-2 rounded">
                    <span className="font-medium">{key}:</span> {value}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {validationResult.suggestions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Suggestions for Improvement:</h3>
              <ul className="list-disc list-inside space-y-1">
                {validationResult.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-indigo-600">{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
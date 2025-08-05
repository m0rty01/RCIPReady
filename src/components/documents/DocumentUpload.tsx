import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

interface DocumentUploadProps {
  documentType: string;
  onUpload: (file: File) => void;
  isUploading?: boolean;
  error?: string;
}

export default function DocumentUpload({
  documentType,
  onUpload,
  isUploading = false,
  error,
}: DocumentUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles[0]);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-indigo-500'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-sm text-gray-600">
            {isDragActive ? (
              <p>Drop the {documentType} here...</p>
            ) : (
              <p>
                Drag and drop your {documentType}, or{' '}
                <span className="text-indigo-600">browse</span>
              </p>
            )}
          </div>
          <p className="text-xs text-gray-500">PDF files only</p>
        </div>
      </div>

      {isUploading && (
        <div className="flex justify-center">
          <Button isLoading disabled>
            Uploading...
          </Button>
        </div>
      )}

      {error && (
        <Alert type="error" title="Upload Error">
          {error}
        </Alert>
      )}
    </div>
  );
}
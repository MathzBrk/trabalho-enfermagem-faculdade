import React, { useState, useRef, type ChangeEvent } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  preview?: boolean;
  error?: string;
  helperText?: string;
  onChange?: (file: File | null) => void;
  className?: string;
}

/**
 * File upload component with preview and drag-and-drop support
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  label = 'Upload File',
  accept = 'image/*',
  maxSize = 5, // 5MB default
  preview = true,
  error,
  helperText,
  onChange,
  className,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File | null) => {
    setUploadError(null);

    if (!selectedFile) {
      setFile(null);
      setPreviewUrl(null);
      onChange?.(null);
      return;
    }

    // Validate file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setUploadError(`Arquivo deve ter no máximo ${maxSize}MB`);
      return;
    }

    setFile(selectedFile);

    // Generate preview for images
    if (preview && selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }

    onChange?.(selectedFile);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    handleFileChange(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0] || null;
    handleFileChange(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onChange?.(null);
  };

  const displayError = error || uploadError;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : displayError
            ? 'border-danger-500 bg-danger-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100',
          'cursor-pointer'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg mx-auto"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute top-0 right-0 -mt-2 -mr-2 bg-danger-500 text-white rounded-full p-1 hover:bg-danger-600"
            >
              <X size={16} />
            </button>
            <p className="text-sm text-gray-600 text-center mt-2">
              {file?.name}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Clique ou arraste o arquivo aqui
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Tamanho máximo: {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {displayError && (
        <p className="mt-1.5 text-sm text-danger-500" role="alert">
          {displayError}
        </p>
      )}

      {helperText && !displayError && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

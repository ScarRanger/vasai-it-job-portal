'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { ocrService } from '@/services/ocrService';

interface FileUploadWithOCRProps {
  onFileVerified: (result: {
    isValid: boolean;
    message: string;
    file: File;
    foundLocations?: string[];
  }) => void;
  userName?: string;
  disabled?: boolean;
}

export default function FileUploadWithOCR({ 
  onFileVerified, 
  userName, 
  disabled = false 
}: FileUploadWithOCRProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    message: string;
    foundLocations?: string[];
  } | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError('');
    setVerificationResult(null);

    // Check file type - PDF support restored with CDN loading
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, JPG, or PNG file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);

    // Start verification
    setVerifying(true);
    try {
      // Verify the uploaded document
      const result = await ocrService.verifyAddressProof(file, userName);
      
      const verificationData = {
        isValid: result.isValid,
        message: result.isValid 
          ? `Verification successful! Address: ${result.foundLocations.join(', ')}${
              result.nameMatched ? `, Name: ${result.extractedName}` : ''
            }`
          : result.error || 'Verification failed',
        foundLocations: result.foundLocations
      };

      setVerificationResult(verificationData);
      onFileVerified({ ...verificationData, file });

    } catch (err) {
      console.error('OCR verification error:', err);
      const errorMessage = 'OCR verification failed. Please try again.';
      setVerificationResult({
        isValid: false,
        message: errorMessage
      });
      onFileVerified({
        isValid: false,
        message: errorMessage,
        file
      });
    } finally {
      setVerifying(false);
    }
  }, [userName, onFileVerified]);

  return (
    <div className="space-y-2">
      <Label htmlFor="addressProof" className="text-foreground font-medium">
        Address Proof Document
      </Label>
      <div className="relative">
        <Input
          id="addressProof"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileUpload}
          className="bg-input border-border text-foreground file:bg-muted file:text-foreground file:border-0"
          disabled={disabled || verifying}
          required
        />
        <div className="absolute right-2 top-2">
          {verifying ? (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          ) : (
            <Upload className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Upload Aadhar, Passport, or Utility Bill from Vasai region (PDF, JPG, PNG - Max 5MB)
        <br />
        <strong>Note:</strong> Document will be verified for both address and name match
        <br />
        <em>PDF files may take longer to process</em>
      </p>
      {selectedFile && (
        <p className="text-green-400 text-sm">
          ✓ {selectedFile.name} selected
        </p>
      )}
      {verifying && (
        <p className="text-blue-400 text-sm flex items-center">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Verifying address and name match...
        </p>
      )}
      {verificationResult && (
        <div className={`text-sm flex items-center ${
          verificationResult.isValid ? 'text-green-400' : 'text-red-400'
        }`}>
          {verificationResult.isValid ? (
            <CheckCircle className="h-4 w-4 mr-2" />
          ) : (
            <XCircle className="h-4 w-4 mr-2" />
          )}
          {verificationResult.message}
        </div>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
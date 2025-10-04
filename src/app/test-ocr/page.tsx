'use client';

import { useState } from 'react';
import FileUploadWithOCR from '@/components/FileUploadWithOCR';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestOCRPage() {
  const [result, setResult] = useState<{
    isValid: boolean;
    message: string;
    file: File;
    foundLocations?: string[];
  } | null>(null);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>OCR Test Page</CardTitle>
            <CardDescription>
              Test the PDF and image OCR functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUploadWithOCR
              onFileVerified={(result) => {
                console.log('OCR Result:', result);
                setResult(result);
              }}
              userName="Test User"
            />
            
            {result && (
              <div className="mt-4 p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Verification Result:</h3>
                <pre className="text-sm bg-muted p-2 rounded">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
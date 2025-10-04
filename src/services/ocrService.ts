'use client';

import Tesseract from 'tesseract.js';

// Valid locations for Vasai region
const VALID_LOCATIONS = [
  'vasai',
  'nalla sopara',
  'naigaon',
  'virar',
  'vasai west',
  'vasai east',
  'nalasopara',
  'nallasopara',
  'virar west',
  'virar east'
];

export interface OCRVerificationResult {
  isValid: boolean;
  extractedText: string;
  foundLocations: string[];
  nameMatched?: boolean;
  extractedName?: string;
  error?: string;
}

export const ocrService = {
  /**
   * Verify address proof document using OCR
   * @param file - The uploaded file (PDF, JPG, PNG)
   * @param providedName - The name provided by the user
   * @returns Promise<OCRVerificationResult>
   */
  async verifyAddressProof(file: File, providedName?: string): Promise<OCRVerificationResult> {
    try {
      // Convert file to image if it's a PDF (simplified - in production use PDF.js)
      const imageFile = file;
      
      if (file.type === 'application/pdf') {
        throw new Error('PDF processing not implemented yet. Please upload JPG or PNG.');
      }

      // Perform OCR on the image
      const { data: { text } } = await Tesseract.recognize(
        imageFile,
        'eng'
      );

      // Clean and normalize extracted text
      const cleanText = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Remove special characters
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();

      console.log('Extracted text:', cleanText);

      // Check for valid locations
      const foundLocations: string[] = [];
      
      for (const location of VALID_LOCATIONS) {
        if (cleanText.includes(location)) {
          foundLocations.push(location);
        }
      }

      const locationValid = foundLocations.length > 0;

      // Check for name match if provided
      let nameMatched = true;
      let extractedName: string | undefined;
      let nameError = '';

      if (providedName) {
        const nameWords = providedName.toLowerCase().trim().split(/\s+/);
        const foundNameWords: string[] = [];
        
        // Check if all name words are found in the document
        for (const word of nameWords) {
          if (word.length >= 2 && cleanText.includes(word.toLowerCase())) {
            foundNameWords.push(word);
          }
        }
        
        nameMatched = foundNameWords.length >= Math.min(nameWords.length, 2); // At least 2 words or all words if less than 2
        extractedName = foundNameWords.join(' ');
        
        if (!nameMatched) {
          nameError = `Name "${providedName}" not found in document. Found: ${foundNameWords.join(' ') || 'No matching name'}`;
        }
      }

      const isValid = locationValid && nameMatched;
      let errorMessage = '';
      
      if (!locationValid && !nameMatched) {
        errorMessage = `No valid Vasai region address found and name verification failed. ${nameError}`;
      } else if (!locationValid) {
        errorMessage = 'No valid Vasai region address found in the document';
      } else if (!nameMatched) {
        errorMessage = nameError;
      }

      return {
        isValid,
        extractedText: text,
        foundLocations,
        nameMatched,
        extractedName,
        error: isValid ? undefined : errorMessage
      };

    } catch (error) {
      console.error('OCR verification error:', error);
      return {
        isValid: false,
        extractedText: '',
        foundLocations: [],
        nameMatched: false,
        error: `OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },

  /**
   * Check if extracted text contains address keywords
   * @param text - The extracted text
   * @returns boolean
   */
  containsAddressKeywords(text: string): boolean {
    const addressKeywords = [
      'address',
      'resident',
      'residence',
      'house',
      'flat',
      'apartment',
      'building',
      'street',
      'road',
      'pin',
      'pincode',
      'postal'
    ];

    const lowerText = text.toLowerCase();
    return addressKeywords.some(keyword => lowerText.includes(keyword));
  }
};
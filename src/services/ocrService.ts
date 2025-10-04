import Tesseract from 'tesseract.js';

// Dynamic import for PDF.js to avoid SSR issues
let pdfjsLib: typeof import('pdfjs-dist') | null = null;

// Initialize PDF.js only on client side
const initPdfJs = async (): Promise<typeof import('pdfjs-dist')> => {
  if (typeof window !== 'undefined' && !pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
  }
  if (!pdfjsLib) {
    throw new Error('PDF.js not available on server side');
  }
  return pdfjsLib;
};

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
   * Convert PDF to images
   * @param file - PDF file
   * @returns Promise<HTMLCanvasElement[]>
   */
  async convertPdfToImages(file: File): Promise<HTMLCanvasElement[]> {
    try {
      // Initialize PDF.js dynamically
      const pdfjs = await initPdfJs();
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const images: HTMLCanvasElement[] = [];

      // Process only the first page for address verification
      // In production, you might want to process multiple pages
      const pageNum = Math.min(1, pdf.numPages);
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context for PDF processing');
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas
      };

      await page.render(renderContext).promise;
      images.push(canvas);

      return images;
    } catch (error) {
      console.error('PDF conversion error:', error);
      throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Verify address proof document using OCR
   * @param file - The uploaded file (PDF, JPG, PNG)
   * @param providedName - The name provided by the user
   * @returns Promise<OCRVerificationResult>
   */
  async verifyAddressProof(file: File, providedName?: string): Promise<OCRVerificationResult> {
    try {
      // Check if we're on the client side for PDF processing
      if (file.type === 'application/pdf' && typeof window === 'undefined') {
        throw new Error('PDF processing is only available on client side');
      }

      let imagesToProcess: (File | HTMLCanvasElement)[] = [];
      
      if (file.type === 'application/pdf') {
        console.log('Processing PDF file...');
        // Convert PDF to images
        const pdfImages = await this.convertPdfToImages(file);
        imagesToProcess = pdfImages;
        console.log(`PDF converted to ${pdfImages.length} image(s)`);
      } else {
        // Use the image file directly
        imagesToProcess = [file];
        console.log('Processing image file...');
      }

      // Process all images (for PDF, we'll just process the first page)
      let allText = '';
      
      for (let i = 0; i < imagesToProcess.length; i++) {
        const imageSource = imagesToProcess[i];
        console.log(`Running OCR on image ${i + 1}/${imagesToProcess.length}...`);
        
        const { data: { text } } = await Tesseract.recognize(
          imageSource,
          'eng'
        );
        allText += text + ' ';
      }

      // Clean and normalize extracted text
      const cleanText = allText.toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Remove special characters
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();

      console.log('OCR completed. Extracted text:', cleanText.substring(0, 200) + '...');

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
        extractedText: allText,
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
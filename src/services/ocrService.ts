import Tesseract from 'tesseract.js';

// --- PDF.js Global Declaration ---
declare global {
  interface Window {
    pdfjsLib: {
      getDocument: (options: { data: ArrayBuffer }) => {
        promise: Promise<{
          numPages: number;
          getPage: (pageNum: number) => Promise<{
            getViewport: (options: { scale: number }) => {
              width: number;
              height: number;
            };
            render: (context: {
              canvasContext: CanvasRenderingContext2D;
              viewport: { width: number; height: number };
              canvas: HTMLCanvasElement;
            }) => { promise: Promise<void> };
            cleanup: () => void;
          }>;
        }>;
      };
      GlobalWorkerOptions: {
        workerSrc: string;
      };
    };
  }
}

// --- PDF.js CDN URLs ---
const PDFJS_CDN_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfJsLoaded = false;
let pdfJsLoadPromise: Promise<typeof window.pdfjsLib> | null = null;

// --- Load PDF.js from CDN ---
const loadPdfJs = async (): Promise<typeof window.pdfjsLib> => {
  if (pdfJsLoadPromise) return pdfJsLoadPromise;
  if (typeof window === 'undefined') throw new Error('PDF.js can only be loaded on the client side');
  if (window.pdfjsLib && pdfJsLoaded) return window.pdfjsLib;

  pdfJsLoadPromise = new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      pdfJsLoaded = true;
      resolve(window.pdfjsLib);
      return;
    }

    const script = document.createElement('script');
    script.src = PDFJS_CDN_URL;
    script.async = true;

    script.onload = () => {
      setTimeout(() => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
          pdfJsLoaded = true;
          resolve(window.pdfjsLib);
        } else {
          reject(new Error('PDF.js failed to load properly'));
        }
      }, 100);
    };

    script.onerror = () => reject(new Error('Failed to load PDF.js from CDN'));
    document.head.appendChild(script);
  });

  return pdfJsLoadPromise;
};

// --- Valid Vasai Region Locations ---
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

// --- OCR Result Interface ---
export interface OCRVerificationResult {
  isValid: boolean;
  extractedText: string;
  foundLocations: string[];
  nameMatched?: boolean;
  extractedName?: string;
  error?: string;
}

// --- Utility: Levenshtein distance ---
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

// --- Utility: Escape special regex chars ---
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// --- Utility: Aggressive normalization & cleaning ---
function aggressiveNormalize(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u0000-\u001F\u007F-\u009F\u00A0\u1680\u180E\u2000-\u200F\u2028-\u202F\u205F\u3000\uFEFF\u200B\u200C\u200D]/g, ' ')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, '...')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// --- Utility: fuzzy contains using multiple strategies ---
function fuzzyContainsText(
  bigText: string,
  pattern: string
): { found: boolean; reason?: string; debug?: Record<string, string | number> } {
  const pat = pattern.toLowerCase().trim();
  const patNormalized = pat.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const patCompact = patNormalized.replace(/\s+/g, '');
  const text = bigText;

  // Exact match
  const wordRe = new RegExp(`\\b${escapeRegExp(patNormalized)}\\b`, 'i');
  if (wordRe.test(text)) {
    return { found: true, reason: 'whole-word' };
  }

  // Compact match (joined OCR words)
  const compactRe = new RegExp(`\\b${escapeRegExp(patCompact)}\\b`, 'i');
  if (compactRe.test(text)) {
    return { found: true, reason: 'whole-word-compact' };
  }

  // Fuzzy match (minor OCR noise)
  const words = text.split(/\s+/);
  for (const w of words) {
    if (Math.abs(w.length - patCompact.length) <= 2) {
      const d = levenshtein(w, patCompact);
      const rel = d / Math.max(patCompact.length, 1);
      if ((d <= 1 || rel <= 0.15) && w.includes(patCompact.substring(0, 3))) {
        return { found: true, reason: 'fuzzy-word', debug: { word: w, distance: d, ratio: rel } };
      }
    }
  }

  // Regex-joined (small OCR gaps)
  const regexPattern = patNormalized.split(/\s+/).map(escapeRegExp).join('.{0,2}');
  try {
    const re = new RegExp(`\\b${regexPattern}\\b`, 'i');
    if (re.test(text)) return { found: true, reason: 'regex-joined' };
  } catch {
    /* ignore regex errors */
  }

  return { found: false };
}

// --- OCR Service ---
export const ocrService = {
  /** Convert PDF to images using PDF.js (CDN version) */
  async convertPdfToImages(file: File): Promise<HTMLCanvasElement[]> {
    try {
      if (file.type !== 'application/pdf') throw new Error('File is not a PDF');

      const pdfjs = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not get 2D rendering context');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport, canvas }).promise;
      page.cleanup();

      return [canvas];
    } catch (error) {
      console.error('PDF conversion error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to process PDF');
    }
  },

  /** Verify address proof document using OCR */
  async verifyAddressProof(file: File, providedName?: string): Promise<OCRVerificationResult> {
    try {
      let imagesToProcess: (File | HTMLCanvasElement)[] = [];

      if (file.type === 'application/pdf') {
        const pdfImages = await this.convertPdfToImages(file);
        imagesToProcess = pdfImages;
      } else {
        imagesToProcess = [file];
      }

      let allText = '';
      for (const img of imagesToProcess) {
        const { data: { text } } = await Tesseract.recognize(img, 'eng');
        allText += text + ' ';
      }

      const normalizedText = aggressiveNormalize(allText);
      const foundLocations: string[] = [];

      for (const location of VALID_LOCATIONS) {
        const check = fuzzyContainsText(normalizedText, location);
        if (check.found) foundLocations.push(location);
      }

      const locationValid = foundLocations.length > 0;

      // --- Name Matching ---
      let nameMatched = true;
      let extractedName: string | undefined;
      let nameError = '';

      if (providedName) {
        const nameNormalized = aggressiveNormalize(providedName);
        const nameWords = nameNormalized.split(/\s+/).filter(Boolean);

        const foundNameWords = nameWords.filter(word => {
          if (word.length < 2) return false;
          return fuzzyContainsText(normalizedText, word).found;
        });

        nameMatched = foundNameWords.length >= Math.min(nameWords.length, 2);
        extractedName = foundNameWords.join(' ');
        if (!nameMatched) nameError = `Name "${providedName}" not found in document.`;
      }

      const isValid = locationValid && nameMatched;
      const errorMessage =
        !isValid && !locationValid && !nameMatched
          ? `No valid Vasai region address and name verification failed.`
          : !locationValid
          ? 'No valid Vasai region address found.'
          : !nameMatched
          ? nameError
          : undefined;

      return { isValid, extractedText: allText, foundLocations, nameMatched, extractedName, error: errorMessage };
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

  /** Check if text contains address-related keywords */
  containsAddressKeywords(text: string): boolean {
    const keywords = ['address', 'resident', 'flat', 'road', 'street', 'pincode'];
    const lower = text.toLowerCase();
    return keywords.some(k => lower.includes(k));
  }
};

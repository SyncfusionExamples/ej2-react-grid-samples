declare global {
  interface Window {
    pendingProductImage?: {
      //productId: string;
      base64: string;
    } | null;   // ← make it optional + null-able
  }
}

// Important: this line is required in .d.ts files that augment globals
export {};
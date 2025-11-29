declare module 'qrcode' {
  export interface ToDataURLOptions {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    margin?: number;
    scale?: number;
    width?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  export function toDataURL(
    data: string,
    options?: ToDataURLOptions
  ): Promise<string>;
}





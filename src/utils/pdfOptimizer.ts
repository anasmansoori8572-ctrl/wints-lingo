/**
 * Wits Lingo Academy - PDF Link Optimizer & Security Utility
 * Converts standard sharing links (Google Drive, Dropbox, OneDrive, Web PDFs)
 * into optimized, view-only embedded URLs that disable downloads & printing.
 */

export interface OptimizedPdfResult {
  originalUrl: string;
  embedUrl: string;
  isGoogleDrive: boolean;
  isDirectPdf: boolean;
  isUploadedFile?: boolean;
  canEmbed?: boolean;
  provider: 'Google Drive' | 'Dropbox' | 'OneDrive' | 'Backblaze B2' | 'Direct PDF' | 'Uploaded Document' | 'Web Document' | 'Internal';
  optimizationNote: string;
}

export function optimizePdfUrl(rawUrl: string): OptimizedPdfResult {
  const trimmed = (rawUrl || '').trim();

  if (!trimmed || trimmed === '#' || trimmed.startsWith('sample:')) {
    return {
      originalUrl: trimmed,
      embedUrl: '',
      isGoogleDrive: false,
      isDirectPdf: false,
      canEmbed: false,
      provider: 'Internal',
      optimizationNote: 'Using Wits Lingo Built-in Interactive Digital Reader.'
    };
  }

  // 0. Uploaded PDF file from Gallery / Files or local data URI
  if (trimmed.includes('/api/files/') || trimmed.startsWith('data:application/pdf') || trimmed.startsWith('blob:')) {
    const isData = trimmed.startsWith('data:application/pdf') || trimmed.startsWith('blob:');
    const embedUrl = isData ? trimmed : `${trimmed.split('#')[0]}#toolbar=0&navpanes=0&scrollbar=0`;
    return {
      originalUrl: trimmed,
      embedUrl,
      isGoogleDrive: false,
      isDirectPdf: true,
      isUploadedFile: true,
      canEmbed: true,
      provider: 'Uploaded Document',
      optimizationNote: 'Local file uploaded from device/gallery loaded with anti-download protection.'
    };
  }

  // 0b. Backblaze B2 Storage URL
  // Backblaze B2 sends X-Frame-Options: SAMEORIGIN which causes Chrome to block in-frame rendering.
  // We route through our same-origin /api/proxy-pdf endpoint with inline content-disposition to ensure Chrome displays it cleanly.
  if (trimmed.includes('backblazeb2.com') || trimmed.includes('.b2.cloud')) {
    const cleanUrl = trimmed.split('#')[0];
    const hashParams = '#toolbar=0&navpanes=0&scrollbar=0&statusbar=0';
    const proxyUrl = `/api/proxy-pdf?url=${encodeURIComponent(cleanUrl)}`;
    return {
      originalUrl: trimmed,
      embedUrl: `${proxyUrl}${hashParams}`,
      isGoogleDrive: false,
      isDirectPdf: true,
      canEmbed: true,
      provider: 'Backblaze B2',
      optimizationNote: 'Backblaze B2 cloud storage streamed securely via Wits Lingo Protected Reader.'
    };
  }

  // 1. Google Drive Links
  // Formats:
  // - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // - https://drive.google.com/file/d/FILE_ID/edit
  // - https://drive.google.com/open?id=FILE_ID
  // - https://docs.google.com/document/d/FILE_ID/edit
  const gDriveMatch = 
    trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i) ||
    trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i) ||
    trimmed.match(/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/i) ||
    trimmed.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/i) ||
    trimmed.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/i);

  if (gDriveMatch && gDriveMatch[1]) {
    const fileId = gDriveMatch[1];
    return {
      originalUrl: trimmed,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      isGoogleDrive: true,
      isDirectPdf: false,
      canEmbed: true,
      provider: 'Google Drive',
      optimizationNote: 'Converted to Google Drive Embed Preview. Downloading toolbars suppressed.'
    };
  }

  // 2. Dropbox Links
  if (trimmed.includes('dropbox.com')) {
    let rawDirectUrl = trimmed.replace(/\?dl=0/g, '?raw=1').replace(/&dl=0/g, '&raw=1');
    if (!rawDirectUrl.includes('raw=1')) {
      rawDirectUrl += (rawDirectUrl.includes('?') ? '&' : '?') + 'raw=1';
    }
    const hashParams = '#toolbar=0&navpanes=0&scrollbar=0&statusbar=0';
    const proxyUrl = `/api/proxy-pdf?url=${encodeURIComponent(rawDirectUrl.split('#')[0])}`;
    return {
      originalUrl: trimmed,
      embedUrl: `${proxyUrl}${hashParams}`,
      isGoogleDrive: false,
      isDirectPdf: true,
      canEmbed: true,
      provider: 'Dropbox',
      optimizationNote: 'Optimized Dropbox streaming stream with view-only wrapper.'
    };
  }

  // 3. OneDrive Links
  if (trimmed.includes('onedrive.live.com') || trimmed.includes('1drv.ms')) {
    const embedUrl = trimmed.replace('view.aspx', 'embed.aspx');
    return {
      originalUrl: trimmed,
      embedUrl,
      isGoogleDrive: false,
      isDirectPdf: false,
      canEmbed: true,
      provider: 'OneDrive',
      optimizationNote: 'Converted to OneDrive embedded view.'
    };
  }

  // 4. Direct PDF URLs
  if (trimmed.toLowerCase().endsWith('.pdf') || trimmed.toLowerCase().includes('.pdf?')) {
    // Append PDF view parameters to suppress default Acrobat/Chrome toolbar & navpanes
    const hashParams = '#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0';
    const cleanUrl = trimmed.split('#')[0];
    const isExternal = (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) &&
      !cleanUrl.includes('/api/files/') && !cleanUrl.includes('/api/proxy-pdf');
    const embedUrl = isExternal
      ? `/api/proxy-pdf?url=${encodeURIComponent(cleanUrl)}${hashParams}`
      : `${cleanUrl}${hashParams}`;

    return {
      originalUrl: trimmed,
      embedUrl,
      isGoogleDrive: false,
      isDirectPdf: true,
      canEmbed: true,
      provider: 'Direct PDF',
      optimizationNote: 'Added #toolbar=0&navpanes=0 parameters to hide native download/print controls.'
    };
  }

  // 5. General Web Document
  return {
    originalUrl: trimmed,
    embedUrl: trimmed,
    isGoogleDrive: false,
    isDirectPdf: false,
    canEmbed: true,
    provider: 'Web Document',
    optimizationNote: 'Rendered in Wits Lingo Protected Reader Frame.'
  };
}

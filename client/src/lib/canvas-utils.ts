export function setupCanvas(canvas: HTMLCanvasElement) {
  const container = canvas.parentElement;
  if (!container) return;

  // Set canvas size to match container
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  // Get context and set default properties
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set default drawing properties
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.imageSmoothingEnabled = true;
}

export function getCanvasPosition(
  e: React.MouseEvent | React.TouchEvent,
  canvas: HTMLCanvasElement
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  
  let clientX: number;
  let clientY: number;

  if ('touches' in e) {
    // Touch event
    const touch = e.touches[0] || e.changedTouches[0];
    clientX = touch.clientX;
    clientY = touch.clientY;
  } else {
    // Mouse event
    clientX = e.clientX;
    clientY = e.clientY;
  }

  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

export function resizeCanvas(canvas: HTMLCanvasElement) {
  const container = canvas.parentElement;
  if (!container) return;

  // Store current canvas content
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Resize canvas
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  // Restore canvas content (this will be scaled)
  ctx.putImageData(imageData, 0, 0);
  
  // Reset context properties
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.imageSmoothingEnabled = true;
}

export function downloadCanvas(canvas: HTMLCanvasElement, fileName: string, format: string = 'png') {
  const link = document.createElement('a');
  link.download = `${fileName}.${format}`;
  
  if (format === 'jpg' || format === 'jpeg') {
    link.href = canvas.toDataURL('image/jpeg', 0.9);
  } else if (format === 'webp') {
    link.href = canvas.toDataURL('image/webp', 0.9);
  } else {
    link.href = canvas.toDataURL('image/png');
  }
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

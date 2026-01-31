/**
 * Image brightness analysis utilities
 * Used to determine if an uploaded background image is light or dark
 * for automatic text contrast adjustment
 */

export type BrightnessLevel = 'light' | 'dark'

/**
 * Analyzes an image's average brightness
 * @param imageDataUrl - Base64 encoded image data URL
 * @returns Promise resolving to 'light' or 'dark'
 */
export async function analyzeImageBrightness(imageDataUrl: string): Promise<BrightnessLevel> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        // Default to dark if canvas not supported
        resolve('dark')
        return
      }

      // Scale down for faster analysis
      const sampleSize = 100
      canvas.width = sampleSize
      canvas.height = sampleSize

      ctx.drawImage(img, 0, 0, sampleSize, sampleSize)

      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize)
      const data = imageData.data

      let totalBrightness = 0
      const pixelCount = data.length / 4

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        // Calculate perceived brightness using luminance formula
        // Human eyes are more sensitive to green, less to blue
        const brightness = (0.299 * r + 0.587 * g + 0.114 * b)
        totalBrightness += brightness
      }

      const avgBrightness = totalBrightness / pixelCount

      // Threshold: 128 is middle gray (0-255 scale)
      // Images below 128 are considered dark, above are light
      resolve(avgBrightness > 128 ? 'light' : 'dark')
    }

    img.onerror = () => {
      // Default to dark on error
      resolve('dark')
    }

    img.src = imageDataUrl
  })
}

/**
 * Converts a File object to a base64 data URL
 * @param file - The file to convert
 * @returns Promise resolving to base64 data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to read file as data URL'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Error reading file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Compresses an image to reduce storage size
 * @param dataUrl - Original image data URL
 * @param maxWidth - Maximum width in pixels (default 800)
 * @param quality - JPEG quality 0-1 (default 0.8)
 * @returns Promise resolving to compressed data URL
 */
export async function compressImage(
  dataUrl: string,
  maxWidth: number = 800,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      // Calculate new dimensions
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      ctx.drawImage(img, 0, 0, width, height)

      // Convert to JPEG for smaller file size
      resolve(canvas.toDataURL('image/jpeg', quality))
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = dataUrl
  })
}

export const resizeImageFile = (file) => new Promise((resolve, reject) => {
  if (!file?.type?.startsWith('image/')) {
    reject(new Error('Choose an image file.'))
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    reject(new Error('Choose an image smaller than 10 MB.'))
    return
  }

  const reader = new FileReader()
  reader.onerror = () => reject(new Error('Could not read this image.'))
  reader.onload = () => {
    const image = new Image()
    image.onerror = () => reject(new Error('Could not open this image.'))
    image.onload = () => {
      const scale = Math.min(1, 512 / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
      const compressedImage = canvas.toDataURL('image/jpeg', 0.78)

      if (compressedImage.length > 2_500_000) {
        reject(new Error('This image could not be compressed enough. Choose a smaller image.'))
        return
      }

      resolve(compressedImage)
    }
    image.src = reader.result
  }
  reader.readAsDataURL(file)
})
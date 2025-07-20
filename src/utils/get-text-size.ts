export function getTextSize(text: string) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) {
    return {
      width: 0,
    }
  }

  return {
    width: context.measureText(text).width,
  }
}

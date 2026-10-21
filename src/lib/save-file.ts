import { MIME_TYPES, type FileExtension } from '../writers/target'

/** Hands a file built in the browser to the user as a download. Nothing leaves the device. */
export function saveFile(contents: string, filename: string, extension: FileExtension): void {
  const url = URL.createObjectURL(new Blob([contents], { type: MIME_TYPES[extension] }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // An immediate revoke races the download in Safari.
  requestAnimationFrame(() => URL.revokeObjectURL(url))
}

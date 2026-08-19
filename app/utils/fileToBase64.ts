// Convierte un File (ej. del input de la foto de perfil) al data URL en
// base64 que espera el backend (mismo formato que valida
// isValidProfilePicture allá: "data:image/<tipo>;base64,<payload>").
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

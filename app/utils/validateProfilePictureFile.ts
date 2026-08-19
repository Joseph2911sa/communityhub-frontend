const ACCEPTED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB, mismo límite que valida el backend

// Validación en cliente antes de convertir a base64 -- evita hacerle
// esperar al usuario (o gastar la llamada al backend) si el archivo
// obviamente no sirve. El backend vuelve a validar esto mismo
// (isValidProfilePicture) porque nunca hay que confiar solo en el
// cliente, pero acá se adelanta el error para que se vea al instante.
// Devuelve un mensaje de error en español, o null si el archivo es válido.
export function validateProfilePictureFile(file: File): string | null {
  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    return 'La foto de perfil debe ser una imagen PNG, JPG, GIF o WEBP.'
  }
  if (file.size > MAX_SIZE_BYTES) {
    return 'La foto de perfil no puede pesar más de 5MB.'
  }
  return null
}

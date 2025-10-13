'use client';

import { ref, uploadBytesResumable, getDownloadURL, Storage } from "firebase/storage";

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param storage - The Firebase Storage instance.
 * @param file - The file to upload.
 * @param userId - The ID of the user.
 * @param onProgress - Optional callback to track upload progress.
 * @returns A promise that resolves with the download URL.
 */
export async function uploadImage(
  storage: Storage,
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Use a path that includes the user's ID for organization
  const storageRef = ref(storage, `profile-pictures/${userId}/${file.name}`);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Progreso de carga: ${progress.toFixed(2)}%`);
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        // Handle unsuccessful uploads
        console.error("Upload failed:", error);
        reject(error);
      },
      () => {
        // Handle successful uploads on complete
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log('¡Carga completada!', { url: downloadURL });
          resolve(downloadURL);
        }).catch(reject);
      }
    );
  });
}

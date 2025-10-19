'use client';

import { ref, uploadBytesResumable, getDownloadURL, Storage } from "firebase/storage";

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param storage - The Firebase Storage instance.
 * @param file - The file to upload.
 * @param filePath - The full path in storage where the file will be saved.
 * @param onProgress - Optional callback to track upload progress.
 * @returns A promise that resolves with the download URL.
 */
export async function uploadFile(
  storage: Storage,
  file: File,
  filePath: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const storageRef = ref(storage, filePath);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
          resolve(downloadURL);
        }).catch(reject);
      }
    );
  });
}

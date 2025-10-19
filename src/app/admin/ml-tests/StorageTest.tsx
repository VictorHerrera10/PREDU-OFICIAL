'use client';

import { useState } from 'react';
import { useUser, useStorage } from '@/firebase';
import { uploadFile } from '@/lib/storage'; 

import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Image as ImageIcon, Upload, CheckCircle, File as FileIcon } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function Uploader({ fileType, path }: { fileType: 'image' | 'document', path: string }) {
  const { user } = useUser();
  const storage = useStorage();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadedUrl(null); // Reset on new file selection
      setUploadProgress(0);
      if (fileType === 'image') {
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !user || !storage) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No hay archivo seleccionado o el usuario no está autenticado.',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadedUrl(null);
    console.log('Iniciando carga de archivo...');

    try {
      const fullPath = `${path}/${userId}/${file.name}`;
      const downloadUrl = await uploadFile(
        storage,
        file,
        fullPath,
        (progress) => {
          setUploadProgress(progress);
          console.log(`Progreso de carga: ${progress.toFixed(2)}%`);
        }
      );
      
      setUploadedUrl(downloadUrl);
      console.log('¡Carga completada!', { url: downloadUrl });
      toast({
        title: '¡Archivo Subido!',
        description: 'El archivo se ha cargado correctamente en Firebase Storage.',
      });

    } catch (error) {
      console.error('Error al subir el archivo:', error);
      toast({
        variant: 'destructive',
        title: 'Error de Carga',
        description: 'No se pudo subir el archivo. Revisa la consola para más detalles.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const Icon = fileType === 'image' ? ImageIcon : FileIcon;

  return (
    <Card>
        <CardHeader>
             <CardTitle className="flex items-center gap-2"><Icon /> Cargar {fileType === 'image' ? 'Imagen' : 'Documento'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor={`${fileType}-upload`}>Seleccionar Archivo</Label>
                <Input id={`${fileType}-upload`} type="file" accept={fileType === 'image' ? 'image/*' : '*/*'} onChange={handleFileChange} disabled={isUploading} />
            </div>

            {previewUrl && fileType === 'image' && (
            <div className="flex justify-center">
                <Image src={previewUrl} alt="Vista previa" width={200} height={200} className="rounded-md object-cover" />
            </div>
            )}
            
            {file && fileType === 'document' && (
                <div className="text-sm text-center text-muted-foreground p-2 border rounded-md">
                    Archivo seleccionado: <span className="font-bold text-foreground">{file.name}</span>
                </div>
            )}

            {isUploading && (
            <div className="space-y-2">
                <Label>Progreso de Carga</Label>
                <Progress value={uploadProgress} />
                <p className="text-xs text-center text-muted-foreground">{Math.round(uploadProgress)}%</p>
            </div>
            )}

            {uploadedUrl && (
                <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg text-center">
                    <p className="text-sm font-semibold text-green-400 flex items-center justify-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        ¡Carga Exitosa!
                    </p>
                    <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline break-all">
                        Ver archivo cargado
                    </a>
                </div>
            )}
             <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
                {isUploading ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                    </>
                ) : (
                    <>
                        <Upload className="mr-2 h-4 w-4" />
                        Subir {fileType === 'image' ? 'Imagen' : 'Documento'}
                    </>
                )}
            </Button>
        </CardContent>
    </Card>
  );
}


export function StorageTest() {
    return (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Uploader fileType="image" path="uploads/images" />
            <Uploader fileType="document" path="uploads/documents" />
        </div>
    )
}

'use client';

import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import api from '@/lib/api-client';
import { useUser } from '@/firebase';

export default function AcademicPredictionView() {
    const { user } = useUser();

  const handleFetchPrediction = async () => {
    if (!user) {
        console.error("Usuario no autenticado.");
        return;
    }
    
    try {
        // Ejemplo de datos que podrías enviar.
        // Deberías reemplazar esto con los datos reales del perfil del estudiante.
        const requestData = {
            // Asegúrate de que los nombres de los campos coincidan con lo que espera tu API
            user_id: user.uid,
            // Aquí irían otros datos del formulario o perfil...
        };

      console.log("Enviando datos a la API:", requestData);
      const response = await api.post('/prediccion/academico/', requestData);
      
      console.log('Respuesta de la API:', response.data);
      // Aquí manejarías la respuesta, por ejemplo, mostrando los resultados en la UI.

    } catch (error) {
      console.error('Error al contactar la API de predicción:', error);
      // Aquí manejarías el error, por ejemplo, mostrando un mensaje al usuario.
    }
  };

  useEffect(() => {
    // Puedes llamar a la función aquí si quieres que se ejecute al cargar la vista
    // handleFetchPrediction();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Predicción Académica</CardTitle>
        <CardDescription>
          Descubre las carreras que mejor se adaptan a tus habilidades e intereses.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground mb-6">
          Haz clic en el botón para iniciar el análisis vocacional basado en tu perfil.
        </p>
        <Button onClick={handleFetchPrediction}>
            Iniciar Predicción Vocacional
        </Button>
      </CardContent>
    </Card>
  );
}

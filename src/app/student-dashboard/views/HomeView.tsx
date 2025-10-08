'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function HomeView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inicio del Estudiante</CardTitle>
        <CardDescription>
          Tu panel de control central.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Bienvenido a tu sección de inicio. Aquí verás resúmenes, notificaciones importantes y tus próximos pasos recomendados.
        </p>
      </CardContent>
    </Card>
  );
}

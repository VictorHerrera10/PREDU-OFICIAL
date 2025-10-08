'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function HomeView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inicio del Tutor</CardTitle>
        <CardDescription>
          Tu panel de control central.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Bienvenido a tu sección de inicio. Aquí verás resúmenes, notificaciones importantes y las actividades recientes de tus estudiantes.
        </p>
      </CardContent>
    </Card>
  );
}

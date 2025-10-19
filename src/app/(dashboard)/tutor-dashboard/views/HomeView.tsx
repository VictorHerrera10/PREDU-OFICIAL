'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ForumView } from "@/components/forum/ForumView";

export default function HomeView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inicio del Tutor</CardTitle>
        <CardDescription>
          Tu panel de control central y el foro de tu comunidad.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">
          Bienvenido a tu sección de inicio. Aquí verás resúmenes, notificaciones importantes y las actividades recientes de tus estudiantes.
        </p>
        <ForumView />
      </CardContent>
    </Card>
  );
}

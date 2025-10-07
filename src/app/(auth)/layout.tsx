import { Card } from "@/components/ui/card";
import { WindowControls } from "@/components/window-controls";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-card/60 backdrop-blur-lg border-border/50 overflow-hidden">
          <WindowControls />
          <div className="p-6 md:p-8">
            {children}
          </div>
        </Card>
      </div>
    </main>
  );
}

import { Card } from "@/components/ui/card";
import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card className="p-6 md:p-8 bg-card/80 backdrop-blur-sm border-border">
          {children}
        </Card>
      </div>
    </main>
  );
}

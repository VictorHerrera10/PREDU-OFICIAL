import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Subject {
  id: string;
  name: string;
}

interface FormValues {
  [key: string]: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  form: any;
  onSubmit: (values: FormValues) => void;
}

export function VocationalFormModal({
  open,
  onOpenChange,
  subjects,
  form,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* ===== ENCABEZADO FIJO ===== */}
        <DialogHeader className="flex-shrink-0 pb-2 border-b">
          <DialogTitle className="text-2xl font-bold text-center">
            Descubre tu vocación
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center px-4">
            Califica tus intereses en las siguientes asignaturas para conocer tus áreas de afinidad.
          </p>
        </DialogHeader>

        {/* ===== CONTENIDO DESPLAZABLE ===== */}
        <div className="flex-grow overflow-y-auto py-4">
          <ScrollArea className="h-full px-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {subjects.map((subject) => (
                  <FormField
                    key={subject.id}
                    control={form.control}
                    name={subject.id}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel className="font-medium text-base">
                            {subject.name}
                          </FormLabel>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex space-x-2"
                          >
                            {["AD", "A", "B", "C"].map((grade) => (
                              <FormItem key={grade}>
                                <FormLabel
                                  htmlFor={`${subject.id}-${grade}`}
                                  className={cn(
                                    "flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 font-bold cursor-pointer transition-all hover:bg-accent hover:text-accent-foreground",
                                    "h-10 min-w-[48px]",
                                    field.value === grade &&
                                      "border-primary ring-2 ring-primary/50 text-primary"
                                  )}
                                >
                                  {grade}
                                </FormLabel>
                                <RadioGroupItem
                                  value={grade}
                                  id={`${subject.id}-${grade}`}
                                  className="hidden"
                                />
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                <div className="flex justify-end pt-4">
                  <Button type="submit" className="px-6">
                    Enviar resultados
                  </Button>
                </div>
              </form>
            </Form>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

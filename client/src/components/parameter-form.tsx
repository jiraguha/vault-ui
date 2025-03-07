import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { insertParameterSchema, type InsertParameter, type Parameter } from "@shared/schema";

interface ParameterFormProps {
  parameter?: Parameter | null;
  environment: string;
  onSuccess: () => void;
}

export default function ParameterForm({ parameter, environment, onSuccess }: ParameterFormProps) {
  const { toast } = useToast();
  
  const form = useForm<InsertParameter>({
    resolver: zodResolver(insertParameterSchema),
    defaultValues: {
      name: parameter?.name || "",
      value: parameter?.value || "",
      isSecure: parameter?.isSecure || false,
      environment: environment as "development" | "production",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertParameter) => {
      const res = await apiRequest("POST", "/api/parameters", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parameters", environment] });
      toast({ title: "Parameter created successfully" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to create parameter", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertParameter) => {
      const res = await apiRequest("PATCH", `/api/parameters/${parameter!.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parameters", environment] });
      toast({ title: "Parameter updated successfully" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to update parameter", variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertParameter) => {
    if (parameter) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{parameter ? "Edit Parameter" : "Add Parameter"}</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input {...field} type={form.watch("isSecure") ? "password" : "text"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isSecure"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <FormLabel>Secure Parameter</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {parameter ? "Update" : "Create"} Parameter
          </Button>
        </form>
      </Form>
    </>
  );
}

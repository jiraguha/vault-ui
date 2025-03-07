import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ParameterForm from "@/components/parameter-form";
import ParameterTable from "@/components/parameter-table";
import EnvironmentSelector from "@/components/environment-selector";
import type { Parameter } from "@shared/schema";

export default function Parameters() {
  const [_, setLocation] = useLocation();
  const { environment = "development" } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState<Parameter | null>(null);

  const { data: parameters, isLoading } = useQuery<Parameter[]>({
    queryKey: ["/api/parameters", environment],
  });

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Parameter Store</CardTitle>
          <div className="flex items-center gap-4">
            <EnvironmentSelector
              value={environment}
              onValueChange={(env) => setLocation(`/${env}`)}
            />
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Parameter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ParameterTable
            parameters={parameters || []}
            isLoading={isLoading}
            onEdit={setSelectedParameter}
          />
        </CardContent>
      </Card>

      <Dialog 
        open={isDialogOpen || !!selectedParameter} 
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedParameter(null);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <ParameterForm
            parameter={selectedParameter}
            environment={environment}
            onSuccess={() => {
              setIsDialogOpen(false);
              setSelectedParameter(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

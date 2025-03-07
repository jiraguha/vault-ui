import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, EyeOff, Trash, Plus } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Parameter } from "@shared/schema";

export default function Parameters() {
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>("ortelius/dev");
  const [showDialog, setShowDialog] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const { data: parameters, isLoading } = useQuery<Parameter[]>({
    queryKey: ["/api/parameters/development"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; value: string; isSecure: boolean }) => {
      const res = await apiRequest("POST", "/api/parameters", {
        ...data,
        environment: "development",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parameters"] });
      toast({ title: "Parameter added successfully" });
      setShowDialog(false);
      setNewKey("");
      setNewValue("");
    },
    onError: () => {
      toast({ title: "Failed to add parameter", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/parameters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parameters"] });
      toast({ title: "Parameter deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete parameter", variant: "destructive" });
    },
  });

  const toggleSecret = (id: number) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addVariable = () => {
    if (newKey && newValue) {
      createMutation.mutate({
        name: newKey,
        value: newValue,
        isSecure: newKey.toLowerCase().includes('secret'),
      });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">AWS Parameter Store UI</h2>
      <div className="flex gap-4 mt-4">
        <Card
          onClick={() => setSelectedNamespace("ortelius/dev")}
          className={`cursor-pointer hover:bg-accent ${
            selectedNamespace === "ortelius/dev" ? "border-primary" : ""
          }`}
        >
          <CardContent className="py-4">
            <h3 className="text-lg font-semibold">ortelius/dev</h3>
          </CardContent>
        </Card>
      </div>

      {selectedNamespace && (
        <div className="mt-6">
          <Card>
            <CardContent className="py-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{selectedNamespace} Variables</h3>
                <Button onClick={() => setShowDialog(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variable
                </Button>
              </div>

              <div className="space-y-2">
                {parameters?.map((param) => (
                  <div
                    key={param.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <span className="font-medium">{param.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">
                        {param.isSecure && !showSecrets[param.id]
                          ? "••••••••"
                          : param.value}
                      </span>
                      {param.isSecure && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSecret(param.id)}
                        >
                          {showSecrets[param.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(param.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Environment Variable</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Key"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
            />
            <Input
              placeholder="Value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
            />
            <Button onClick={addVariable} className="w-full">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
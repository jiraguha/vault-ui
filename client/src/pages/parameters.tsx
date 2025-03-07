import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, EyeOff, Trash, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { createMockApiClient, type MockApiClient } from "@/lib/mockApiClient";
import type { Parameter } from "@shared/schema";

export default function Parameters() {
  const [data, setData] = useState<Record<string, Parameter[]>>({});
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isSecure, setIsSecure] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<number, boolean>>({});
  const [apiClient] = useState<MockApiClient>(() => createMockApiClient());
  const { toast } = useToast();

  useEffect(() => {
    apiClient.fetchNamespaces().then(setData);
  }, [apiClient]);

  const toggleSecret = (id: number) => {
    setShowSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const addVariable = () => {
    if (selectedNamespace && newKey && newValue) {
      const variable = {
        name: newKey,
        value: newValue,
        isSecure,
        environment: "development",
      };

      apiClient.addVariable(selectedNamespace, variable).then(() => {
        apiClient.fetchNamespaces().then(setData);
        setNewKey("");
        setNewValue("");
        setIsSecure(false);
        setShowDialog(false);
        toast({ title: "Variable added successfully" });
      });
    }
  };

  const deleteVariable = (paramName: string) => {
    if (selectedNamespace) {
      apiClient.deleteVariable(selectedNamespace, paramName).then(() => {
        apiClient.fetchNamespaces().then(setData);
        toast({ title: "Variable deleted successfully" });
      });
    }
  };

  const resetForm = () => {
    setNewKey("");
    setNewValue("");
    setIsSecure(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">AWS Parameter Store UI</h2>
      <div className="flex gap-4 mt-4">
        {Object.keys(data).map((namespace) => (
          <Card
            key={namespace}
            onClick={() => setSelectedNamespace(namespace)}
            className={`cursor-pointer hover:bg-accent ${
              selectedNamespace === namespace ? "border-primary" : ""
            }`}
          >
            <CardContent className="py-4">
              <h3 className="text-lg font-semibold">{namespace}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedNamespace && (
        <div className="mt-4">
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
                {data[selectedNamespace]?.map((param) => (
                  <div
                    key={param.id}
                    className="flex items-center justify-between border-b p-2"
                  >
                    <span>{param.name}</span>
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
                        onClick={() => deleteVariable(param.name)}
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

      <Dialog open={showDialog} onOpenChange={(open) => {
        if (!open) resetForm();
        setShowDialog(open);
      }}>
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
              type={isSecure ? "password" : "text"}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Secure Parameter</span>
              <Switch
                checked={isSecure}
                onCheckedChange={setIsSecure}
              />
            </div>
            <Button onClick={addVariable} className="w-full">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
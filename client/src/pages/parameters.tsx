import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, EyeOff, Trash, Plus, Pencil, Upload, ChevronDown, ChevronRight, Key } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Parameter } from "@shared/schema";
import { createApiClient } from "@/lib/apiClient";

export default function Parameters() {
  const [data, setData] = useState<Record<string, Parameter[]>>({});
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(null);
  const [expandedNamespaces, setExpandedNamespaces] = useState<Record<string, boolean>>({});
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isSecure, setIsSecure] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Set<number>>(new Set());
  const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);
  const [apiClient] = useState(() => {
    // Log environment variables for debugging
    console.log('Environment variables:', {
      baseUrl: import.meta.env.VITE_AWS_API_URL
    });

    return createApiClient(
      import.meta.env.VITE_AWS_API_URL
        ? {
            baseUrl: import.meta.env.VITE_AWS_API_URL
          }
        : undefined
    );
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showNamespaceDialog, setShowNamespaceDialog] = useState(false);
  const [newNamespace, setNewNamespace] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    apiClient.fetchNamespaces().then(setData);
  }, [apiClient]);

  const toggleSecret = (id: number) => {
    setShowSecrets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleNamespace = (namespace: string) => {
    setExpandedNamespaces(prev => ({
      ...prev,
      [namespace]: !prev[namespace]
    }));
  };

  const getBaseNamespace = (namespace: string) => {
    return namespace.split('/')[0];
  };

  const getEnvironment = (namespace: string) => {
    return namespace.split('/')[1];
  };

  const groupedNamespaces = Object.keys(data).reduce((acc, namespace) => {
    const base = getBaseNamespace(namespace);
    if (!acc[base]) {
      acc[base] = [];
    }
    acc[base].push(namespace);
    return acc;
  }, {} as Record<string, string[]>);

  const addOrUpdateVariable = () => {
    if (selectedNamespace && newKey && newValue) {
      const variable = {
        name: newKey,
        value: newValue,
        isSecure,
      };

      const existingParam = editingParameter || data[selectedNamespace]?.find(p => p.name === newKey);

      if (existingParam) {
        apiClient.updateVariable(selectedNamespace, existingParam.name, variable).then(() => {
          apiClient.fetchNamespaces().then(setData);
          resetForm();
          setShowDialog(false);
          toast({ title: "Variable updated successfully" });
        });
      } else {
        apiClient.addVariable(selectedNamespace, variable).then(() => {
          apiClient.fetchNamespaces().then(setData);
          resetForm();
          setShowDialog(false);
          toast({ title: "Variable added successfully" });
        });
      }
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
    setEditingParameter(null);
  };

  const startEditing = (param: Parameter) => {
    setEditingParameter(param);
    setNewKey(param.name);
    setNewValue(param.value);
    setIsSecure(param.isSecure);
    setShowDialog(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedNamespace) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      let updated = 0;
      let created = 0;

      const variables = content
        .split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => {
          const [key, ...valueParts] = line.split('=');
          const value = valueParts.join('=');
          return {
            name: key.trim(),
            value: value.trim().replace(/^["']|["']$/g, ''),
            isSecure: key.toLowerCase().includes('secret') || key.toLowerCase().includes('password')
          };
        });

      for (const variable of variables) {
        try {
          const existingParam = data[selectedNamespace]?.find(p => p.name === variable.name);

          if (existingParam) {
            await apiClient.updateVariable(selectedNamespace, variable.name, variable);
            updated++;
          } else {
            await apiClient.addVariable(selectedNamespace, variable);
            created++;
          }
        } catch (error) {
          console.error(`Failed to import ${variable.name}:`, error);
        }
      }

      apiClient.fetchNamespaces().then(setData);
      toast({
        title: `Import completed`,
        description: `Created ${created} new parameters, updated ${updated} existing parameters.`
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  const createNamespace = async () => {
    if (!newNamespace.trim() || !newKey || !newValue) {
      toast({ 
        title: "All fields are required", 
        description: "Please provide namespace name and initial variable details",
        variant: "destructive" 
      });
      return;
    }

    try {
      const variable = {
        name: newKey,
        value: newValue,
        isSecure
      };

      await apiClient.createNamespaceWithVariable(newNamespace, variable);
      await apiClient.fetchNamespaces().then(setData);
      setSelectedNamespace(newNamespace);
      resetNamespaceDialog();
      toast({ title: "Namespace created successfully" });
    } catch (error) {
      toast({ 
        title: "Failed to create namespace", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    }
  };

  const resetNamespaceDialog = () => {
    setNewNamespace("");
    setNewKey("");
    setNewValue("");
    setIsSecure(false);
    setShowNamespaceDialog(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">AWS Parameter Store UI</h2>
          <Badge variant="outline">v1.0.0</Badge>
        </div>
        <Button onClick={() => setShowNamespaceDialog(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Namespace
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="w-64 border-r pr-4">
          {Object.entries(groupedNamespaces).map(([base, namespaces]) => (
            <div key={base} className="mb-2">
              <div
                className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                onClick={() => toggleNamespace(base)}
              >
                {expandedNamespaces[base] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span className="font-medium">{base}</span>
              </div>
              {expandedNamespaces[base] && (
                <div className="ml-6 space-y-1">
                  {namespaces.map(namespace => (
                    <div
                      key={namespace}
                      onClick={() => setSelectedNamespace(namespace)}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-accent ${
                        selectedNamespace === namespace ? "bg-accent" : ""
                      }`}
                    >
                      <Key className="h-4 w-4" />
                      <span>{getEnvironment(namespace)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedNamespace && (
          <div className="flex-1">
            <Card>
              <CardContent className="py-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">{selectedNamespace} Variables</h3>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept=".env"
                      onChange={handleFileUpload}
                      ref={fileInputRef}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      size="sm"
                      variant="outline"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import .env
                    </Button>
                    <Button onClick={() => {
                      resetForm();
                      setShowDialog(true);
                    }} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Variable
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {data[selectedNamespace]?.map((param) => (
                    <div
                      key={param.id}
                      className="flex items-center justify-between border-b p-2"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{param.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            v{param.version || 1}
                          </Badge>
                          {param.isSecure && (
                            <Badge variant="outline" className="text-xs">
                              secure
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">
                          {param.isSecure && !showSecrets.has(param.id)
                            ? "••••••••"
                            : param.value}
                        </span>
                        {param.isSecure && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSecret(param.id)}
                          >
                            {showSecrets.has(param.id) ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(param)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
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
      </div>

      <Dialog open={showDialog} onOpenChange={(open) => {
        if (!open) resetForm();
        setShowDialog(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingParameter ? 'Edit Parameter' : 'Add Environment Variable'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Key"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              disabled={!!editingParameter}
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
            <Button onClick={addOrUpdateVariable} className="w-full">
              {editingParameter ? 'Update' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNamespaceDialog} onOpenChange={(open) => {
        if (!open) resetNamespaceDialog();
        setShowNamespaceDialog(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Namespace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Namespace name (e.g., myapp/dev)"
              value={newNamespace}
              onChange={(e) => setNewNamespace(e.target.value)}
            />
            <Input
              placeholder="Initial Variable Key"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
            />
            <Input
              placeholder="Initial Variable Value"
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetNamespaceDialog}>
                Cancel
              </Button>
              <Button onClick={createNamespace}>
                Create Namespace
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
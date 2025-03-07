import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Parameters from "@/pages/parameters";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Parameters />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import Parameters from "@/pages/parameters";

function App() {
  return (
    <>
      <Parameters />
      <Toaster />
    </>
  );
}

export default App;
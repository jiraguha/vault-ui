import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EnvironmentSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export default function EnvironmentSelector({ value, onValueChange }: EnvironmentSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select environment" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="development">Development</SelectItem>
        <SelectItem value="production">Production</SelectItem>
      </SelectContent>
    </Select>
  );
}

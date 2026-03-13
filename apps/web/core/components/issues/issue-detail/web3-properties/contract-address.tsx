import { useState } from "react";
import { observer } from "mobx-react";
import type { TWeb3Properties } from "@plane/types";

type Props = {
  value: string | undefined;
  onChange: (properties: Partial<TWeb3Properties>) => void;
  disabled?: boolean;
};

export const ContractAddress = observer(function ContractAddress({ value, onChange, disabled }: Props) {
  const [localValue, setLocalValue] = useState(value ?? "");

  const handleBlur = () => {
    if (localValue !== (value ?? "")) {
      onChange({ contract_address: localValue || undefined });
    }
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => e.key === "Enter" && handleBlur()}
      placeholder="0x..."
      disabled={disabled}
      className="w-full h-7.5 rounded-sm border-0 bg-transparent px-2 text-body-xs-regular text-primary placeholder:text-placeholder focus:outline-none focus:ring-1 focus:ring-accent-primary disabled:cursor-not-allowed disabled:opacity-60 font-mono"
    />
  );
});

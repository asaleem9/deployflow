import { useState } from "react";
import { observer } from "mobx-react";
import type { TWeb3Properties } from "@plane/types";

type Props = {
  value: string | undefined;
  onChange: (properties: Partial<TWeb3Properties>) => void;
  disabled?: boolean;
};

export const DeploymentDate = observer(function DeploymentDate({ value, onChange, disabled }: Props) {
  const [localValue, setLocalValue] = useState(value ?? "");

  return (
    <input
      type="date"
      value={localValue}
      onChange={(e) => {
        setLocalValue(e.target.value);
        onChange({ deployment_date: e.target.value || undefined });
      }}
      disabled={disabled}
      className="w-full h-7.5 rounded-sm border-0 bg-transparent px-2 text-body-xs-regular text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary disabled:cursor-not-allowed disabled:opacity-60"
    />
  );
});

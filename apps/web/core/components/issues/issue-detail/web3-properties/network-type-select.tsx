import { observer } from "mobx-react";
import { WEB3_NETWORK_TYPES } from "@plane/constants";
import type { TWeb3Properties } from "@plane/types";

type Props = {
  value: string | undefined;
  onChange: (properties: Partial<TWeb3Properties>) => void;
  disabled?: boolean;
};

export const NetworkTypeSelect = observer(function NetworkTypeSelect({ value, onChange, disabled }: Props) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange({ network_type: (e.target.value as TWeb3Properties["network_type"]) || undefined })}
      disabled={disabled}
      className="w-full h-7.5 rounded-sm border-0 bg-transparent px-2 text-body-xs-regular text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary disabled:cursor-not-allowed disabled:opacity-60"
    >
      <option value="">Select network</option>
      {WEB3_NETWORK_TYPES.map((network) => (
        <option key={network.key} value={network.key}>
          {network.title}
        </option>
      ))}
    </select>
  );
});

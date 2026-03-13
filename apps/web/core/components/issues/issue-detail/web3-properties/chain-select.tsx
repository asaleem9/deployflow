import { observer } from "mobx-react";
import { WEB3_CHAIN_OPTIONS } from "@plane/constants";
import type { TWeb3Properties } from "@plane/types";

type Props = {
  value: string | undefined;
  onChange: (properties: Partial<TWeb3Properties>) => void;
  disabled?: boolean;
};

export const ChainSelect = observer(function ChainSelect({ value, onChange, disabled }: Props) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange({ chain_name: e.target.value || undefined })}
      disabled={disabled}
      className="w-full h-7.5 rounded-sm border-0 bg-transparent px-2 text-body-xs-regular text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary disabled:cursor-not-allowed disabled:opacity-60"
    >
      <option value="">Select chain</option>
      {WEB3_CHAIN_OPTIONS.map((chain) => (
        <option key={chain.key} value={chain.key}>
          {chain.title}
        </option>
      ))}
    </select>
  );
});

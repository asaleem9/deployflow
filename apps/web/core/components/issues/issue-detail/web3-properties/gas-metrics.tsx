import { useState } from "react";
import { observer } from "mobx-react";
import type { TWeb3Properties } from "@plane/types";

type Props = {
  value: TWeb3Properties["gas_metrics"] | undefined;
  onChange: (properties: Partial<TWeb3Properties>) => void;
  disabled?: boolean;
};

export const GasMetrics = observer(function GasMetrics({ value, onChange, disabled }: Props) {
  const [deployGas, setDeployGas] = useState(value?.deployment_gas?.toString() ?? "");
  const [txGas, setTxGas] = useState(value?.avg_transaction_gas?.toString() ?? "");

  const handleUpdate = () => {
    onChange({
      gas_metrics: {
        deployment_gas: deployGas ? parseInt(deployGas, 10) : undefined,
        avg_transaction_gas: txGas ? parseInt(txGas, 10) : undefined,
        optimization_notes: value?.optimization_notes,
      },
    });
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      <input
        type="number"
        value={deployGas}
        onChange={(e) => setDeployGas(e.target.value)}
        onBlur={handleUpdate}
        placeholder="Deploy gas"
        disabled={disabled}
        className="w-full h-7.5 rounded-sm border-0 bg-transparent px-2 text-body-xs-regular text-primary placeholder:text-placeholder focus:outline-none focus:ring-1 focus:ring-accent-primary disabled:cursor-not-allowed disabled:opacity-60"
      />
      <input
        type="number"
        value={txGas}
        onChange={(e) => setTxGas(e.target.value)}
        onBlur={handleUpdate}
        placeholder="Avg tx gas"
        disabled={disabled}
        className="w-full h-7.5 rounded-sm border-0 bg-transparent px-2 text-body-xs-regular text-primary placeholder:text-placeholder focus:outline-none focus:ring-1 focus:ring-accent-primary disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
});

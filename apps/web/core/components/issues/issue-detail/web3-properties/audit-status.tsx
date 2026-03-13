import { observer } from "mobx-react";
import { WEB3_AUDIT_STATUSES } from "@plane/constants";
import type { TWeb3Properties } from "@plane/types";

type Props = {
  value: string | undefined;
  onChange: (properties: Partial<TWeb3Properties>) => void;
  disabled?: boolean;
};

export const AuditStatus = observer(function AuditStatus({ value, onChange, disabled }: Props) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange({ audit_status: (e.target.value as TWeb3Properties["audit_status"]) || undefined })}
      disabled={disabled}
      className="w-full h-7.5 rounded-sm border-0 bg-transparent px-2 text-body-xs-regular text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary disabled:cursor-not-allowed disabled:opacity-60"
    >
      <option value="">Select status</option>
      {WEB3_AUDIT_STATUSES.map((status) => (
        <option key={status.key} value={status.key}>
          {status.title}
        </option>
      ))}
    </select>
  );
});

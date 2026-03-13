import { observer } from "mobx-react";
import type { TWeb3Properties } from "@plane/types";
import { SidebarPropertyListItem } from "@/components/common/layout/sidebar/property-list-item";
import { ChainSelect } from "./chain-select";
import { NetworkTypeSelect } from "./network-type-select";
import { ContractAddress } from "./contract-address";
import { AuditStatus } from "./audit-status";
import { GasMetrics } from "./gas-metrics";
import { DeploymentDate } from "./deployment-date";

type Props = {
  web3Properties: TWeb3Properties | undefined;
  onChange: (properties: Partial<TWeb3Properties>) => void;
  disabled?: boolean;
};

const Web3Icon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-secondary shrink-0">
    <path d="M7 1L2 7.5L7 5.5V1Z" fill="currentColor" opacity="0.6" />
    <path d="M7 1L12 7.5L7 5.5V1Z" fill="currentColor" opacity="0.8" />
    <path d="M7 10L2 7.5L7 5.5V10Z" fill="currentColor" opacity="0.6" />
    <path d="M7 10L12 7.5L7 5.5V10Z" fill="currentColor" opacity="0.8" />
    <path d="M7 11L2 8.5L7 13V11Z" fill="currentColor" opacity="0.6" />
    <path d="M7 11L12 8.5L7 13V11Z" fill="currentColor" opacity="0.8" />
  </svg>
);

export const Web3PropertiesSection = observer(function Web3PropertiesSection({ web3Properties, onChange, disabled }: Props) {
  const props = web3Properties ?? {};

  return (
    <div className="mt-4">
      <h5 className="text-body-xs-medium mb-2">Web3 Properties</h5>
      <div className="space-y-2.5">
        <SidebarPropertyListItem icon={Web3Icon} label="Chain">
          <ChainSelect value={props.chain_name} onChange={onChange} disabled={disabled} />
        </SidebarPropertyListItem>

        <SidebarPropertyListItem icon={Web3Icon} label="Network">
          <NetworkTypeSelect value={props.network_type} onChange={onChange} disabled={disabled} />
        </SidebarPropertyListItem>

        <SidebarPropertyListItem icon={Web3Icon} label="Contract">
          <ContractAddress value={props.contract_address} onChange={onChange} disabled={disabled} />
        </SidebarPropertyListItem>

        <SidebarPropertyListItem icon={Web3Icon} label="Audit Status">
          <AuditStatus value={props.audit_status} onChange={onChange} disabled={disabled} />
        </SidebarPropertyListItem>

        <SidebarPropertyListItem icon={Web3Icon} label="Gas Metrics">
          <GasMetrics value={props.gas_metrics} onChange={onChange} disabled={disabled} />
        </SidebarPropertyListItem>

        <SidebarPropertyListItem icon={Web3Icon} label="Deploy Date">
          <DeploymentDate value={props.deployment_date} onChange={onChange} disabled={disabled} />
        </SidebarPropertyListItem>
      </div>
    </div>
  );
});

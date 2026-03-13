import { useState, useEffect } from "react";
import { cn } from "@plane/utils";

type ProjectTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

const TEMPLATE_ICONS: Record<string, string> = {
  code: "description",
  "trending-up": "trending_up",
  vote: "how_to_vote",
  image: "image",
  link: "link",
};

type Props = {
  selectedTemplateId: string | null;
  onSelect: (templateId: string | null) => void;
  workspaceSlug: string;
};

const BUILT_IN_TEMPLATES: ProjectTemplate[] = [
  {
    id: "smart-contract",
    name: "Smart Contract Development",
    description: "Full lifecycle smart contract project with audit and deployment tracking",
    icon: "code",
  },
  {
    id: "defi-protocol",
    name: "DeFi Protocol",
    description: "DeFi protocol development with tokenomics and liquidity management",
    icon: "trending-up",
  },
  {
    id: "dao-governance",
    name: "DAO/Governance",
    description: "DAO governance framework with proposal tracking and voting mechanisms",
    icon: "vote",
  },
  {
    id: "nft-project",
    name: "NFT Project",
    description: "NFT collection or marketplace with minting and metadata management",
    icon: "image",
  },
  {
    id: "cross-chain-bridge",
    name: "Cross-Chain Bridge",
    description: "Cross-chain bridge development with multi-network deployment",
    icon: "link",
  },
];

export function TemplateSelector({ selectedTemplateId, onSelect }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-primary">Web3 Project Template</h4>
        {selectedTemplateId && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-xs text-secondary hover:text-primary"
          >
            Clear selection
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {BUILT_IN_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id === selectedTemplateId ? null : template.id)}
            className={cn(
              "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
              selectedTemplateId === template.id
                ? "border-accent-primary bg-accent-subtle"
                : "border-subtle-1 hover:border-subtle-2 hover:bg-surface-2"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-rounded text-base text-secondary">
                {TEMPLATE_ICONS[template.icon] ?? template.icon}
              </span>
              <span className="text-xs font-medium text-primary">{template.name}</span>
            </div>
            <p className="text-[10px] text-secondary line-clamp-2">{template.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

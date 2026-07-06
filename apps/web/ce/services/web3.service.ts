/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { AxiosInstance } from "axios";
import { create } from "axios";
import { API_BASE_URL } from "@plane/constants";
import type {
  INetwork,
  ISmartContract,
  IContractDeployment,
  IAudit,
  IAuditFinding,
  IBounty,
  ITokenLaunch,
} from "@/plane-web/types/web3";

const WEB3 = "/api/web3";

/** Client for the DeployFlow web3 endpoints (contracts, deployments, networks). */
export class Web3Service {
  private axios: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.axios = create({ baseURL, withCredentials: true });
  }

  async listNetworks(workspaceSlug: string): Promise<INetwork[]> {
    return this.axios.get(`${WEB3}/workspaces/${workspaceSlug}/networks/`).then((r) => r.data);
  }

  async listContracts(workspaceSlug: string, projectId: string): Promise<ISmartContract[]> {
    return this.axios.get(`${WEB3}/workspaces/${workspaceSlug}/projects/${projectId}/contracts/`).then((r) => r.data);
  }

  async retrieveContract(workspaceSlug: string, projectId: string, contractId: string): Promise<ISmartContract> {
    return this.axios
      .get(`${WEB3}/workspaces/${workspaceSlug}/projects/${projectId}/contracts/${contractId}/`)
      .then((r) => r.data);
  }

  async createContract(
    workspaceSlug: string,
    projectId: string,
    data: Partial<ISmartContract>
  ): Promise<ISmartContract> {
    return this.axios
      .post(`${WEB3}/workspaces/${workspaceSlug}/projects/${projectId}/contracts/`, data)
      .then((r) => r.data);
  }

  async updateContract(
    workspaceSlug: string,
    projectId: string,
    contractId: string,
    data: Partial<ISmartContract>
  ): Promise<ISmartContract> {
    return this.axios
      .patch(`${WEB3}/workspaces/${workspaceSlug}/projects/${projectId}/contracts/${contractId}/`, data)
      .then((r) => r.data);
  }

  async listDeployments(workspaceSlug: string, projectId: string, contractId: string): Promise<IContractDeployment[]> {
    return this.axios
      .get(`${WEB3}/workspaces/${workspaceSlug}/projects/${projectId}/contracts/${contractId}/deployments/`)
      .then((r) => r.data);
  }

  async createDeployment(
    workspaceSlug: string,
    projectId: string,
    contractId: string,
    data: Partial<IContractDeployment>
  ): Promise<IContractDeployment> {
    return this.axios
      .post(`${WEB3}/workspaces/${workspaceSlug}/projects/${projectId}/contracts/${contractId}/deployments/`, data)
      .then((r) => r.data);
  }

  /** Queue an on-chain sync (receipt + verification) for one deployment. */
  async refreshDeployment(workspaceSlug: string, projectId: string, deploymentId: string): Promise<unknown> {
    return this.axios
      .post(`${WEB3}/workspaces/${workspaceSlug}/projects/${projectId}/deployments/${deploymentId}/refresh/`)
      .then((r) => r.data);
  }

  // --- audits & findings ---

  async listAudits(workspaceSlug: string, projectId: string): Promise<IAudit[]> {
    return this.axios.get(`${WEB3}/workspaces/${workspaceSlug}/projects/${projectId}/audits/`).then((r) => r.data);
  }

  async listFindings(workspaceSlug: string, projectId: string): Promise<IAuditFinding[]> {
    return this.axios.get(`${WEB3}/workspaces/${workspaceSlug}/projects/${projectId}/findings/`).then((r) => r.data);
  }

  /** Create a finding against a contract, opening/reusing an audit in one call. */
  async createFinding(
    workspaceSlug: string,
    projectId: string,
    data: { contract: string; title: string; severity: string; code?: string }
  ): Promise<IAuditFinding> {
    return this.axios
      .post(`${WEB3}/workspaces/${workspaceSlug}/projects/${projectId}/findings/create-with-audit/`, data)
      .then((r) => r.data);
  }

  /** Turn a finding into a tracked remediation work item (severity -> priority). */
  async createRemediationIssue(
    workspaceSlug: string,
    projectId: string,
    findingId: string
  ): Promise<{ issue_id: string; sequence_id?: number; created: boolean }> {
    return this.axios
      .post(`${WEB3}/workspaces/${workspaceSlug}/projects/${projectId}/findings/${findingId}/remediation-issue/`)
      .then((r) => r.data);
  }

  // --- bounties & token launches ---

  async listBounties(workspaceSlug: string, projectId: string): Promise<IBounty[]> {
    return this.axios.get(`${WEB3}/workspaces/${workspaceSlug}/projects/${projectId}/bounties/`).then((r) => r.data);
  }

  /** Create a bounty and its backing work item in one call. */
  async createBounty(
    workspaceSlug: string,
    projectId: string,
    data: { title: string; network: string; reward_amount: string; reward_token_symbol: string }
  ): Promise<IBounty> {
    return this.axios
      .post(`${WEB3}/workspaces/${workspaceSlug}/projects/${projectId}/bounties/create-with-issue/`, data)
      .then((r) => r.data);
  }

  async listTokenLaunches(workspaceSlug: string, projectId: string): Promise<ITokenLaunch[]> {
    return this.axios
      .get(`${WEB3}/workspaces/${workspaceSlug}/projects/${projectId}/token-launches/`)
      .then((r) => r.data);
  }

  async createTokenLaunch(
    workspaceSlug: string,
    projectId: string,
    data: Partial<ITokenLaunch>
  ): Promise<ITokenLaunch> {
    return this.axios
      .post(`${WEB3}/workspaces/${workspaceSlug}/projects/${projectId}/token-launches/`, data)
      .then((r) => r.data);
  }
}

export const web3Service = new Web3Service();

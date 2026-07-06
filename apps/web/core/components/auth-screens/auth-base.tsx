/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import { AuroraBackground } from "@deployflow/motion";
import { AuthRoot } from "@/components/account/auth-forms/auth-root";
import type { EAuthModes } from "@/helpers/authentication.helper";
import { AuthFooter } from "./footer";
import { AuthHeader } from "./header";

type AuthBaseProps = {
  authType: EAuthModes;
};

export function AuthBase({ authType }: AuthBaseProps) {
  return (
    <div className="relative flex h-screen w-screen flex-col items-center overflow-hidden overflow-y-auto bg-canvas px-8 pt-6 pb-10">
      {/* animated aurora mesh behind everything (decorative, respects reduced-motion) */}
      <AuroraBackground />
      <div className="relative z-10 w-full flex-shrink-0">
        <AuthHeader type={authType} />
      </div>
      {/* the form sits in a glass panel, centered in the remaining space */}
      <div className="relative z-10 flex w-full flex-1 items-center justify-center py-6">
        <div className="glass-2 w-full max-w-md rounded-4xl px-6 py-4 shadow-glow-brand sm:px-8">
          <AuthRoot authMode={authType} />
        </div>
      </div>
      <div className="relative z-10 w-full flex-shrink-0">
        <AuthFooter />
      </div>
    </div>
  );
}

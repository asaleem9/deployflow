/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { AuthBase } from "@/components/auth-screens/auth-base";
import { EAuthModes, EPageTypes } from "@/helpers/authentication.helper";
import DefaultLayout from "@/layouts/default-layout";
import { AuthenticationWrapper } from "@/lib/wrappers/authentication-wrapper";

// The dedicated sign-in page. "/" now hosts the marketing landing, so the auth
// form lives here and the landing's "Sign in" CTA points at it.
export default function SignInPage() {
  return (
    <DefaultLayout>
      <AuthenticationWrapper pageType={EPageTypes.NON_AUTHENTICATED}>
        <AuthBase authType={EAuthModes.SIGN_IN} />
      </AuthenticationWrapper>
    </DefaultLayout>
  );
}

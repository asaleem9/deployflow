/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@plane/constants";
// components
import { AuthBase } from "@/components/auth-screens/auth-base";
import { Landing } from "@/plane-web/components/marketing/landing";
// helpers
import { EAuthModes, EPageTypes } from "@/helpers/authentication.helper";
// hooks
import { useUser, useUserSettings } from "@/hooks/store/user";
// demo
import { isDemoUser } from "@/plane-web/components/demo/demo.utils";
// layouts
import DefaultLayout from "@/layouts/default-layout";
// wrappers
import { AuthenticationWrapper } from "@/lib/wrappers/authentication-wrapper";

const HomePage = observer(() => {
  const searchParams = useSearchParams();
  const [demoLoading, setDemoLoading] = useState(false);
  const { data: currentUser } = useUser();
  const { data: userSettings } = useUserSettings();

  // Only the auth-flow redirects (errors, magic/invite links) show the sign-in
  // form. The plain homepage is always the marketing landing — for everyone.
  const isAuthFlow =
    searchParams.has("error_code") ||
    searchParams.has("email") ||
    searchParams.has("invitation_id") ||
    searchParams.has("next_path") ||
    searchParams.has("auth");

  // Adapt the landing nav: signed-in visitors get "Open app" into their last
  // workspace; everyone else gets "Sign in".
  const isAuthenticated = !!currentUser?.id;
  const isDemo = isDemoUser(currentUser);
  const lastWorkspace =
    userSettings?.workspace?.last_workspace_slug || userSettings?.workspace?.fallback_workspace_slug;
  const appHref = lastWorkspace ? `/${lastWorkspace}` : "/create-workspace";

  const tryDemo = async () => {
    if (demoLoading) return;
    // Already in the demo? Just go back into it — don't re-run the login (which
    // looked like the homepage merely reloading).
    if (isDemo) {
      window.location.href = appHref;
      return;
    }
    setDemoLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/demo-login/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      window.location.href = data?.workspace_slug ? `/${data.workspace_slug}` : "/";
    } catch {
      setDemoLoading(false);
    }
  };

  // Auth flow: redirect signed-in users to their workspace, show the form to others.
  if (isAuthFlow) {
    return (
      <DefaultLayout>
        <AuthenticationWrapper pageType={EPageTypes.NON_AUTHENTICATED}>
          <AuthBase authType={EAuthModes.SIGN_IN} />
        </AuthenticationWrapper>
      </DefaultLayout>
    );
  }

  // Marketing landing: PUBLIC, so authed and anonymous visitors both reach it.
  return (
    <DefaultLayout>
      <AuthenticationWrapper pageType={EPageTypes.PUBLIC}>
        <Landing
          onTryDemo={tryDemo}
          demoLoading={demoLoading}
          isAuthenticated={isAuthenticated}
          isDemo={isDemo}
          appHref={appHref}
        />
      </AuthenticationWrapper>
    </DefaultLayout>
  );
});

export default HomePage;

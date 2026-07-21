import { ApEdition, ApFlagId } from '@activepieces/shared';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { useTheme } from '@/components/providers/theme-provider';
import { Card, CardContent } from '@/components/ui/card';
import { WarpBackground } from '@/components/ui/warp-background';
import { authenticationSession } from '@/lib/authentication-session';
import { useRedirectAfterLogin } from '@/lib/navigation-utils';

import { HorizontalSeparatorWithText } from '../../../components/ui/separator';
import { flagsHooks } from '../../../hooks/flags-hooks';

import { SignInForm } from './sign-in-form';
import { SignUpForm } from './sign-up-form';
import { ThirdPartyLogin } from './third-party-logins';

const BottomNote = ({ isSignup }: { isSignup: boolean }) => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.toString();

  return isSignup ? (
    <div className="mt-6 text-center text-[14px] text-muted-foreground">
      {t('Already have an account?')}
      <Link
        to={`/sign-in?${searchQuery}`}
        className="pl-1 font-medium text-foreground hover:underline transition-all duration-200"
      >
        {t('Sign in')}
      </Link>
    </div>
  ) : (
    <div className="mt-6 text-center text-[14px] text-muted-foreground">
      {t("Don't have an account?")}
      <Link
        to={`/sign-up?${searchQuery}`}
        className="pl-1 font-medium text-foreground hover:underline transition-all duration-200"
      >
        {t('Sign up')}
      </Link>
    </div>
  );
};

const TermsFooter = () => {
  const { data: termsOfServiceUrl } = flagsHooks.useFlag<string>(
    ApFlagId.TERMS_OF_SERVICE_URL,
  );
  const { data: privacyPolicyUrl } = flagsHooks.useFlag<string>(
    ApFlagId.PRIVACY_POLICY_URL,
  );
  const { data: edition } = flagsHooks.useFlag<ApEdition>(ApFlagId.EDITION);

  if (
    edition !== ApEdition.CLOUD ||
    (!termsOfServiceUrl && !privacyPolicyUrl)
  ) {
    return null;
  }

  return (
    <div className="text-center text-xs text-muted-foreground">
      {t('By continuing, you agree to our')}
      {termsOfServiceUrl && (
        <Link
          to={termsOfServiceUrl}
          target="_blank"
          className="px-1 text-muted-foreground underline hover:text-primary text-xs transition-all duration-200"
        >
          {t('Terms of Service')}
        </Link>
      )}
      {termsOfServiceUrl && privacyPolicyUrl && t('and')}
      {privacyPolicyUrl && (
        <Link
          to={privacyPolicyUrl}
          target="_blank"
          className="pl-1 text-muted-foreground underline hover:text-primary text-xs transition-all duration-200"
        >
          {t('Privacy Policy')}
        </Link>
      )}
      .
    </div>
  );
};

const AuthSeparator = ({
  isEmailAuthEnabled,
}: {
  isEmailAuthEnabled: boolean;
}) => {
  return isEmailAuthEnabled ? (
    <HorizontalSeparatorWithText className="my-5 text-muted-foreground">
      {t('or')}
    </HorizontalSeparatorWithText>
  ) : null;
};

const AuthLayout = ({
  children,
  isSignUp,
}: {
  children: React.ReactNode;
  isSignUp?: boolean;
}) => {
  const { setForceLightMode } = useTheme();
  const branding = flagsHooks.useWebsiteBranding();
  useEffect(() => {
    setForceLightMode(true);
    return () => setForceLightMode(false);
  }, [setForceLightMode]);
  return (
    <WarpBackground
      className="flex h-screen w-full items-center justify-center overflow-y-auto rounded-none border-none bg-background p-6"
      gridColor="hsl(var(--primary-600) / 0.12)"
      beamColor="#6394FF"
      beamDuration={2}
    >
      <div className="flex w-96 max-w-full flex-col items-center">
        <img
          src={branding.logos.logoIconUrl}
          alt={branding.websiteName}
          className="mb-4 h-12 w-auto"
        />
        <h1 className="mb-6 text-center text-4xl font-bold tracking-tight text-primary-900">
          {branding.websiteName}
        </h1>
        <Card className="w-full">
          <CardContent className="p-6">{children}</CardContent>
        </Card>
        {isSignUp && (
          <div className="mt-6">
            <TermsFooter />
          </div>
        )}
      </div>
    </WarpBackground>
  );
};

AuthLayout.displayName = 'AuthLayout';

const AuthFormTemplate = React.memo(
  ({ form }: { form: 'signin' | 'signup' }) => {
    const isSignUp = form === 'signup';
    const token = authenticationSession.getToken();
    const redirectAfterLogin = useRedirectAfterLogin();
    const [showCheckYourEmailNote, setShowCheckYourEmailNote] = useState(false);
    const { data: isEmailAuthEnabled } = flagsHooks.useFlag<boolean>(
      ApFlagId.EMAIL_AUTH_ENABLED,
    );
    const data = {
      signin: {
        description: t('Sign in to pick up where you left off.'),
      },
      signup: {
        description: t('Join thousands of teams running on autopilot.'),
      },
    }[form];

    useEffect(() => {
      if (token) {
        redirectAfterLogin();
      }
    }, [token, redirectAfterLogin]);

    if (token) {
      return null;
    }

    return (
      <AuthLayout isSignUp={isSignUp}>
        {!showCheckYourEmailNote && (
          <p className="mb-6 text-center text-sm text-muted-foreground">
            {data.description}
          </p>
        )}

        {isEmailAuthEnabled ? (
          isSignUp ? (
            <SignUpForm
              setShowCheckYourEmailNote={setShowCheckYourEmailNote}
              showCheckYourEmailNote={showCheckYourEmailNote}
            />
          ) : (
            <SignInForm />
          )
        ) : null}

        <AuthSeparator
          isEmailAuthEnabled={
            (isEmailAuthEnabled ?? true) && !showCheckYourEmailNote
          }
        />
        {!showCheckYourEmailNote && <ThirdPartyLogin isSignUp={isSignUp} />}

        <BottomNote isSignup={isSignUp} />
      </AuthLayout>
    );
  },
);

AuthFormTemplate.displayName = 'AuthFormTemplate';

export { AuthFormTemplate, AuthLayout };

import Link from "next/link";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";
import {
  ancillaryClass,
  introLeadClass,
  sectionEyebrowClass,
  textLinkMutedClass,
  titleDisplayClass,
} from "@/lib/ui/typography";

type Props = {
  nextPath: string;
};

export function AuthPanel({ nextPath }: Props) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className={sectionEyebrowClass}>learnwithme</p>
        <h1 className={titleDisplayClass}>Sign in</h1>
        <p className={introLeadClass}>
          Continue with Google. If you&apos;re new here, you&apos;ll be guided through a quick profile setup.
        </p>
      </div>

      <GoogleOAuthButton nextPath={nextPath} />

      <p className={ancillaryClass}>
        By continuing you agree to our{" "}
        <Link href="/conduct" className={textLinkMutedClass}>
          Code of Conduct
        </Link>
        .
      </p>
    </div>
  );
}

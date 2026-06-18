import { Button } from "@/components/Button";
import { PCAP_COHORT_PATH } from "@/lib/pcap-cohort-1/quiz-data";
import { joinPcapCohort } from "./actions";

type Props = {
  signedIn: boolean;
  isMember: boolean;
  className?: string;
};

export function JoinCohortButton({ signedIn, isMember, className = "" }: Props) {
  if (isMember) {
    return (
      <Button href={PCAP_COHORT_PATH} className={className}>
        Go to Cohort
      </Button>
    );
  }

  if (!signedIn) {
    return (
      <Button
        href={`/login?next=${encodeURIComponent(PCAP_COHORT_PATH)}`}
        className={className}
      >
        Join Cohort
      </Button>
    );
  }

  return (
    <form action={joinPcapCohort} className={className}>
      <Button type="submit" className="w-full sm:w-auto">
        Join Cohort
      </Button>
    </form>
  );
}

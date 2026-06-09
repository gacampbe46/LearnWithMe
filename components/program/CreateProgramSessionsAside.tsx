import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { bodyLeadClass, captionClass, titleSubsectionClass } from "@/lib/ui/typography";

export function CreateProgramSessionsAside() {
  return (
    <section className="space-y-4">
      <h2 className={titleSubsectionClass}>Sessions</h2>
      <Card className="space-y-4">
        <p className={bodyLeadClass}>
          After you create the program, add sessions here — one tile per lesson,
          with video and notes for learners.
        </p>
        <p className={captionClass}>
          You&apos;ll land on the manage screen right after creating the program.
        </p>
        <Button
          type="button"
          variant="outline"
          disabled
          className="w-full min-h-10 justify-center px-4 text-sm font-medium opacity-60"
          title="Create the program first"
        >
          Add session
        </Button>
      </Card>
    </section>
  );
}

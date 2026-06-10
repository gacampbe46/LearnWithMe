import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { bodyLeadClass, captionClass, titleSubsectionClass } from "@/lib/ui/typography";

export function CreateProgramSessionsAside() {
  return (
    <section className="space-y-4">
      <h2 className={titleSubsectionClass}>Sessions</h2>
      <Card className="space-y-4">
        <p className={bodyLeadClass}>
          Create the program on the left first. You&apos;ll add sessions on the
          manage screen right after — one lesson at a time, with video for
          learners.
        </p>
        <p className={captionClass}>
          Programs start hidden from users until you add a session and turn
          visibility on.
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

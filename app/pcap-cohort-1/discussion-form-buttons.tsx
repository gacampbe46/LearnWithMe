"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/Button";

type PendingButtonProps = {
  children: React.ReactNode;
  pendingChildren: React.ReactNode;
  variant?: ButtonProps["variant"];
  className?: string;
  disabled?: boolean;
};

export function PendingSubmitButton({
  children,
  pendingChildren,
  variant,
  className,
  disabled = false,
}: PendingButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      className={className}
      disabled={disabled || pending}
    >
      {pending ? pendingChildren : children}
    </Button>
  );
}

import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "rounded-3xl border border-zinc-200 bg-white shadow-sm transition-shadow duration-200 dark:border-zinc-800 dark:bg-zinc-950",
  {
    variants: {
      intent: {
        default: "",
        subtle: "bg-zinc-50 dark:bg-zinc-900",
      },
    },
    defaultVariants: {
      intent: "default",
    },
  }
);

export interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export function Card({ className, intent, ...props }: CardProps) {
  return <div className={cardVariants({ intent, className })} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={"border-b border-zinc-200 px-6 py-5 dark:border-zinc-800 " + (className ?? "")} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={"p-6 " + (className ?? "")} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={"border-t border-zinc-200 px-6 py-4 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 " + (className ?? "")} {...props} />;
}

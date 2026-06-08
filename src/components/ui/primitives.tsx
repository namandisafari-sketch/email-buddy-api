export function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm leading-relaxed text-code-foreground">
      <code className="font-mono">{children}</code>
    </pre>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{children}</span>
  );
}

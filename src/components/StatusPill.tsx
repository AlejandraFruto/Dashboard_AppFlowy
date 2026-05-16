interface StatusPillProps {
  status: "complete" | "pending";
}

export function StatusPill({ status }: StatusPillProps) {
  return <span className={`status-pill status-pill--${status}`}>{status === "complete" ? "Measured" : "Pending"}</span>;
}

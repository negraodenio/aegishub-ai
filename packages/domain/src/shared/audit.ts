export interface AuditEvent {
  tenantId: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  occurredAt: Date;
}

export function buildAuditEvent(
  params: Omit<AuditEvent, "occurredAt">
): AuditEvent {
  return {
    ...params,
    occurredAt: new Date(),
  };
}

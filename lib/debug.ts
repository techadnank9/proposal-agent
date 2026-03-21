function isDisabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "false";
}

function isServerDebugEnabled() {
  return !isDisabled(process.env.PROPOSAL_AGENT_DEBUG);
}

function isClientDebugEnabled() {
  if (typeof window === "undefined") {
    return false;
  }

  const value =
    process.env.NEXT_PUBLIC_PROPOSAL_AGENT_DEBUG ??
    process.env.PROPOSAL_AGENT_DEBUG;

  return !isDisabled(value);
}

function timestamp() {
  return new Date().toISOString();
}

export function logDebug(scope: string, message: string, data?: unknown) {
  if (!isServerDebugEnabled()) {
    return;
  }

  const prefix = `[proposal-agent][${timestamp()}][${scope}] ${message}`;

  if (data === undefined) {
    console.log(prefix);
    return;
  }

  console.log(prefix, data);
}

export function logError(scope: string, message: string, data?: unknown) {
  const prefix = `[proposal-agent][${timestamp()}][${scope}] ${message}`;

  if (data === undefined) {
    console.error(prefix);
    return;
  }

  console.error(prefix, data);
}

export function logClientDebug(scope: string, message: string, data?: unknown) {
  if (!isClientDebugEnabled()) {
    return;
  }

  const prefix = `[proposal-agent][browser][${timestamp()}][${scope}] ${message}`;

  if (data === undefined) {
    console.log(prefix);
    return;
  }

  console.log(prefix, data);
}

export function logClientError(scope: string, message: string, data?: unknown) {
  if (!isClientDebugEnabled()) {
    return;
  }

  const prefix = `[proposal-agent][browser][${timestamp()}][${scope}] ${message}`;

  if (data === undefined) {
    console.error(prefix);
    return;
  }

  console.error(prefix, data);
}

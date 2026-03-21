const DEBUG_ENABLED = process.env.NODE_ENV !== "production";

function timestamp() {
  return new Date().toISOString();
}

export function logDebug(scope: string, message: string, data?: unknown) {
  if (!DEBUG_ENABLED) {
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

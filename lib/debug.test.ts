import {
  logClientDebug,
  logDebug,
} from "@/lib/debug";

describe("debug logging", () => {
  const originalEnv = process.env;
  const originalWindow = global.window;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
    global.window = originalWindow;
  });

  it("logs on the server by default, including production", () => {
    process.env.NODE_ENV = "production";
    delete process.env.PROPOSAL_AGENT_DEBUG;

    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    logDebug("server", "hello");

    expect(spy).toHaveBeenCalled();
  });

  it("can disable server logging explicitly", () => {
    process.env.PROPOSAL_AGENT_DEBUG = "false";

    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    logDebug("server", "hello");

    expect(spy).not.toHaveBeenCalled();
  });

  it("logs in the browser when enabled", () => {
    process.env.NEXT_PUBLIC_PROPOSAL_AGENT_DEBUG = "true";
    global.window = {} as Window & typeof globalThis;

    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    logClientDebug("browser", "hello");

    expect(spy).toHaveBeenCalled();
  });
});

import { generateProposal } from "@/lib/llm";

describe("llm helper", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      OPENROUTER_API_KEY: "sk-or-v1-test-key",
      OPENROUTER_BASE_URL: "https://openrouter.ai/api/v1",
      OPENROUTER_MODEL: "openai/gpt-4o-mini",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("surfaces provider error messages", async () => {
    await expect(
      generateProposal(
        "hello",
        vi.fn(async () =>
          new Response(
            JSON.stringify({
              error: {
                message: "No endpoints found for openai/gpt-5-mini",
              },
            }),
            { status: 400 },
          ),
        ) as typeof fetch,
      ),
    ).rejects.toThrow(/no endpoints found/i);
  });

  it("parses array-based message content", async () => {
    const proposal = await generateProposal(
      "hello",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: [
                    {
                      type: "text",
                      text: JSON.stringify({
                        intro: "Hi",
                        client_understanding: "Understood",
                        problems: ["Problem"],
                        solution: "Solution",
                        deliverables: ["Deliverable"],
                        timeline: "1 week",
                        pricing: "$500",
                      }),
                    },
                  ],
                },
              },
            ],
          }),
          { status: 200 },
        ),
      ) as typeof fetch,
    );

    expect(proposal.intro).toBe("Hi");
    expect(proposal.pricing).toBe("$500");
  });

  it("defaults to the OpenRouter endpoint when the key is an OpenRouter key", async () => {
    process.env = {
      ...originalEnv,
      OPENAI_API_KEY: "sk-or-v1-test-key",
    };

    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  intro: "Hi",
                  client_understanding: "Understood",
                  problems: ["Problem"],
                  solution: "Solution",
                  deliverables: ["Deliverable"],
                  timeline: "1 week",
                  pricing: "$500",
                }),
              },
            },
          ],
        }),
        { status: 200 },
      ),
    );

    await generateProposal("hello", fetchMock as typeof fetch);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("https://openrouter.ai/api/v1/chat/completions"),
      expect.any(Object),
    );
  });
});

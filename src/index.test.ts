import { afterEach, describe, expect, it, vi } from "vitest";
import { useFormspark } from "./index";

const mockFetchOnce = (json: unknown) => {
  const fetchMock = vi.fn().mockResolvedValue({
    json: () => Promise.resolve(json),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

describe("useFormspark", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a [submit, submitting] tuple", () => {
    const [submit, submitting] = useFormspark({ formId: "abc" });
    expect(typeof submit).toBe("function");
    expect(submitting.value).toBe(false);
  });

  it("posts the payload as JSON to the form endpoint and returns parsed JSON", async () => {
    const fetchMock = mockFetchOnce({ success: true });
    const [submit] = useFormspark({ formId: "abc" });

    const result = await submit({ message: "hi" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://submit-form.com/abc");
    expect(init).toMatchObject({
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "hi" }),
    });
    expect(result).toEqual({ success: true });
  });

  it("URL-encodes the form id so special characters do not malform the URL", async () => {
    const fetchMock = mockFetchOnce({});
    const [submit] = useFormspark({ formId: "weird/id?x=1" });

    await submit({});

    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://submit-form.com/weird%2Fid%3Fx%3D1",
    );
  });

  it("toggles submitting around an in-flight request", async () => {
    let resolveFetch!: (value: unknown) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          }),
      ),
    );

    const [submit, submitting] = useFormspark({ formId: "abc" });
    expect(submitting.value).toBe(false);

    const inFlight = submit({});
    expect(submitting.value).toBe(true);

    resolveFetch({ json: () => Promise.resolve({}) });
    await inFlight;

    expect(submitting.value).toBe(false);
  });

  it("propagates fetch errors and resets submitting", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const [submit, submitting] = useFormspark({ formId: "abc" });

    await expect(submit({})).rejects.toThrow("network");
    expect(submitting.value).toBe(false);
  });

  it("propagates JSON parse errors and resets submitting", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.reject(new Error("invalid json")),
      }),
    );
    const [submit, submitting] = useFormspark({ formId: "abc" });

    await expect(submit({})).rejects.toThrow("invalid json");
    expect(submitting.value).toBe(false);
  });

  it("each useFormspark call gets its own submitting ref", () => {
    const [, submittingA] = useFormspark({ formId: "a" });
    const [, submittingB] = useFormspark({ formId: "b" });
    expect(submittingA).not.toBe(submittingB);
  });

  it("supports concurrent submits without leaking submitting state", async () => {
    const fetchMock = mockFetchOnce({ ok: true });
    const [submit, submitting] = useFormspark({ formId: "abc" });

    await Promise.all([submit({ a: 1 }), submit({ b: 2 })]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(submitting.value).toBe(false);
  });
});

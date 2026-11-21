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
    let resolveFetch: ((value: Response) => void) | undefined;
    const response = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(() => response),
    );

    const [submit, submitting] = useFormspark({ formId: "abc" });
    expect(submitting.value).toBe(false);

    const inFlight = submit({});
    expect(submitting.value).toBe(true);

    if (!resolveFetch) throw new Error("Expected a pending request");
    resolveFetch(new Response("{}"));
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

  it("keeps another form idle while this form submits", async () => {
    let resolveFetch: ((value: Response) => void) | undefined;
    const response = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(() => response),
    );
    const [submit, submitting] = useFormspark({ formId: "a" });
    const [, otherSubmitting] = useFormspark({ formId: "b" });
    const pending = submit({ message: "hello" });

    expect(submitting.value).toBe(true);
    expect(otherSubmitting.value).toBe(false);

    if (!resolveFetch) throw new Error("Expected a pending request");
    resolveFetch(new Response('{"ok":true}'));
    await expect(pending).resolves.toEqual({ ok: true });
    expect(submitting.value).toBe(false);
    expect(otherSubmitting.value).toBe(false);
  });

  it("permits a successful retry after a rejected request", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("network down"))
      .mockResolvedValueOnce(new Response('{"ok":true}'));
    vi.stubGlobal("fetch", fetchMock);
    const [submit, submitting] = useFormspark({ formId: "abc" });
    await expect(submit({})).rejects.toThrow("network down");
    expect(submitting.value).toBe(false);
    await expect(submit({ message: "retry" })).resolves.toEqual({ ok: true });
    expect(submitting.value).toBe(false);
  });
});

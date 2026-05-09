import { describe, expect, it } from "vitest";
import { useFormspark } from "../src";

describe("useFormspark", () => {
  it("submits to /echo and resolves with the echoed payload", async () => {
    const [submit] = useFormspark({ formId: "echo" });
    const response = await submit({ message: "Hello, World!" });
    expect(response).toMatchObject({ message: "Hello, World!" });
  });

  it("toggles submitting state during a call", async () => {
    const [submit, submitting] = useFormspark({ formId: "echo" });
    expect(submitting.value).toBe(false);
    const promise = submit({ message: "state" });
    expect(submitting.value).toBe(true);
    await promise;
    expect(submitting.value).toBe(false);
  });
});

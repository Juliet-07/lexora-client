import { describe, expect, it } from "vitest";
import { getPostLoginRoute } from "@/lib/profile";

describe("client KYC login routing", () => {
  it("opens onboarding for a client who has not started KYC", () => {
    expect(getPostLoginRoute("not_started")).toBe("/onboarding");
  });
  it.each(["draft", "submitted", "under_review", "approved", "completed", "rejected"])(
    "opens the client dashboard for KYC status %s without role selection",
    (status) => expect(getPostLoginRoute(status)).toBe("/dashboard"),
  );
});
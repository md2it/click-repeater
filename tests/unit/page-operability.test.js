"use strict";

TestHarness.test("page operability probe succeeds on a normal document", () => {
  TestHarness.assertEqual(probeDocumentOperability(), true);
});

TestHarness.test("page operability probe message type is stable for background checks", () => {
  TestHarness.assertEqual(PROBE_DOCUMENT_OPERABILITY, "PROBE_DOCUMENT_OPERABILITY");
  TestHarness.assertEqual(
    isProbeDocumentOperabilityMessage({ type: PROBE_DOCUMENT_OPERABILITY }),
    true,
  );
  TestHarness.assertEqual(isProbeDocumentOperabilityMessage({ type: "other" }), false);
});

import { describe, it } from "node:test";
import { strict as assert } from "node:assert";

import { hello } from "../src/";

describe("Example", () => {
  it("should test an example function", () => {
    assert.equal(hello(), "world");
  });
});

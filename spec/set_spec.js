import Store from "../store.js";
import StoreError from "../store_error";
import Set from "../corvo_set.js";
import MemoryTracker from "../memory_tracker";

describe("Set", () => {
  it("exists as a class", () => {
    const testSet = new Set();
    expect(testSet.constructor).toBe(Set);
  });

  it("uses add to add a member and increment cardinality", () => {
    const member = "myMember";
    const testSet = new Set();

    testSet.add(member);
    expect(testSet.cardinality).toBe(1);
    expect(testSet.memberHash[member]).toBe(0);
  });

  it("uses pop to remove an element", () => {
    const testSet = new Set();

    for (let i = 0; i < 50; i += 1) {
      testSet.add(i.toString());
    }

    for (let j = 0; j < 15; j += 1) {
      testSet.pop();
    }

    expect(testSet.cardinality).toBe(35);
  });
});

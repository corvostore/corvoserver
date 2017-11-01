import Store from "../store.js";
// import CorvoLinkedList from "../corvo_linked_list.js";
// import CorvoNode from "../corvo_node.js";
import MemoryTracker from "../memory_tracker";

describe("MemoryTracker", () => {
  it("calculates memory used for a set operation", () => {
    const testStore = new Store();
    const key = "key";
    const value = "value";
    testStore.setString(key, value);
    expect(testStore.memoryTracker.memoryUsed).toBe(48);
  });
});

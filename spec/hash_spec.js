import Store from "../store.js";
import CorvoLinkedList from "../corvo_linked_list.js";
import CorvoNode from "../corvo_node.js";
import MemoryTracker from "../memory_tracker";

describe("Hash",  () => {
  it("true is true", () => {
    expect(true).toBe(true);
  });

  it("uses hget to get a value from an existing hash using a field", () => {
    const testStore = new Store();
    const key = 'key';
    const myField = 'myField';
    const value = 'myValue';

    const node = new CorvoNode(key, { myField: value });
    testStore.mainHash[key] = node;
    testStore.mainList.append(node);
    // testStore.hset(key, field, value);

    expect(testStore.hget(key, myField)).toBe(value);
  });
});

import Store from "../store.js";
// import CorvoLinkedList from "../corvo_linked_list.js";
// import CorvoNode from "../corvo_node.js";
import MemoryTracker from "../memory_tracker";

describe("MemoryTracker", () => {
  it("returns correct size for calculateHashItemSize", () => {
    const testMemoryTracker = new MemoryTracker();
    const key = "a-key";
    const expectedSize = key.length * 2 + 8;
    expect(testMemoryTracker.calculateHashItemSize(key)).toBe(expectedSize);
  });

  it("returns correct size for calculateNodeSize", () => {
    const testMemoryTracker = new MemoryTracker();
    const val = "a-value";
    const expectedSize = val.length * 2 + 3 * 8;
    expect(testMemoryTracker.calculateNodeSize(val)).toBe(expectedSize);
  });

  it("returns correct size for calculateStoreItemSize", () => {
    const testMemoryTracker = new MemoryTracker();
    const key = "a-key";
    const val = "a-value";
    const expectedSize = key.length * 2 + 8 + val.length * 2 + 3 * 8;
    expect(testMemoryTracker.calculateStoreItemSize(key, val)).toBe(expectedSize);
  });

  it("calculates memory used for a set operation", () => {
    const testStore = new Store();
    const key = "key";
    const value = "value";
    testStore.setString(key, value);
    expect(testStore.memoryTracker.memoryUsed).toBe(48);
  });

  it("updates memory used for a set operation on existing key", () => {
    const testStore = new Store();
    const key = "key";
    const oldValue = "value";
    const newValue = "new-value-that-is-longer";

    testStore.setString(key, oldValue);
    expect(testStore.memoryTracker.memoryUsed).toBe(48);
    testStore.setString(key, newValue);
    expect(testStore.memoryTracker.memoryUsed).toBe(86);
  });

  it("updates memory used for a setStringX operation", () => {
    const testStore = new Store();
    const key = "key";
    const oldValue = "value";
    const newValue = "new-value-that-is-longer";

    testStore.setString(key, oldValue);
    expect(testStore.memoryTracker.memoryUsed).toBe(48);
    testStore.setStringX(key, newValue);
    expect(testStore.memoryTracker.memoryUsed).toBe(86);
  });

  it("calculates memory used for a setStringNX operation", () => {
    const testStore = new Store();
    const key = "key";
    const value = "value";
    testStore.setStringNX(key, value);
    expect(testStore.memoryTracker.memoryUsed).toBe(48);
  });

  it("updates memory used for a appendString operation", () => {
    const testStore = new Store();
    const key = "key";
    const oldValue = "value";
    const newValue = "new-value-that-is-longer";

    testStore.setString(key, oldValue);
    expect(testStore.memoryTracker.memoryUsed).toBe(48);

    testStore.appendString(key, newValue);
    expect(testStore.memoryTracker.memoryUsed).toBe(96);
  });

  it("doesn't change memory used for strIncr operation that doesn't increase length of string", () => {
    const testStore = new Store();
    const key = 'key';
    const value = '1';

    testStore.setString(key, value);
    expect(testStore.memoryTracker.memoryUsed).toBe(40);
    testStore.strIncr(key);
    expect(testStore.memoryTracker.memoryUsed).toBe(40);
  });

  it("changes memory used for strIncr operation that increases length of string", () => {
    const testStore = new Store();
    const key = 'key';
    const value = '9';

    testStore.setString(key, value);
    expect(testStore.memoryTracker.memoryUsed).toBe(40);
    testStore.strIncr(key);
    expect(testStore.memoryTracker.memoryUsed).toBe(42);
  });

  it("doesn't change memory used for strDecr operation that doesn't decrease length of string", () => {
    const testStore = new Store();
    const key = 'key';
    const value = '1';

    testStore.setString(key, value);
    expect(testStore.memoryTracker.memoryUsed).toBe(40);
    testStore.strDecr(key);
    expect(testStore.memoryTracker.memoryUsed).toBe(40);
  });

  it("changes memory used for strDecr operation that decreases length of string", () => {
    const testStore = new Store();
    const key = 'key';
    const value = '10';

    testStore.setString(key, value);
    expect(testStore.memoryTracker.memoryUsed).toBe(42);
    testStore.strDecr(key);
    expect(testStore.memoryTracker.memoryUsed).toBe(40);
  });

  it("uses maxMemoryExceeded to return true if maxMemory exceeded", () => {
    const testTracker = new MemoryTracker(10);
    testTracker.memoryUsed = 20;

    expect(testTracker.maxMemoryExceeded()).toBe(true);
  });
});

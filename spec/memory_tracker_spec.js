import Store from "../store.js";
import CorvoLinkedList from "../corvo_linked_list.js";
import CorvoNode from "../corvo_node.js";
import CorvoListNode from '../data_types/corvo_list_node.js';
import MemoryTracker from "../memory_tracker";

describe("MemoryTracker", () => {
  it("returns correct size for calculateHashItemSize", () => {
    const testMemoryTracker = new MemoryTracker();
    const key = "a-key";
    const expectedSize = key.length * 2 + 8;
    expect(testMemoryTracker.calculateMainHashKeySize(key)).toBe(expectedSize);
  });

  it("returns correct size for calculateNodeSize", () => {
    const testMemoryTracker = new MemoryTracker();
    const key = "key";
    const val = "a-value";
    const type = "string";
    const expectedSize = val.length * 2 + key.length * 2 + type.length * 2 + 5 * 8;
    expect(testMemoryTracker.calculateNodeSize(key, val, type)).toBe(expectedSize);
  });

  it("returns correct size for calculateStoreItemSize", () => {
    const testMemoryTracker = new MemoryTracker();
    const key = "a-key";
    const val = "a-value";
    const type = "string";
    const expectedSize = key.length * 2 + 8 + val.length * 2 + 5 * 8 + key.length * 2 + type.length * 2;
    expect(testMemoryTracker.calculateStoreItemSize(key, val, type)).toBe(expectedSize);
  });

  it("calculates memory used for a set operation", () => {
    const testStore = new Store();
    const key = "key";
    const value = "value";
    testStore.setString(key, value);
    expect(testStore.memoryTracker.memoryUsed).toBe(82);
  });

  it("updates memory used for a set operation on existing key", () => {
    const testStore = new Store();
    const key = "key";
    const oldValue = "value";
    const newValue = "new-value-that-is-longer";

    testStore.setString(key, oldValue);
    expect(testStore.memoryTracker.memoryUsed).toBe(82);
    testStore.setString(key, newValue);
    expect(testStore.memoryTracker.memoryUsed).toBe(120);
  });

  it("updates memory used for a setStringX operation", () => {
    const testStore = new Store();
    const key = "key";
    const oldValue = "value";
    const newValue = "new-value-that-is-longer";

    testStore.setString(key, oldValue);
    expect(testStore.memoryTracker.memoryUsed).toBe(82);
    testStore.setStringX(key, newValue);
    expect(testStore.memoryTracker.memoryUsed).toBe(120);
  });

  it("calculates memory used for a setStringNX operation", () => {
    const testStore = new Store();
    const key = "key";
    const value = "value";
    testStore.setStringNX(key, value);
    expect(testStore.memoryTracker.memoryUsed).toBe(82);
  });

  it("updates memory used for a appendString operation", () => {
    const testStore = new Store();
    const key = "key";
    const oldValue = "value";
    const newValue = "new-value-that-is-longer";

    testStore.setString(key, oldValue);
    expect(testStore.memoryTracker.memoryUsed).toBe(82);

    testStore.appendString(key, newValue);
    expect(testStore.memoryTracker.memoryUsed).toBe(130);
  });

  it("doesn't change memory used for strIncr operation that doesn't increase length of string", () => {
    const testStore = new Store();
    const key = 'key';
    const value = '1';

    testStore.setString(key, value);
    expect(testStore.memoryTracker.memoryUsed).toBe(74);
    testStore.strIncr(key);
    expect(testStore.memoryTracker.memoryUsed).toBe(74);
  });

  it("changes memory used for strIncr operation that increases length of string", () => {
    const testStore = new Store();
    const key = 'key';
    const value = '9';

    testStore.setString(key, value);
    expect(testStore.memoryTracker.memoryUsed).toBe(74);
    testStore.strIncr(key);
    expect(testStore.memoryTracker.memoryUsed).toBe(76);
  });

  it("doesn't change memory used for strDecr operation that doesn't decrease length of string", () => {
    const testStore = new Store();
    const key = 'key';
    const value = '1';

    testStore.setString(key, value);
    expect(testStore.memoryTracker.memoryUsed).toBe(74);
    testStore.strDecr(key);
    expect(testStore.memoryTracker.memoryUsed).toBe(74);
  });

  it("changes memory used for strDecr operation that decreases length of string", () => {
    const testStore = new Store();
    const key = 'key';
    const value = '10';

    testStore.setString(key, value);
    expect(testStore.memoryTracker.memoryUsed).toBe(76);
    testStore.strDecr(key);
    expect(testStore.memoryTracker.memoryUsed).toBe(74);
  });

  it("uses maxMemoryExceeded to return true if maxMemory exceeded", () => {
    const testTracker = new MemoryTracker(10);
    testTracker.memoryUsed = 20;

    expect(testTracker.maxMemoryExceeded()).toBe(true);
  });

  it("uses maxMemoryExceeded to return false if maxMemory is not exceeded", () => {
    const testTracker = new MemoryTracker(30);
    testTracker.memoryUsed = 20;

    expect(testTracker.maxMemoryExceeded()).toBe(false);
  });

  it("uses listItemDelete to decrement memory used", () => {
    const testTracker = new MemoryTracker(100);
    testTracker.memoryUsed = 80;
    const val = 'my value';
    const testListNode = new CorvoListNode(val);

    testTracker.listItemDelete(testListNode);
    expect(testTracker.memoryUsed).toBe(40);
  });

  it("uses listItemInsert to update memory used", () => {
    const testTracker = new MemoryTracker(100);

    const val = 'my value';
    const testListNode = new CorvoListNode(val);

    testTracker.listItemInsert(testListNode.val);
    expect(testTracker.memoryUsed).toBe(40);
  });
});

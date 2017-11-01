import Store from "../store.js";
import CorvoLinkedList from "../corvo_linked_list.js";
import CorvoNode from "../corvo_node.js";
import MemoryTracker from "../memory_tracker";

describe("corvo node", () => {
  it("exists as a class", () => {
    let testNode = new CorvoNode();
    expect(testNode.constructor).toBe(CorvoNode);
  });

  it("takes val argument", () => {
    let val = "My value";
    let testNode = new CorvoNode(val);
    expect(testNode.val).toBe(val);
  });

  it("takes all constructor arguments", () => {
    let val = "My value";
    let preceedingNode = new CorvoNode(null);
    let succeedingNode = new CorvoNode(null);
    let testNode = new CorvoNode(val, preceedingNode, succeedingNode);
    expect(testNode.val).toBe(val);
    expect(testNode.nextNode).toBe(succeedingNode);
    expect(testNode.prevNode).toBe(preceedingNode);
  });

  it("has null default constructor arguments", () => {
    let val = "My value";
    let testNode = new CorvoNode(val);
    expect(testNode.nextNode).toBe(null);
    expect(testNode.prevNode).toBe(null);
  });
});

describe("corvo linked list", () => {
  it("exists as a class", () => {
    let testList = new CorvoLinkedList();
    expect(testList.constructor).toBe(CorvoLinkedList);
  });

  it("new with no argument creates an empty linked list", () => {
    let testList = new CorvoLinkedList();
    expect(testList.head).toBe(null);
    expect(testList.tail).toBe(null);
  });

  it("is added to list on append for single node", () => {
    let newNode = new CorvoNode(100);
    let testList = new CorvoLinkedList(newNode);
    let newNode2 = new CorvoNode(200);
    testList.append(newNode2);
    const head = testList.head;
    expect(head.nextNode).toBe(newNode2);
    expect(testList.tail).toBe(newNode2);
  });

  it("is prepended to list on prepend for single node", () => {
    let newNode = new CorvoNode(100);
    let testList = new CorvoLinkedList(newNode);
    let newNode2 = new CorvoNode(200);
    testList.prepend(newNode2);
    const head = testList.head;
    expect(head).toBe(newNode2);
    expect(head.nextNode).toBe(newNode);
  });

  it("is added to list on append for multiple nodes", () => {
    let startNode = new CorvoNode(100);
    let testList = new CorvoLinkedList(startNode);
    let endNode = new CorvoNode(200);

    for (var i = 0; i < 50; i++) {
      let intermediateNode = new CorvoNode(50);
      testList.append(intermediateNode);
    }

    testList.append(endNode);
    const head = testList.head;
    expect(head).toBe(startNode);
    expect(testList.tail).toBe(endNode);
  });

  it("is prepended to list on prepend for multiple nodes", () => {
    let startNode = new CorvoNode(100);
    let testList = new CorvoLinkedList(startNode);
    let endNode = new CorvoNode(200);

    for (var i = 0; i < 50; i++) {
      let intermediateNode = new CorvoNode(50);
      testList.prepend(intermediateNode);
    }

    testList.prepend(endNode);
    const head = testList.head;
    expect(head).toBe(endNode);
    expect(testList.tail).toBe(startNode);
  });

});

describe("store", () => {
  it("exists as a class", () => {
    let testStore = new Store();
    expect(testStore.constructor).toBe(Store);
  });

  it("has mainHash and mainLinkedList initialized", () => {
    const testStore = new Store();
    expect(Object.keys(testStore.mainHash).length).toBe(0);
    expect(testStore.mainList.constructor).toBe(CorvoLinkedList);
    expect(testStore.mainList.head).toBe(null);
    expect(testStore.mainList.tail).toBe(null);
  });

  it("has a new instance of memory tracker", () => {
    const testStore = new Store();
    expect(testStore.memoryTracker.constructor).toBe(MemoryTracker);
  });

  it("sets a default max memory value of 100 megabytes", () => {
    const testStore = new Store();
    expect(testStore.memoryTracker.maxMemory).toBe(104857600);
  });

  it("uses setString method to set one key/value in store", () => {
    const testStore = new Store();
    const key = "key1";
    const value = "this-is-the-value";
    testStore.setString(key, value);
    expect(testStore.mainHash[key].val).toBe(value);
    expect(testStore.mainList.head.val).toBe(value);
    expect(testStore.mainList.tail.val).toBe(value);
  });

  it("uses setString method to overwrite one value in store", () => {
    const testStore = new Store();
    const key = "key1";
    const value1 = "this-is-the-value1";
    const value2 = "this-is-the-value2";

    testStore.setString(key, value1);
    expect(testStore.getString(key)).toBe(value1);

    testStore.setString(key, value2);
    expect(testStore.getString(key)).toBe(value2);
    expect(testStore.mainList.head).toBe(testStore.mainList.tail);
  });

  it("uses setString method to set two key/value items in store", () => {
    const testStore = new Store();
    const key1 = "key1";
    const value1 = "this-is-the-value-1";
    const key2 = "key2";
    const value2 = "this-is-the-value-2";
    testStore.setString(key1, value1);
    testStore.setString(key2, value2);
    expect(testStore.mainHash[key1].val).toBe(value1);
    expect(testStore.mainHash[key2].val).toBe(value2);
    expect(testStore.mainList.head.val).toBe(value1);
    expect(testStore.mainList.tail.val).toBe(value2);
  });

  it("uses setStringX to overwrite a single key/value in store", () => {
    const testStore = new Store();
    const key = "key";
    const value1 = "this-is-the-value1";
    const value2 = "this-is-the-value2";

    testStore.setString(key, value1);
    expect(testStore.getString(key)).toBe(value1);
    testStore.setStringX(key, value2);
    expect(testStore.getString(key)).toBe(value2);
  });

  it("can't use setStringX method to create new key/value in store", () => {
    const testStore = new Store();
    const key = "key";
    const value = "this-is-the-value";

    expect(testStore.setStringX(key, value)).toBe(null);
    expect(testStore.getString(key)).toBe(null);
  });

  it("uses setStringNX method to create new key/value in store", () => {
    const testStore = new Store();
    const key = "key";
    const value = "this-is-the-value";

    testStore.setStringNX(key, value);

    expect(testStore.getString(key)).toBe(value);
  });

  it("can't use setStringNX method to overwrite key/value in store", () => {
    const testStore = new Store();
    const key = "key";
    const value1 = "this-is-the-value1";
    const value2 = "this-is-the-value2";

    testStore.setStringNX(key, value1);
    expect(testStore.getString(key)).toBe(value1);
    expect(testStore.setStringNX(key, value2)).toBe(null);
    expect(testStore.getString(key)).toBe(value1);
  });

  it("uses getString method to retrieve corresponding value for a key", () => {
    const testStore = new Store();
    const key1 = "key1";
    const value1 = "this-is-the-value-1";

    testStore.setString(key1, value1);
    const valueFromStore = testStore.getString(key1);
    expect(valueFromStore).toBe(value1);
  });

  it("getString method moves most recently accessed key to tail of list", () => {
    const testStore = new Store();
    const key1 = "key1";
    const value1 = "this-is-the-value-1";
    const key2 = "key2";
    const value2 = "this-is-the-value-2";
    const key3 = "key3";
    const value3 = "this-is-the-value-3";
    const key4 = "key4";
    const value4 = "this-is-the-value-4";

    testStore.setString(key1, value1);
    testStore.setString(key2, value2);
    testStore.setString(key3, value3);
    testStore.setString(key4, value4);
    expect(testStore.mainList.tail.val).toBe(value4);
    const valueFromStore = testStore.getString(key2);
    expect(valueFromStore).toBe(value2);
    expect(testStore.mainList.tail.val).toBe(value2);
  });

  it("returns null when getString called for non-existent key", () => {
    const testStore = new Store();
    const key1 = "key1";
    const value1 = "this-is-the-value-1";

    testStore.setString(key1, value1);
    const valueFromStore = testStore.getString("non-existent-key");
    expect(valueFromStore).toBe(null);
  });

  it("moves touched key value to end of linked list", () => {
    const testStore = new Store();
    const key = "key";
    const value = "this-is-the-value";

    for (var i = 0; i < 50; i++) {
      testStore.setString("key" + i, "Some val");
    }

    testStore.setString(key, value);
    testStore.touch(key);
    expect(testStore.mainList.tail.val).toBe(value)
  });

  it("appends string value to value in memory with appendString", () => {
    const testStore = new Store();
    const key = "key1";
    const valueA = "Hello, ";
    const valueB = "World!";
    const result = "Hello, World!";

    testStore.setString(key, valueA);
    testStore.appendString(key, valueB);

    expect(testStore.getString(key)).toBe(result);
  });

  it("uses getStrLen to return number representation of string length", () => {
    const testStore = new Store();
    const key = "key1";
    const value = "123456789";

    testStore.setString(key, value);
    const len = testStore.getStrLen(key);
    expect(len).toBe(value.length);
  });

  it("uses strIncr to increment number stored as string", () => {
    const testStore = new Store();
    const key = 'key';
    const value = '1';

    testStore.setString(key, value);
    testStore.strIncr(key);
    expect(testStore.getString(key)).toBe('2');
  });

  it("uses strIncr to create a new key/value of 0 and then increment it", () => {
    const testStore = new Store();
    const key = 'key';

    testStore.strIncr(key);
    expect(testStore.getString(key)).toBe('1');
  });

  it("it returns null if strIncr used on non-number string", () => {
    const testStore = new Store();
    const key = 'key';
    const value = 'Aw heck';

    testStore.setString(key, value);
    expect(testStore.strIncr(key)).toBe(null);
  });

  it("uses strDecr to decrement number stored as string", () => {
    const testStore = new Store();
    const key = 'key';
    const value = '1';

    testStore.setString(key, value);
    testStore.strDecr(key);
    expect(testStore.getString(key)).toBe('0');
  });

  it("uses strDecr to create a new key/value of 0 and then decrement it", () => {
    const testStore = new Store();
    const key = 'key';

    testStore.strDecr(key);
    expect(testStore.getString(key)).toBe('-1');
  });

  it("it returns null if strDecr used on non-number string", () => {
    const testStore = new Store();
    const key = 'key';
    const value = 'Aw heck';

    testStore.setString(key, value);
    expect(testStore.strDecr(key)).toBe(null);
  });
});

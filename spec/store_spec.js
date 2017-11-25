import Store from "../store.js";
import CorvoLinkedList from "../corvo_linked_list.js";
import CorvoNode from "../corvo_node.js";
import MemoryTracker from "../memory_tracker";
import CorvoSkipList from "../corvo_skiplist.js";
import CorvoSkipListNode from "../corvo_skiplist_node.js";

describe("corvo node", () => {
  it("exists as a class", () => {
    let testNode = new CorvoNode();
    expect(testNode.constructor).toBe(CorvoNode);
  });

  it("takes val argument", () => {
    const val = "My value";
    const key = "key";
    const testNode = new CorvoNode(key, val);
    expect(testNode.val).toBe(val);
  });

  it("takes all constructor arguments", () => {
    const val = "My value";
    const key = "key";
    const preceedingNode = new CorvoNode(null, null);
    const succeedingNode = new CorvoNode(null, null);
    const testNode = new CorvoNode(key, val, "string", preceedingNode, succeedingNode);
    expect(testNode.val).toBe(val);
    expect(testNode.nextNode).toBe(succeedingNode);
    expect(testNode.prevNode).toBe(preceedingNode);
  });

  it("has null default constructor arguments", () => {
    const val = "My value";
    const key = "key";
    const testNode = new CorvoNode(key, val);
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
    const testList = new CorvoLinkedList();
    expect(testList.head).toBe(null);
    expect(testList.tail).toBe(null);
  });

  it("adds new single node to existing list", () => {
    const key1 = "key1";
    const key2 = "key2";
    const value1 = 100;
    const value2 = 200;

    const newNode = new CorvoNode(key1, value1);
    const testList = new CorvoLinkedList(newNode);
    const newNode2 = new CorvoNode(key2, value2);
    testList.append(newNode2);
    const head = testList.head;
    expect(head.nextNode).toBe(newNode2);
    expect(testList.tail).toBe(newNode2);
  });

  it("prepends single node to existing list", () => {
    const key1 = "key1";
    const key2 = "key2";
    const value1 = 100;
    const value2 = 200;

    const newNode = new CorvoNode(key1, value1);
    const testList = new CorvoLinkedList(newNode);
    const newNode2 = new CorvoNode(key2, value2);
    testList.prepend(newNode2);
    const head = testList.head;
    expect(head).toBe(newNode2);
    expect(head.nextNode).toBe(newNode);
  });

  it("adds multiple nodes to the list with append", () => {
    const key1 = "key1";
    const key2 = "key2";
    const value1 = 100;
    const value2 = 200;

    const startNode = new CorvoNode(key1, value1);
    const testList = new CorvoLinkedList(startNode);
    const endNode = new CorvoNode(key2, value2);

    for (var i = 0; i < 50; i++) {
      const intermediateNode = new CorvoNode('k' + i, 50);
      testList.append(intermediateNode);
    }

    testList.append(endNode);
    const head = testList.head;
    expect(head).toBe(startNode);
    expect(testList.tail).toBe(endNode);
  });

  it("prepends multiple nodes to list with prepend", () => {
    const key1 = "key1";
    const key2 = "key2";
    const value1 = 100;
    const value2 = 200;

    const startNode = new CorvoNode(key1, value1);
    const testList = new CorvoLinkedList(startNode);
    const endNode = new CorvoNode(key2, value2);

    for (var i = 0; i < 50; i++) {
      const intermediateNode = new CorvoNode('k' + i, 50);
      testList.prepend(intermediateNode);
    }

    testList.prepend(endNode);
    const head = testList.head;
    expect(head).toBe(endNode);
    expect(testList.tail).toBe(startNode);
  });

  it("pops leftmost node with lpop", () => {
    const key1 = "key1";
    const key2 = "key2";
    const value1 = 100;
    const value2 = 200;

    const startNode = new CorvoNode(key1, value1);
    const testList = new CorvoLinkedList(startNode);
    const endNode = new CorvoNode(key2, value2);
    testList.append(endNode);

    const result = testList.lpop();

    expect(result).toBe(startNode);
    expect(testList.head).toBe(endNode);
  });

  it("pops rightmost node with rpop", () => {
    const key1 = "key1";
    const key2 = "key2";
    const value1 = 100;
    const value2 = 200;

    const startNode = new CorvoNode(key1, value1);
    const testList = new CorvoLinkedList(startNode);
    const endNode = new CorvoNode(key2, value2);
    testList.append(endNode);

    const result = testList.rpop();

    expect(result).toBe(endNode);
    expect(testList.head).toBe(startNode);
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

  it("uses setString method to set one key/value in store and return OK", () => {
    const testStore = new Store();
    const key = "key1";
    const value = "this-is-the-value";
    const returnVal = testStore.setString(key, value);
    expect(testStore.mainHash[key].val).toBe(value);
    expect(testStore.mainList.head.val).toBe(value);
    expect(testStore.mainList.tail.val).toBe(value);
    expect(returnVal).toBe("OK");
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

  it("uses setStringX to overwrite a single key/value in store and return OK", () => {
    const testStore = new Store();
    const key = "key";
    const value1 = "this-is-the-value1";
    const value2 = "this-is-the-value2";

    testStore.setString(key, value1);
    expect(testStore.getString(key)).toBe(value1);
    const returnVal = testStore.setStringX(key, value2);
    expect(testStore.getString(key)).toBe(value2);
    expect(returnVal).toBe("OK");
  });

  it("can't use setStringX method to create new key/value in store", () => {
    const testStore = new Store();
    const key = "key";
    const value = "this-is-the-value";

    expect(testStore.setStringX(key, value)).toBe(null);
    expect(testStore.getString(key)).toBe(null);
  });

  it("uses setStringNX method to create new key/value in store and return OK", () => {
    const testStore = new Store();
    const key = "key";
    const value = "this-is-the-value";

    const returnVal = testStore.setStringNX(key, value);

    expect(testStore.getString(key)).toBe(value);
    expect(returnVal).toBe("OK");
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

  it("moves multiple touched nodes to end of linked list and returns number of keys touched", () => {
    const testStore = new Store();
    const key = "key";
    const value = "this-is-the-value";
    const key2 ="key2";
    const value2 = "value2";

    for (var i = 0; i < 50; i++) {
      testStore.setString("key" + i, "Some val");
    }

    testStore.setString(key, value);
    testStore.setString(key2, value2);
    const returnVal = testStore.touch(key, key2);
    expect(testStore.mainList.tail.val).toBe(value2);
    expect(testStore.mainList.tail.prevNode.val).toBe(value);
    expect(returnVal).toBe(2);
  });

  it("moves multiple existing keys to end of linked list and returns number of existing keys touched", () => {
    const testStore = new Store();
    const key = "key";
    const value = "this-is-the-value";
    const key2 ="key2";
    const value2 = "value2";

    for (var i = 0; i < 50; i++) {
      testStore.setString("key" + i, "Some val");
    }

    testStore.setString(key, value);
    testStore.setString(key2, value2);
    const returnVal = testStore.touch(key, key2, "randKey");
    expect(testStore.mainList.tail.val).toBe(value2);
    expect(testStore.mainList.tail.prevNode.val).toBe(value);
    expect(returnVal).toBe(2);
  });

  it("appends string value to value in memory with appendString and returns length of newly updated value", () => {
    const testStore = new Store();
    const key = "key1";
    const valueA = "Hello, ";
    const valueB = "World!";
    const result = "Hello, World!";

    testStore.setString(key, valueA);
    const returnVal = testStore.appendString(key, valueB);

    expect(testStore.getString(key)).toBe(result);
    expect(returnVal).toBe(result.length);
  });

  it("appends string value to a non-existent key with appendString and returns length of newly updated value", () => {
    const testStore = new Store();
    const key = "key1";
    const valueA = "Hello";
    const result = 5;

    const returnVal = testStore.appendString(key, valueA);
    expect(returnVal).toBe(result);
    expect(testStore.getString(key)).toBe(valueA);
  });

  it("uses getStrLen to return number representation of string length", () => {
    const testStore = new Store();
    const key = "key1";
    const value = "123456789";

    testStore.setString(key, value);
    const len = testStore.getStrLen(key);
    expect(len).toBe(value.length);
  });

  it("uses getStrLen to return 0 if key does not exist", () => {
    const testStore = new Store();
    const key = "key1";
    const value = "123456789";

    testStore.setString(key, value);
    const len = testStore.getStrLen("key2");
    expect(len).toBe(0);
  });

  it("uses strIncr to increment number stored as string and verify returns the incremented number", () => {
    const testStore = new Store();
    const key = 'key';
    const value = '1';

    testStore.setString(key, value);
    const returnVal = testStore.strIncr(key);
    expect(testStore.getString(key)).toBe('2');
    expect(returnVal).toBe(2);
  });

  it("uses strIncr to create a new key/value of 0 and then increment it", () => {
    const testStore = new Store();
    const key = 'key';

    testStore.strIncr(key);
    expect(testStore.getString(key)).toBe('1');
  });

  it("it throws error if strIncr used on non-number string", () => {
    const testStore = new Store();
    const key = 'key';
    const value = 'Aw heck';

    testStore.setString(key, value);
    expect(() => { testStore.strIncr(key) }).toThrow(new Error("StoreError: value at key is not a number string."));
  });

  it("uses strDecr to decrement number stored as string and verify return value is the decremented value", () => {
    const testStore = new Store();
    const key = 'key';
    const value = '9';

    testStore.setString(key, value);
    const returnVal = testStore.strDecr(key);
    expect(testStore.getString(key)).toBe('8');
    expect(returnVal).toBe(8);
  });

  it("uses strDecr to create a new key/value of 0 and then decrement it", () => {
    const testStore = new Store();
    const key = 'key';

    testStore.strDecr(key);
    expect(testStore.getString(key)).toBe('-1');
  });

  it("throws error if strDecr used on non-number string", () => {
    const testStore = new Store();
    const key = 'key';
    const value = 'Aw heck';

    testStore.setString(key, value);
    expect(() => { testStore.strDecr(key) }).toThrow(new Error("StoreError: value at key is not a number string."));
  });

  it("evicts least-recently touched key/value from store when lruEvict is invoked", () => {
    const testStore = new Store();
    const key = 'key';
    const value = 'Aw heck';

    testStore.setString(key, value);
    testStore.lruEvict();
    expect(testStore.mainList.tail).toBe(null);
    expect(testStore.mainHash[key]).toBe(undefined);
  });

  it("evicts least-recently touched key/value from store when lruEvict is invoked", () => {
    const testStore = new Store();
    const key1 = 'key1';
    const key2 = 'key2';
    const value1 = 'Some val';
    const value2 = 'another val';

    testStore.setString(key1, value1);
    testStore.setString(key2, value2);
    testStore.lruEvict();
    expect(testStore.mainList.tail.val).toBe(value2);
    expect(testStore.mainHash[key1]).toBe(undefined);
  });

  it("uses lruCheckAndEvictToMaxMemory to bring total store memory below threshold", () => {
    const testStore = new Store({maxMemory: 1361});
    for (var i = 0; i < 10; i++) {
      testStore.setString("key" + i, "abcdefghijklmnopqrstuvwxyzabc" + i);
    }
    expect(testStore.mainList.head.key).toBe("key0");
    testStore.setString("key-xyz", "xyz");
    expect(testStore.mainList.head.key).toBe("key1");
  });

  it("uses exists to check for existence of a key", () => {
    const testStore = new Store();
    const key = "key";
    const val = "value";
    testStore.setString(key, val);
    const keyExists = testStore.exists(key);
    expect(keyExists).toBe(1);
  });

  it("uses exists to check for existence of a key", () => {
    const testStore = new Store();
    const key = "key";

    const keyExists = testStore.exists(key);

    expect(keyExists).toBe(0);
  });

  it("uses type to get the data type of a string key/value", () => {
    const testStore = new Store();
    const key = "key";
    const val = "my string";

    testStore.setString(key, val);
    const type = testStore.type(key);

    expect(type).toBe('string');
  });

  it("uses del to delete a single key and value and expect return value to be 1", () => {
    const testStore = new Store();
    const key = "key";
    const val = "my string";

    testStore.setString(key, val);
    const returnVal = testStore.del(key);
    const lookupResult = testStore.getString(key);

    expect(lookupResult).toBe(null);
    expect(returnVal).toBe(1);
    expect(testStore.memoryTracker.memoryUsed).toBe(0);
  });

  it("uses del to delete multiple keys and values and expect return value to be equal to number of keys deleted", () => {
    const testStore = new Store();
    const keyA = "key";
    const valA = "my string";
    const keyB = "keyB";
    const valB = "my string";

    testStore.setString(keyA, valA);
    testStore.setString(keyB, valB);
    const returnVal = testStore.del(keyA, keyB);
    const lookupResultA = testStore.getString(keyA);
    const lookupResultB = testStore.getString(keyB);

    expect(lookupResultA).toBe(null);
    expect(lookupResultB).toBe(null);
    expect(returnVal).toBe(2);
    expect(testStore.memoryTracker.memoryUsed).toBe(0);
  });

  it("uses del to delete multiple keys and non-existent keys and returns an integer equal to number of keys actually deleted", () => {
    const testStore = new Store();
    const keyA = "key";
    const valA = "my string";
    const keyB = "keyB";
    const valB = "my string";

    testStore.setString(keyA, valA);
    testStore.setString(keyB, valB);
    const returnVal = testStore.del(keyA, keyB, "keyC", "keyD");
    const lookupResultA = testStore.getString(keyA);
    const lookupResultB = testStore.getString(keyB);

    expect(lookupResultA).toBe(null);
    expect(lookupResultB).toBe(null);
    expect(returnVal).toBe(2);
    expect(testStore.memoryTracker.memoryUsed).toBe(0);
  });

  it("uses rename to rename an exising key and returns OK", () => {
    const testStore = new Store();
    const keyA = "key";
    const keyB = "newKey";
    const val = "my string";

    testStore.setString(keyA, val);
    const returnVal = testStore.rename(keyA, keyB);

    expect(testStore.getString(keyB)).toBe(val);
    expect(returnVal).toBe("OK");
  });

  it("uses rename to throw error if key doesn't exist", () => {
    const testStore = new Store();

    expect(() => { testStore.rename("keyA", "keyB") }).toThrow(new Error("StoreError: No such key."));
  });

  it("uses renameNX to rename an existing key and returns 1", () => {
    const testStore = new Store();
    const keyA = "key";
    const keyB = "newKey";
    const val = "my string";

    testStore.setString(keyA, val);
    const returnVal = testStore.renameNX(keyA, keyB);

    expect(testStore.getString(keyB)).toBe(val);
    expect(returnVal).toBe(1);
  });

  it("uses renameNX to throw error if key to be renamed doesn't exist", () => {
    const testStore = new Store();
    const keyA = "key";
    const keyB = "keyB"

    expect(() => { testStore.renameNX(keyA, keyB) }).toThrow(new Error("StoreError: No such key"));
  });

  it("uses renameNX to return 0 if keyB already exists and verify keyB still exists", () => {
    const testStore = new Store();
    const keyA = "keyA";
    const valA = "some-valueA";
    const keyB = "keyB"
    const valB = "some-valueB";

    testStore.setString(keyA, valA);
    testStore.setString(keyB, valB);
    const returnVal = testStore.renameNX(keyA, keyB)

    expect(returnVal).toBe(0);
    expect(testStore.getString(keyB)).toBe(valB);
  });

  it("accepts multiple values for lpush", () => {
    const key = 'k';
    const testStore = new Store();
    const val1 = '1';
    const val2 = '2';

    testStore.lpush(key, val1, val2);

    expect(testStore.mainHash[key].val.length).toBe(2);
  });

  it("uses zadd to add a new member to a new sorted set", () => {
    const key = 'k';
    const score = '5';
    const member = '1';
    const testStore = new Store();

    testStore.zadd(key, score, member);
    const sortedSet = testStore.mainList.head.val;

    expect(sortedSet.cardinality).toBe(1);
    expect(sortedSet.memberExists(member)).toBe(true);
    expect(sortedSet.skipList.findNode(score, member).member).toBe(member);
  });

  it("uses zadd to add multiple new members to a sorted set w multiple score", () => {
    const key = 'k';
    const scoreA = '5';
    const scoreB = '10';
    const memberA = '1';
    const memberB = '2';
    const testStore = new Store();

    testStore.zadd(key, scoreA, memberA, scoreB, memberB);
    const sortedSet = testStore.mainList.head.val;

    expect(sortedSet.cardinality).toBe(2);
    expect(sortedSet.memberExists(memberA)).toBe(true);
    expect(sortedSet.memberExists(memberB)).toBe(true);
    expect(sortedSet.skipList.findNode(scoreA, memberA).member).toBe(memberA);
    expect(sortedSet.skipList.findNode(scoreB, memberB).member).toBe(memberB);

    expect(testStore.memoryTracker.memoryUsed).not.toBeLessThan(380);
  });

  it("uses zadd to add multiple new members to a sorted set w multiple score", () => {
    const key = 'k';
    const scoreA = '10';
    const scoreB = '20';
    const scoreC = '30';
    const memberA = 'aa';
    const memberB = 'bb';
    const memberC = 'aa';
    const testStore = new Store();

    const returnVal = testStore.zadd(key, scoreA, memberA, scoreB, memberB, scoreC, memberC);
    const destSortedSet = testStore.mainHash[key].val;
    expect(returnVal).toBe(2);
    expect(destSortedSet.hash).toEqual({ "aa": 30, "bb": 20 });
  });

  it("uses zadd to add multiple new members to a sorted set with NX", () => {
    const key = 'k';
    const scoreA = '10';
    const scoreB = '20';
    const scoreC = '30';
    const memberA = 'aa';
    const memberB = 'bb';
    const memberC = 'aa';
    const testStore = new Store();

    const returnVal = testStore.zadd(key, "nx", scoreA, memberA, scoreB, memberB, scoreC, memberC);
    const destSortedSet = testStore.mainHash[key].val;
    expect(returnVal).toBe(2);
    expect(destSortedSet.hash).toEqual({ "aa": 10, "bb": 20 });
  });

  it("uses zadd to add multiple new members to a sorted set with CH", () => {
    const key = 'k';
    const memberA = 'aa';
    const scoreA = '10';
    const memberB = 'bb';
    const scoreB1 = '210';
    const scoreB2 = '220';
    const memberC = 'cc';
    const scoreC = '310';
    const memberD = 'dd';
    const scoreD = '400';
    const testStore = new Store();

    testStore.zadd(key, scoreA, memberA, scoreB1, memberB);
    const returnVal = testStore.zadd(key, "ch", scoreB2, memberB, scoreC, memberC, scoreD, memberD);
    const destSortedSet = testStore.mainHash[key].val;
    expect(returnVal).toBe(3);
    expect(destSortedSet.hash).toEqual({ "aa": 10, "bb": 220, "cc": 310, "dd": 400 });
  });

  it("uses zadd to add multiple new members to a sorted set with CH", () => {
    const key = 'k';
    const memberA = 'aa';
    const scoreA = '10';
    const memberB = 'bb';
    const scoreB = '210';
    const memberC = 'cc';
    const scoreC = '310';
    const memberD = 'dd';
    const scoreD = '400';
    const testStore = new Store();

    testStore.zadd(key, scoreA, memberA, scoreB, memberB);
    const returnVal = testStore.zadd(key, "ch", scoreB, memberB, scoreC, memberC, scoreD, memberD);
    const destSortedSet = testStore.mainHash[key].val;
    expect(returnVal).toBe(2);
    expect(destSortedSet.hash).toEqual({ "aa": 10, "bb": 210, "cc": 310, "dd": 400 });
  });

  it("uses zadd to add multiple new members to a sorted set with NX", () => {
    const key = 'k';
    const scoreA = '10';
    const scoreB = '20';
    const scoreC = '30';
    const memberA = 'aa';
    const memberB = 'bb';
    const memberC = 'aa';
    const testStore = new Store();

    testStore.zadd(key, "1000", "some-member");
    const returnVal = testStore.zadd(key, "nx", scoreA, memberA, scoreB, memberB, scoreC, memberC);
    const destSortedSet = testStore.mainHash[key].val;
    expect(returnVal).toBe(2);
    expect(destSortedSet.hash).toEqual({ "some-member": 1000, "aa": 10, "bb": 20 });
  });

  it("uses zadd to add multiple new members to a sorted set w multiple score", () => {
    const key = 'k';
    const scoreA = '10';
    const memberA = 'aa';
    const incr = "200";
    const testStore = new Store();

    testStore.zadd(key, scoreA, memberA);
    const returnVal = testStore.zadd(key, "incr", incr, memberA);
    const destSortedSet = testStore.mainHash[key].val;
    expect(returnVal).toBe(210);
    expect(destSortedSet.hash).toEqual({ "aa": 210 });
  });


  it("uses zunionstore to add the union of one or more sorted sets", () => {
    const key1 = "k1";
    const key2 = "k2";

    const scoreA = '10';
    const scoreB = '10';
    const memberA = 'memberA';
    const memberB = 'memberB';
    const testStore = new Store();

    testStore.zadd(key1, scoreA, memberA, scoreB, memberB);
    testStore.zadd(key2, scoreA, memberA, "12", "member1");

    testStore.zunionstore("destKey", "2", key1, key2);

    const destList = testStore.mainHash["destKey"].val;

    expect(destList.cardinality).toBe(3);
  });

  it("uses zunionstore returns union of two sorted sets", () => {
    const key1 = "key1";
    const key2 = "key2";
    const destKey = "destKey";
    const member1 = "m1";
    const score1  = "10";
    const member2 = "m2";
    const score21 = "20";
    const score22 = "222";
    const member3 = "m3";
    const score31 = "30";
    const score32 = "333";
    const member4 = "m4";
    const score4  = "444";
    const testStore = new Store();
    testStore.zadd(key1, score1, member1, score21, member2, score31, member3);
    testStore.zadd(key2, score22, member2, score32, member3, score4, member4);

    const returnVal = testStore.zunionstore(destKey, "2", key1, key2);
    const destSortedSet = testStore.mainHash[destKey].val;
    expect(destSortedSet.hash).toEqual({ "m1": 10, "m2": 242, "m3": 363, "m4": 444 });
  });

  it("uses zunionstore on two sorted sets with weights and aggregate", () => {
    const key1 = "key1";
    const key2 = "key2";
    const destKey = "destKey";
    const member1 = "m1";
    const score1  = "10";
    const member2 = "m2";
    const score21 = "20";
    const score22 = "222";
    const member3 = "m3";
    const score31 = "8000";
    const score32 = "333";
    const member4 = "m4";
    const score4  = "444";
    const weight1 = "5";
    const weight2 = "11";
    const testStore = new Store();
    testStore.zadd(key1, score1, member1, score21, member2, score31, member3);
    testStore.zadd(key2, score22, member2, score32, member3, score4, member4);

    const returnVal = testStore.zunionstore(
      destKey, "2", key1, key2, "WEIGHTS", weight1, weight2, "AGGREGATE", "MIN");
    const destSortedSet = testStore.mainHash[destKey].val;
    expect(destSortedSet.hash).toEqual({ "m1": 50, "m2": 100, "m3": 3663, "m4": 4884 });
  });

  it("uses zrem to remove members from the sorted set", () => {
    const key1 = "k1";

    const scoreA = '10';
    const scoreB = '10';
    const memberA = 'memberA';
    const memberB = 'memberB';
    const testStore = new Store();

    testStore.zadd(key1, scoreA, memberA, scoreB, memberB);
    const result = testStore.zrem(key1, memberA);
    expect(result).toBe(1);
    expect(testStore.mainList.head.val.memberExists(memberA)).toBe(false);
  });

  it("uses zscore to get the score of a member", () => {
    const key1 = "k1";

    const scoreA = '10';
    const scoreB = '10';
    const memberA = 'memberA';
    const memberB = 'memberB';
    const testStore = new Store();

    testStore.zadd(key1, scoreA, memberA, scoreB, memberB);
    const result = testStore.zscore(key1, memberB);

    expect(result).toBe(parseInt(scoreA, 10));
  });

  it("uses zincrby to increment the score of a member", () => {
    const key1 = "k1";

    const scoreA = '10';
    const scoreB = '10';
    const memberA = 'memberA';
    const memberB = 'memberB';
    const testStore = new Store();

    testStore.zadd(key1, scoreA, memberA, scoreB, memberB);
    const result = testStore.zincrby(key1, 5, memberB);

    expect(result).toBe(15);
  });

  it("uses zinterstore with mismatch between numkeys argument and actual keys", () => {
    const testStore = new Store();
    expect(function() { testStore.zinterstore("destKey", '2', "somekey")})
      .toThrow(new Error("StoreError: numkeys does not match number of keys provided."));
  });

  it("uses zinterstore with a non-numeric string for numkeys argument", () => {
    const testStore = new Store();
    expect(function() { testStore.zinterstore("destKey", 'aaa', "somekey")})
      .toThrow(new Error("StoreError: numkeys needs to be numeric."));
  });

  it("uses zinterstore with a non-zset key", () => {
    const testStore = new Store();
    testStore.setString("key1", "val1");
    expect(function() { testStore.zinterstore("dest", '1', "key1")})
      .toThrow(new Error("StoreError: value at key is not type sorted set."));
  });

  it("uses zinterstore with an invalid options keyword", () => {
    const testStore = new Store();
    expect(function() { testStore.zinterstore("dest", '1', "key1", "ABCD")})
      .toThrow(new Error("StoreError: unexpected options keyword."));
  });

  it("uses zinterstore returns intersection of two sorted sets", () => {
    const key1 = "key1";
    const key2 = "key2";
    const destKey = "destKey";
    const member1 = "m1";
    const score1  = "10";
    const member2 = "m2";
    const score21 = "20";
    const score22 = "222";
    const member3 = "m3";
    const score31 = "30";
    const score32 = "333";
    const member4 = "m4";
    const score4  = "444";
    const testStore = new Store();
    testStore.zadd(key1, score1, member1, score21, member2, score31, member3);
    testStore.zadd(key2, score22, member2, score32, member3, score4, member4);

    const returnVal = testStore.zinterstore(destKey, "2", key1, key2);
    const destSortedSet = testStore.mainHash[destKey].val;
    expect(destSortedSet.hash).toEqual({ "m2": 242, "m3": 363 });
  });

  it("uses zinterstore between two sorted sets with weights", () => {
    const key1 = "key1";
    const key2 = "key2";
    const destKey = "destKey";
    const member1 = "m1";
    const score1  = "10";
    const member2 = "m2";
    const score21 = "20";
    const score22 = "222";
    const member3 = "m3";
    const score31 = "30";
    const score32 = "333";
    const member4 = "m4";
    const score4  = "444";
    const weight1 = "5";
    const weight2 = "11";
    const testStore = new Store();
    testStore.zadd(key1, score1, member1, score21, member2, score31, member3);
    testStore.zadd(key2, score22, member2, score32, member3, score4, member4);

    const returnVal = testStore.zinterstore(
                        destKey, "2", key1, key2, "WEIGHTS", weight1, weight2);
    const destSortedSet = testStore.mainHash[destKey].val;
    expect(destSortedSet.hash).toEqual({ "m2": 2542, "m3": 3813 });
  });

  it("uses zinterstore with duplicate weights keyword", () => {
    const testStore = new Store();
    expect(function() {
      testStore.zinterstore("destKey", "2", "key1", "key2", "WEIGHTS", "10", "20", "WEIGHTS")
    }).toThrow(new Error("StoreError: invalid or duplicate options keyword."));
  });

  it("uses zinterstore with duplicate AGGREGATE keyword", () => {
    const testStore = new Store();
    expect(function() {
      testStore.zinterstore(
        "destKey", "2", "key1", "key2", "AGGREGATE", "SUM", "AGGREGATE")
    }).toThrow(new Error("StoreError: syntax error, more tokens than expected."));
  });

  it("uses zinterstore returns intersection of two sorted sets with AGGREGATE", () => {
    const key1 = "key1";
    const key2 = "key2";
    const destKey = "destKey";
    const member1 = "m1";
    const score1  = "10";
    const member2 = "m2";
    const score21 = "20";
    const score22 = "222";
    const member3 = "m3";
    const score31 = "30";
    const score32 = "333";
    const member4 = "m4";
    const score4  = "444";
    const testStore = new Store();
    testStore.zadd(key1, score1, member1, score21, member2, score31, member3);
    testStore.zadd(key2, score22, member2, score32, member3, score4, member4);

    const returnVal = testStore.zinterstore(destKey, "2", key1, key2, "AGGREGATE", "SUM");
    const destSortedSet = testStore.mainHash[destKey].val;
    expect(destSortedSet.hash).toEqual({ "m2": 242, "m3": 363 });
  });

  it("uses zinterstore returns intersection with AGGREGATE MIN", () => {
    const key1 = "key1";
    const key2 = "key2";
    const destKey = "destKey";
    const member1 = "m1";
    const score1  = "10";
    const member2 = "m2";
    const score21 = "20";
    const score22 = "222";
    const member3 = "m3";
    const score31 = "3000";
    const score32 = "333";
    const member4 = "m4";
    const score4  = "444";
    const testStore = new Store();
    testStore.zadd(key1, score1, member1, score21, member2, score31, member3);
    testStore.zadd(key2, score22, member2, score32, member3, score4, member4);

    const returnVal = testStore.zinterstore(destKey, "2", key1, key2, "AGGREGATE", "MIN");
    const destSortedSet = testStore.mainHash[destKey].val;
    expect(destSortedSet.hash).toEqual({ "m2": 20, "m3": 333 });
  });

  it("uses zinterstore returns intersection with AGGREGATE MAX", () => {
    const key1 = "key1";
    const key2 = "key2";
    const destKey = "destKey";
    const member1 = "m1";
    const score1  = "10";
    const member2 = "m2";
    const score21 = "20";
    const score22 = "222";
    const member3 = "m3";
    const score31 = "3000";
    const score32 = "333";
    const member4 = "m4";
    const score4  = "444";
    const testStore = new Store();
    testStore.zadd(key1, score1, member1, score21, member2, score31, member3);
    testStore.zadd(key2, score22, member2, score32, member3, score4, member4);

    const returnVal = testStore.zinterstore(destKey, "2", key1, key2, "AGGREGATE", "MAX");
    const destSortedSet = testStore.mainHash[destKey].val;
    expect(destSortedSet.hash).toEqual({ "m2": 222, "m3": 3000 });
  });

  it("uses zinterstore between two sorted sets with weights and aggregate", () => {
    const key1 = "key1";
    const key2 = "key2";
    const destKey = "destKey";
    const member1 = "m1";
    const score1  = "10";
    const member2 = "m2";
    const score21 = "20";
    const score22 = "222";
    const member3 = "m3";
    const score31 = "8000";
    const score32 = "333";
    const member4 = "m4";
    const score4  = "444";
    const weight1 = "5";
    const weight2 = "11";
    const testStore = new Store();
    testStore.zadd(key1, score1, member1, score21, member2, score31, member3);
    testStore.zadd(key2, score22, member2, score32, member3, score4, member4);

    const returnVal = testStore.zinterstore(
      destKey, "2", key1, key2, "WEIGHTS", weight1, weight2, "AGGREGATE", "MIN");
    const destSortedSet = testStore.mainHash[destKey].val;
    expect(destSortedSet.hash).toEqual({ "m2": 100, "m3": 3663 });
  });

  it("uses sadd to instantiate a set an empty key and add a single value", () => {
    const testStore = new Store();
    const key = 'key';
    const member = 'my member';

    testStore.sadd(key, member);
    expect(testStore.mainHash[key].val.cardinality).toBe(1);
  });

  it("uses sadd to add multiple members to a set at a key", () => {
    const testStore = new Store();
    const key = 'key';

    const returnVal = testStore.sadd(key, '1', '2', '3', '4', '5', '6');
    expect(testStore.mainHash[key].val.cardinality).toBe(6);
    expect(returnVal).toBe(6);
  });

  it("uses sadd to overwrite duplicate members thereby maintaining unique rule", () => {
    const testStore = new Store();
    const key = 'key';
    const member = 'my member';

    testStore.sadd(key, member);
    testStore.sadd(key, member);
    expect(testStore.mainHash[key].val.cardinality).toBe(1);
  });

  it("uses scard to return cardinality of set", () => {
    const testStore = new Store();
    const key = 'bigCardKey';

    for (let i = 0; i < 370; i += 1) {
      testStore.sadd(key, i.toString());
    }

    const returnVal = testStore.sadd(key, '371');

    const card = testStore.scard(key);
    expect(card).toBe(371);
    expect(returnVal).toBe(1);
  });

  it("uses scard to throw error if no val at key", () => {
    const testStore = new Store();

    expect(() => { testStore.scard('k'); }).toThrow(new Error("StoreError: value at key is not type set."));
  });

  it("uses sismember to check for existence of a member", () => {
    const testStore = new Store();
    const key = 'k';
    const member = 'memberooney';

    testStore.sadd(key, member);

    expect(testStore.sismember(key, member)).toBe(1);
    expect(testStore.sismember(key, 'blah')).toBe(0);
  });

  it("uses sismember to return 0 for nonassigned key", () => {
    const testStore = new Store();
    expect(testStore.sismember('k', 'm')).toBe(0);
  });

  it("uses sismember to throw error if k is assigned to nonset valu", () => {
    const testStore = new Store();
    const key = 'k';

    testStore.setString(key, 'some val');

    expect(() => { testStore.sismember(key, 'mem'); }).toThrow(new Error("StoreError: value at key is not type set."));
  });

  it("uses spop to return and delete a random member", () => {
    const testStore = new Store();
    const key = 'k';

    for (let i = 0; i < 20; i += 1) {
      testStore.sadd(key, i.toString());
    }
    for (let j = 0; j < 11; j += 1) {
      testStore.spop(key);
    }

    expect(testStore.scard(key)).toBe(9);
  });

  it("uses spop to throw an error when key holds nonset val", () => {
    const testStore = new Store();

    testStore.setString('key', 'someVal');

    expect(() => { testStore.spop('key'); }).toThrow(new Error("StoreError: value at key is not type set."));
  });

  it("uses spop to return null when the key holds no val", () => {
    const testStore = new Store();

    expect(testStore.spop('key')).toBe(null);
  });

  it("uses srem to remove a specific member", () => {
    const testStore = new Store();
    const key = 'k';
    const member = 'my member';

    testStore.sadd(key, member);
    const returnVal = testStore.srem(key, member);
    expect(returnVal).toBe(1);

    expect(testStore.mainHash[key].val.cardinality).toBe(0);
  });

  it("uses srem to remove multiple specific members", () => {
    const testStore = new Store();
    const key = 'k';

    testStore.sadd(key, '1', '2', '3', '4', '5');
    const returnVal = testStore.srem(key, '2', '3', '4');

    expect(returnVal).toBe(3);
    expect(testStore.mainHash[key].val.cardinality).toBe(2);
  });

  it("uses srem to throw error if val holds nonset type", () => {
    const testStore = new Store();
    const key = 'k';
    const val = 'v';
    testStore.setString(key, val);

    expect(() => { testStore.srem(key, val); }).toThrow(new Error("StoreError: value at key is not type set."));
  });

  it("uses smembers to get all members", () => {
    const testStore = new Store();
    const key = 'k';
    const movies = ['A New Hope', 'The Return of the Jedi', 'The Empire Strikes Back']

    testStore.sadd(key, ...movies);
    const returnVal = testStore.smembers(key);

    expect(returnVal).toEqual(movies);
  });

  it("uses smembers to throw error when nonset type at key", () => {
    const testStore = new Store();
    const key = 'k';
    const val = 'v';
    testStore.setString(key, val);

    expect(() => { testStore.smembers(key, val); }).toThrow(new Error("StoreError: value at key is not type set."));
  });

  it("uses sunion to return the union of two sets", () => {
    const testStore = new Store();
    const keyA = 'A';
    const keyB = 'B';
    const union = ['a', 'b', 'c', 'd'];

    testStore.sadd(keyA, 'a', 'b', 'c');
    testStore.sadd(keyB, 'b', 'c', 'd');
    const returnVal = testStore.sunion(keyA, keyB);

    expect(returnVal).toEqual(union);
  });

  it("uses sunion to return the contents of a single set if other set empty", () => {
    const testStore = new Store();
    const keyA = 'A';
    const keyB = 'B';
    const union = ['a', 'b', 'c'];

    testStore.sadd(keyA, 'a', 'b', 'c');
    testStore.sadd(keyB);
    const returnVal = testStore.sunion(keyA, keyB);

    expect(returnVal).toEqual(union);
  });

  it("uses sunion to return the contents of a single set if other key has no val", () => {
    const testStore = new Store();
    const keyA = 'A';
    const keyB = 'B';
    const union = ['a', 'b', 'c'];

    testStore.sadd(keyA, 'a', 'b', 'c');
    const returnVal = testStore.sunion(keyA, keyB);

    expect(returnVal).toEqual(union);
  });

  it("uses sunion to throw an error if one of the keys holds a nonset value", () => {
    const testStore = new Store();
    const keyA = 'A';
    const keyB = 'B';

    testStore.sadd(keyA, 'a', 'b', 'c');
    testStore.setString(keyB, "You can get anything you want, at Alice's restaurant");

    expect(() => { testStore.sunion(keyA, keyB); }).toThrow(new Error("StoreError: value at key is not type set."));
  });

  it("uses sinter to return the intersection of two sets", () => {
    const testStore = new Store();
    const keyA = 'A';
    const keyB = 'B';
    const intersection = ['b', 'c'];

    testStore.sadd(keyA, 'a', 'b', 'c');
    testStore.sadd(keyB, 'b', 'c', 'd');
    const returnVal = testStore.sinter(keyA, keyB);

    expect(returnVal).toEqual(intersection);
  });

  it("uses sinter to return an empty list if one of the keys is not assigned", () => {
    const testStore = new Store();
    const keyA = 'A';
    const keyB = 'B';
    const intersection = [];

    testStore.sadd(keyA, 'a', 'b', 'c');
    testStore.sinter(keyA, keyB);
  });

  it("uses sinter to throw an error if one of the keys holds a nonset value", () => {
    const testStore = new Store();
    const keyA = 'A';
    const keyB = 'B';

    testStore.sadd(keyA, 'a', 'b', 'c');
    testStore.setString(keyB, "You can get anything you want, at Alice's restaurant");

    expect(() => { testStore.sinter(keyA, keyB); }).toThrow(new Error("StoreError: value at key is not type set."));
  });

  it("uses sdiff to return the difference of two sets", () => {
    const testStore = new Store();
    const keyA = 'A';
    const keyB = 'B';
    const difference = ['a', 'd'];

    testStore.sadd(keyA, 'a', 'b', 'c');
    testStore.sadd(keyB, 'b', 'c', 'd');
    const returnVal = testStore.sdiff(keyA, keyB);

    expect(returnVal).toEqual(difference);
  });

  it("uses sdiff to return an empty list if one of the keys is not assigned", () => {
    const testStore = new Store();
    const keyA = 'A';
    const keyB = 'B';
    const difference = [];

    testStore.sadd(keyA, 'a', 'b', 'c');
    testStore.sdiff(keyA, keyB);
  });

  it("uses sdiff to throw an error if one of the keys holds a nonset value", () => {
    const testStore = new Store();
    const keyA = 'A';
    const keyB = 'B';

    testStore.sadd(keyA, 'a', 'b', 'c');
    testStore.setString(keyB, "You can get anything you want, at Alice's restaurant");

    expect(() => { testStore.sdiff(keyA, keyB); }).toThrow(new Error("StoreError: value at key is not type set."));
  });
  // X SADD key member [member...] * O(1)
  // X SCARD key * O(1)
  // SDIFF  key [key...]
  // X SUNION key [key...]
  // X SINTER key [key...]
  // X SISMEMBER key member O(1)
  // X SMEMBERS key
  // X SPOP key [count] * O(1)
  // X SREM key member [member...] * O(1) per member
  // set is an unordered collection of unique string values
  // add, remove (via pop or explicit remove), test for existence in constant time
});

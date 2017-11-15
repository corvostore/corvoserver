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

    testStore.zunionstore("destKey", 2, key1, key2);

    const destList = testStore.mainHash["destKey"].val;

    expect(destList.cardinality).toBe(3);
  });

  it("uses zscore to get the score of a member", () => {
    const key1 = "k1";

    const scoreA = 10;
    const scoreB = 10;
    const memberA = 'memberA';
    const memberB = 'memberB';
    const testStore = new Store();

    testStore.zadd(key1, scoreA, memberA, scoreB, memberB);
    const result = testStore.zscore(key1, memberB);

    expect(result).toBe(scoreA);
  });

  it("uses zincrby to increment the score of a member", () => {
    const key1 = "k1";

    const scoreA = 10;
    const scoreB = 10;
    const memberA = 'memberA';
    const memberB = 'memberB';
    const testStore = new Store();

    testStore.zadd(key1, scoreA, memberA, scoreB, memberB);
    const result = testStore.zincrby(key1, 5, memberB);

    expect(result).toBe(15);
  });
});

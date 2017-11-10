import Store from "../store.js";
import CorvoLinkedList from "../corvo_linked_list.js";
import CorvoNode from "../corvo_node.js";
import StoreError from "../store_error";
import MemoryTracker from "../memory_tracker";

describe("Hash",  () => {
  it("uses hget to get a value from an existing hash using a field", () => {
    const testStore = new Store();
    const key = 'key';
    const myField = 'myField';
    const value = 'myValue';

    const node = new CorvoNode(key, { myField: value });

    testStore.hset(key, myField, value);

    expect(testStore.hget(key, myField)).toBe(value);
  });

  it("uses hsetnx method on a non-existent key and returns 1", () => {
    const key = "key1"
    const field = "field1";
    const value = "value1";
    const testStore = new Store();

    const returnVal = testStore.hsetnx(key, field, value);
    expect(returnVal).toBe(1);
    expect(testStore.mainHash[key].val[field]).toBe(value);
    expect(testStore.memoryTracker.memoryUsed).toBe(104)
  });

  it("uses hsetnx throws error when called on a key that holds a non-hash value", () => {
    const key = "key1"
    const field = "field1";
    const value = "value1";
    const testStore = new Store();
    testStore.setString(key, value);
    expect(() => { testStore.hsetnx(key, field, value) }).toThrow(new Error("StoreError: value at key not a hash."));
  });

  it("uses hsetnx method on a already existing key but non-existent field, returns 1", () => {
    const key = "key1"
    const field1 = "field1";
    const value1 = "value1";
    const field2 = "field2";
    const value2 = "value2";
    const testStore = new Store();

    testStore.hsetnx(key, field1, value1);
    expect(testStore.memoryTracker.memoryUsed).toBe(104);
    const returnVal = testStore.hsetnx(key, field2, value2);
    expect(testStore.memoryTracker.memoryUsed).toBe(136);
    expect(returnVal).toBe(1);
    expect(testStore.mainHash[key].val[field1]).toBe(value1);
    expect(testStore.mainHash[key].val[field2]).toBe(value2);
  });

  it("uses hsetnx method on a already existing key and already existent field, returns 0 and the field's value is unchanged", () => {
    const key = "key1"
    const field1 = "field1";
    const value1 = "value1";
    const value2 = "value2";
    const testStore = new Store();

    testStore.hsetnx(key, field1, value1);
    const returnVal = testStore.hsetnx(key, field1, value2);
    expect(returnVal).toBe(0);
    expect(testStore.mainHash[key].val[field1]).toBe(value1);
  });

  it("uses hset to set field in hash at key to value ", () => {
    const testStore = new Store();
    const key = "k";
    const field = "field1";
    const value = "v";
    testStore.hset(key, field, value);
    expect(testStore.hget(key, field)).toBe(value);
  });

  it("hset returns 1 if field being set is a new field in hash", () => {
    const testStore = new Store();
    const key = "k";
    const field = "field1";
    const value = "v";
    const result = testStore.hset(key, field, value);
    expect(testStore.memoryTracker.memoryUsed).toBe(82);
    expect(result).toBe(1);
  });

  it("hset returns 0 if field already existed in hash and was overwritten", () => {
    const testStore = new Store();
    const key = "k";
    const field = "field1";
    const value = "v";
    const value2 = "v2";
    let result = testStore.hset(key, field, value);
    result = testStore.hset(key, field, value2);
    expect(testStore.memoryTracker.memoryUsed).toBe(84);
    expect(result).toBe(0);
  });

  it("hset throws an error if data type stored at key is not a hash", () => {
    const testStore = new Store();
    const key = "k";
    const field = "field1";
    const value = "v";
    testStore.setString(key, value);
    expect(() => { testStore.hset(key, field, value) }).toThrow(new Error("StoreError: value at key not a hash."));
  });

  it("hvals returns an empty list when the key does not exist", () => {
    const testStore = new Store();
    const key = "k";
    expect(testStore.hvals(key)).toEqual([]);
  });

  it("hvals returns list of values from the hash stored at key", () => {
    const testStore = new Store();
    const key = "k";
    const field = "field1";
    const value = "v";

    testStore.hset(key, field, value);
    expect(testStore.hvals(key)).toEqual(["v"]);
  });

  it("uses hdel to delete an existing field and value in a hash", () => {
    const testStore = new Store();
    const key = "k";
    const field = "field1";
    const value = "v";

    testStore.hset(key, field, value);
    expect(testStore.memoryTracker.memoryUsed).toBe(82);

    const resultDel = testStore.hdel(key, field);
    const resultLookup = testStore.hget(key, field);
    expect(resultDel).toBe(1);
    expect(testStore.memoryTracker.memoryUsed).toBe(60);
    expect(resultLookup).toBe(null);
  });

  it("returns 0 when hdel is passed a nonexistent field", () => {
    const testStore = new Store();
    const key = "k";
    const field = "field1";
    const value = "v";

    testStore.hset(key, field, value);
    const result = testStore.hdel(key, 'ZZZZ');
    expect(result).toBe(0);
    expect(testStore.memoryTracker.memoryUsed).toBe(82);
  });

  it("hstrlen returns string length of value associated with field in hash stored at key", () => {
    const testStore = new Store();
    const key = "k";
    const field = "field1";
    const value = "v";
    testStore.hset(key, field, value);
    expect(testStore.hstrlen(key, field)).toBe(1);
  });

  it("hstrlen returns 0 if key does not exist", () => {
    const testStore = new Store();
    const key = "k";
    const key2 = "k2";
    const field = "field1";
    const value = "v";
    testStore.hset(key, field, value);
    expect(testStore.hstrlen(key2, field)).toBe(0);
  });

  it("hstrlen returns 0 if field in hash at key does not exist", () => {
    const testStore = new Store();
    const key = "k";
    const field = "field1";
    const value = "v";
    testStore.hset(key, field, value);
    expect(testStore.hstrlen(key, "field2")).toBe(0);
  });

  it("hmset sets specified fields to their respective values in the hash stored at key and returns 'OK'", () => {
    const testStore = new Store();
    const key = "k";
    const field1 = "field1";
    const value1 = "v1";
    const field2 = "field2";
    const value2 = "v2";

    const result = testStore.hmset(key, field1, value1, field2, value2);
    expect(testStore.hget(key, field1)).toBe(value1);
    expect(testStore.hget(key, field2)).toBe(value2);
    expect(result).toBe("OK");
  });

  it("hmset creates new hash at key if key does not exist", () => {
    const testStore = new Store();

    const field1 = "field1";
    const value1 = "v1";
    const field2 = "field2";
    const value2 = "v2";

    testStore.hmset("key", field1, value1, field2, value2);
    expect(testStore.memoryTracker.memoryUsed).toBe(116);
    expect(testStore.hget("key", field1)).toBe(value1);
    expect(testStore.hget("key", field2)).toBe(value2);
  });

  it("throws an error when hdel is passed a key holding non-hash data type", () => {
    const testStore = new Store();
    const key = "k";
    const value = "v";

    testStore.setString(key, value);
    expect(() => { testStore.hdel(key, 'field'); }).toThrow(new StoreError("StoreError: value at key not a hash."));
  });

  it("uses hGetAll to return an array of all keys and values in the hash", () => {
    const testStore = new Store();
    const key = "k";
    const f1 = "field1";
    const v1 = "v";
    const f2 = "field2";
    const v2 = "v2";


    testStore.hset(key, f1, v1);
    testStore.hset(key, f2, v2);
    const result = testStore.hGetAll(key);
    expect(result).toEqual([f1, v1, f2, v2]);
  });

  it("returns an empty array when hGetAll is passed a nonexistent key", () => {
    const testStore = new Store();
    const key = "k";

    const result = testStore.hGetAll(key);
    expect(result.constructor).toBe(Array);
  });

  it("throws an error when hGetAll is passed a key holding non-hash data type", () => {
    const testStore = new Store();
    const key = "k";
    const value = "v";

    testStore.setString(key, value);
    expect(() => { testStore.hGetAll(key, 'field'); }).toThrow(new StoreError("StoreError: value at key not a hash."));
  });

  it("returns the number of fields of a hash stored at a key with hlen", () => {
    const testStore = new Store();
    const key = 'k';
    const len = 59;

    for (var i = 0; i < len; i += 1) {
      testStore.hset(key, 'k' + i, 'v' + i);
    }

    expect(testStore.hlen(key)).toBe(len);
  });

  it("returns 0 when passing a key that doesn't exist to hlen", () => {
    const testStore = new Store();

    expect(testStore.hlen('key')).toBe(0);
  });

  it("throws an error when key doesn't hold a hash", () => {
    const testStore = new Store();
    const key = 'k';

    testStore.setString(key, 'v');
    expect(() => { testStore.hlen(key); }).toThrow(new StoreError("StoreError: value at key not a hash."));
  });

  it("uses hkeys on a key that holds a non-hash value, throws error", () => {
    const key = "key1"
    const value = "value1";
    const testStore = new Store();
    testStore.setString(key, value);
    expect(() => { testStore.hkeys(key) }).toThrow(new Error("StoreError: value at key not a hash."));
  });

  it("uses hkeys return empty array for a key that holds a hash with no fields", () => {
    const key = "key1";
    const field = "field1";
    const value = "value1";
    const testStore = new Store();

    testStore.hset(key, field, value);
    // testStore.hdel(key, field);
    delete testStore.mainHash[key].val[field]; // delete field until hdel is implemented
    const returnVal = testStore.hkeys(key);
    expect(returnVal).toEqual([]);
  });

  it("uses hkeys return empty array for a non-existent key", () => {
    const key = "key1";
    const testStore = new Store();
    const returnVal = testStore.hkeys(key);
    expect(returnVal).toEqual([]);
  });

  it("uses hkeys return an array of field names", () => {
    const key = "key1"
    const field1 = "field1";
    const value1 = "value1";
    const field2 = "field2";
    const value2 = "value2";
    const field3 = "field3"; const value3 = "value3";
    const testStore = new Store();

    testStore.hset(key, field1, value1);
    testStore.hset(key, field2, value2);
    testStore.hset(key, field3, value3);
    const returnVal = testStore.hkeys(key);
    expect(returnVal).toEqual(["field1", "field2", "field3"]);
  });

  it("uses hmget on a key that is non-hash type, throws error", () => {
    const key = "key1"
    const value = "value1";
    const testStore = new Store();
    testStore.setString(key, value);
    expect(() => { testStore.hmget(key, "foo") }).toThrow(new Error("StoreError: value at key not a hash."));
  });

  it("uses hmget returns array with one null for each value requested for a non-existent key", () => {
    const key = "key1";
    const testStore = new Store();
    const returnVal = testStore.hmget(key, "f1", "f2", "f3");
    expect(returnVal).toEqual([null, null, null]);
  });

  it("uses hmget to request a mix of existing and non-existing field values, returns an array with field value or null", () => {
    const key = "key1"
    const field1 = "field1";
    const value1 = "value1";
    const field2 = "field2";
    const value2 = "value2";
    const field3 = "field3";
    const value3 = "value3";
    const testStore = new Store();

    testStore.hset(key, field1, value1);
    testStore.hset(key, field2, value2);
    testStore.hset(key, field3, value3);
    const returnVal = testStore.hmget(key, field1, field2, "foo", "bar", field3);
    expect(returnVal).toEqual(["value1", "value2", null, null, "value3"]);
  });

  it("uses hincrby on a key that is non-hash type, throws error", () => {
    const key = "key1"
    const value = "value1";
    const testStore = new Store();
    testStore.setString(key, value);
    expect(() => { testStore.hincrby(key, "foo") }).toThrow(new Error("StoreError: value at key not a hash."));
  });

  it("uses hincrby on a non-existent key, hash created with field and value set", () => {
    const key = "key1"
    const field = "field1";
    const value = "10";
    const incrBy = "5";

    const testStore = new Store();
    const returnVal = testStore.hincrby(key, field, incrBy);
    expect(returnVal).toBe(5);
    expect(testStore.hget(key, field)).toBe("5");
    expect(testStore.memoryTracker.memoryUsed).toBe(94);
  });

  it("uses hincrby on a hash with field that contains a non-numeric string, throws error", () => {
    const key = "key1"
    const field1 = "field1";
    const value1 = "value1";
    const testStore = new Store();

    testStore.hset(key, field1, value1);
    expect(() => { testStore.hincrby(key, field1, "5") }).toThrow(new Error("StoreError: value at key is not a number string."));
  });

  it("uses hincrby on a hash with field that contains a numeric string, value incremented", () => {
    const key = "key1"
    const field1 = "field1";
    const value1 = "value1";
    const field2 = "field2";
    const value2 = "10";
    const incrBy = "90";

    const testStore = new Store();
    testStore.hset(key, field1, value1);
    testStore.hset(key, field2, value2);
    expect(testStore.memoryTracker.memoryUsed).toBe(128);
    const returnVal = testStore.hincrby(key, field2, incrBy);
    expect(testStore.memoryTracker.memoryUsed).toBe(130);
    expect(returnVal).toBe(100);
    expect(testStore.hget(key, field2)).toBe("100");
  });

  it("uses hincrby on a hash which does not contain the field specified, hash created with field and value set", () => {
    const key = "key1"
    const field1 = "field1";
    const value1 = "value1";
    const field2 = "field2";
    const value2 = "value2";
    const field3 = "field3";
    const incrBy = "5";

    const testStore = new Store();
    testStore.hset(key, field1, value1);
    testStore.hset(key, field2, value2);
    const returnVal = testStore.hincrby(key, field3, incrBy);
    expect(returnVal).toBe(5);
    expect(testStore.hget(key, field1)).toBe("value1");
    expect(testStore.hget(key, field2)).toBe("value2");
    expect(testStore.hget(key, field3)).toBe("5");
  });
});

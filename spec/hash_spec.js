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
    const returnVal = testStore.hsetnx(key, field2, value2);
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

  it("uses hdel to delete an existing field and value in a hash", () => {
    const testStore = new Store();
    const key = "k";
    const field = "field1";
    const value = "v";

    testStore.hset(key, field, value);
    const resultDel = testStore.hdel(key, field);
    const resultLookup = testStore.hget(key, field);
    expect(resultDel).toBe(1);
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
});

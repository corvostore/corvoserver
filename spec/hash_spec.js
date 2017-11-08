import Store from "../store.js";
import CorvoLinkedList from "../corvo_linked_list.js";
import CorvoNode from "../corvo_node.js";
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
    const incrBy = "5";

    const testStore = new Store();
    testStore.hset(key, field1, value1);
    testStore.hset(key, field2, value2);
    const returnVal = testStore.hincrby(key, field2, incrBy);
    expect(returnVal).toBe(15);
    expect(testStore.hget(key, field2)).toBe("15");
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

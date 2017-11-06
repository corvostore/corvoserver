import Store from "../store.js";
import CorvoLinkedList from "../corvo_linked_list.js";
import CorvoListNode from "../data_types/corvo_list_node.js";
import MemoryTracker from "../memory_tracker";

describe("CorvoListNode", () => {
  it("exists as a class", () => {
    let testNode = new CorvoListNode();
    expect(testNode.constructor).toBe(CorvoListNode);
  });

  it("takes val argument", () => {
    const val = "My value";
    const key = "key";
    const testNode = new CorvoListNode(val);
    expect(testNode.val).toBe(val);
  });

  it("takes all constructor arguments", () => {
    const val = "My value";
    const preceedingNode = new CorvoListNode(null, null);
    const succeedingNode = new CorvoListNode(null, null);
    const testNode = new CorvoListNode(val, preceedingNode, succeedingNode);
    expect(testNode.val).toBe(val);
    expect(testNode.nextNode).toBe(succeedingNode);
    expect(testNode.prevNode).toBe(preceedingNode);
  });

  it("has null default constructor arguments", () => {
    const val = "My value";
    const testNode = new CorvoListNode(val);
    expect(testNode.nextNode).toBe(null);
    expect(testNode.prevNode).toBe(null);
  });
});


describe("Store list", () => {
  // it("uses createList method to create a new list", () => {
  //   const testStore = new Store();
  //   const newList =
  //
  //   const returnVal = testStore.createListNode(key);
  //   expect(returnVal.constructor).toBe(CorvoNode);
  //
  //   expect(testStore.mainHash[key].val).toBe(value);
  //   expect(testStore.mainList.head.val).toBe(value);
  //   expect(testStore.mainList.tail.val).toBe(value);
  //   expect(returnVal).toBe("OK");
  // });

  it("uses lpush to add item to end of list", () => {
    const testStore = new Store();
    const key = "mykey";
    const val = "val";
    testStore.lpush(key, val);

    expect(testStore.mainHash[key].type).toBe("list");

    expect(testStore.mainHash[key].val.tail.val).toBe(val);
  });
});

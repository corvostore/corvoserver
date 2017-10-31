import Store from "../store.js";
import CorvoLinkedList from "../corvo_linked_list.js";
import CorvoNode from "../corvo_node.js";

describe("corvo node", () => {
  it("exists as a class", () => {
    let testNode = new CorvoNode();
    expect(testNode.constructor).toBe(CorvoNode);
  })

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
    expect(testNode.nextNode()).toBe(succeedingNode);
    expect(testNode.prevNode()).toBe(preceedingNode);
  });

  it("has null default constructor arguments", () => {
    let val = "My value";
    let testNode = new CorvoNode(val);
    expect(testNode.nextNode()).toBe(null);
    expect(testNode.prevNode()).toBe(null);
  });
});

describe("corvo linked list", () => {
  it("exists as a class", () => {
    let testList = new CorvoLinkedList();
    expect(testList.constructor).toBe(CorvoLinkedList);
  })
});

describe("store", () => {
  it("true equals true", () => {
    expect(true).toBe(true);
  })

  it("exists as a class", () => {
    let testStore = new Store();
    expect(testStore.constructor).toBe(Store);
  })
});

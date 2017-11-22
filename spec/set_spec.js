import Store from "../store.js";
import StoreError from "../store_error";
import Set from "../corvo_set.js";
import MemoryTracker from "../memory_tracker";

describe("Set", () => {
  it("exists as a class", () => {
    const testSet = new Set();
    expect(testSet.constructor).toBe(Set);
  });

  it("uses add to add a member and increment cardinality", () => {
    const member = "myMember";
    const testSet = new Set();

    testSet.add(member);
    expect(testSet.cardinality).toBe(1);
    expect(testSet.memberHash[member]).toBe(0);
  });

  it("uses pop to remove an element", () => {
    const testSet = new Set();

    for (let i = 0; i < 50; i += 1) {
      testSet.add(i.toString());
    }

    for (let j = 0; j < 15; j += 1) {
      testSet.pop();
    }

    expect(testSet.cardinality).toBe(35);
  });

  it("returns null if calling pop on empty set", () => {
    const testSet = new Set();
    expect(testSet.pop()).toBe(null);
  });

  it("uses memberExists to return appropriate truth values after checking for a member's existence", () => {
    const testSet = new Set();
    const testMember = "member";

    testSet.add(testMember);
    expect(testSet.memberExists(testMember)).toBe(true);
    expect(testSet.memberExists("someOtherMember")).toBe(false);
  });

  it("uses remove to remove a specific member and return 1", () => {
    const testSet = new Set();
    const testMember = "member";

    testSet.add(testMember);
    const returnVal = testSet.remove(testMember);

    expect(returnVal).toBe(1);
    expect(testSet.memberExists(testMember)).toBe(false);
  });

  it("uses remove to remove a specific member and return 1", () => {
    const testSet = new Set();

    const returnVal = testSet.remove('blahblahblah');

    expect(returnVal).toBe(0);
  });

  it("uses getMembers to return an array of all of the members", () => {
    const testSet = new Set();
    const movies = ['A New Hope', 'The Return of the Jedi', 'The Empire Strikes Back']

    testSet.add('A New Hope');
    testSet.add('The Empire Strikes Back');
    testSet.add('The Return of the Jedi');
    const members = testSet.getMembers(movies);

    expect(members)
  });
});

// SADD key member [member...] * O(1)
// SCARD key * O(1)
// SDIFF  key [key...]
// SISMEMBER key member O(1)
// SMEMBERS key
// SPOP key [count] * O(1)
// SREM key member [member...] * O(1) per member
// set is an unordered collection of unique string values
// add, remove (via pop or explicit remove), test for existence in constant time

class CorvoSet {
  constructor() {
    this.cardinality = 0;
    this.memberHash = {};
    this.indexHash = {};
  };

  add(member) {
    this.memberHash[member] = this.cardinality;
    this.indexHash[this.cardinaity] = member;
    this.cardinality += 1;
  }

  pop() {
    if (this.cardinality === 0) {
      return null;
    }

    const index = Math.round(Math.random() * this.cardinality);
    const memberToRemove = this.indexHash[index];
    const lastMember = this.indexHash[this.cardinality];

    delete this.memberHash[memberToRemove];
    if (index !== this.cardinality) {
      this.indexHash[index] = lastMember;
    }
    delete this.indexHash[this.cardinality];
    this.cardinality -= 1;
    return memberToRemove;
  }

  memberExists(member) {
    return this.memberHash[member] !== undefined;
  }
}

export default CorvoSet;

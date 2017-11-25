class CorvoSet {
  constructor() {
    this.cardinality = 0;
    this.memberHash = {};
    this.indexHash = {};
  };

  add(member) {
    if (this.memberExists(member)) {
      return 0;
    } else {
      this.memberHash[member] = this.cardinality;
      this.indexHash[this.cardinality] = member;
      this.cardinality += 1;
      return 1;
    }
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

  getMembers() {
    return Object.keys(this.memberHash);
  }

  remove(member) {
    const index = this.memberHash[member];

    if (index !== undefined) {
      this.cardinality -= 1;
      delete this.memberHash[member];
      delete this.indexHash[index];
      return 1;
    } else {
      return 0;
    }
  }
}

export default CorvoSet;

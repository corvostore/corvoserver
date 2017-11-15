import CorvoSkipListNode from '../corvo_skiplist_node';
import CorvoSkipList from '../corvo_skiplist';

class CorvoSortedSet {
  constructor() {
    this.skipList = new CorvoSkipList();
    this.hash = {};  // key = member,  value = score
    this.cardinality = 0;
  }

  memberExists(member) {
    return !!(this.hash[member]);
  }

  add(score, member) {
    if(this.memberExists(member)) {
      // const oldNode = this.skipList.findNode(score, member);
      this.remove(member);
      this.add(score, member);
    } else {
      this.hash[member] = score;
      this.skipList.insert(score, member);
    }

    this.cardinality += 1;
  }

  getScore(member) {
    return this.hash[member];
  }

  setScore(member, newScore) {
    this.hash[member] = newScore;
    return newScore;
  }

  remove(member) {
    this.skipList.remove(this.hash[member]);
    delete this.hash[member];
    this.cardinality -= 1;
  }

}

export default CorvoSortedSet;

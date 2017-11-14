import SkipListNode from './corvo_skiplist_node';
import SkipList from './corvo_skiplist';

class CorvoSortedSet {
  constructor() {
    this.skiplist = new SkipList();
    this.hash = {};  // key = member,  value = score
    this.cardinality = 0;
  }

  add(score, member) {
    this.skiplist.insert(
  }

  remove() {

  }

}

export default CorvoSortedSet;

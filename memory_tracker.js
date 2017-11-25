const REFERENCE_SIZE_BYTES = 8;
const STRING_ONE_CHAR_BYTES = 2;
const NODE_NUM_REFS = 3;
const NUMBER_BYTES = 8;
const SKIPLIST_NODE_SIZE = 48;

class MemoryTracker {
  constructor(maxMemory) {
    this.maxMemory = maxMemory;
    this.memoryUsed = 0;
  }

  nodeCreation(node) {
    const key = node.key;
    const val = node.val;
    const type = node.type;
    const memory = this.calculateStoreItemSize(key, val, type);

    this.memoryUsed += memory;
  }

  stringUpdate(oldVal, newVal) {
    this.memoryUsed -= oldVal.length * STRING_ONE_CHAR_BYTES;
    this.memoryUsed += newVal.length * STRING_ONE_CHAR_BYTES;
  }

  stringDelete(key, val) {
    this.memoryUsed -= this.calculateStoreItemSize(key, val, "string");
  }

  listItemInsert(val) {
    this.memoryUsed += this.calculateListNodeSize(val);
  }

  listItemDelete(listNode) {
    this.memoryUsed -= this.calculateListNodeSize(listNode.val);
  }

  listItemUpdate(oldVal, newVal) {
    this.stringUpdate(oldVal, newVal);
  }

  listDelete(key, val) {
    this.memoryUsed -= this.calculateStoreItemSize(key, val, "list");
  }

  hashItemInsert(field, val) {
    this.memoryUsed += field.length * STRING_ONE_CHAR_BYTES + val.length * STRING_ONE_CHAR_BYTES + REFERENCE_SIZE_BYTES;
  }

  hashItemUpdate(oldVal, newVal) {
    this.stringUpdate(oldVal, newVal);
  }

  hashItemDelete(field, val) {
    this.memoryUsed -= field.length * STRING_ONE_CHAR_BYTES + val.length * STRING_ONE_CHAR_BYTES + REFERENCE_SIZE_BYTES;
  }

  hashDelete(key, val) {
    this.memoryUsed -= this.calculateStoreItemSize(key, val, "hash");
  }

  sortedSetElementInsert(oldVal, newVal) {
    this.memoryUsed += (newVal - oldVal);
  }

  setAddMember(member) {
    this.memoryUsed += 2 * REFERENCE_SIZE_BYTES;
    this.memoryUsed += NUMBER_BYTES;
    this.memoryUsed += 2 * (STRING_ONE_CHAR_BYTES * member.length);
  }

  deleteStoreItem(node) {
    this.memoryUsed -= this.calculateStoreItemSize(node.key, node.val, node.type);
  }

  calculateMainHashKeySize(key) {
    const keyBytes = STRING_ONE_CHAR_BYTES * key.length;
    return keyBytes + REFERENCE_SIZE_BYTES;
  }

  calculateNodeSize(key, val, type) {
    const total_refs = REFERENCE_SIZE_BYTES * 5;

    const valueBytes = type === "string" ? STRING_ONE_CHAR_BYTES * val.length : 0;

    const keyBytes = STRING_ONE_CHAR_BYTES * key.length;
    const typeStringBytes = STRING_ONE_CHAR_BYTES * type.length;
    return total_refs + valueBytes + keyBytes + typeStringBytes;
  }

  calculateListNodeSize(val) {
    const total_refs = REFERENCE_SIZE_BYTES * 3;
    const valueBytes = STRING_ONE_CHAR_BYTES * val.length;
    return total_refs + valueBytes;
  }

  calculateListSize(list) {
    let total = 0;
    total += REFERENCE_SIZE_BYTES * 3;
    total += 8;
    let currentNode = list.head;
    while(currentNode) {
      total = total + this.calculateListNodeSize(currentNode.val);
      currentNode = currentNode.nextNode;
    }
    return total;
  }

  calculateHashSize(hash) {
    let total = 0;
    Object.keys(hash).forEach((key) => {
      total += REFERENCE_SIZE_BYTES;
      total += key.length * STRING_ONE_CHAR_BYTES;
      if (hash[key].constructor === String) {
        total += hash[key].length * STRING_ONE_CHAR_BYTES;
      } else if (hash[key].constructor === Number) {
        total += NUMBER_BYTES;
      }
    });

    return total;
  }

  calculateSortedSetSize(sortedSet) {
    let total = 3 * REFERENCE_SIZE_BYTES;

    // add the size of the hash AND the score/member pair for each skipList node
    total += this.calculateHashSize(sortedSet.hash);
    // add shallow size of skipList nodes to total
    total += sortedSet.skipList.memoryUsed;

    return total;
  }

  calculateSetSize(set) {
    let total = 3 * REFERENCE_SIZE_BYTES;

    total += this.calculateHashSize(set.memberHash);
    total += this.calculateHashSize(set.indexHash);

    return total;
  }

  calculateStoreItemSize(key, val, type) {
    let returnVal;
    switch(type) {
      case "list":
        returnVal = this.calculateMainHashKeySize(key) + this.calculateNodeSize(key, val, type) + this.calculateListSize(val);
        break;
      case "string":
        returnVal = this.calculateMainHashKeySize(key) + this.calculateNodeSize(key, val, type);
        break;
      case "hash":
        returnVal = this.calculateMainHashKeySize(key) + this.calculateNodeSize(key, val, type) + this.calculateHashSize(val);
        break;
      case "zset":
        returnVal = this.calculateMainHashKeySize(key) + this.calculateNodeSize(key, val, type) + this.calculateSortedSetSize(val);
        break;
      case "set":
        returnVal = this.calculateMainHashKeySize(key) + this.calculateNodeSize(key, val, type) + this.calculateSetSize(val);
        break;
    }
    return returnVal;
  }

  updateMemoryUsed(oldVal, newVal) {
    this.memoryUsed += (newVal - oldVal);
  }

  decrementMemoryUsed(key, val, type) {
    this.memoryUsed -= this.calculateStoreItemSize(key, val, type);
  }

  maxMemoryExceeded() {
    return this.memoryUsed > this.maxMemory;
  }
}

export default MemoryTracker;

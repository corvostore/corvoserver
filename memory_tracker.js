const REFERENCE_SIZE_BYTES = 8;
const STRING_ONE_CHAR_BYTES = 2;
const NODE_NUM_REFS = 3;

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

  calculateHashItemSize(key) {
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
      total += hash[key].length * STRING_ONE_CHAR_BYTES;
    });

    return total;
  }

  calculateStoreItemSize(key, val, type) {
    let returnVal;
    switch(type) {
      case "list":
        returnVal = this.calculateHashItemSize(key) + this.calculateNodeSize(key, val, type) + this.calculateListSize(val);
        break;
      case "string":
        returnVal = this.calculateHashItemSize(key) + this.calculateNodeSize(key, val, type);
        break;
      case "hash":
        returnVal = this.calculateHashItemSize(key) + this.calculateNodeSize(kev, val, type) + this.calculateHashSize(val);
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

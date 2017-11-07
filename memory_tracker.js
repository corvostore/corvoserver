const REFERENCE_SIZE_BYTES = 8;
const STRING_ONE_CHAR_BYTES = 2;
const NODE_NUM_REFS = 3;

class MemoryTracker {
  constructor(maxMemory) {
    this.maxMemory = maxMemory;
    this.memoryUsed = 0;
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

  calculateStoreItemSize(key, val, type) {
    let returnVal;
    switch(type) {
      case "list": returnVal = this.calculateHashItemSize(key) + this.calculateNodeSize(key, val, type) + this.calculateListSize(val);
      break;
      case "string": returnVal = this.calculateHashItemSize(key) + this.calculateNodeSize(key, val, type);
      break;
    }
    return returnVal;
  }

  incrementMemoryUsed(key, val, type) {
    this.memoryUsed += this.calculateStoreItemSize(key, val, type);
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

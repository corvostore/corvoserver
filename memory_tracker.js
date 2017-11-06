const REFERENCE_SIZE_BYTES = 8;
const STRING_ONE_CHAR_BYTES = 2;
const NODE_NUM_REFS = 3;

class MemoryTracker {
  constructor(maxMemory) {
    this.maxMemory = maxMemory,
    this.memoryUsed = 0
  }

  calculateHashItemSize(key) {
    const keyBytes = STRING_ONE_CHAR_BYTES * key.length;
    return keyBytes + REFERENCE_SIZE_BYTES;
  }

  calculateNodeSize(key, val, type) {
    const total_refs = REFERENCE_SIZE_BYTES * 5;
    const valueBytes = STRING_ONE_CHAR_BYTES * val.length;
    const keyBytes = STRING_ONE_CHAR_BYTES * key.length;
    const typeStringBytes = STRING_ONE_CHAR_BYTES * type.length;
    return total_refs + valueBytes + keyBytes + typeStringBytes;
  }

  calculateListNodeSize(val) {
    const total_refs = REFERENCE_SIZE_BYTES * 3;
    const valueBytes = STRING_ONE_CHAR_BYTES * val.length;
    return total_refs + valueBytes;
  }

  calculateStoreItemSize(key, val, type) {
    return this.calculateHashItemSize(key) + this.calculateNodeSize(key, val, type);
  }

  incrementMemoryUsed(key, val, type) {
    this.memoryUsed += this.calculateStoreItemSize(key, val, type);
  }

  updateMemoryUsed(key, oldVal, newVal) {
    this.memoryUsed += (newVal.length - oldVal.length) * STRING_ONE_CHAR_BYTES;
  }

  decrementMemoryUsed(key, val, type) {
    this.memoryUsed -= this.calculateStoreItemSize(key, val, type);
  }

  maxMemoryExceeded() {
    return this.memoryUsed > this.maxMemory;
  }
}

export default MemoryTracker;

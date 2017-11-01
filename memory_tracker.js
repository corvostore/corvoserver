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

  calculateNodeSize(val) {
    const total_refs = REFERENCE_SIZE_BYTES * 3;
    const valueBytes = STRING_ONE_CHAR_BYTES * val.length;
    return total_refs + valueBytes;
  }

  calculateStoreItemSize(key, val) {
    return this.calculateHashItemSize(key) + this.calculateNodeSize(val);
  }

  incrementMemoryUsed(key, val) {
    this.memoryUsed += this.calculateStoreItemSize(key, val);
  }

  updateMemoryUsed(key, oldVal, newVal) {
    this.memoryUsed += (newVal.length - oldVal.length) * STRING_ONE_CHAR_BYTES;
  }

}

export default MemoryTracker;

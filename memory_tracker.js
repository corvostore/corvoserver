class MemoryTracker {
  constructor(maxMemory) {
    this.maxMemory = maxMemory,
    this.memoryUsed = 0
  }

  calculateHashItemSize(key) {
    const keyBytes = 2 * key.length;
    const ref = 8;
    return keyBytes + ref;
  }

  calculateNodeSize(val) {
    const ref = 8;
    const total_refs = ref * 3;
    const valueBytes = 2 * val.length;
    return total_refs + valueBytes;
  }

  calculateStoreItemSize(key, val) {
    return this.calculateHashItemSize(key) + this.calculateNodeSize(val);
  }

  incrementMemoryUsed(key, val) {
    this.memoryUsed += this.calculateStoreItemSize(key, val);
  }

  updateMemoryUsed(key, oldVal, newVal) {

  }

}

export default MemoryTracker;

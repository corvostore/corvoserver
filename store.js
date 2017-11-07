import CorvoLinkedList from './corvo_linked_list';
import CorvoNode from './corvo_node';
import CorvoListNode from './data_types/corvo_list_node';
import MemoryTracker from './memory_tracker';
const DEFAULT_MAX_MEMORY = 104857600; // equals 100MB
const STRING_ONE_CHAR_BYTES = 2;

class Store {
  constructor(options={maxMemory: DEFAULT_MAX_MEMORY}) {
    this.mainHash = {};
    this.mainList = new CorvoLinkedList();

    this.memoryTracker = new MemoryTracker(options.maxMemory);
  }

  setString(key, value) {
    const accessedNode = this.mainHash[key];

    if (accessedNode === undefined) {
      const newNode = new CorvoNode(key, value);
      this.mainHash[key] = newNode;
      this.mainList.append(newNode);
      this.memoryTracker.incrementMemoryUsed(key, value, newNode.type);
    } else {
      const oldValue = accessedNode.val;
      const oldValueMemory = oldValue.length * STRING_ONE_CHAR_BYTES;
      const newValueMemory = value.length * STRING_ONE_CHAR_BYTES;
      accessedNode.val = value;
      this.memoryTracker.updateMemoryUsed(oldValueMemory, newValueMemory);
      this.touch(accessedNode);
    }
    this.lruCheckAndEvictToMaxMemory();
    return "OK";
  }

  setStringX(key, value) {
    // only writes if already exists; otherwise, return null
    const accessedNode = this.mainHash[key];

    if (accessedNode === undefined) {
      return null;
    }
    const oldValue = accessedNode.val;
    const oldValueMemory = oldValue.length * STRING_ONE_CHAR_BYTES;
    const newValueMemory = value.length * STRING_ONE_CHAR_BYTES;
    accessedNode.val = value;
    this.memoryTracker.updateMemoryUsed(oldValueMemory, newValueMemory);
    this.touch(accessedNode);
    this.lruCheckAndEvictToMaxMemory();
    return "OK";
  }

  setStringNX(key, value) {
    // only writes if doesn't exist; otherwise return null
    const accessedNode = this.mainHash[key];

    if (accessedNode !== undefined) {
      return null;
    }
    const newNode = new CorvoNode(key, value);
    this.mainHash[key] = newNode;
    this.mainList.append(newNode);
    this.memoryTracker.incrementMemoryUsed(key, value, newNode.type);
    this.lruCheckAndEvictToMaxMemory();
    return "OK";
  }

  getString(key) {
    const accessedNode = this.mainHash[key];
    if (accessedNode === undefined) {
      return null;
    }

    const returnValue = accessedNode.val;
    this.touch(key);
    return returnValue;
  }

  appendString(key, valueToAppend) {
    const accessedNode = this.mainHash[key];
    let lengthAppendedValue;

    if (accessedNode === undefined) {
      const newNode = new CorvoNode(key, valueToAppend);
      this.mainHash[key] = newNode;
      this.mainList.append(newNode);
      this.memoryTracker.incrementMemoryUsed(key, valueToAppend, newNode.type);
      lengthAppendedValue = valueToAppend.length;
    } else if (accessedNode.type === 'string') {
      this.touch(key);
      const oldValue = accessedNode.val;
      accessedNode.val += valueToAppend;

      const oldValueMemory = oldValue.length * STRING_ONE_CHAR_BYTES;
      const newValueMemory = accessedNode.val.length * STRING_ONE_CHAR_BYTES;
      this.memoryTracker.updateMemoryUsed(oldValueMemory, newValueMemory);

      lengthAppendedValue = accessedNode.val.length;
    } else {
      throw new Error("StoreError: value at key not string type.");
    }

    this.lruCheckAndEvictToMaxMemory();
    return lengthAppendedValue;
  }

  touch(...keys) {
    let validKeys = 0;
    keys.forEach((key) => {
      const accessedNode = this.mainHash[key];
      if (accessedNode !== undefined) {
        validKeys += 1;
        this.mainList.remove(accessedNode);
        this.mainList.append(accessedNode);
      }
    });
    return validKeys;
  }

  getStrLen(key) {
    const accessedNode = this.mainHash[key];
    if (accessedNode !== undefined && accessedNode.type === 'string') {
      return accessedNode.val.length;
    } else if (accessedNode) {
      throw new Error("StoreError: value at key is not string type.")
    } else {
      return 0;
    }
  }

  strIncr(key) {
    function isNumberString(strInput) {
      return ((parseInt(strInput)).toString() === strInput);
    }

    let accessedNode = this.mainHash[key];

    if (accessedNode === undefined) {
      this.setString(key, '0');
      accessedNode = this.mainHash[key];
    } else if (!isNumberString(accessedNode.val)) {
      throw new Error("StoreError: value at key is not a number string.");
    }

    const oldValue = accessedNode.val;

    accessedNode.val = (parseInt(accessedNode.val, 10) + 1).toString();

    const oldValueMemory = oldValue.length * STRING_ONE_CHAR_BYTES;
    const newValueMemory = accessedNode.val.length * STRING_ONE_CHAR_BYTES;

    this.memoryTracker.updateMemoryUsed(oldValueMemory, newValueMemory);
    this.touch(accessedNode);

    this.lruCheckAndEvictToMaxMemory();
    return parseInt(accessedNode.val, 10);
  }

  strDecr(key) {
    function isNumberString(strInput) {
      return ((parseInt(strInput)).toString() === strInput);
    }

    let accessedNode = this.mainHash[key];

    if (accessedNode === undefined) {
      this.setString(key, '0');
      accessedNode = this.mainHash[key];
    } else if (!isNumberString(accessedNode.val)) {
      throw new Error("StoreError: value at key is not a number string.");
    }

    const oldValue = accessedNode.val;
    accessedNode.val = (parseInt(accessedNode.val, 10) - 1).toString();

    const oldValueMemory = oldValue.length * STRING_ONE_CHAR_BYTES;
    const newValueMemory = accessedNode.val.length * STRING_ONE_CHAR_BYTES;

    this.memoryTracker.updateMemoryUsed(oldValueMemory, newValueMemory);

    this.touch(accessedNode);

    this.lruCheckAndEvictToMaxMemory();
    return parseInt(accessedNode.val, 10);
  }

  exists(...keys) {
    let existingKeysCount = 0;
    keys.forEach((key) => {
      if(this.mainHash[key]) {
        existingKeysCount += 1;
      }
    });
    return existingKeysCount;
  }

  type(key) {
    // alter to return null or none or type
    if (!this.mainHash[key]) {
      return "none";
    }
    return this.mainHash[key].type;
  }

  rename(keyA, keyB) {
    // alter after dataType prop and multiple data types added
    // alter to reflect memory changes list data type
    if (!this.exists(keyA)) {
      throw new Error("StoreError: No such key.");
    }

    const val = this.mainHash[keyA].val;
    const keyADataType = this.mainHash[keyA].type;

    if (keyADataType === 'string') {
      this.setString(keyB, val);
    } else if (keyADataType === 'list') {
      const newMainListNode = new CorvoNode(keyA, val, "list");
      this.mainList.append(newMainListNode);
      this.mainList[keyB] = newMainListNode;
    }

    this.del(keyA);
    return "OK";
  }

  renameNX(keyA, keyB) {
    // alter to accommodate memory mgmt for complex data types
    const keyAExists = !!this.mainHash[keyA];
    const keyBExists = !!this.mainHash[keyB];

    if (keyAExists) {
      if (keyBExists) {
        return 0;
      } else {
        this.rename(keyA, keyB);
        return 1;
      }
    } else {
      throw new Error("StoreError: No such key");
    }
  }

  del(...keys) {
    // alter to accommodate memory mgmt for complex data types
    let numDeleted = 0;

    keys.forEach((key) => {
      const node = this.mainHash[key];
      if (node !== undefined) {
        const val = node.val;
        const type = node.type;
        this.memoryTracker.decrementMemoryUsed(key, val, type);
        delete this.mainHash[key];
        this.mainList.remove(node);
        numDeleted += 1;
      }
    });

    return numDeleted;
  }

  lruEvict() {
    // alter to accommodate memory mgmt for complex data types
    const head = this.mainList.head;
    const headKey = head.key;

    this.mainList.remove(head);
    const currentVal = this.mainHash[headKey];
    delete this.mainHash[headKey];
    this.memoryTracker.decrementMemoryUsed(headKey, currentVal, currentVal.type);
  }

  lruCheckAndEvictToMaxMemory() {
    while (this.memoryTracker.maxMemoryExceeded()) {
      this.lruEvict();
    }
  }

  lpush(key, val) {
    const nodeAtKey = this.mainHash[key];
    if (nodeAtKey && nodeAtKey.type === "list") {
      const newListNode = new CorvoListNode(val);
      const newListNodeMemory = this.memoryTracker.calculateListNodeSize(val);
      const oldListMemory = this.memoryTracker.calculateListSize(nodeAtKey.val);
      const newListMemory = oldListMemory + newListNodeMemory;

      nodeAtKey.val.prepend(newListNode);
      this.memoryTracker.updateMemoryUsed(oldListMemory, newListMemory);

      // increment memory tracker memoryUsed by size of node holding val
    } else if (nodeAtKey && nodeAtKey.type !== "list") {
      throw new Error("StoreError: value at key not a list.");
    } else {
      // create new linked list at that key
      // add node to mainList
      // add key to mainHash
      // add value to "list" linked list
      const newListNode = this.createListNode(key);
      newListNode.val.append(new CorvoListNode(val));
      this.mainHash[key] = newListNode;
      this.mainList.append(newListNode);

      this.memoryTracker.incrementMemoryUsed(key, newListNode.val, "list");
    }
  }

  rpush(key, val) {
    const nodeAtKey = this.mainHash[key];
    if (nodeAtKey && nodeAtKey.type === "list") {
      const newListNode = new CorvoListNode(val);
      const newListNodeMemory = this.memoryTracker.calculateListNodeSize(val);
      const oldListMemory = this.memoryTracker.calculateListSize(nodeAtKey.val);
      const newListMemory = oldListMemory + newListNodeMemory;

      nodeAtKey.val.append(newListNode);
      this.memoryTracker.updateMemoryUsed(oldListMemory, newListMemory);

      // increment memory tracker memoryUsed by size of node holding val
    } else if (nodeAtKey && nodeAtKey.type !== "list") {
      throw new Error("StoreError: value at key not a list.");
    } else {
      // create new linked list at that key
      // add node to mainList
      // add key to mainHash
      // add value to "list" linked list
      const newListNode = this.createListNode(key);
      newListNode.val.append(new CorvoListNode(val));
      this.mainHash[key] = newListNode;
      this.mainList.append(newListNode);

      this.memoryTracker.incrementMemoryUsed(key, newListNode.val, "list");
    }
  }

  createListNode(key) {
    const newList = new CorvoLinkedList();
    const newNode = new CorvoNode(key, newList, "list", null, null);
    return newNode;
  }

  lpop(key) {
    if (this.mainHash[key]) {
      const list = this.mainHash[key].val;

      return list.lpop().val;
    } else {
      return null;
    }
  }

  rpop(key) {
    if (this.mainHash[key]) {
      const list = this.mainHash[key].val;

      return list.rpop().val;
    } else {
      return null;
    }
  }

  lindex(key, idx) {
    if (!this.mainHash[key]) {
      return null;
    }

    if (this.mainHash[key].type !== "list") {
      throw new Error("StoreError: value at key not a list.");
    }

    const list = this.mainHash[key].val;
    let currIdx;
    let currListNode;
    if (idx >= 0) {
      currIdx = 0;
      currListNode = list.head;

      while (currListNode) {
        if (idx === currIdx) {
          return currListNode.val;
        }

        currIdx += 1;
        currListNode = currListNode.nextNode;
      }
    } else {
      currIdx = -1;
      currListNode = list.tail;

      while (currListNode) {
        if (idx === currIdx) {
          return currListNode.val;
        }

        currIdx -= 1;
        currListNode = currListNode.prevNode;
      }
    }

    return null;
  }

  lrem(key, count, val) {
    if (!this.mainHash[key]) {
      return 0;
    }

    if (this.mainHash[key].type !== "list") {
      throw new Error("StoreError: value at key not a list.");
    }

    const list = this.mainHash[key].val;
    let countRemoved = 0;;
    let currListNode;

    if (count > 0) {
      currListNode = list.head;
      while (currListNode) {
        if (currListNode.val === val) {
          const nextListNode = currListNode.nextNode;
          list.remove(currListNode);
          countRemoved += 1;

          if (countRemoved === count) {
            return countRemoved;
          }

          currListNode = nextListNode;
          continue;
        }

        currListNode = currListNode.nextNode;
      }
    } else if (count < 0) {
      currListNode = list.tail;
      while (currListNode) {
        if (currListNode.val === val) {
          const prevListNode = currListNode.prevNode;
          list.remove(currListNode);
          countRemoved += 1;

          if (countRemoved === Math.abs(count)) {
            return countRemoved;
          }

          currListNode = prevListNode;
          continue;
        }

        currListNode = currListNode.prevNode;
      }
    } else {
      // count is 0, remove all elements matching val
      currListNode = list.head;
      while (currListNode) {
        if (currListNode.val === val) {
          const nextListNode = currListNode.nextNode;
          list.remove(currListNode);
          countRemoved += 1;
          currListNode = nextListNode;
          continue;
        }

        currListNode = currListNode.nextNode;
      }
    }

    return countRemoved;
  }

  llen(key) {
    if(!this.mainHash[key]) {
      return 0;
    }

    if (this.mainHash[key].type !== "list") {
      throw new Error("StoreError: value at key not a list.");
    }

    return this.mainHash[key].val.length;
  }

  linsertBefore(key, pivotVal, newVal) {
    if (!this.mainHash[key]) {
      return 0;
    }

    if (this.mainHash[key].type !== "list") {
      throw new Error("StoreError: value at key not a list.");
    }

    return this.mainHash[key].val.insertBefore(pivotVal, newVal);
  }

  linsertAfter(key, pivotVal, newVal) {
    if (!this.mainHash[key]) {
      return 0;
    }

    if (this.mainHash[key].type !== "list") {
      throw new Error("StoreError: value at key not a list.");
    }

    return this.mainHash[key].val.insertAfter(pivotVal, newVal);
  }
}

export default Store;

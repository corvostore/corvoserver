import CorvoLinkedList from './corvo_linked_list';
import CorvoNode from './corvo_node';
import CorvoListNode from './data_types/corvo_list_node';
import MemoryTracker from './memory_tracker';
import StoreError from './store_error';

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
      this.memoryTracker.nodeCreation(newNode);
    } else {
      const oldValue = accessedNode.val;
      accessedNode.val = value;
      this.memoryTracker.stringUpdate(oldValue, value);
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
    accessedNode.val = value;
    this.memoryTracker.stringUpdate(oldValue, value);
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
    this.memoryTracker.nodeCreation(newNode);
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

      this.memoryTracker.nodeCreation(newNode);

      lengthAppendedValue = valueToAppend.length;
    } else if (accessedNode.type === 'string') {
      this.touch(key);
      const oldValue = accessedNode.val;
      accessedNode.val += valueToAppend;

      this.memoryTracker.stringUpdate(oldValue, accessedNode.val);
      lengthAppendedValue = accessedNode.val.length;
    } else {
      throw new StoreError("StoreError: value at key not string type.");
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
      throw new StoreError("StoreError: value at key is not string type.")
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
      throw new StoreError("StoreError: value at key is not a number string.");
    }

    const oldValue = accessedNode.val;

    accessedNode.val = (parseInt(accessedNode.val, 10) + 1).toString();

    this.memoryTracker.stringUpdate(oldValue, accessedNode.val);
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
      throw new StoreError("StoreError: value at key is not a number string.");
    }

    const oldValue = accessedNode.val;
    accessedNode.val = (parseInt(accessedNode.val, 10) - 1).toString();

    this.memoryTracker.stringUpdate(oldValue, accessedNode.val);

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
      throw new StoreError("StoreError: No such key.");
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
      throw new StoreError("StoreError: No such key");
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
        // this.memoryTracker.decrementMemoryUsed(key, val, type);
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
    // this.memoryTracker.decrementMemoryUsed(headKey, currentVal, currentVal.type);
  }

  lruCheckAndEvictToMaxMemory() {
    while (this.memoryTracker.maxMemoryExceeded()) {
      this.lruEvict();
    }
  }

  lpush(key, ...vals) {
    const nodeAtKey = this.mainHash[key];
    if (nodeAtKey && nodeAtKey.type === "list") {
      // const oldListMemory = this.memoryTracker.calculateListSize(nodeAtKey.val);
      // let newListMemory = oldListMemory;

      vals.forEach((val) => {
        const newListNode = new CorvoListNode(val);
        nodeAtKey.val.prepend(newListNode);
        // newListMemory += this.memoryTracker.calculateListNodeSize(val);
      });

      // this.memoryTracker.updateMemoryUsed(oldListMemory, newListMemory);
    } else if (nodeAtKey && nodeAtKey.type !== "list") {
      throw new StoreError("StoreError: value at key not a list.");
    } else {
      const newMainListNode = this.createMainNodeForListType(key);

      this.mainHash[key] = newMainListNode;
      this.mainList.append(newMainListNode);

      vals.forEach((val) => {
        const newListNode = new CorvoListNode(val);

        newMainListNode.val.prepend(newListNode);
      });

      this.memoryTracker.nodeCreation(newMainListNode);
    }
  }

  rpush(key, ...vals) {
    const nodeAtKey = this.mainHash[key];
    if (nodeAtKey && nodeAtKey.type === "list") {
      // const oldListMemory = this.memoryTracker.calculateListSize(nodeAtKey.val);
      // let newListMemory = oldListMemory;

      vals.forEach((val) => {
        const newListNode = new CorvoListNode(val);
        nodeAtKey.val.append(newListNode);
        // newListMemory += this.memoryTracker.calculateListNodeSize(val);
      });

      // this.memoryTracker.updateMemoryUsed(oldListMemory, newListMemory);
    } else if (nodeAtKey && nodeAtKey.type !== "list") {
      throw new StoreError("StoreError: value at key not a list.");
    } else {
      const newMainListNode = this.createMainNodeForListType(key);

      this.mainHash[key] = newMainListNode;
      this.mainList.append(newMainListNode);

      vals.forEach((val) => {
        const newListNode = new CorvoListNode(val);

        newMainListNode.val.append(newListNode);
      });

      this.memoryTracker.nodeCreation(newMainListNode);
    }
  }

  createMainNodeForListType(key) {
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
      throw new StoreError("StoreError: value at key not a list.");
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
      throw new StoreError("StoreError: value at key not a list.");
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
      throw new StoreError("StoreError: value at key not a list.");
    }

    return this.mainHash[key].val.length;
  }

  linsertBefore(key, pivotVal, newVal) {
    if (!this.mainHash[key]) {
      return 0;
    }

    if (this.mainHash[key].type !== "list") {
      throw new StoreError("StoreError: value at key not a list.");
    }

    return this.mainHash[key].val.insertBefore(pivotVal, newVal);
  }

  linsertAfter(key, pivotVal, newVal) {
    if (!this.mainHash[key]) {
      return 0;
    }

    if (this.mainHash[key].type !== "list") {
      throw new StoreError("StoreError: value at key not a list.");
    }

    return this.mainHash[key].val.insertAfter(pivotVal, newVal);
  }

  hget(key, field) {
    // return (nil) if key or field undefined
    // else return value
    const nodeAtKey = this.mainHash[key];
    if (nodeAtKey === undefined) {
      return null;
    } else if (nodeAtKey.type !== "hash") {
      this.touch(nodeAtKey);
      throw new StoreError("StoreError: value at key not a hash.");
    } else {
      this.touch(nodeAtKey);
      const value = nodeAtKey.val[field];
      return value ? value : null;
    }
  }

  hsetnx(key, field, val) {
    let returnValue;
    const nodeAtKey = this.mainHash[key];
    if (nodeAtKey) {
      this.touch(nodeAtKey);
      if (nodeAtKey.type !== "hash") {
        throw new StoreError("StoreError: value at key not a hash.");
      } else {
        const hash = nodeAtKey.val;
        if (hash[field]) {
          returnValue = 0;
        } else {
          hash[field] = val;
          returnValue = 1;
        }
      }
    } else {
      const newMainHashNode = new CorvoNode(key, {}, "hash", null, null);
      this.mainHash[key] = newMainHashNode;
      this.mainList.append(newMainHashNode);
      newMainHashNode.val[field] = val;
      returnValue = 1;
    }

    this.lruCheckAndEvictToMaxMemory();
    return returnValue;
  }

  hset(key, field, value) {
    let node = this.mainHash[key];
    if (!node) {
      node = new CorvoNode(key, {}, "hash");
      this.mainHash[key] = node;
      this.mainList.append(node);
      // this.memoryTracker.incrementMemoryUsed(key, {}, node.type);
    } else if (this.mainHash[key].type !== "hash") {
      this.touch(node);
      throw new StoreError("StoreError: value at key not a hash.");
    } else if (node && node.val[field]) {
      node.val[field] = value;
      // update memory
      this.touch(node);
      this.lruCheckAndEvictToMaxMemory();
      return 0;
    } else {
      this.touch(node);
    }
    node.val[field] = value;
    // update memory - todo
    this.lruCheckAndEvictToMaxMemory();
    return 1;
  }

  hvals(key) {
    const nodeAtKey = this.mainHash[key];
    let result = [];
    if(!nodeAtKey) {
      return result;
    } else if (nodeAtKey.type !== "hash") {
      this.touch(nodeAtKey);
      throw new StoreError("StoreError: value at key not a hash.");
    } else {
      this.touch(nodeAtKey);
      const obj = nodeAtKey.val;
      for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          result.push(obj[prop]);
        }
      }
    }
    return result;
  }

  hstrlen(key, field) {
    const nodeAtKey = this.mainHash[key];
    if (!nodeAtKey) {
      return 0;
    } else if (nodeAtKey.type !== "hash") {
      this.touch(nodeAtKey);
      throw new StoreError("StoreError: value at key not a hash.");
    } else {
      this.touch(nodeAtKey);
      if (!nodeAtKey.val[field]) {
        return 0;
      } else {
        return nodeAtKey.val[field].length;
      }
    }
  }

  hmset(key, ...fieldVals) {
    let node = this.mainHash[key];
    if (!node) {
      node = new CorvoNode(key, {}, "hash");
      this.mainHash[key] = node;
      this.mainList.append(node);
      // this.memoryTracker.incrementMemoryUsed(key, {}, node.type);
    } else if (this.mainHash[key].type !== "hash") {
      this.touch(node);
      throw new StoreError("StoreError: value at key not a hash.");
    } else {
      this.touch(node);
    }
    for (let i = 0; i < fieldVals.length - 1; i++) {
      let field = fieldVals[i];
      let value = fieldVals[i + 1];
      node.val[field] = value;
    }
    // update memory - todo
    // this.lruCheckAndEvictToMaxMemory();
    return "OK";
  }

  hdel(key, field) {
    const nodeAtKey = this.mainHash[key];

    if (nodeAtKey === undefined) {
      return 0;
    } else if (nodeAtKey.type !== 'hash') {
      this.touch(key);
      throw new StoreError("StoreError: value at key not a hash.");
    } else if (nodeAtKey.val[field] === undefined) {
      this.touch(key);
      return 0;
    } else {
      delete nodeAtKey.val[field];
      this.touch(key);
      return 1;
    }
  }

  hGetAll(key) {
    const nodeAtKey = this.mainHash[key];

    if (nodeAtKey === undefined) {
      return [];
    } else if (nodeAtKey.type !== 'hash') {
      this.touch(key);
      throw new StoreError("StoreError: value at key not a hash.");
    } else {
      const fields = Object.keys(nodeAtKey.val);
      const hash = this.mainHash[key].val;
      const result = [];

      fields.forEach((field) => {
        result.push(field);
        result.push(hash[field]);
      });

      this.touch(key);
      return result;
    }
  }

  hlen(key) {
    const nodeAtKey = this.mainHash[key];

    if (nodeAtKey === undefined) {
      return 0;
    } else if (nodeAtKey.type !== 'hash') {
      this.touch(key);
      throw new StoreError("StoreError: value at key not a hash.");
    } else {
      this.touch(key);
      return Object.keys(nodeAtKey.val).length;
    }
  }

  hkeys(key) {
    const nodeAtKey = this.mainHash[key];
    const returnArray = [];

    if (nodeAtKey) {
      this.touch(nodeAtKey);
      if (nodeAtKey.type !== "hash") {
        throw new StoreError("StoreError: value at key not a hash.");
      } else {
        const hash = nodeAtKey.val;
        Object.keys(hash).forEach((field) => {
          returnArray.push(field);
        });
      }
    }

    this.lruCheckAndEvictToMaxMemory();
    return returnArray;
  }

  hmget(key, ...fields) {
    const nodeAtKey = this.mainHash[key];
    const returnArray = [];

    if (nodeAtKey) {
      this.touch(nodeAtKey);
      if (nodeAtKey.type !== "hash") {
        throw new StoreError("StoreError: value at key not a hash.");
      } else {
        const hash = nodeAtKey.val;
        fields.forEach((field) => {
          const fieldValue = hash[field] ? hash[field] : null;
          returnArray.push(fieldValue);
        });
      }
    } else {
      fields.forEach(() => {
        returnArray.push(null);
      });
    }

    this.lruCheckAndEvictToMaxMemory();
    return returnArray;
  }

  hincrby(key, field, incrBy) {
    let returnValue;
    const nodeAtKey = this.mainHash[key];

    if (nodeAtKey) {
      this.touch(nodeAtKey);
      if (nodeAtKey.type !== "hash") {
        throw new StoreError("StoreError: value at key not a hash.");
      } else {
        const hash = nodeAtKey.val;
        if (hash[field]) {
          const oldValue = hash[field];
          if (oldValue.match(/[^0-9]/)) {
            throw new StoreError("StoreError: value at key is not a number string.");
          } else {
            returnValue = parseInt(oldValue, 10) + parseInt(incrBy, 10);
            hash[field] = returnValue.toString();
          }
        } else {
          hash[field] = incrBy;
          returnValue = parseInt(incrBy, 10);
        }
      }
    } else {
      const newMainHashNode = new CorvoNode(key, {}, "hash");
      this.mainHash[key] = newMainHashNode;
      this.mainList.append(newMainHashNode);
      newMainHashNode.val[field] = incrBy;
      returnValue = parseInt(incrBy, 10);;
    }

    this.lruCheckAndEvictToMaxMemory();
    return returnValue;
  }
}

export default Store;

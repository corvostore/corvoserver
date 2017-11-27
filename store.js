import CorvoLinkedList from './corvo_linked_list';
import CorvoNode from './corvo_node';
import CorvoListNode from './data_types/corvo_list_node';
import MemoryTracker from './memory_tracker';
import CorvoSortedSet from './data_types/corvo_sorted_set.js';
import CorvoSet from './corvo_set.js';
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
      this.touch(key);
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
    this.touch(key);
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
      this.touch(key);
      return accessedNode.val.length;
    } else if (accessedNode) {
      this.touch(key);
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
    this.touch(key);

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

    this.touch(key);

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
    if (!this.mainHash[key]) {
      return "none";
    }
    return this.mainHash[key].type;
  }

  rename(keyA, keyB) {
    if (!this.exists(keyA)) {
      throw new StoreError("StoreError: No such key.");
    }

    const keyADataType = this.mainHash[keyA].type;

    if (keyADataType === 'string') {
      const val = this.mainHash[keyA].val;
      if (this.mainHash[keyB]) {
        this.del(keyB);
      }
      this.setString(keyB, val);
    } else if (keyADataType === 'list') {
      if (this.mainHash[keyB]) {
        this.del(keyB);
      }
      const val = this.mainHash[keyA].val;
      const newMainListNode = new CorvoNode(keyB, val, "list");
      this.mainList.append(newMainListNode);
      this.mainList[keyB] = newMainListNode;
      this.memoryTracker.nodeCreation(newMainListNode);
    } else if (keyADataType === 'hash') {
      if (this.mainHash[keyB]) {
      }
      const val = this.mainHash[keyA].val;
      const newMainHashNode = new CorvoNode(keyB, val, "hash");
      this.mainList.append(newMainHashNode);
      this.mainList[keyB] = newMainHashNode;
      this.memoryTracker.nodeCreation(newMainHashNode);
    }

    this.del(keyA);
    return "OK";
  }

  renameNX(keyA, keyB) {
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
    let numDeleted = 0;

    keys.forEach((key) => {
      const node = this.mainHash[key];
      if (node !== undefined) {
        const val = node.val;
        const type = node.type;
        this.memoryTracker.deleteStoreItem(node);
        delete this.mainHash[key];
        this.mainList.remove(node);
        numDeleted += 1;
      }
    });

    return numDeleted;
  }

  lruEvict() {
    this.del(this.mainList.head.key);
  }

  lruCheckAndEvictToMaxMemory() {
    while (this.memoryTracker.maxMemoryExceeded()) {
      this.lruEvict();
    }
  }

  lpush(key, ...vals) {
    const nodeAtKey = this.mainHash[key];
    if (nodeAtKey && nodeAtKey.type === "list") {
      this.touch(key);
      vals.forEach((val) => {
        const newListNode = new CorvoListNode(val);
        nodeAtKey.val.prepend(newListNode);

        this.memoryTracker.listItemInsert(newListNode.val);
      });
      return nodeAtKey.val.length;
    } else if (nodeAtKey && nodeAtKey.type !== "list") {
      this.touch(key);
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
      return newMainListNode.val.length;
    }
  }

  rpush(key, ...vals) {
    const nodeAtKey = this.mainHash[key];
    if (nodeAtKey && nodeAtKey.type === "list") {
      this.touch(key);
      vals.forEach((val) => {
        const newListNode = new CorvoListNode(val);
        nodeAtKey.val.append(newListNode);

        this.memoryTracker.listItemInsert(newListNode.val);
      });
      return nodeAtKey.val.length;
    } else if (nodeAtKey && nodeAtKey.type !== "list") {
      this.touch(key);
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
      return newMainListNode.val.length;
    }
  }

  createMainNodeForListType(key) {
    const newList = new CorvoLinkedList();
    const newNode = new CorvoNode(key, newList, "list", null, null);
    return newNode;
  }

  lpop(key) {
    if (this.mainHash[key]) {
      this.touch(key);
      const list = this.mainHash[key].val;

      return list.length ? list.lpop().val : null;
    } else {
      return null;
    }
  }

  rpop(key) {
    if (this.mainHash[key]) {
      this.touch(key);
      const list = this.mainHash[key].val;

      return list.length ? list.rpop().val : null;
    } else {
      return null;
    }
  }

  lindex(key, idx) {
    if (!this.mainHash[key]) {
      return null;
    }

    if (this.mainHash[key].type !== "list") {
      this.touch(key);
      throw new StoreError("StoreError: value at key not a list.");
    }

    const list = this.mainHash[key].val;
    this.touch(key);
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
      this.touch(key);
      throw new StoreError("StoreError: value at key not a list.");
    }

    const list = this.mainHash[key].val;
    this.touch(key);
    let countRemoved = 0;
    let currListNode;

    if (count > 0) {
      currListNode = list.head;
      while (currListNode) {
        if (currListNode.val === val) {
          const nextListNode = currListNode.nextNode;
          this.memoryTracker.listItemDelete(currListNode);
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
          this.memoryTracker.listItemDelete(currListNode);
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
          this.memoryTracker.listItemDelete(currListNode);
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
      this.touch(key);
      throw new StoreError("StoreError: value at key not a list.");
    }

    this.touch(key);
    return this.mainHash[key].val.length;
  }

  linsertBefore(key, pivotVal, newVal) {
    if (!this.mainHash[key]) {
      return 0;
    }

    if (this.mainHash[key].type !== "list") {
      this.touch(key);
      throw new StoreError("StoreError: value at key not a list.");
    }
    this.touch(key);
    this.memoryTracker.listItemInsert(newVal);
    return this.mainHash[key].val.insertBefore(pivotVal, newVal);
  }

  linsertAfter(key, pivotVal, newVal) {
    if (!this.mainHash[key]) {
      return 0;
    }

    if (this.mainHash[key].type !== "list") {
      this.touch(key);
      throw new StoreError("StoreError: value at key not a list.");
    }
    this.touch(key);
    this.memoryTracker.listItemInsert(newVal);
    return this.mainHash[key].val.insertAfter(pivotVal, newVal);
  }

  lset(key, idx, value) {
    if (!this.mainHash[key]) {
      throw new StoreError("StoreError: no such key.");
    }

    const nodeAtKey = this.mainHash[key];
    if (nodeAtKey.type !== "list") {
      throw new StoreError("StoreError: value at key not a list.");
    } else {
      const listLength = nodeAtKey.val.length;
      const normalizedIdx = (idx >= 0) ? idx : (listLength + idx);
      if (normalizedIdx < 0 || normalizedIdx >= listLength) {
        throw new StoreError("StoreError: index out of range.");
      }

      const list = nodeAtKey.val;
      let oldValue;

      // accessing indices at head and tail are required to be O(1)
      if (normalizedIdx === 0) {
        oldValue = list.head.val;
        list.head.val = value;
      } else if (normalizedIdx === (listLength - 1)) {
        oldValue = list.tail.val;
        list.tail.val = value;
      } else {
        let currListNode = list.head;
        for (let i = 0; i < normalizedIdx; i += 1) {
          currListNode = currListNode.nextNode
        }

        oldValue = currListNode.val;
        currListNode.val = value;
      }

      this.touch(nodeAtKey);
      this.memoryTracker.listItemUpdate(oldValue, value);
    }

    this.lruCheckAndEvictToMaxMemory();
    return "OK";
  }

  hget(key, field) {
    // return (nil) if key or field undefined
    // else return value
    const nodeAtKey = this.mainHash[key];
    if (nodeAtKey === undefined) {
      return null;
    } else if (nodeAtKey.type !== "hash") {
      this.touch(key);
      throw new StoreError("StoreError: value at key not a hash.");
    } else {
      this.touch(key);
      const value = nodeAtKey.val[field];
      return value ? value : null;
    }
  }

  hsetnx(key, field, val) {
    let returnValue;
    const nodeAtKey = this.mainHash[key];
    if (nodeAtKey) {
      this.touch(key);
      if (nodeAtKey.type !== "hash") {
        throw new StoreError("StoreError: value at key not a hash.");
      } else {
        const hash = nodeAtKey.val;
        if (hash[field]) {
          returnValue = 0;
        } else {
          hash[field] = val;
          this.memoryTracker.hashItemInsert(field, val);
          returnValue = 1;
        }
      }
    } else {
      const newMainHashNode = new CorvoNode(key, {}, "hash", null, null);
      this.mainHash[key] = newMainHashNode;
      this.mainList.append(newMainHashNode);
      newMainHashNode.val[field] = val;
      this.memoryTracker.nodeCreation(newMainHashNode);
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
      this.memoryTracker.nodeCreation(node);
    } else if (this.mainHash[key].type !== "hash") {
      this.touch(key);
      throw new StoreError("StoreError: value at key not a hash.");
    } else if (node && node.val[field]) {
      const oldVal = node.val[field];
      node.val[field] = value;
      this.memoryTracker.hashItemUpdate(oldVal, node.val[field]);
      this.touch(key);
      this.lruCheckAndEvictToMaxMemory();
      return 0;
    } else {
      this.touch(key);
    }
    node.val[field] = value;
    this.memoryTracker.hashItemInsert(field, value);
    this.lruCheckAndEvictToMaxMemory();
    return 1;
  }

  hvals(key) {
    const nodeAtKey = this.mainHash[key];
    let result = [];
    if(!nodeAtKey) {
      return result;
    } else if (nodeAtKey.type !== "hash") {
      this.touch(key);
      throw new StoreError("StoreError: value at key not a hash.");
    } else {
      this.touch(key);
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
      this.touch(key);
      throw new StoreError("StoreError: value at key not a hash.");
    } else {
      this.touch(key);
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
      this.memoryTracker.nodeCreation(node);
    } else if (this.mainHash[key].type !== "hash") {
      this.touch(key);
      throw new StoreError("StoreError: value at key not a hash.");
    } else {
      this.touch(key);
    }
    for (let i = 0; i < fieldVals.length; i+=2) {
      let field = fieldVals[i];
      let value = fieldVals[i + 1];
      if (node.val[field]) {
        const oldVal = node.val[field];
        this.memoryTracker.hashItemUpdate(oldVal, value);
      } else {
        this.memoryTracker.hashItemInsert(field, value);
      }
      node.val[field] = value;
    }
    this.lruCheckAndEvictToMaxMemory();
    return "OK";
  }

  hdel(key, ...fields) {
    const nodeAtKey = this.mainHash[key];

    if (nodeAtKey === undefined) {
      return 0;
    } else if (nodeAtKey.type !== 'hash') {
      this.touch(key);
      throw new StoreError("StoreError: value at key not a hash.");
    } else {
      const hash = nodeAtKey.val;
      let numDeleted = 0;

      fields.forEach((field) => {
        if (hash[field]) {
          numDeleted += 1;
          this.memoryTracker.hashItemDelete(field, hash[field]);
          delete hash[field];
        }
      });

      this.touch(key);
      return numDeleted;
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
      this.touch(key);
      if (nodeAtKey.type !== "hash") {
        throw new StoreError("StoreError: value at key not a hash.");
      } else {
        const hash = nodeAtKey.val;
        Object.keys(hash).forEach((field) => {
          returnArray.push(field);
        });
      }
    }

    return returnArray;
  }

  hmget(key, ...fields) {
    const nodeAtKey = this.mainHash[key];
    const returnArray = [];

    if (nodeAtKey) {
      this.touch(key);
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

    return returnArray;
  }

  hincrby(key, field, incrBy) {
    let returnValue;
    const nodeAtKey = this.mainHash[key];

    if (nodeAtKey) {
      this.touch(key);
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
            this.memoryTracker.hashItemUpdate(oldValue, hash[field]);
          }
        } else {
          hash[field] = incrBy;
          this.memoryTracker.hashItemInsert(field, incrBy);
          returnValue = parseInt(incrBy, 10);
        }
      }
    } else {
      const newMainHashNode = new CorvoNode(key, {}, "hash");
      this.mainHash[key] = newMainHashNode;
      this.mainList.append(newMainHashNode);
      newMainHashNode.val[field] = incrBy;
      this.memoryTracker.nodeCreation(newMainHashNode);
      returnValue = parseInt(incrBy, 10);;
    }

    this.lruCheckAndEvictToMaxMemory();
    return returnValue;
  }

  processZaddParams(...restOfParams) {
    let xxNxFlag = "";
    let chFlag = false;
    let incrFlag = false;

    let token;
    while(restOfParams.length) {
      token = restOfParams.shift().toUpperCase();
      if (token === "XX") {
        if (xxNxFlag) {
          throw new StoreError("StoreError: only one of NX or XX can be specified.");
        }

        xxNxFlag = token;
      } else if (token === "NX") {
        if (xxNxFlag) {
          throw new StoreError("StoreError: only one of NX or XX can be specified.");
        }

        xxNxFlag = token;
      } else if (token === "CH") {
        chFlag = true;
      } else if (token === "INCR") {
        incrFlag = true;
      } else {
        break;
      }
    }

    restOfParams.unshift(token);
    let scoreAndMembers = restOfParams.slice();

    return {
      xxNxFlag,
      chFlag,
      incrFlag,
      scoreAndMembers,
    };
  }

  zaddIncrement(key, score, member, xxNxFlag) {
    const nodeAtKey = this.mainHash[key];
    let newScore = null;

    if (!nodeAtKey) {
      newScore = this.zincrby(key, score, member);
    } else if (nodeAtKey.type !== "zset") {
      throw new StoreError("StoreError: value at key not a sorted set.");
    } else {
      const sortedSet = this.mainHash[key].val;

      if (isNaN(+score)) {
        throw new StoreError("StoreError: score should be numeric.");
      }

      if (xxNxFlag === 'NX') {
        if (!sortedSet.memberExists(member)) {
          newScore = this.zincrby(key, score, member);
        }
      } else if (xxNxFlag === 'XX') {
        if (sortedSet.memberExists(member)) {
          newScore = this.zincrby(key, score, member);
        }
      } else {
        newScore = this.zincrby(key, score, member);
      }
    }

    return newScore;
  }

  zadd(key, ...restOfParams) {
    const paramsObject = this.processZaddParams(...restOfParams);
    const xxNxFlag = paramsObject.xxNxFlag;
    const chFlag = paramsObject.chFlag;
    const incrFlag = paramsObject.incrFlag;
    const scoreAndMembers = paramsObject.scoreAndMembers;

    if (incrFlag) {
      if (scoreAndMembers.length > 2) {
        throw new StoreError("StoreError: INCR option supports a single increment-element pair.");
      } else {
        return this.zaddIncrement(key, ...scoreAndMembers, xxNxFlag);
      }
    }

    const nodeAtKey = this.mainHash[key];
    let numElems = 0;
    // Todo - accomodate flags (nx/xx, ch, incr)


    if (!nodeAtKey) {
      // create a new sorted set
      const sortedSet = new CorvoSortedSet();
      const newMainZsetNode = new CorvoNode(key, sortedSet, "zset");
      this.mainHash[key] = newMainZsetNode;
      this.mainList.append(newMainZsetNode);

      while (scoreAndMembers.length) {
        const score = scoreAndMembers.shift();
        const member = scoreAndMembers.shift();

        if (isNaN(+score)) {
          throw new StoreError("StoreError: score should be numeric.");
        }

        if (xxNxFlag === 'NX') {
          if (!sortedSet.memberExists(member)) {
            sortedSet.add(parseFloat(score, 10), member);
            numElems += 1;
          }
        } else if (xxNxFlag === 'XX') {
          if (sortedSet.memberExists(member)) {
            const oldScore = sortedSet.getScore(member);
            sortedSet.add(parseFloat(score, 10), member);
            if (chFlag && oldScore !== parseFloat(score, 10)) {
              numElems += 1;
            }
          }
        } else {
          const oldScore = sortedSet.getScore(member);
          if (chFlag) {
            if (oldScore !== parseFloat(score, 10))  {
              numElems += 1;
            }
          } else if (!sortedSet.memberExists(member)) {
            numElems += 1;
          }
          sortedSet.add(parseFloat(score, 10), member);
        }

      }
      this.memoryTracker.nodeCreation(newMainZsetNode);
    } else if (nodeAtKey.type !== "zset") {
      this.touch(key);
      throw new StoreError("StoreError: value at key not a sorted set.");
    } else {
      // update the existing sorted set
      const oldMemory = this.memoryTracker.calculateStoreItemSize(nodeAtKey);
      this.touch(key);
      const sortedSet = this.mainHash[key].val;
      while (scoreAndMembers.length) {
        const score = scoreAndMembers.shift();
        const member = scoreAndMembers.shift();

        if (isNaN(+score)) {
          throw new StoreError("StoreError: score should be numeric.");
        }

        if (xxNxFlag === 'NX') {
          if (!sortedSet.memberExists(member)) {
            sortedSet.add(parseFloat(score, 10), member);
            numElems += 1;
          }
        } else if (xxNxFlag === 'XX') {
          const oldScore = sortedSet.getScore(member);
          if (sortedSet.memberExists(member)) {
            sortedSet.add(parseFloat(score, 10), member);
            if (chFlag && oldScore !== parseFloat(score, 10)) {
              numElems += 1;
            }
          }
        } else {
          const oldScore = sortedSet.getScore(member);
          if (chFlag) {
            if (oldScore !== parseFloat(score, 10))  {
              numElems += 1;
            }
          } else if (!sortedSet.memberExists(member)) {
            numElems += 1;
          }
          sortedSet.add(parseFloat(score, 10), member);
        }
      }
      const newMemory = this.memoryTracker.calculateStoreItemSize(nodeAtKey);
      this.memoryTracker.sortedSetElementInsert(oldMemory, newMemory);
    }
    this.lruCheckAndEvictToMaxMemory();
    return numElems;
  }

  zunionstore(destination, ...restOfParams) {
    // pick source key, iterate over sorted set at key,
    // add values to destination
    // if destination already exists, it is overwritten.
    // weights flag defaults to 1
    // aggregate flag defaults to SUM

    const paramsObject = this.processUnionInterParams(...restOfParams);

    const keys        = paramsObject.keys;
    const weightsArr  = paramsObject.weightsArr;
    const aggregation = paramsObject.aggregation;

    keys.forEach((key) => {
      let nodeAtKey = this.mainHash[key];
      if (nodeAtKey && nodeAtKey.type !== "zset") {
        this.touch(key);
        throw new StoreError("StoreError: value at key is not type sorted set.");
      }
    });

    let unionHash = {};

    keys.forEach((key, idx) => {
      let hash = this.mainHash[key].val.hash;
      this.touch(key);

      Object.keys(hash).forEach((member) => {
        let weightToApply = (weightsArr.length === 0) ? 1 : weightsArr[idx];
        if (unionHash[member]) {
          let newScore = this.calcScoreAggr(
                          aggregation,
                          parseFloat(unionHash[member], 10),
                          (hash[member] * weightToApply));
          unionHash[member] = newScore;
        } else {
          let score = hash[member] * weightToApply;
          unionHash[member] = score;
        }
      });
    });

    if (this.mainHash[destination]) {
      this.del(destination);
    }
    const sortedSet = new CorvoSortedSet();
    const newMainZsetNode = new CorvoNode(destination, sortedSet, "zset");
    this.mainHash[destination] = newMainZsetNode;
    this.mainList.append(newMainZsetNode);

    Object.keys(unionHash).forEach((member) => {
      sortedSet.add(unionHash[member], member);
    });

    this.memoryTracker.nodeCreation(newMainZsetNode);
    this.lruCheckAndEvictToMaxMemory();
    return Object.keys(unionHash).length;
  }

  zcard(key) {
    const nodeAtKey = this.mainHash[key];
    if(!nodeAtKey) {
      return 0;
    } else if (nodeAtKey.type !== "zset") {
      this.touch(key);
      throw new StoreError("StoreError: value at key is not type sorted set.");
    }
    this.touch(key);
    return nodeAtKey.val.cardinality;
  }

  zrem(key, ...members) {
    let countRemoved = 0;
    const nodeAtKey = this.mainHash[key];
    if (nodeAtKey && nodeAtKey.type !== "zset") {
      this.touch(key);
      throw new StoreError("StoreError: value at key is not type sorted set.");
    }
    this.touch(key);
    const sortedSet = nodeAtKey.val;
    const oldMemory = this.memoryTracker.calculateStoreItemSize(nodeAtKey);
    members.forEach((member) => {
      if (sortedSet.memberExists(member)) {
        sortedSet.remove(member);
        countRemoved += 1;
      }
    });
    const newMemory = this.memoryTracker.calculateStoreItemSize(nodeAtKey);
    this.memoryTracker.sortedSetElementInsert(oldMemory, newMemory);
    this.lruCheckAndEvictToMaxMemory();
    return countRemoved;
  }

  zscore(key, member) {
    const nodeAtKey = this.mainHash[key];
    if (!nodeAtKey) {
      return null;
    }
    if (nodeAtKey && nodeAtKey.type !== "zset") {
      this.touch(key);
      throw new StoreError("StoreError: value at key is not type sorted set.");
    }
    this.touch(key);
    return this.mainHash[key].val.getScore(member);
  }

  zincrby(key, increment, member) {
    if (isNaN(+increment)) {
      throw new StoreError("StoreError: increment should be numeric.");
    }

    increment = parseFloat(increment, 10);
    const nodeAtKey = this.mainHash[key];
    if (nodeAtKey && nodeAtKey.type !== 'zset') {
      this.touch(key);
      throw new StoreError("StoreError: value at key is not type sorted set.");
    } else if (nodeAtKey === undefined) {
      this.zadd(key, increment, member);
      this.lruCheckAndEvictToMaxMemory();
      return increment;
    } else {
      let newScore = this.zscore(key, member) || 0;
      newScore += increment;
      this.lruCheckAndEvictToMaxMemory();
      return this.mainHash[key].val.setScore(member, newScore);
    }
  }

  calcScoreAggr(aggregationType, prevScore, nextHashScore) {
    let newScore;

    switch(aggregationType) {
      case "SUM":
        newScore = prevScore + nextHashScore;
        break;
      case "MIN":
        newScore = (nextHashScore < prevScore) ? nextHashScore : prevScore;
        break;
      case "MAX":
        newScore = (nextHashScore > prevScore) ? nextHashScore : prevScore;
        break;
    }

    return newScore;
  }

  processUnionInterParams(...restOfParams) {
    const numKeysString = restOfParams.shift();
    if (numKeysString.match(/[^0-9]/)) {
      throw new StoreError("StoreError: numkeys needs to be numeric.");
    }

    const numKeys = parseInt(numKeysString, 10);
    if (numKeys > restOfParams.length) {
      throw new StoreError("StoreError: numkeys does not match number of keys provided.");
    }

    let keys = [];
    for (let i = 0; i < numKeys; i += 1) {
      keys.push(restOfParams.shift());
    }

    keys.forEach((key) => {
      let nodeAtKey = this.mainHash[key];
      if (nodeAtKey && nodeAtKey.type !== "zset") {
        throw new StoreError("StoreError: value at key is not type sorted set.");
      }
    });

    let optionsKeywordIsWeights;
    if (restOfParams.length) {
      const optionsKeyword = restOfParams.shift().toUpperCase();
      if (optionsKeyword !== "WEIGHTS" && optionsKeyword !== "AGGREGATE") {
        throw new StoreError("StoreError: unexpected options keyword.");
      }

      optionsKeywordIsWeights = (optionsKeyword === "WEIGHTS");
    }

    let weightsArr = [];
    let aggregation = "SUM";
    let anOptionProcessed = false;
    while (restOfParams.length) {
      if (anOptionProcessed) {
        const newOptionKeyword = restOfParams.shift().toUpperCase();
        if (optionsKeywordIsWeights && newOptionKeyword === "AGGREGATE") {
          throw new StoreError("StoreError: invalid or duplicate options keyword.");
        }

        if (!optionsKeywordIsWeights && newOptionKeyword === "WEIGHTS") {
          throw new StoreError("StoreError: invalid or duplicate options keyword.");
        }
      }

      if (optionsKeywordIsWeights) {
        // process weights
        if (numKeys > restOfParams.length) {
          throw new StoreError("StoreError: weights not provided for all keys.");
        }

        for (let i = 0; i < numKeys; i += 1) {
          weightsArr.push(parseFloat(restOfParams.shift(), 10));
        }

        anOptionProcessed = true;
        optionsKeywordIsWeights = false;
      } else {
        // process aggregate
        if (restOfParams.length > 1) {
          throw new StoreError("StoreError: syntax error, more tokens than expected.");
        }

        if (restOfParams.length === 0) {
          throw new StoreError("StoreError: aggregation option not provided.");
        }

        aggregation = restOfParams.shift().toUpperCase();
        if (aggregation !== "SUM" && aggregation !== "MIN" && aggregation !== "MAX") {
          throw new StoreError("StoreError: invalid aggregation option.");
        }

        anOptionProcessed = true;
        optionsKeywordIsWeights = true;
      }
    }

    return {
      "keys": keys,
      "weightsArr": weightsArr,
      "aggregation": aggregation,
    };
  }

  zinterstore(destKey, ...restOfParams) {
    const paramsObject = this.processUnionInterParams(...restOfParams);

    const keys        = paramsObject.keys;
    const weightsArr  = paramsObject.weightsArr;
    const aggregation = paramsObject.aggregation;

    keys.forEach((key) => {
      let nodeAtKey = this.mainHash[key];
      if (nodeAtKey && nodeAtKey.type !== "zset") {
        throw new StoreError("StoreError: value at key is not type sorted set.");
      }
    });

    // initialize interHash with first source sorted set, apply weight
    let interHash = {};
    const firstKeyHash = this.mainHash[keys[0]].val.hash;
    this.touch(keys[0]);
    Object.keys(firstKeyHash).forEach((member) => {
      let weightToApply = (weightsArr.length === 0) ? 1 : weightsArr[0];
      let score = firstKeyHash[member] * weightToApply;
      interHash[member] = score;
    });

    // for each item in interHash check if the next source Hash contains
    // the key, if yes keep in interHash (apply weight and aggregation)
    // otherwise remove from interHash
    keys.slice(1).forEach((key, idx) => {
      let sourceHash = this.mainHash[key].val.hash;
      this.touch(key);

      Object.keys(interHash).forEach((interMember) => {
        let interScore = interHash[interMember];
        if (sourceHash[interMember]) {
          // apply weight and aggregation
          let weightToApply = (weightsArr.length === 0) ? 1 : weightsArr[idx + 1];
          let newScore = this.calcScoreAggr(
                          aggregation,
                          interHash[interMember],
                          (sourceHash[interMember] * weightToApply));
          interHash[interMember] = newScore;
        } else {
          delete interHash[interMember];
        }
      });
    });

    if (this.mainHash[destKey]) {
      this.del(destKey);
    }
    const sortedSet = new CorvoSortedSet();
    const newMainZsetNode = new CorvoNode(destKey, sortedSet, "zset");
    this.mainHash[destKey] = newMainZsetNode;
    this.mainList.append(newMainZsetNode);

    Object.keys(interHash).forEach((member) => {
      sortedSet.add(interHash[member], member);
    });
    this.memoryTracker.nodeCreation(newMainZsetNode);
    this.lruCheckAndEvictToMaxMemory();
    return Object.keys(interHash).length;
  }

  sadd(key, ...members) {
    let nodeAtKey = this.mainHash[key];
    let numAdded = 0;

    if (nodeAtKey === undefined) {
      const newSet = new CorvoSet();
      const newMainNode = new CorvoNode(key, newSet, 'set');
      this.mainHash[key] = newMainNode;
      this.mainList.append(newMainNode);
      nodeAtKey = newMainNode;
      this.memoryTracker.nodeCreation(nodeAtKey);
    } else {
      this.touch(key);
    }
    const set = nodeAtKey.val;

    // only add members that aren't already present in memberHash
    members.forEach((member) => {
      if (set.memberHash[member] === undefined) {
        numAdded += 1;
        set.add(member);
        this.memoryTracker.setAddMember(member);
      }
    });

    return numAdded;
  }

  scard(key) {
    const nodeAtKey = this.mainHash[key];

    if (nodeAtKey !== undefined && nodeAtKey.type === 'set') {
      this.touch(key);
      return nodeAtKey.val.cardinality;
    } else {
      throw new StoreError("StoreError: value at key is not type set.");
    }
  }

  sismember(key, member) {
    const nodeAtKey = this.mainHash[key];

    if (nodeAtKey === undefined) {
      return 0;
    } else if (nodeAtKey.type !== 'set') {
      this.touch(key);
      throw new StoreError("StoreError: value at key is not type set.");
    } else {
      this.touch(key);
      return nodeAtKey.val.memberExists(member) ? 1 : 0;
    }
  }

  spop(key, count) {
    // add node test code to loop
    const nodeAtKey = this.mainHash[key];
    let members = [];
    if (count !== undefined) {
      count = +count;
      if (Number.isNaN(count) || count <= 0) {
        throw new StoreError("StoreError: count is not an integer or out of range");
      }
    }

    if (count === undefined) {
      if (nodeAtKey === undefined) {
        return null;
      } else if (nodeAtKey.type !== 'set') {
        this.touch(key);
        throw new StoreError("StoreError: value at key is not type set.");
      } else {
        this.touch(key);
        const poppedMember = nodeAtKey.val.pop();
        this.memoryTracker.setRemoveMember(poppedMember);
        return poppedMember;
      }
    } else {
      for (let i = 0; i < count; i += 1) {
        members.push(nodeAtKey.val.pop());
      }
      return members;
    }
  }

  srem(key, ...members) {
    const nodeAtKey = this.mainHash[key];

    if (nodeAtKey === undefined) {
      return 0;
    } else if (nodeAtKey.type !== 'set') {
      this.touch(key);
      throw new StoreError("StoreError: value at key is not type set.");
    } else {
      this.touch(key);
      let numDeleted = 0;
      const set = nodeAtKey.val;

      members.forEach((member) => {
        if (this.sismember(key, member)) {
          numDeleted += set.remove(member);
          this.memoryTracker.setRemoveMember(member);
        }
      });

      return numDeleted;
    }
  }

  smembers(key) {
    const nodeAtKey = this.mainHash[key];

    if (nodeAtKey === undefined) {
      return null;
    } else if (nodeAtKey.type !== 'set') {
      this.touch(key);
      throw new StoreError("StoreError: value at key is not type set.");
    } else {
      this.touch(key);
      return nodeAtKey.val.getMembers();
    }
  }

  sunion(...keys) {
    const unionHash = {};
    this.touch(...keys);

    keys.forEach((key) => {
      const nodeAtKey = this.mainHash[key];
      if (nodeAtKey !== undefined && nodeAtKey.type === 'set') {
        Object.keys(nodeAtKey.val.memberHash).forEach((member) => {
          unionHash[member] = true;
        });
      } else if (nodeAtKey !== undefined && nodeAtKey.type !== 'set') {
        throw new StoreError("StoreError: value at key is not type set.");
      }
    });

    return Object.keys(unionHash);
  }

  sinter(...keys) {
    let smallestSet;
    let emptyNodeAtKey = false;

    keys.forEach((key) => {
      const nodeAtKey = this.mainHash[key];

      if (nodeAtKey === undefined) {
        emptyNodeAtKey = true;
      } else if (nodeAtKey.type !== 'set') {
        throw new StoreError("StoreError: value at key is not type set.");
      } else {
        const set = Object.keys(nodeAtKey.val.memberHash);
        if (smallestSet === undefined) {
          smallestSet = set;
        } else if (smallestSet.length > set.length) {
          smallestSet = set;
        }
      }
    });

    if (emptyNodeAtKey) {
      return [];
    }

    return smallestSet.filter((member) => {
      let returnVal = true;
      keys.forEach((key) => {
        const setHash = this.mainHash[key].val.memberHash;

        if (setHash[member] === undefined) {
          returnVal = false;
        }
      });
      return returnVal;
    });
  }

  sdiff(...keys) {
    const allMembers = {};
    const diffMembers = [];

    keys.forEach((key) => {
      const nodeAtKey = this.mainHash[key];

      if (nodeAtKey !== undefined && nodeAtKey.type !== 'set') {
        throw new StoreError("StoreError: value at key is not type set.");
      } else if (nodeAtKey !== undefined) {
        const members = Object.keys(nodeAtKey.val.memberHash);
        members.forEach((member) => {
          if (allMembers[member] !== undefined) {
            allMembers[member] += 1;
          } else {
            allMembers[member] = 1;
          }
        });
      }
    });

    Object.keys(allMembers).forEach((member) => {
      if (allMembers[member] === 1) {
        diffMembers.push(member);
      }
    });

    return diffMembers;
  }

  sunionstore(destination, ...keys) {
    const union = this.sunion(...keys);

    const returnVal = this.sadd(destination, ...union);
    return returnVal;
  }

  sinterstore(destination, ...keys) {
    const intersection = this.sinter(...keys);

    const returnVal = this.sadd(destination, ...intersection);
    return returnVal;
  }

  sdiffstore(destination, ...keys) {
    const intersection = this.sdiff(...keys);

    const returnVal = this.sadd(destination, ...intersection);
    return returnVal;
  }

}

export default Store;

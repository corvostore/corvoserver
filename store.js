import CorvoLinkedList from './corvo_linked_list';
import CorvoNode from './corvo_node';
import MemoryTracker from './memory_tracker';
const DEFAULT_MAX_MEMORY = 104857600; // equals 100MB

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
      this.memoryTracker.incrementMemoryUsed(key, value);
    } else {
      const oldValue = accessedNode.val;
      accessedNode.val = value;
      this.memoryTracker.updateMemoryUsed(key, oldValue, value);
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
    this.memoryTracker.updateMemoryUsed(key, oldValue, value);
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
    this.memoryTracker.incrementMemoryUsed(key, value);
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
    if (accessedNode === undefined) {
      return null;
    }

    this.touch(key);
    const oldValue = accessedNode.val;
    accessedNode.val += valueToAppend;
    this.memoryTracker.updateMemoryUsed(key, oldValue, accessedNode.val);

    this.lruCheckAndEvictToMaxMemory();
    return accessedNode.val.length;
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
    if (accessedNode !== undefined) {
      return accessedNode.val.length;
    }
  }

  strIncr(key) {
    // should we touch if val not number as string?
    function isNumberString(strInput) {
      return ((parseInt(strInput)).toString() === strInput);
    }

    let accessedNode = this.mainHash[key];

    if (accessedNode === undefined) {
      this.setString(key, '0');
      accessedNode = this.mainHash[key];
    } else if (!isNumberString(accessedNode.val)) {
      return null;
    }

    const oldValue = accessedNode.val;
    accessedNode.val = (parseInt(accessedNode.val, 10) + 1).toString();
    this.memoryTracker.updateMemoryUsed(key, oldValue, accessedNode.val);
    this.touch(accessedNode);

    this.lruCheckAndEvictToMaxMemory();
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
      return null;
    }

    const oldValue = accessedNode.val;
    accessedNode.val = (parseInt(accessedNode.val, 10) - 1).toString();
    this.memoryTracker.updateMemoryUsed(key, oldValue, accessedNode.val);
    this.touch(accessedNode);

    this.lruCheckAndEvictToMaxMemory();
  }

  exists(key) {
    return !!this.mainHash[key];
  }

  type(key) {
    // alter after dataType prop added to corvoNode
    return 'string';
  }

  rename(keyA, keyB) {
    // alter after dataType prop and multiple data types added
    const val = this.getString(keyA);
    this.del(keyA);
    this.setString(keyB, val);
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
      throw new Error("StoreError: key does not exist.");
    }
  }

  del(...keys) {
    keys.forEach((key) => {
      const node = this.mainHash[key];
      const val = node.val;
      this.memoryTracker.decrementMemoryUsed(key, val);
      delete this.mainHash[key];
      this.mainList.remove(node);
    });
  }

  lruEvict() {
    const head = this.mainList.head;
    const headKey = head.key;

    this.mainList.remove(head);
    const currentVal = this.mainHash[headKey];
    delete this.mainHash[headKey];
    this.memoryTracker.decrementMemoryUsed(headKey, currentVal);
  }

  lruCheckAndEvictToMaxMemory() {
    while (this.memoryTracker.maxMemoryExceeded()) {
      this.lruEvict();
    }
  }
}

export default Store;

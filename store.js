import CorvoLinkedList from './corvo_linked_list';
import CorvoNode from './corvo_node';

class Store {
  constructor() {
    this.mainHash = {};
    this.mainList = new CorvoLinkedList();
  }

  setString(key, value) {
    const accessedNode = this.mainHash[key];

    if (accessedNode === undefined) {
      const newNode = new CorvoNode(value);
      this.mainHash[key] = newNode;
      this.mainList.append(newNode);
    } else {
      accessedNode.val = value;
      this.touch(accessedNode);
    }
  }

  setStringX(key, value) {
    // only writes if already exists; otherwise, return null
    const accessedNode = this.mainHash[key];

    if (accessedNode !== undefined) {
      accessedNode.val = value;
      this.touch(accessedNode);
    } else {
      return null;
    }
  }

  setStringNX(key, value) {
    // only writes if doesn't exist; otherwise return null
    const accessedNode = this.mainHash[key];

    if (accessedNode === undefined) {
      const newNode = new CorvoNode(value);
      this.mainHash[key] = newNode;
      this.mainList.append(newNode);
    } else {
      return null;
    }
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

    accessedNode.val += valueToAppend;
  }

  touch(key) {
    const accessedNode = this.mainHash[key];
    if (accessedNode !== undefined) {
      this.mainList.remove(accessedNode);
      this.mainList.append(accessedNode);
    }
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

    accessedNode.val = (parseInt(accessedNode.val, 10) + 1).toString();
    this.touch(accessedNode);
  }
}

export default Store;

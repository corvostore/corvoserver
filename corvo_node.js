class CorvoNode {
  constructor(key, val, type="string", prevNode=null, nextNode=null) {
    this.val = val;
    this._prevNode = prevNode;
    this._nextNode = nextNode;
    this.key = key;
    this.type = type;
  }

  get prevNode() {
    return this._prevNode;
  }

  get nextNode() {
    return this._nextNode;
  }

  set prevNode(node) {
    this._prevNode = node;
  }

  set nextNode(node) {
    this._nextNode = node;
  }
}

export default CorvoNode;

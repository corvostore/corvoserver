class CorvoListNode {
  constructor(val, prevNode=null, nextNode=null) {
    this.val = val;
    this._prevNode = prevNode;
    this._nextNode = nextNode;
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

export default CorvoListNode;

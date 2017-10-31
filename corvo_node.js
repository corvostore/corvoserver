class CorvoNode {
  constructor(val, prevNode=null, nextNode=null) {
    this.val = val;
    this.prevNode = prevNode;
    this.nextNode = nextNode;
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

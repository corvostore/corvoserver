class CorvoNode {
  constructor(val, prevNode=null, nextNode=null) {
    this.val = val;
    this.prevNode = prevNode;
    this.nextNode = nextNode;
  }

  get prevNode() {
    return this.getPrevNode;
  }

  get nextNode() {
    return this.getNextNode;
  }

  getPrevNode() {
    return this.prevNode;
  }

  getNextNode() {
    return this.nextNode;
  }

  set prevNode(node) {
    // this.prevNode = node;
  }

  // setPrevNode(node) {
  //   this.prevNode = node;
  // }

  set nextNode(node) {
    // this.nextNode = node;
  }

  // setNextNode(node) {
  //   this.nextNode = node;
  // }
}

export default CorvoNode;

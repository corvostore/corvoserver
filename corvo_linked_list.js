class CorvoLinkedList {
  constructor(inputNode=null) {
    this.head = inputNode;
    this.tail = inputNode;
  }

  append(inputNode) {
    let dummy = this.tail;
    dummy.nextNode = inputNode;
    inputNode.prevNode = dummy;
    this.tail = inputNode;
  }

  prepend(inputNode) {
    let dummy = this.head;
    inputNode.nextNode = dummy;
    this.head = inputNode;
    dummy.prevNode = this.head;
  }
}

export default CorvoLinkedList;

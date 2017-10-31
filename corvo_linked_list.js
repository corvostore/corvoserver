class CorvoLinkedList {
  constructor(inputNode=null) {
    this.head = inputNode;
    this.tail = inputNode;
  }

  append(inputNode) {
    if (this.tail === null) {
      this.head = inputNode;
    } else {
      this.tail.nextNode = inputNode;
      inputNode.prevNode = this.tail;
    }

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

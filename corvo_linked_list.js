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

  remove(inputNode) {
    if (this.head === this.tail) {
      this.head = null;
      this.tail = null;
    } else if (inputNode === this.head) {
      this.head = inputNode.nextNode;
      this.head.prevNode = null;
    } else if (inputNode === this.tail) {
      const tempPrevNode = this.tail.prevNode;
      tempPrevNode.nextNode = null;
      this.tail = tempPrevNode;
    } else {
      const tempPrevNode = inputNode.prevNode;
      const tempNextNode = inputNode.nextNode;
      tempPrevNode.nextNode = tempNextNode;
      tempNextNode.prevNode = tempPrevNode;
    }
  }

  prepend(inputNode) {
    let dummy = this.head;
    inputNode.nextNode = dummy;
    this.head = inputNode;
    dummy.prevNode = this.head;
  }

  lpop() {
    const head = this.head;
    this.remove(head);
    return head;
  }

  rpop() {
    const tail = this.tail;
    this.remove(tail);
    return tail;
  }
}

export default CorvoLinkedList;

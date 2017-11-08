import CorvoListNode from './data_types/corvo_list_node.js';

class CorvoLinkedList {
  constructor(inputNode=null) {
    this.head = inputNode;
    this.tail = inputNode;
    this.length = inputNode ? 1 : 0;
  }

  append(inputNode) {
    if (this.tail === null) {
      this.head = inputNode;
    } else {
      this.tail.nextNode = inputNode;
      inputNode.prevNode = this.tail;
    }

    this.tail = inputNode;
    this.length += 1;
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
    this.length -= 1;
  }

  prepend(inputNode) {
    if (this.length === 0) {
      this.head = inputNode;
      this.tail = inputNode;
    } else {
      let dummy = this.head;
      inputNode.nextNode = dummy;
      this.head = inputNode;
      // dummy.prevNode = this.head;
      dummy.prevNode = inputNode;
    }
    this.length += 1;
  }

  lpop() {
    const head = this.head;
    this.remove(head);
    return head;

    this.length -= 1;
  }

  rpop() {
    const tail = this.tail;
    this.remove(tail);
    return tail;

    this.length -= 1;
  }

  insertBefore(pivot, newVal) {
    // traverse list until curr node's val is equal to pivotVal
    // set prevNode.next to new node containing newVal
    // set new node's next node to current node
    // return new length of list or -1
    let currentNode = this.head;
    while(currentNode) {
      if (currentNode.val === pivot) {
        const newNode = new CorvoListNode(newVal);
        if (currentNode === this.head) {
          this.prepend(newNode);
        } else {
          currentNode.prevNode.nextNode = newNode;
          newNode.prevNode = currentNode.prevNode;
          newNode.nextNode = currentNode;
          currentNode.prevNode = newNode;
          this.length += 1;
        }

        return this.length;
      }
      currentNode = currentNode.nextNode;
    }

    return -1;
  }

  insertAfter(pivot, newVal) {
    // traverse list until curr node's val is equal to pivotVal
    // set currentNode.next to new node containing newVal
    // set new node's prev node to current node
    // return new length of list or -1
    let currentNode = this.head;
    while(currentNode) {
      if (currentNode.val === pivot) {
        const newNode = new CorvoListNode(newVal);
        if (currentNode === this.tail) {
          this.append(newNode);
        } else {
          currentNode.nextNode.prevNode = newNode;
          newNode.nextNode = currentNode.nextNode;
          currentNode.nextNode = newNode;
          newNode.prevNode = currentNode;

          this.length += 1;
        }

        return this.length;
      }
      currentNode = currentNode.nextNode;
    }

    return -1;
  }
}

export default CorvoLinkedList;

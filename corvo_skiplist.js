import CorvoSkipListNode from './corvo_skiplist_node.js';
const MAX_LEVELS = 29;
const STRING_ONE_CHAR_BYTES = 2;
const NUMBER_BYTES = 8;

class CorvoSkipList {
  constructor() {

    // First element of the top level
    this.head = new CorvoSkipListNode(CorvoSkipListNode.negInf);
    // Last element of the top level
    this.tail = new CorvoSkipListNode(CorvoSkipListNode.posInf);

    this.head.right = this.tail;
    this.tail.left = this.head;
    this.memoryUsed = 112; // memory allocated to all skip list nodes

    this.n = 0;
    this.height = 0; // Height of skip list
  }

  findNode(score, member) { // finds skip list node with key that is <= specified key
    let p = this.head; // pointer to head
    while (true) {
      while (p.right.score != CorvoSkipListNode.posInf && p.right.score <= score && p.right.member <= member) {
         p = p.right;         // Move to right
      }

      if (p.down != null) {
        p = p.down;          // Go downwards
      } else {
          break;       // lowest level reached
      }
    }
    return p; // returns node
  }

  get(score, member) { // returns the value associated with a key (or score?)
    let p = this.findNode(score, member);
    if (p.key === key && p.member === member) {
      return p.member;
    }
  }

  insert(score, member) {
    let p = this.findNode(score, member);

    // insert (k, v) after p
    // make a column of (k, v) of random height
    let q = new CorvoSkipListNode(score, member);       // Create a new node with k and v
    this.incrementMemoryForNode(score, member);
     // Insert q into lowest level after p
     q.left = p;
     q.right = p.right;
     p.right.left = q;
     p.right = q;

     // add copy of node q to every upper level up to a random height
     let i = 0;                   // Current level = 0
     while (Math.random() < 0.5 && i < MAX_LEVELS) { // coin toss algo?
       if (i >= this.height) { // if current max height of skip list is reached, add an empty layer to the top
         this.addLayerToSkipList();
       }
       while (p.up === null) { // move pointer left until node has an up pointer, then move p up one level
         p = p.left;
       }
       p = p.up;

       const newUpperLevelNode = new CorvoSkipListNode(score, member);
       this.incrementMemoryForNode(score, member);

       newUpperLevelNode.left = p;
       newUpperLevelNode.right = p.right;
       newUpperLevelNode.down = q;

       p.right.left = newUpperLevelNode;
       p.right = newUpperLevelNode;
       q.up = newUpperLevelNode;

       q = newUpperLevelNode; // make q point to newly created node above it

       i += 1;
     }
     this.n += 1;

     return null;   // No old value
  }

  incrementMemoryForNode(score, member) {
    this.memoryUsed += 64 + (member.length * STRING_ONE_CHAR_BYTES) + NUMBER_BYTES;
  }

  addLayerToSkipList() {
    const p1 = new CorvoSkipListNode(CorvoSkipListNode.negInf);
    const p2 = new CorvoSkipListNode(CorvoSkipListNode.posInf);
    this.memoryUsed += 112;


    p1.right = p2;
    p1.down = this.head;

    p2.left = p1;
    p2.down = this.tail;

    this.head.up = p1;
    this.tail.up = p2;

    this.head = p1;
    this.tail = p2;

    this.height += 1;
  }

  remove(key) {
    let p = this.findNode(key);

    if (p.key !== key) {
      return null;
    }

    while (p !== null) {
      p.left.right = p.right;
      p.right.left = p.left;
      p = p.up;
    }
  }
}

export default CorvoSkipList;

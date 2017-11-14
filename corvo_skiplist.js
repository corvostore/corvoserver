import SkipListNode from './corvo_skiplist_node.js';
const MAX_LEVELS = 29;

class SkipList {

  constructor() {
    // First element of the top level
    this.head = new SkipListNode(SkipListNode.negInf);
    // Last element of the top level
    this.tail = new SkipListNode(SkipListNode.posInf);

    this.head.right = this.tail;
    this.tail.left = this.head;

    this.n = 0;
    this.height = 0; // Height of skip list

    // random value r used to determine height of a newly added node
    this.randomNum = Math.random();
  }

  findNode(key) { // finds skip list node with key that is <= specified key

    let p = this.head; // pointer to head
    while (true) {
      while (p.right.key != SkipListNode.posInf &&
              p.right.key <= key) {
         p = p.right;         // Move to right
      }

      if (p.down != null) {
        p = p.down;          // Go downwards
      }
      else {
          break;       // lowest level reached
      }
    }
    return p; // returns node
  }

  get(key) { // returns the value associated with a key (or score?)
    let p = this.findNode(key);
    if (p.key === key) {
      return p.value;
    }
  }

  insert(key, val) {
    let p = this.findNode(key);
    if (p.key === key) {
      // update value
      p.value = val;
      return p.value;
    }
    // insert (k, v) after p
    // make a column of (k, v) of random height
    let q = new SkipListNode(key, val);       // Create a new node with k and v

     // Insert q into lowest level after p

     q.left = p;
     q.right = p.right;
     p.right.left = q;
     p.right = q;

     // add copy of node q to every upper level up to a random height

     let i = 0;                   // Current level = 0
     console.log("outside while", i);
     while (Math.random() < 0.5 && i < MAX_LEVELS) { // coin toss algo?
       console.log("inside while", i);
       if (i >= this.height) { // if current max height of skip list is reached, add an empty layer to the top
         this.addLayerToSkipList();
       }
       while (p.up === null) { // move pointer left until node has an up pointer, then move p up one level
         p = p.left;
       }
       p = p.up;

       const newUpperLevelNode = new SkipListNode(key, val);
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

  makeCol(k, v) {

  }

  addLayerToSkipList() {
    const p1 = new SkipListNode(SkipListNode.negInf);
    const p2 = new SkipListNode(SkipListNode.posInf);

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

  remove() {

  }


}

export default SkipList;

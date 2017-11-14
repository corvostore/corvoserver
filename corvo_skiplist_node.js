class SkipListNode {
  constructor(key, value, up=null, down=null, left=null, right=null) {
    this.key = key;
    this.value = value;

    this.up = up;
    this.down = down;
    this.left = left;
    this.right = right;
  }
}

SkipListNode.posInf = Number.POSITIVE_INFINITY;
SkipListNode.negInf = Number.NEGATIVE_INFINITY;

export default SkipListNode;

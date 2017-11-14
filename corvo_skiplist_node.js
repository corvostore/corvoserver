class CorvoSkipListNode {
  constructor(score, member, up=null, down=null, left=null, right=null) {
    this.score = score;
    this.member = member;

    this.up = up;
    this.down = down;
    this.left = left;
    this.right = right;
  }
}

CorvoSkipListNode.posInf = Number.POSITIVE_INFINITY;
CorvoSkipListNode.negInf = Number.NEGATIVE_INFINITY;

export default CorvoSkipListNode;

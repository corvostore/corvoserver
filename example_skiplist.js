import SkipListNode from './corvo_skiplist_node';
import SkipList from './corvo_skiplist';


let list = new SkipList();

list.insert("k", "v");
list.insert("k2", "v2");
list.insert("k3", "v3");
list.insert("k4", "v4");

console.log(list.get("k3"));

const EXPLORER = "https://explorer.nemtool.com";

const NG_NODES = [
];

//http://chain.nem.ninja/api3/nodes
const NODES = [
  'https://nem04.symbol-node.com:7891',
  'https://4n.dusanjp.com:7891',
  'https://nis1.dusanjp.com:7891',
  'https://nem01a.symbol-node.com:7891',
  'https://nem03.symbol-node.com:7891',
  'https://2n.dusanjp.com:7891',
  'https://6n.dusanjp.com:7891',
  'https://7n.dusanjp.com:7891',
  'https://nem06.symbol-node.com:7891',
  'https://1n.dusanjp.com:7891',
  'https://orange-pi5.symbol-node.com:7891',
  'https://super-nem.love:7891',
  'https://3n.dusanjp.com:7891',
  'https://11n.dusanjp.com:7891',
  'https://symbol.from.nagoya:7891',
  'https://nem02.symbol-node.com:7891'
].filter(node => !NG_NODES.includes(node));
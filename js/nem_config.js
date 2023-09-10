const EXPLORER = "https://explorer.nemtool.com";

const NG_NODES = [
  "https://nis1.harvestasya.com:7891"
];

//http://chain.nem.ninja/api3/nodes
const NODES = [
  "https://nem03.symbol-node.com:7891",
  "https://nem01a.symbol-node.com:7891",
  "https://nem06.symbol-node.com:7891",
  "https://nem02.symbol-node.com:7891",
  "https://nem04.symbol-node.com:7891",
  "https://symbology.from.nagoya:7891",
  "https://super-nem.love:7891"
].filter(node => !NG_NODES.includes(node));
// const EXPLORER = "https://explorer.nemtool.com";
const EXPLORER = "https://nem-explorer.vercel.app";

const NG_NODES = [
];

//http://chain.nem.ninja/api3/nodes
const NODES = [
  'https://super-nem.love:7891',
  'https://luna2.dusanjp.com:7891',
  'https://wasabisio.tsvr.net:7891',
  'https://sika.dusanjp.com:7891'
].filter(node => !NG_NODES.includes(node));
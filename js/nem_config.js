const EXPLORER = "https://explorer.nemtool.com";

const NG_NODES = [
  "https://nis1.harvestasya.com:7891"
];

//http://chain.nem.ninja/api3/nodes
const NODES = [
  "https://00b21efd.xem.stir-hosyu.com:7891",
  "https://symbolic.from.nagoya:7891",
  "https://super-nem.love:7891",
  "https://nis1.dusan.gq:7891",
  "https://nem-main-1.next-web-technology.com:7891",
  "https://6.dusan.gq:7891",
  "https://2.dusan.gq:7891",
  "https://nis1.p-runner.net:7891",
  "https://1.dusan.gq:7891",
  "https://nis1.harvestasya.com:7891",
].filter(node => !NG_NODES.includes(node));
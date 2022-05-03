import axios from "axios";
import fs from 'fs';

const _peer_url = "http://chain.nem.ninja/api3/nodes";
const nisInfo_version = "0.6.100";
const protcol = "https://";
const port = ":7891";

axios.get(_peer_url)
.then((response) => {
  const nodes = response.data.active_nodes;
  createNodeArray(nodes);
  // config_write(nodes);
})
.catch(function (error) {
  // 取得失敗時
  console.log('取得失敗', error);
})
.then(function () {
  // 取得成功・失敗の処理後に共通で実行
});

/**
 * コンフィグ用ノード配列生成
 * @param {Array} nodes 
 */
 async function createNodeArray(nodes){
  let hosts = [];
  for(let i in nodes){
    const node = nodes[i];
    await axios.get(protcol + node.endpoint.host + port +"/node/info",{timeout: 1200})
    .then((response)=>{
      console.log('SSL OK!!!', node.endpoint.host);
      console.log('Version', node.nisInfo.version);
      console.log(node.nisInfo.version === nisInfo_version);
      if(node.nisInfo.version === nisInfo_version){
        hosts.push(protcol + node.endpoint.host  + port);
      }
    })
    .catch(function (error) {
      // 取得失敗時
      console.log("失敗...");
    })
    .then(function () {
      // 取得成功・失敗の処理後に共通で実行
    });
  };
  config_write(hosts);
  console.log(hosts);
}

/**
 * ファイルへ書き出し
 * @param {Array} nodes 
 */
function config_write(nodes){
  // 同期で行う場合
  try {
      fs.writeFileSync("nodelist.js", JSON.stringify(nodes));
  }catch(e){
    console.log(e);
  }
}
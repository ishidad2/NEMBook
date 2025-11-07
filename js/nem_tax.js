$(async function(){
  let address = "";
	let last_transfer_id;
	let first_harvests_id;
	let sum_income = 0;
  let sum_outcome = 0;

  const getTransfers = (mcnt) => {
    $('#transfers_load').show();
    let index_id = "";
		if(last_transfer_id){
			index_id = "&id=" + last_transfer_id;
		}
    axios.get(node + '/account/transfers/all?address=' + address + index_id)
    .then(function (response){
      parseTransfers(response.data,mcnt);
    })
    .catch(function(err){
      console.log(err);
    })
    .then(function(){
      // always executed
    })
  }
	
  const getHarvests = (mcnt) => {
    $('#harvests_load').show();
    
		let index_id = "";
		if(first_harvests_id){
			index_id = "&id=" + first_harvests_id;
		}
		axios.get(node + "/account/harvests?address=" + address + index_id
		).then(function(result){
			parseHarvests(result.data, mcnt);
		})
    .catch((err)=>{
      console.log(err);
    });
	};

  // === parse ===
  const parseHarvests = (result) => {
		let dataArray = result.data;
    if(dataArray.length === 0){
      $('#harvests_more').hide();
    }

		dataArray.forEach(function(val){

			if(val.totalFee != 0){

				let totalFeeCsv = val.totalFee/1000000;
				let totalFee = dispAmount(val.totalFee);
				let totalFeeJPY = "NO JPY DATA";
				let avgJPY = "NO JPY DATA";
				if(getDate(val.timeStamp) in zaif_ticker){
					avgJPY = zaif_ticker[getDate(val.timeStamp)]
					totalFeeJPY = Math.floor(avgJPY * val.totalFee / 100 ) / 10000;
				}

				$( "#harvests tbody" ).append( "<tr>" +
					"<td>" + dispTimeStamp(val.timeStamp) + "</td>" +
					"<td class='text-right'>" + totalFee + "</td>" +
					"<td class='text-right'>" + totalFeeJPY + "</td>" +
					"<td class='text-right'>" + avgJPY + "</td>" +
				"</tr>" );
				csv_harvest_line += dispTimeStamp(val.timeStamp) +","+totalFeeCsv+","+totalFeeJPY+","+avgJPY+"\r\n";
				csv_harvest_line_cp += dispTimeStamp(val.timeStamp, "/", true) +","+"BONUS,NEMBook,XEM,"+totalFeeCsv+","+avgJPY+",JPY,0,JPY"+"\r\n";
			}
			first_harvests_id = val.id;
		});
    $('#harvests_load').hide();
	};

  const parseTransfers = (result) => {

		let dataArray = result.data;
    if(dataArray.length === 0) {
      $('#transfers_more').hide();
      $('#transfers_load').hide();
      return;
    }

		lastTransferId = result.data[result.data.length - 1].meta.id;

		dataArray.forEach(function(val){
			let meta = val.meta;
			last_transfer_id = meta.id;

			let meta_hash = meta.hash.data;
			let tran = val.transaction;
			let tran_amount = 0;
			let tran_amount_jpy = 0;
			let avg_jpy = 0;
			let tran_fee = tran.fee;
			let tran_type = "";
			let tran_type_csv = "";
			let tran_amount_csv = 0;
			let tran_amount_jpy_csv = 0;
			let outgoing_fee = 0;

			if(tran.type == 4100){

				tran_fee    = tran.otherTrans.fee + tran.fee ;
				tran = tran.otherTrans;
			}

			if (tran.type == 257 || tran.type == 8193 || tran.type == 2049){

				//モザイクが存在した場合
				let has_mosaic = false;
				if(tran.mosaics){

					for(key  in tran.mosaics){
						has_mosaic = true;
						let mosaic = tran.mosaics[key];
						if(mosaic.mosaicId.name == "xem" && mosaic.mosaicId.namespaceId == "nem"){
							tran_amount_jpy = mosaic.quantity;
							tran_amount = mosaic.quantity;
						}
					}
				}
				//通常送金
				if(!has_mosaic){

					if (tran.type == 8193 ){
						tran_amount_jpy = tran.rentalFee;
						tran_amount = tran.rentalFee;

					}else{
						tran_amount_jpy = tran.amount;
						tran_amount = tran.amount;
					}
				}

				let is_appendable = false;

				if(tran.type == 2049){
					sum_outcome = tran_fee;
					tran_type = "<font color='gray'>手数料</font>";
					tran_type_csv = "手数料";
					tran_amount_csv = (tran_fee)/1000000;
					tran_amount = dispAmount(tran_fee);
					tran_amount = "- " + tran_amount;
					is_appendable = true;
					if(getDate(tran.timeStamp) in zaif_ticker){
						avg_jpy = zaif_ticker[getDate(tran.timeStamp)];
						tran_amount_jpy = Math.floor( avg_jpy * tran_fee / 100) / 10000;
						tran_amount_jpy_csv = tran_amount_jpy;
						outgoing_fee = Math.floor( avg_jpy * ( tran_fee) / 100) / 10000;
						tran_amount_jpy = "- " + tran_amount_jpy.toString();
					}else{
						avg_jpy = "NO JPY DATA";
						tran_amount_jpy = "NO JPY DATA";
						tran_amount_jpy_csv = tran_amount_jpy;
					}
				}else	if(address != tran.recipient && tran.signer == account_publicKey){
					sum_outcome += tran_amount + tran_fee;
					tran_type = "<font color='red'>出金</font>";
					tran_type_csv = "出金";
					tran_amount_csv = (tran_amount + tran_fee)/1000000;
					tran_amount = dispAmount(tran_amount + tran_fee);
					tran_amount = "- " + tran_amount;
					is_appendable = true;

					if(getDate(tran.timeStamp) in zaif_ticker){
						avg_jpy = zaif_ticker[getDate(tran.timeStamp)];
						tran_amount_jpy = Math.floor( avg_jpy * (tran_amount_jpy + tran_fee) / 100) / 10000;
						tran_amount_jpy_csv = tran_amount_jpy;
						outgoing_fee = Math.floor( avg_jpy * ( tran_fee) / 100) / 10000;
						tran_amount_jpy = "- " + tran_amount_jpy;
					}else{
						avg_jpy = "NO JPY DATA";
						tran_amount_jpy = "NO JPY DATA";
						tran_amount_jpy_csv = tran_amount_jpy;
					}
				}else if(address == tran.recipient){
					sum_income += tran_amount;
					if(tran.signer == "d96366cdd47325e816ff86039a6477ef42772a455023ccddae4a0bd5d27b8d23" || tran.signer == "4b1451054a825b2501b877ef1eb26e6c1009c5e935851a679f75321123a742db"){
						tran_type = "<font color='green'>SN入金</font>";
						tran_type_csv = "SN入金";
					}else{
						tran_type = "<font color='green'>入金</font>";
						tran_type_csv = "入金";
					}

					tran_amount_csv = tran_amount / 1000000;
					tran_amount = dispAmount(tran_amount);
					tran_amount = "+ " + tran_amount.toString();
					is_appendable = true;
					if(getDate(tran.timeStamp) in zaif_ticker){
						avg_jpy = zaif_ticker[getDate(tran.timeStamp)];
						tran_amount_jpy = Math.floor( avg_jpy * tran_amount_jpy / 100) / 10000;
						tran_amount_jpy_csv = tran_amount_jpy;
						tran_amount_jpy = "+ " + tran_amount_jpy.toString();
					}else{
						avg_jpy = "NO JPY DATA";
						tran_amount_jpy = "NO JPY DATA";
						tran_amount_jpy_csv = tran_amount_jpy;
					}
				}
				if(is_appendable){

					$( "#transfers tbody" ).append( "<tr>" +
						"<td>" + dispTimeStamp(tran.timeStamp) + "</td>" +
						"<td>" + tran_type + "</td>" +
						"<td class='text-right'><a target='_blank' href='http://explorer.nemtool.com/#/s_tx?hash=" + meta_hash + "'>" + tran_amount + "</a></td>" +
						"<td class='text-right'>" + tran_amount_jpy + "</td>" +
						"<td class='text-right'>" + avg_jpy + "</td>" +
						"<td class='text-right'>" + outgoing_fee + "</td>" +
					"</tr>" );
					csv_tran_line += dispTimeStamp(tran.timeStamp) +","+tran_type_csv+","+tran_amount_csv+","+tran_amount_jpy_csv+","+avg_jpy+","+ outgoing_fee+"\r\n";
					csv_tran_line_cp += dispTimeStamp(tran.timeStamp, "/", true) + ","
						+ tran_type_csv + ","
						+ "NEMBook" + ","
						+ "XEM" + ","
						+ tran_amount_csv + ","
						+ avg_jpy + ","
						+ "JPY" + ","
						+ outgoing_fee + ","
						+ "JPY" + "\r\n";
				}
			}
		});
		$("#sum_income").text(dispAmount(sum_income) + "XEM");
		$("#sum_outcome").text(dispAmount(sum_outcome) + "XEM");
    $('#transfers_load').hide();
	}

  // === parse end ===

  const getDate = (timeStamp) => {
		let NEM_EPOCH = Date.UTC(2015, 2, 29, 0, 6, 25, 0);
    let d = dayjs(timeStamp * 1000 + NEM_EPOCH)
		return 	d.format('YYYYMMDD');
	}

  // === main ===
  if (1 < document.location.search.length) {
		let query = document.location.search.substring(1);
		let prms = query.split('&');
		let item = new Object();
		for (let i = 0; i < prms.length; i++) {
			let elm   = prms[i].split('=');
			let idx   = decodeURIComponent(elm[0]);
			let val   = decodeURIComponent(elm[1]);
			item[idx] = decodeURIComponent(val);
		}
		address = item["address"];
	}

  if( !address ){
		let proaddress = prompt('NEMのアドレスを入力してください',address);
		if(!proaddress){
			alert('サンプルアカウントを表示します');
			proaddress = 'NACETR-47STWT-NJSLWY-3JMH45-BLCS5U-L3G5HL-MWR7';
		}
		proaddress = proaddress.replace( /-/g , "" ).toUpperCase();
		proaddress = proaddress.replace(/\s+/g, "");
    console.log(proaddress);
		location.href = "?address=" + proaddress;
	}
	address = address.replace( /-/g , "" ).toUpperCase();
	address = address.replace(/\s+/g, "");
	_address = address


  const result = await getAccount(address);
  if(result.account === undefined){
    alert("アカウント情報が見つかりません。\n入力したアドレスを確認してください。");
    return;
  }

  console.log(result.account);
  console.log("========getAccount===========");
  console.log(result);
  console.log("========getAccount end===========");
  let account = result.account;
  account_balance = account.balance;
  account_balance = 	account_balance.toString();
  account_publicKey = account.publicKey;

  if(account_balance != "0"){
    account_balance = dispAmount(account_balance);
  }else{
    account_balance = "0.000000";
  }
  let account_importance = account.importance * 100000000;
  account_importance = Math.round( account_importance );
  account_importance /= 10000;

  $("#account_address"   ).text(account.address.substring(0,6) + "-" +account.address.substring(6,12) + "-" + account.address.substring(12,18)+"..." );
  $("#account_balance"   ).text(account_balance + "XEM");
  $("#account_importance").text(account_importance);
  $("#transfers_nembex"  ).attr("href", "http://explorer.nemtool.com/#/s_account?account="  + account.address);
  $("#nembook").attr("href", "index.html?address=" + address);
  $("#nembook_logo").attr("href", "index.html?address=" + address);
  $("#nemmessage").attr("href", "nemmessage.html?address=" + address);
  $("#nemgallery").attr("href", "nemgallery.html?address=" + address);

	const token = readToken();

  axios.get("./xem_jpy.json")
	.then(function(res){
    zaif_ticker = res.data;
		getHarvests(10);
	  getTransfers(10);
	})
  .catch(function(err){
    console.log(err);
  });

  // 取引所価格
  axios.get("./last_price.json")
	.then(function(res){
		$("#zaif_lastprice").text( res.data.zaif.last_price + " JPY/XEM");
		$("#coingecko_lastprice").text( res.data.coingecko.last_price + " JPY/XEM");

    var total_price = account.balance / 1000000 * res.data.zaif.last_price;
    $("#total_price").text(total_price + "JPY (" + res.data.zaif.last_price + "JPY/XEM rate)");

	})
  .catch(function(err){
    console.log(err);
  });

  $('#harvests_more').click(function(){getHarvests(25);return false;});
	$('#transfers_more').click(function(){getTransfers(25);return false;});

})
let csv_tran_line = "";
let csv_tran_line_cp = "";
let csv_harvest_line = "";
let csv_harvest_line_cp = "";
// === CSV ===
const tranDownload = () => {
  let bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  let content = '日時,区分,XEM,円換算値,円平均,負担手数料\r\n' + csv_tran_line;
  let blob = new Blob([ bom, content ], { "type" : "text/csv" });
  if (window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(blob, "tran_history.csv");
      // msSaveOrOpenBlobの場合はファイルを保存せずに開ける
      window.navigator.msSaveOrOpenBlob(blob, "tran_history.csv");
  } else {
      document.getElementById("tdownload").href = window.URL.createObjectURL(blob);
  }
}

const tranDownload_cryptact = () => {
  let bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  let content = '日時,種類,ソース,主軸通貨,取引量,価格（主軸通貨1枚あたりの価格）,決済通貨,手数料,手数料通貨,コメント\r\n' + csv_tran_line_cp;
  let blob = new Blob([ bom, content ], { "type" : "text/csv" });
  if (window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(blob, "custom_history.csv");
      // msSaveOrOpenBlobの場合はファイルを保存せずに開ける
      window.navigator.msSaveOrOpenBlob(blob, "custom_history.csv");
  } else {
      document.getElementById("t_2download").href = window.URL.createObjectURL(blob);
  }
}

const harvestsDownload = () => {
  let bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  let content = '日時,XEM,円換算値,円平均\r\n' + csv_harvest_line;
  let blob = new Blob([ bom, content ], { "type" : "text/csv" });
  if (window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(blob, "harvests.csv");
      // msSaveOrOpenBlobの場合はファイルを保存せずに開ける
      window.navigator.msSaveOrOpenBlob(blob, "harvests.csv");
  } else {
      document.getElementById("hdownload").href = window.URL.createObjectURL(blob);
  }
}
const harvestsDownload_cryptact = () => {
	console.log(csv_harvest_line_cp);
  let bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  let content = '日時,種類,ソース,主軸通貨,取引量,価格（主軸通貨1枚あたりの価格）,決済通貨,手数料,手数料通貨,コメント\r\n' + csv_harvest_line_cp;
  let blob = new Blob([ bom, content ], { "type" : "text/csv" });
  if (window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(blob, "custom_harvests.csv");
      // msSaveOrOpenBlobの場合はファイルを保存せずに開ける
      window.navigator.msSaveOrOpenBlob(blob, "custom_harvests.csv");
  } else {
      document.getElementById("h_2download").href = window.URL.createObjectURL(blob);
  }
}

// === CSV end===
var _address = "";
function setToken(){
	var prop = window.prompt('tokenを入力してください','');
	if(prop !== "" && prop !== null){
		saveToken(prop);
	}
}

function readToken(){
	const token = window.localStorage.getItem(_address)
	$("#token").html(token);
	$(".set_token_btn").prop("disabled", false);
	return token;
}

function saveToken(token){
	window.localStorage.setItem(_address, token);
	$("#token").html(token);
	$(".set_token_btn").prop("disabled", true);
	location.reload();
}
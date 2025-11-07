$(async function(){
  let address = "";
	let last_transfer_id;
	let sum_income = 0;
  let sum_outcome = 0;

  const getTransfers = () => {
    var index_id = "";
		if(last_transfer_id){
			index_id = "&id=" + last_transfer_id;
		}
    axios.get(node + '/account/transfers/all?address=' + address + index_id)
    .then(function (response){
      parseTransfers(response.data);
    })
    .catch(function(err){
      console.log(err);
    })
    .then(function(){
      // always executed
    })
  }

	//Txのパース
	const parseTransfers = (result) => {
		var search_word = $("#search_word").val();
		var dataArray = result.data;
    //配列がゼロなら更に読み込むを非表示
    if(dataArray.length === 0) $('#transfers_more').hide();
		dataArray.forEach(function(val){
			var is_hit = true;
			if(search_word != ""){
				is_hit = false;
			}

			var meta = val.meta;
			last_transfer_id = meta.id;

			var meta_hash = meta.hash.data;

			var tran = val.transaction;
			var tran_amount = 0;
			var tran_fee = tran.fee;

			if(tran.type == 4100){

				tran_fee = tran.otherTrans.fee + tran.fee ;
				tran = tran.otherTrans;
			}

			if (tran.type == 257 || tran.type == 8193 ){

				var tran_message = tran.message;
				var plain_text = "";
				if (tran_message && 'payload' in tran_message){

					var o = tran_message.payload;
					if(tran_message.type == '2'){
						plain_text = "[EncryptedMessage]";

					}else if (o && o.length > 2 && o[0] === 'f' && o[1] === 'e') {
						plain_text = "HEX:" + o;
						console.log("HEX: " + o);
					}else{
						try {

							plain_text = escape_html(decodeURIComponent( escape(hex2a(o))));

							if(plain_text.match(search_word)  ){
								if(search_word != ""){
									plain_text = replacer( plain_text, search_word,15);
									is_hit = true;
								}
							}

						} catch (e) {
							console.log(tran_message);
							console.log('invalid text input: ' + tran_message.payload);
						}
					}
				}

				if(is_hit){
					//モザイクが存在した場合
					var has_mosaic = false;
					if(tran.mosaics){
						for(key  in tran.mosaics){
							has_mosaic = true;
							var mosaic = tran.mosaics[key];
							if(mosaic.mosaicId.name == "xem" && mosaic.mosaicId.namespaceId == "nem"){
								tran_amount = mosaic.quantity;
							}
						}
					}

					//通常送金
					if(!has_mosaic){
						if (tran.type == 8193 ){
							tran_amount = tran.rentalFee;

						}else{
							tran_amount = tran.amount;
						}
					}

					var is_appendable = false;
					if(address != tran.recipient && tran.signer == account_publicKey){

						sum_outcome += tran_amount + tran_fee;
						tran_type = "<font color='red'>出金</font>";
						tran_amount = dispAmount(tran_amount + tran_fee);
						tran_amount = "- " + tran_amount;
						is_appendable = true;

					}else if(address == tran.recipient){

						sum_income += tran_amount;
						tran_type = "<font color='green'>入金</font>";
						tran_amount = dispAmount(tran_amount);
						tran_amount = "+ " + tran_amount.toString();
						is_appendable = true;
					}

					if(is_appendable ){
						$( "#transfers tbody" ).append( "<tr>" +
							"<td style='white-space: nowrap'>" + dispTimeStamp(tran.timeStamp) + "</td>" +
							"<td style='white-space: nowrap'>" + tran_type + "</td>" +
							"<td class='text-right' style='white-space: nowrap'><a target='_blank' href='http://explorer.nemtool.com/#/s_tx?hash=" + meta_hash + "'>" + tran_amount + "</a></td>" +
							"<td style='text-align: left'>" + plain_text + "</td>" +
						"</tr>" );
					}
				}
			}
		});
		$("#sum_income").text(dispAmount(sum_income) + "XEM");
		$("#sum_outcome").text(dispAmount(sum_outcome) + "XEM");	
	}

  // === main ===
  //アカウントパラメータ取得
	if (1 < document.location.search.length) {
		var query = document.location.search.substring(1);
		var prms = query.split('&');
		var item = new Object();
		for (var i = 0; i < prms.length; i++) {
			var elm   = prms[i].split('=');
			var idx   = decodeURIComponent(elm[0]);
			var val   = decodeURIComponent(elm[1]);
			item[idx] = decodeURIComponent(val);
		}
		address = item["address"];
	}

  if( !address ){
		var proaddress = prompt('NEMのアドレスを入力してください',address);
		if(!proaddress){
			alert('サンプルアカウントを表示します');
			proaddress = 'NACETR-47STWT-NJSLWY-3JMH45-BLCS5U-L3G5HL-MWR7';
		}
		proaddress = proaddress.replace( /-/g , "" ).toUpperCase();
		proaddress = proaddress.replace(/\s+/g, "");

		location.href = "/xemmessage?address=" + proaddress;
	}
	address = address.replace( /-/g , "" ).toUpperCase();
	address = address.replace(/\s+/g, "");

  const result = await getAccount(address);
  
  if(result.account === undefined){
    alert("アカウント情報が見つかりません。\n入力したアドレスを確認してください。");
    return;
  }

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
  $("#nemtax").attr("href", "nemtax.html?address=" + address);
  $("#nemgallery").attr("href", "nemgallery.html?address=" + address);

  // 取引所価格
  axios.get("/last_price.json")
	.then(function(res){
		$("#zaif_lastprice").text( res.data.zaif.last_price + " JPY/XEM");
		$("#coingecko_lastprice").text( res.data.coingecko.last_price + " JPY/XEM");

    const total_price = account.balance / 1000000 * res.data.zaif.last_price;
    $("#total_price").text(total_price + "JPY (" + res.data.zaif.last_price + "JPY/XEM rate)");
    getTransfers(10);
	})
  .catch(function(err){
    console.log(err);
  });

	$('#transfers_more').click(function(){getTransfers(25);return false;});

  $('#transfers_more').click(function(){getTransfers(25);return false;});
  $('#search_btn').click(function(){
    $('#transfers_more').show();

    $('table#transfers tbody *').remove();
    sum_income = 0;
    sum_outcome = 0;
    lastHash = "";
    lastId = "";
    last_transfer_id = "";

    getTransfers(10);
    return false;
  })
})
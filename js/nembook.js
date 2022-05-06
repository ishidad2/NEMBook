$(async function(){

  const node = NODES[Math.floor(Math.random() * NODES.length)];
  let address = "";
	let last_transfer_id;
	let first_harvests_id;
	let sum_income = 0;
	let sum_outcome = 0;
	let is_last_harvest = true;
  let harvets_flg = false;

  const getAccount = (address) => {
    return new Promise((resolve, reject) => {
      axios
        .get(node + '/account/get?address=' + address)
        .then(response => {
          resolve(response.data)
         })
        .catch(error => reject(error))
    })
  }
  const getTransfers = (mcnt) => {
    var index_id = "";
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

  // === api end ===

  // === parser=== 
  const parseTransfers = (result,mcnt) => {
		var dataArray = result.data;
    //配列がゼロなら更に読み込むを非表示
    if(dataArray.length === 0) $('#transfers_more').hide();
		let cnt = 0;
		dataArray.some(function(val){
			var meta = val.meta;
			last_transfer_id = meta.id;

			var meta_hash = meta.hash.data;
			var tran = val.transaction;
			var tran_amount = 0;
			var tran_fee = tran.fee;

			if(tran.type == 4100){

				tran_fee    = tran.otherTrans.fee + tran.fee ;
				tran = tran.otherTrans;
				console.log(val);

			}

			if (tran.type == 257 || tran.type == 8193 ){

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

				if(address != tran.recipient){
					sum_outcome += tran_amount + tran.fee;
					tran_type = "<font color='red'>out</font>";
					tran_amount = dispAmount(tran_amount + tran.fee);
					tran_amount = "- " + tran_amount;

				}else{
					sum_income += tran_amount;
					tran_type = "<font color='green'>in</font>";
					tran_amount = dispAmount(tran_amount);
					tran_amount = "+ " + tran_amount.toString();
				}

				$( "#transfers tbody" ).append( "<tr>" +
					"<td>" + dispTimeStamp(tran.timeStamp) + "</td>" +
					"<td>" + tran_type + "</td>" +
					"<td class='text-right'><a target='_blank' href='https://explorer.nemtool.com/#/s_tx?hash=" + meta_hash + "'>" + tran_amount + "</a></td>" +
				"</tr>" );

				$("#sum_income" ).text(dispAmount(sum_income ) + "XEM");
				$("#sum_outcome").text(dispAmount(sum_outcome) + "XEM");
			}

			cnt++;
			if(mcnt <= cnt){
				return true;
			}
		});
	}

  const getHarvests = (mcnt) => {

		index_id = "";
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

  const parseHarvests = (result,mcnt) => {
		if (account_meta.remoteStatus != "ACTIVE"){
			if(!harvets_flg) $("#harvests tbody").append( "<tr><td>[status]</td><td>INACTIVE</td></tr>" );
      harvets_flg = true;
		}else{
			var dataArray = result.data;
      //配列がゼロなら更に読み込むを非表示
      if(dataArray.length === 0) $('#harvests_more').hide();
			var cnt = 0;
			dataArray.some(function(val){
				if(is_last_harvest){
					$("#last_harvest").text("[ " + dispTimeStamp(val.timeStamp) + " ] " + dispAmount(val.totalFee) + "XEM");
					is_last_harvest = false;
				}

				if(val.totalFee != 0){

					var totalFee = dispAmount(val.totalFee);
					$( "#harvests tbody" ).append( "<tr>" +
						"<td>" + dispTimeStamp(val.timeStamp) + "</td>" +
						"<td class='text-right'>" + totalFee + "</td>" +
					"</tr>" );
					cnt++;

				}
				first_harvests_id = val.id;

				if(mcnt <= cnt){
					return true;
				}
			});
		}
	};

  // === parser end === 

  // === main ===
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
    console.log(proaddress);
		location.href = "?address=" + proaddress;
	}
	address = address.replace( /-/g , "" ).toUpperCase();
	address = address.replace(/\s+/g, "");

  const result = await getAccount(address);
  
  if(result.account === undefined){
    alert("アカウント情報が見つかりません。\n入力したアドレスを確認してください。");
    return;
  }

  getHarvests(10);
	getTransfers(10);

  var account = result.account;
  account_meta    = result.meta;
  account_balance = account.balance;
  account_balance = 	account_balance.toString();
  if(account_balance != "0"){
    account_balance = dispAmount(account_balance);
  }
  var account_importance = account.importance * 100000000;
  account_importance = Math.round( account_importance );
  account_importance /= 10000;

  $("#full_address").val(address);
  $("#account_balance").text(account_balance + "XEM");
  $("#account_importance").text(account_importance);
  $("#account_importance2").text(account_importance);
  $("#nembook").attr("href", "index.html?address=" + address);
  $("#xemtax").attr("href", "nemtax.html?address=" + address);
  $("#xemmessage").attr("href", "nemmessage.html?address=" + address);
  $("#nemgallery").attr("href", "nemgallery.html?address=" + address);
  $("#openapostille").attr("href", "https://www.openapostille.net/owner/" + address);
  $("#transfers_nembex").attr("href", "https://explorer.nemtool.com/#/s_account?account=" + address);
  $("#account_address").text(
    account.address.substring(0,6)
    + "-" +account.address.substring(6,12)
    + "-" + account.address.substring(12,18)
    +"..."
  );

  // 取引所価格
  axios.get("https://nem.daisan.dev/api/last_price")
	.then(function(res){
		$("#zaif_lastprice").text( res.data.zaif.last_price + " JPY/XEM");
		$("#coingecko_lastprice").text( res.data.coingecko.last_price + " JPY/XEM");

    var total_price = account.balance / 1000000 * res.data.zaif.last_price;
    $("#total_price").text(total_price + "JPY (" + res.data.zaif.last_price + "JPY/XEM rate)");

	})
  .catch(function(err){
    console.log(err);
  });

  $('#harvests_more' ).click(function(){ getHarvests(25);return false;});
	$('#transfers_more').click(function(){getTransfers(25);return false;});

});
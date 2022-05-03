$(async function(){
  const node = NODES[Math.floor(Math.random() * NODES.length)];
  let address = "";
  let lc = "JPY";
  let last_jpy;
	let last_transfer_id;
	let first_harvests_id;
	let sum_income = 0;
	let sum_outcome = 0;
	let is_last_harvest = true;

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
      parseTransfers(result,mcnt);
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
		transfers_node = result.node
		var dataArray = result.transfers.data;
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
		$.ajax({
			url: proxy_harvests,
			type: 'GET',
			data:{
				params: index_id,
				target_address: address,
				node: harvets_node 
			}
		}).then(function(result){
			parseHarvests(result,mcnt);
		});
	};

  const parseHarvests = (result,mcnt) => {
		if (account_meta.remoteStatus != "ACTIVE"){
			if(harvets_node === "" ) $("#harvests tbody").append( "<tr><td>[status]</td><td>INACTIVE</td></tr>" );
		}else{
			var dataArray = result.harvests.data;
			var cnt = 0;
			dataArray.some(function(val){
				console.log(val);
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
		harvets_node = result.node
	};

  // === parser end === 

  const dispTimeStamp = (timeStamp) => {

		var NEM_EPOCH = Date.UTC(2015, 2, 29, 0, 6, 25, 0);
		var d = new Date(timeStamp * 1000 + NEM_EPOCH);
		var strDate =
			date_format( d.getMonth() + 1 )
			+ '/' + date_format( d.getDate() )
			+ '/' + d.getFullYear()
			+ ' ' + date_format( d.getHours() )
			+ ':' + date_format( d.getMinutes() ) ;
		return 	strDate;
	}

	const dispAmount = (amount) => {
		if(amount != 0){
			if(amount < 1000000){

				return "0." + paddingright(amount.toString(),0,6);
			}else{
				var str_amount = amount.toString();
				var r = str_amount.slice(-6);
				var l = str_amount.substring(0,str_amount.length - 6);
				l = l.replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
			}
		}else{
			return "0.000000";
		}
		return l + "." + r;
	}

	const  paddingright = (val,char,n) =>{
		for(; val.length < n; val= char + val);
		return val;
	}

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

  axios.get("https://api.zaif.jp/api/1/last_price/xem_jpy")
	.then(function(res){
		$("#zaif_lastprice").text( res.last_price + " JPY/XEM");
	})
  .catch(function(err){
    console.log(err);
  });

  axios.get("https://api.coingecko.com/api/v3/simple/price?ids=nem&vs_currencies=jpy")
	.then(function(res) {
		$("#coingecko_lastprice").text( res.nem.jpy + " JPY/XEM");
	})
  .catch(function(err){
    console.log(err);
  });

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

});
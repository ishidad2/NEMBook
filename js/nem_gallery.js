$(async function(){

  const node = NODES[Math.floor(Math.random() * NODES.length)];
  const ACCOUNT_MOSAIC_OWNED = "/account/mosaic/owned?address=";
	const NAMESPACE_MOSAIC_DEFINITION = "/namespace/mosaic/definition/page?pageSize=50&namespace=";
  let address ="";
  let imgtarget =0;

  const dispAmount2 = (amount,divisibility) => {
		if(divisibility > 0){
			if(amount < Math.pow(10, divisibility)){
				return "0." + paddingright(amount.toString(),0,divisibility);
			}else{
				var str_amount = amount.toString();
				var r = str_amount.slice(-divisibility);
				var l = str_amount.substring(0,str_amount.length - divisibility);
				l = l.replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
			}
			return l + "." + r;
		}else{
			l = amount.toString().replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
			return l
		}
	}

	const createImgTag = (src,target,comment) => {
		var photo = '<div class="col-md-4 col-sm-6 co-xs-12 gal-item">';
		photo += '<div class="box">';
		photo += '<a href="#" data-bs-toggle="modal" data-bs-target="#modal-'+ target +'">';
		photo += '<img class="img-fluid" src="' + src + '">';
		photo += '</a>';
		photo += '<div class="modal fade" id="modal-'+ target +'" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">';
		photo += '<div class="modal-dialog modal-dialog-centered">';
		photo += '<div class="modal-content">';
		photo += '<div class="modal-body">';
		photo += '<button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">';
		photo += '<span aria-hidden="true">×</span>';
		photo += '</button>';
		photo += '<img class="img-fluid" src="' + src + '">';
		photo += '<div class="col-md-12 description"><h4>' + comment + '</h4></div>';
		photo += '</div>';
		photo += '</div>';
		photo += '</div>';
		photo += '</div>';
		photo += '</div>';
		photo += '</div>';
		photo += '</div>';
		$( "#gallary" ).append( photo );
	}

  function sendAjax(URL){
		return new Promise((resolve, reject) => {
      axios
        .get(node + URL)
        .then(response => {
          resolve(response.data)
         })
        .catch(error => reject(error))
    })
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

  if( address == ""){
    address = prompt('NEMアドレスを入力してください',address);
  }
  address = address.replace( /-/g , "" ).toUpperCase();
	$("#nembook").attr("href", "index.html?address=" + address);
	$("#nembook_logo").attr("href", "index.html?address=" + address);

  sendAjax(ACCOUNT_MOSAIC_OWNED + address).then(function(result){

		console.log(result["data"]);
		console.log("===========");
		var mosaicDictionary = {}
		var dupchkDictionary = {}
		for(let item of result["data"]) {

			console.log("--------------");
			mosaicDictionary[item["mosaicId"]["namespaceId"] + ":"+ item["mosaicId"]["name"]] = item["quantity"];
			if (item["mosaicId"]["namespaceId"] == "nem"){
				imgtarget++;
				createImgTag("https://s3-ap-northeast-1.amazonaws.com/xembook.net/gallery/20170808NEM.jpg",imgtarget,"サンプル画像 by ぷちくん");
//				createImgTag("https://s3.amazonaws.com/open-apostille-nemgallary-production/4f8720a6887f8f907642f6c11227ee90417e5df6401b4f31a0826699bd9af4a5.jpg",imgtarget,"サンプル画像 by ぷちくん");
			}
			sendAjax(NAMESPACE_MOSAIC_DEFINITION  + item["mosaicId"]["namespaceId"]).then(function(result2){

					//console.log(result2["data"]);
					for(let item2 of result2["data"]) {

						console.log(item2);

						var mosaicName = item2["mosaic"]["id"]["namespaceId"] + ":"+ item2["mosaic"]["id"]["name"];
						if (mosaicName in dupchkDictionary){
							continue;
						}
						dupchkDictionary[mosaicName] = true;

						var divisibility = item2["mosaic"]["properties"][0]["value"];
						var quantity = mosaicDictionary[mosaicName];
						var description = item2["mosaic"]["description"];

						console.log("==" + mosaicName + "==");
						console.log(quantity);
						if(typeof quantity !== "undefined" && quantity > 0){

							var owncnt = dispAmount2(quantity,divisibility);
							if(description.indexOf("jpg") > 0 || description.indexOf("png") > 0){
								imgtarget++;
								console.log(mosaicName);
								console.log(divisibility);
								console.log(quantity);

								createImgTag("https://s3-ap-northeast-1.amazonaws.com/xembook.net/gallery/" + description,imgtarget,mosaicName +  " x " + owncnt );
							}else if(description.indexOf("oa:") == 0 ){
								imgtarget++;
									var txhash = description.split(":")[1];
									console.log("*********************");
									createImgTag("https://s3.amazonaws.com/open-apostille-nemgallary-production/" + txhash + ".jpg",imgtarget,mosaicName +  " x " + owncnt );
							}else if(mosaicName == 'tomato:ripe'){
								imgtarget++;
								createImgTag("https://s3-ap-northeast-1.amazonaws.com/xembook.net/gallery/tomato_ripe.jpg",imgtarget,mosaicName +  " x " + owncnt );
							}else if(mosaicName == 'nembear:waribikiken'){
								imgtarget++;
								createImgTag("https://s3-ap-northeast-1.amazonaws.com/xembook.net/gallery/nembear_waribikiken.jpg",imgtarget,mosaicName +  " x " + owncnt );
							}else if(mosaicName == 'nembear:832'){
								imgtarget++;
								createImgTag("https://s3-ap-northeast-1.amazonaws.com/xembook.net/gallery/nembear_832.jpg",imgtarget,mosaicName +  " x " + owncnt );

							}else if(mosaicName == 'puchikun:spthx'){
								imgtarget++;
								createImgTag("https://s3-ap-northeast-1.amazonaws.com/xembook.net/gallery/puchikun_spthx.jpg",imgtarget,mosaicName +  " x " + owncnt );
							}else if(mosaicName == 'nice:art'){
								imgtarget++;
								createImgTag("https://s3-ap-northeast-1.amazonaws.com/xembook.net/gallery/nice_art.jpg",imgtarget,mosaicName +  " x " + owncnt );
							}else if(mosaicName == 'namuyan:nemrin'){
								imgtarget++;
								createImgTag("https://s3-ap-northeast-1.amazonaws.com/xembook.net/gallery/namuyan_nemrin.png",imgtarget,mosaicName +  " x " + owncnt );
							}else if(mosaicName == 'namuyan:nekonium'){
								imgtarget++;
								createImgTag("https://s3-ap-northeast-1.amazonaws.com/xembook.net/gallery/namuyan_nekonium.jpg",imgtarget,mosaicName +  " x " + owncnt );
							}else if(mosaicName == 'kobun:kurofuku'){
								imgtarget++;
								createImgTag("https://s3-ap-northeast-1.amazonaws.com/xembook.net/gallery/kobun_kurofuku.jpg",imgtarget,mosaicName +  " x " + owncnt );
							}else if(mosaicName == 'hi:coin'){
								imgtarget++;
								createImgTag("https://s3-ap-northeast-1.amazonaws.com/xembook.net/gallery/hi_coin.jpg",imgtarget,mosaicName +  " x " + owncnt );
							}else if(mosaicName == 'hi.happy_nem:nem'){
								imgtarget++;
								createImgTag("https://s3-ap-northeast-1.amazonaws.com/xembook.net/gallery/hi_happy_nem_nem.jpg",imgtarget,mosaicName +  " x " + owncnt );
							}else if(mosaicName == 'lovenem:lovenem'){
								imgtarget++;
								createImgTag("https://s3-ap-northeast-1.amazonaws.com/xembook.net/gallery/lovenem_lovenem.jpg",imgtarget,mosaicName +  " x " + owncnt );

							}else if(mosaicName == 'nem_holder:gachiho'){
								imgtarget++;
								createImgTag("https://s3-ap-northeast-1.amazonaws.com/xembook.net/gallery/nem_holder_gachiho.png",imgtarget,mosaicName +  " x " + owncnt );
							}else if(mosaicName == 'hamada:jun'){
								imgtarget++;
								createImgTag("https://s3-ap-northeast-1.amazonaws.com/xembook.net/gallery/hamada_jun.png",imgtarget,mosaicName +  " x " + owncnt );

							}else if(mosaicName == 'nemket.nemket2017:entry'){

								imgtarget++;
								createImgTag("https://s3-ap-northeast-1.amazonaws.com/xembook.net/gallery/nemket_nemket2017_entry.jpg",imgtarget,mosaicName +  " x " + owncnt );
							}else if(mosaicName == 'nemicon:nemic'){

								imgtarget++;
								createImgTag("https://s3.amazonaws.com/open-apostille-nemgallary-production/e2a7a3ded3c31438a1c45f20392522fbe6224328a35dd3d8ecf32bdc07cf5529.jpg",imgtarget,mosaicName +  " x " + owncnt );
							}else{
								console.log("NONONONO" + mosaicName);
							}
						}
					}
			});
		}
	});
});
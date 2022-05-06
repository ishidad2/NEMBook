const node = NODES[Math.floor(Math.random() * NODES.length)];

// === api ===
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

// === api end ===

const dispTimeStamp = (timeStamp) => {
  var NEM_EPOCH = Date.UTC(2015, 2, 29, 0, 6, 25, 0);
		var d = new Date(timeStamp * 1000 + NEM_EPOCH);
		var strDate = d.getFullYear()%100
			+ "-" + date_format( d.getMonth() + 1 )
			+ '-' + date_format( d.getDate() )
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

const date_format = (num) => {
  return ( num < 10 ) ? '0' + num  : num;
};

const  paddingright = (val,char,n) =>{
  for(; val.length < n; val= char + val);
  return val;
}

const escape_html = (string) => {
  if(typeof string !== 'string') {
    return string;
  }
  return string.replace(/[&'`"<>]/g, function(match) { //'
    return {
      '&': '&amp;',
      "'": '&#x27;',
      '`': '&#x60;',
      '"': '&quot;',
      '<': '&lt;',
      '>': '&gt;',
    }[match]
  });
}

const replacer = ( str, word , size ) => {

  var SearchString = '(' + word.replace( ',', '|' ) + ')';
  var RegularExp = new RegExp( SearchString, "g" );
  var ReplaceString = "<span class='right' style='color:red; font-size:" + size + "px; background-color: yellow;'>$1</span>";
  var ResString = str.replace( RegularExp , ReplaceString );
  return ResString;
}

const hex2a = (hexx) => {
  var hex = hexx.toString();
  var str = '';
  for (var i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
};
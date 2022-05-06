const dispTimeStamp = (timeStamp) => {
  var NEM_EPOCH = Date.UTC(2015, 2, 29, 0, 6, 25, 0);
  var d = new Date(timeStamp * 1000 + NEM_EPOCH);
  var strDate =
    date_format(d.getMonth() + 1)
    + '/' + date_format(d.getDate())
    + '/' + d.getFullYear()
    + ' ' + date_format(d.getHours())
    + ':' + date_format(d.getMinutes());
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
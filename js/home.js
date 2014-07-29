/* ------------------------------------------------------------*/
//    Declare MATH for Handlebars
/* ------------------------------------------------------------*/
Handlebars.registerHelper("math", function(lvalue, operator, rvalue, options) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);
        
    return {
        "+": lvalue + rvalue,
        "-": lvalue - rvalue,
        "*": lvalue * rvalue,
        "/": lvalue / rvalue,
        "%": lvalue % rvalue
    }[operator];
});


/* ------------------------------------------------------------*/
//		OAuth 2.0 authorization.
/* ------------------------------------------------------------*/
var tableId = '1Ed8oQjlUZu3taYzbjEhUePlr6Y-7WJnLoazC8Th1';
// var clientId = '620854073277-21qpvpu2sk8k0fb0llvvfcjm8c7o876d.apps.googleusercontent.com';
// var apiKey = 'AIzaSyD4REk101IKAOV0bCRU2ZqLttWDmCdgBmA';
var clientId = '620854073277-qhsnd3l79nkoh8emfkmhce81pp0f6eti.apps.googleusercontent.com';
var apiKey = 'AIzaSyAoFEVwvxeLEZS2sOnckHU2zBPRYPgA-gA';
var scopes = 'https://www.googleapis.com/auth/fusiontables';

var table     = $('#table-striped tbody'),
    NhapKho   = $('#btn-nhapkho'),
    XuatKho   = $('#btn-xuatkho'),
    addPhieu  = $('#btn-taophieumoi'),
    btnLefts  = $('.sidebar'),
    Oclock    = $('.my-date'),
    loading   = $('.loading');

// login to pass authorization
function initialize() {
  gapi.client.setApiKey(apiKey);
  window.setTimeout(function() { auth(false); }, 1);
}

// Run OAuth 2.0 authorization.
function auth(immediate) {
  gapi.auth.authorize({
    client_id: clientId,
    scope: scopes,
    immediate: immediate
  }, function(res){

    // Get user form google api
    var url = "https://www.googleapis.com/oauth2/v1/userinfo?access_token=" + res.access_token;
    $.get(url, function(resp){
      // console.log(resp);
      var user = $('#my-user');

      user.find('span').html(resp.name);
      user.find('img').attr('src', resp.picture);
    });

    // Get data form fusion table
    var sql = 'SELECT rowId,SoChungTu,NgayChungTu,MaThietKe,SoLuong FROM ' + 
              tableId + ' WHERE LoaiChungTu = 0 ORDER BY NgayChungTu DESC LIMIT 50';
    query(sql, 'NhapKho');
  });
}


/* ------------------------------------------------------------*/
//		Events Handling
/* ------------------------------------------------------------*/

// Upload image
var logo = $('.logo-company'),
    file = $('#file');
logo.hover(function(){
  //file.toggleClass('upload-file-on').toggleClass('upload-file-off');
});

function PreviewImage() {
    var oFReader = new FileReader(),
        file = document.getElementById("fileUpload").files[0],
        img  = document.getElementById("imgUploadProfile");

    oFReader.readAsDataURL(file);

    oFReader.onload = function (oFREvent) {
        img.src = oFREvent.target.result;

        
    }
};

// on click Button VIEW, UPDATE
table.on('click', '.view', function() {
  btnClick($(this));
});

table.on('click', '.update', function() {
  alert('updating..');
});

function btnClick(t) {
  var rowId = $(t).attr('data-id');
  var table = $(t).attr('data-table');

  if(table === "NhapKho")
    window.location.href = "showdata.html?id=" + rowId;
  else 
    window.location.href = "showdataxuatkho.html?id=" + rowId;
}

addPhieu.click(function() {
  var row = table.find('tr:first');

  if(row != null) {
    var SCT = $(row).attr('data-id').split('-');
    window.location.href = "nhapkho.html?SCT=" + SCT[2];
  }
  else window.location.href = "nhapkho.html?SCT=000";
});


/* ------------------------------------------------------------*/
//    Request to SELECT data.
/* ------------------------------------------------------------*/
NhapKho.click(function() {

  btnClickHandle($(this), 'NhapKho');
  addPhieu.fadeIn(300);
});


XuatKho.click(function() {

  btnClickHandle($(this), 'XuatKho');
  addPhieu.fadeOut(300);
});


function btnClickHandle(t, call) {
  var sql = 'SELECT rowId,SoChungTu,NgayChungTu,MaThietKe,SoLuong ';

  if(call === 'NhapKho')
    sql += 'FROM ' + tableId + ' WHERE LoaiChungTu = 0 ';
  else 
    sql += 'FROM ' + tableId + ' WHERE LoaiChungTu = 1 ';
            
  sql += 'ORDER BY NgayChungTu DESC LIMIT 50';

  // remove all active
  btnLefts.find('li>button')
            .removeClass('btn-primary')
            .addClass('btn-default');

  // active this
  $(t).toggleClass('btn-default').toggleClass('btn-primary');

  // Get data in server
  query(sql, call);
}


/* ------------------------------------------------------------*/
//    Send an SQL query to Fusion Tables.
/* ------------------------------------------------------------*/
function query(query, call) {
  var lowerCaseQuery = query.toLowerCase();
  var path = '/fusiontables/v1/query';

  var fillTable = function(output) {

  	table.html('');
  	var STT = 0;

  	if(output.rows != null) {
      var row;

      if(call == 'NhapKho')
        row = $("#tbody-template").html();
      else
        row = $("#tbody-template-2").html();

      var template = Handlebars.compile(row);
      // add pend row into table
      table.append(template(output.rows));
  	}
  }

  var callback = function() {
    return function(resp) {
      fillTable(resp);
    };
  }

  if (lowerCaseQuery.indexOf('select') != 0 &&
      lowerCaseQuery.indexOf('show') != 0 &&
      lowerCaseQuery.indexOf('describe') != 0) {

    var body = 'sql=' + encodeURIComponent(query);
    runClientRequest({
      path: path,
      body: body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': body.length
      },
      method: 'POST'
    }, callback());

  } else {
    runClientRequest({
      path: path,
      params: { 'sql': query }
    }, callback());
  }
}

// Execute the client request.
function runClientRequest(request, callback) {
  var restRequest = gapi.client.request(request);
  restRequest.execute(callback);
}

// O'clock
function time() {
   var today = new Date();
   var weekday=new Array(7);
   weekday[0]="Chủ Nhật";
   weekday[1]="Thứ Hai";
   weekday[2]="Thứ Ba";
   weekday[3]="Thứ Tư";
   weekday[4]="Thứ Năm";
   weekday[5]="Thứ Sáu";
   weekday[6]="Thứ Bảy";
   var day = weekday[today.getDay()]; 
   var dd = today.getDate();
   var mm = today.getMonth()+1; //January is 0!
   var yyyy = today.getFullYear();
   var h=today.getHours();
   var m=today.getMinutes();
   var s=today.getSeconds();
   m=checkTime(m);
   s=checkTime(s);
   nowTime = h+":"+m+":"+s;
   if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} today = day+', '+ dd+'/'+mm+'/'+yyyy;

   tmp='<span class="date">'+today+' '+nowTime+'</span>';

   //document.getElementById("clock").innerHTML=tmp;
   Oclock.html(tmp);
   //console.log(tmp);

   clocktime=setTimeout("time()","1000","JavaScript");
   function checkTime(i)
   {
      if(i<10){
        i="0" + i;
      }
      return i;
   }
}

time();
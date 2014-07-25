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

    var url = "https://www.googleapis.com/oauth2/v1/userinfo?access_token=" + res.access_token;
    $.get(url, function(resp){
      // console.log(resp);
      var user = $('#my-user');

      user.find('span').html(resp.name);
      user.find('img').attr('src', resp.picture);
    });

    InsertData(); 
  });
}


/* ------------------------------------------------------------*/
//		Events Handling
/* ------------------------------------------------------------*/
var myDate = new Date();
$('.my-date').html(myDate.getDate() + ' - ' + myDate.getMonth() + ' - ' + myDate.getFullYear());

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
  window.location.href = "nhapkho.html";
});


/* ------------------------------------------------------------*/
//    Request to SELECT data.
/* ------------------------------------------------------------*/
NhapKho.click(function() {
  // select data
  var sql = 'SELECT rowId,SoChungTu,NgayChungTu,MaThietKe,SoLuong FROM ' + 
            tableId + ' WHERE LoaiChungTu = 0';

  btnClickHandle($(this), sql, 'NhapKho');

  // show button Tao Phieu Moi
  addPhieu.fadeIn(300);
});


XuatKho.click(function() {
  // select data
  var sql = 'SELECT rowId,SoChungTu,NgayChungTu,MaThietKe,SoLuong FROM ' + 
            tableId + ' WHERE LoaiChungTu = 1';

  btnClickHandle($(this), sql, 'XuatKho');

	// hide button nhap kho
  addPhieu.fadeOut(300);
});


function btnClickHandle(t, sql, call) {
  // remove all active
  btnLefts.find('li>button').removeClass('btn-primary')
                            .addClass('btn-default');

  // active this
  $(t).toggleClass('btn-default').toggleClass('btn-primary');

  // Get data in server
  query(sql, call);
}

function InsertData() {
  var sql = 'SELECT rowId,SoChungTu,NgayChungTu,MaThietKe,SoLuong FROM ' + 
            tableId + ' WHERE LoaiChungTu = 0';
  query(sql, 'NhapKho');
}


/* ------------------------------------------------------------*/
//    Send an SQL query to Fusion Tables.
/* ------------------------------------------------------------*/
function query(query, call) {
  var lowerCaseQuery = query.toLowerCase();
  var path = '/fusiontables/v1/query';

  var fillTable = function(output) {
    //console.log(output);

  	output = jQuery.parseJSON(output);

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
      var output = JSON.stringify(resp);

      fillTable(output);
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
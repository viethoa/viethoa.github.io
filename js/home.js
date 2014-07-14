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
var clientId = '620854073277-21qpvpu2sk8k0fb0llvvfcjm8c7o876d.apps.googleusercontent.com';
var apiKey = 'AIzaSyD4REk101IKAOV0bCRU2ZqLttWDmCdgBmA';
var scopes = 'https://www.googleapis.com/auth/fusiontables';

var table     = $('#table-striped tbody'),
    NhapKho   = $('#btn-nhapkho'),
    XuatKho   = $('#btn-xuatkho'),
    addPhieu  = $('#btn-taophieumoi'),
    boolXuatNhap = true;

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
  }, InsertData);
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
  var row = $(t).closest('tr');
  console.log(row);

  var tdSoChungTu = $(row).find('td')[1];
  var id = $(tdSoChungTu).html();

  if(boolXuatNhap)
    window.location.href = "showdata.html?id=" + id;
  else 
    window.location.href = "showdataxuatkho.html?id=" + id;
}

addPhieu.click(function() {
  window.location.href = "nhapkho.html";
});


/* ------------------------------------------------------------*/
//    Request to SELECT data.
/* ------------------------------------------------------------*/
NhapKho.click(function() {
  // active this
	$(this).toggleClass('btn-default').toggleClass('btn-primary');
	XuatKho.toggleClass('btn-default').toggleClass('btn-primary');

  // is Nhap Kho
  boolXuatNhap = true;

  // show button Tao Phieu Moi
  addPhieu.fadeIn(300);

  // select data
	InsertData();
});

XuatKho.click(function() {
  // active this
	$(this).toggleClass('btn-default').toggleClass('btn-primary');
	NhapKho.toggleClass('btn-default').toggleClass('btn-primary');

  // is Xuat Kho
  boolXuatNhap = false;

  // hide button nhap kho
  addPhieu.fadeOut(300);

  // select data
	query('SELECT * FROM ' + tableId + ' WHERE LoaiChungTu = 1');			
});

function InsertData() {
  query('SELECT * FROM ' + tableId + ' WHERE LoaiChungTu = 0');
}


/* ------------------------------------------------------------*/
//    Send an SQL query to Fusion Tables.
/* ------------------------------------------------------------*/
function query(query) {
  var lowerCaseQuery = query.toLowerCase();
  var path = '/fusiontables/v1/query';

  var fillTable = function(output) {
    //console.log(output);

  	output = jQuery.parseJSON(output);

  	table.html('');
  	var STT = 0;

  	if(output.rows != null) {
      var row;

      if(boolXuatNhap == true)
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
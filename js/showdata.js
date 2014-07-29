/* ------------------------------------------------------------*/
//		Declare MATH for Handlebars
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
var ChungTu_tableId = '1Ed8oQjlUZu3taYzbjEhUePlr6Y-7WJnLoazC8Th1';
var Coc_tableId = '16S5xV2WhuOzYyr4oNtPuOcq1M2eOkE-JqkwRfXuc';
var clientId = '620854073277-21qpvpu2sk8k0fb0llvvfcjm8c7o876d.apps.googleusercontent.com';
var apiKey = 'AIzaSyD4REk101IKAOV0bCRU2ZqLttWDmCdgBmA';
// var clientId = '620854073277-qhsnd3l79nkoh8emfkmhce81pp0f6eti.apps.googleusercontent.com';
// var apiKey = 'AIzaSyAoFEVwvxeLEZS2sOnckHU2zBPRYPgA-gA';
var scopes = 'https://www.googleapis.com/auth/fusiontables';

var FormChungTu  = $('.form-chung-tu'),
		FormCoc			 = $('#table-coc tbody'),
		loading			 = $('.loading'),
		sum 				 = $('.sum'),
		attrLocation = window.location.search,
		length 			 = attrLocation.length,
		id 					 = attrLocation.substring(4,length),
		CountSend		 = 0,
		CountRes 		 = 0,
		flagFins		 = false;


// login to pass authorization
function initialize() {
  gapi.client.setApiKey(apiKey);
  window.setTimeout(function() { auth(true); }, 1);
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
    GetChungTu();
  });
}


/* ------------------------------------------------------------*/
//		UPDATE STATUS
/* ------------------------------------------------------------*/
function CapNhapTrangThai() {
	loading.fadeIn(300);

	var sql = [];
	sql.push('UPDATE ');
	sql.push(ChungTu_tableId);
	sql.push(' SET LoaiChungTu = 1 WHERE ROWID = ');
	sql.push("'" + id + "'");
	
	query(sql.join(''), 'updateFins');
}


/* ------------------------------------------------------------*/
//		DELETE
/* ------------------------------------------------------------*/
function XoaPhieu() {
	loading.fadeIn(300);
	
	// delete each row on CocChungTu Table with Foreign Key = id
	// var sql = [];
	// sql.push('SELECT ROWID FROM ');
	// sql.push(Coc_tableId);
	// sql.push(' WHERE SoChungTu = ');
	// sql.push("'" + id + "'");
	// query(sql.join(''), 'select', Coc_tableId);

	// delete row in ChungTu (this)
	var sql = [];
			sql.push('DELETE FROM ');
			sql.push(ChungTu_tableId);
			sql.push(' WHERE ROWID = ');
			sql.push("'" + id + "'");

	query(sql.join(''), 'delete');
}



function deletes(res, tableId, finish) {
	second = 0;

	$.each(res.rows, function(key, value){

		setTimeout(function(){			
			var sql = [];
			sql.push('DELETE FROM ');
			sql.push(tableId);
			sql.push(' WHERE ROWID = ');
			sql.push("'" + value[0] + "'");
			query(sql.join(''), 'delete');

			// console.log(sql.join(''));
			// CountSend++;
		}, second);

		second += 2000;
	});

	flagFins = true;
}



/* ------------------------------------------------------------*/
//		Show DATA
/* ------------------------------------------------------------*/
function GetChungTu() {
	// get row CHUNG TU
	var sql = [];
	sql.push('SELECT * FROM ');
	sql.push(ChungTu_tableId);
	sql.push(' WHERE rowId = ');
	sql.push("'" + id + "'");
	query(sql.join(''), 'ChungTu');

	// get table COC
	sql = [];
	sql.push('SELECT * FROM ');
	sql.push(Coc_tableId);
	sql.push(' WHERE SoChungTu = ');
	sql.push("'" + id + "'");
	query(sql.join(''), 'Coc');	
}

function fillData_ChungTu(res) {
	var form = $('#form-chungtu-template').html(),
			template = Handlebars.compile(form);

	FormChungTu.html(template(res.rows[0]));
}

function fillData_Coc(res) {
	var form = $('#form-coc-template').html(),
			template = Handlebars.compile(form);

	FormCoc.html(template(res.rows));

	// change sum row
	sum.html('Tổng: ' + res.rows.length + ' cọc');
}



/* ------------------------------------------------------------*/
//		Send an SQL query to Fusion Tables.
/* ------------------------------------------------------------*/
function query(query, flag, tableId ,finish) {
  var lowerCaseQuery = query.toLowerCase();
  var path = '/fusiontables/v1/query';

  var callback = function() {
    return function(resp) {

      if(resp.rows && flag === 'ChungTu') fillData_ChungTu(resp);

      if(resp.rows && flag === 'Coc') fillData_Coc(resp);

      if(flag === 'delete') {
      	window.location.href = "/";

      	//CountRes++;
      	// console.log(CountSend, CountRes, flagFins);
	      //if(CountRes == CountSend && flagFins == true) {
	      //	window.location.href = "/";
	      //}
      }

      if(flag === 'updateFins') {
      	window.location.href = "/";
      }

      // console.log(resp);
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


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
  });
}


/* ------------------------------------------------------------*/
//		Auto add row when call event enter
/* ------------------------------------------------------------*/
var table = $('#table-striped tbody'),
		sum = $('.sum'),
		content = {STT: 1};

$('#table-striped').on('keypress', '.enterfill', function(e) {
	if(e.which == 13) {
		content.STT++;

		// remove class enterfill
		$(this).toggleClass('enterfill');

		// get template row
		var row = $("#row-template").html();
		var template = Handlebars.compile(row);
		// add pend row into table
		table.append(template(content));

		// activation datetime picker
		table.find('.mydate:last').datetimepicker({
      format: 'dd/MM/yyyy'
    }).data('datetimepicker').setDate((new Date).getTime());

		// change focus
		table.find('.enterfill').focus().val();

		// change sum row
		sum.html('Tổng: ' + content.STT + ' cọc');
	}
});

// Delete a row on Table Event Handle
$('#table-striped').on('click', '.delete', function() {
	$(this).parent().parent().remove();
})


// set current date for datetime picker
$('.mydate').data('datetimepicker').setDate((new Date).getTime());
$('td.mydate').data('datetimepicker').setDate((new Date).getTime());


/* ------------------------------------------------------------*/
//		Request to INSERT data.
/* ------------------------------------------------------------*/
var sochungtu 	= $('#sochungtu'),
		ngaychungtu = $('#ngaychungtu'),
		mathietke 	= $('#mathietke'),
		InsertData 	= $('#InsertData'),
		loading 		= $('.loading'),
		countSend 	= 0,
		countRes		= 0,
		flag				= false;

function initNhapKho() {
	content.STT = 1;
	countSend 	= 0;
	countRes		= 0
	flag				= false;
	
	sum.html('Tổng: ' + content.STT + ' cọc');

	sochungtu.val('');
	$('.mydate').data('datetimepicker').setDate((new Date).getTime());
}

InsertData.click( function() {
	
	if(checkOutData(sochungtu) && checkOutData(ngaychungtu) && checkOutData(mathietke))
	{
		$(this).attr("disabled", true);
		loading.fadeIn(300);

		// insert table: Chứng Tù
		InsertChungTung();

		// insert table: Cọc được sau khi insert xong ChungTu
		// setTimeout(function(){
		// 	InsertCocChungTus();
		// }, 2500);
	}
});

function checkOutData(t) {
	if(t.val() === '') {
		t.focus()
		 .next().fadeIn(300).delay(1500).fadeOut(300);

		return false;
	}
	return true;
}

function InsertChungTung() {
	var insert = [];
	insert.push('INSERT INTO ');
	insert.push(ChungTu_tableId);
	insert.push(' (SoChungTu, NgayChungTu, MaThietKe, SoLuong, LoaiChungTu) VALUES (');
	insert.push("'"+ sochungtu.val() +"',");
	insert.push("'"+ngaychungtu.val()+"',");
	insert.push("'"+mathietke.val()+"',");
	insert.push("'"+content.STT+"', '0' )");
	  
	query(insert.join(''), 'ChungTu');
}

function InsertCocChungTus(rowId) {
	var rows = table.find('tr'),
			second = 0;

	$.each(rows, function(key, row) {
		setTimeout(function() {
		   InsertCocChungTu(row, rowId);
		}, second);

		second += 2000; countSend++;
	});

	flag = true;
}

function InsertCocChungTu(row, rowId) {
	var cols = $(row).find('td');
	var insert = [];

	insert.push('INSERT INTO ');
	insert.push(Coc_tableId);
	insert.push(' (NgaySanXuat, ChieuDai, MSC, SoChungTu, TinhTrang) VALUES (');

	$.each(cols, function(key, col) {
    if(key > 0) {
    	insert.push("'"+ $(col).find('input').val() +"',");
    }
	});

	insert.push("'"+ rowId +"',");
	insert.push("0 )");
	query(insert.join(''));
}


/* ------------------------------------------------------------*/
//		Send an SQL query to Fusion Tables.
/* ------------------------------------------------------------*/
function query(query, call) {
  var lowerCaseQuery = query.toLowerCase();
  var path = '/fusiontables/v1/query';

  var callback = function() {

    return function(resp) {

    	if(call === "ChungTu") {
    		var rowChungTuID = resp.rows[0][0];

    		InsertCocChungTus(rowChungTuID);
    	}      

      // resquet number received
      countRes++;

      // finish Insert
      if((countSend + 1) == countRes && flag === true) {

      	loading.fadeOut(300);
      	InsertData.attr("disabled", false);

      	var row = $("#tbody-template").html();
				var template = Handlebars.compile(row);

				// finish, set table is empty
	      table.html(template());

	      // activation datatime picker
	      table.find('.mydate:last').datetimepicker({
		      format: 'dd/MM/yyyy'
		    }).data('datetimepicker').setDate((new Date).getTime());

	      // setup attributs
	      initNhapKho();
      }
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



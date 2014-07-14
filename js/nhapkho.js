/* ------------------------------------------------------------*/
//		OAuth 2.0 authorization.
/* ------------------------------------------------------------*/
var ChungTu_tableId = '1Ed8oQjlUZu3taYzbjEhUePlr6Y-7WJnLoazC8Th1';
var Coc_tableId = '16S5xV2WhuOzYyr4oNtPuOcq1M2eOkE-JqkwRfXuc';
var clientId = '620854073277-21qpvpu2sk8k0fb0llvvfcjm8c7o876d.apps.googleusercontent.com';
var apiKey = 'AIzaSyD4REk101IKAOV0bCRU2ZqLttWDmCdgBmA';
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

		// change sum row
		sum.html('Tổng: ' + content.STT + ' cọc');
	}
});

$('#table-striped').on('click', '.delete', function() {
	$(this).parent().parent().remove();
})


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
	ngaychungtu.val('');
	mathietke.val('');
}

InsertData.click( function() {
	
	if(checkOutData(sochungtu) && checkOutData(ngaychungtu) && checkOutData(mathietke))
	{
		$(this).attr("disabled", true);
		loading.fadeIn(300);

		// insert table: chứng từ
		InsertChungTung();

		// insert table: cọc chứng từ
		setTimeout(function(){
			InsertCocChungTus();
		}, 2500);
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
	  
	query(insert.join(''));
}

function InsertCocChungTus() {
	var rows = table.find('tr'),
			second = 0;

	$.each(rows, function(key, row) {
		setTimeout(function() {
		   InsertCocChungTu(row);
		}, second);

		second += 2000; countSend++;
	});

	flag = true;
}

function InsertCocChungTu(row) {
	var cols = $(row).find('td');
	var insert = [];

	insert.push('INSERT INTO ');
	insert.push(Coc_tableId);
	insert.push(' (MSC, ChieuDai, NgaySanXuat, SoChungTu, TinhTrang) VALUES (');

	$.each(cols, function(key, col) {
    if(key > 0) {
    	insert.push("'"+ $(col).find('input').val() +"',");
    }
	});

	insert.push("'"+ sochungtu.val() +"',");
	insert.push("0 )");
	query(insert.join(''));
}


/* ------------------------------------------------------------*/
//		Send an SQL query to Fusion Tables.
/* ------------------------------------------------------------*/
function query(query) {
  var lowerCaseQuery = query.toLowerCase();
  var path = '/fusiontables/v1/query';

  var callback = function() {
    return function(resp) {
      var output = JSON.stringify(resp);

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
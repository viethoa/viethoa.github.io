/* ------------------------------------------------------------*/
//		OAuth 2.0 authorization.
/* ------------------------------------------------------------*/
var ChungTu_tableId = '1Ed8oQjlUZu3taYzbjEhUePlr6Y-7WJnLoazC8Th1';
var Coc_tableId = '16S5xV2WhuOzYyr4oNtPuOcq1M2eOkE-JqkwRfXuc';
var HeThongId = '1TRG3TqHDWKekCK7stxR_yRfp7y23PBvYzJnrssOj';
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


// set current date for datetime picker
$('.mydate').data('datetimepicker').setDate((new Date).getTime());
$('td.mydate').data('datetimepicker').setDate((new Date).getTime());


var table = $('#table-striped tbody'),
		sum = $('.sum'),
		content = {STT: 1};

/* ------------------------------------------------------------*/
//		Auto add row when call event enter
/* ------------------------------------------------------------*/
$('#table-striped').on('keypress', '.enterfill', function(e) {
	if(e.which == 13) {
		//Seccion to checkIn value of this
		var val = $(this).val(),
				first = val.substring(0,3);

		if(val.length != 9 || first != "14.") {
			alert('Nhập liệu không đúng !!');
		} 
		else { // Seccion fo auto add row + focus next input
			
			var row = $(this).closest('tr'),
					next = $(row).next();

			// Have a NextRow
			if(next.length == 1) {

				$(next).find('.enterfill').focus();
			}
			else { // Don't have a NextRow

				content.STT++;

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
		}
	}
});


/* ------------------------------------------------------------*/
//		Focus next input.cd-enter-fill + CheckIn value
/* ------------------------------------------------------------*/
$('#table-striped').on('keypress', '.cd-enter-fill', function(e) {
	if(e.which == 13) {

		// Seccion to check value
		var val = $(this).val();
		if(val.length == 0 || parseInt(val) > 99) {

			alert('Nhập liệu không đúng !!');
		}
		else { // Seccion to focus

			var row = $(this).closest('tr'),
					next = $(row).next();

			// Have a NextRow
			if(next.length == 1) {

				$(next).find('.cd-enter-fill').focus();
			}
			else { // Don't have a NextRow

				content.STT++;

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
				table.find('.cd-enter-fill:last').focus();

				// change sum row
				sum.html('Tổng: ' + content.STT + ' cọc');
			}
		}
	}
});


// Delete a row on Table Event Handle
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


// Auto fill So Chung Tu : PNK-0714
var key = parseInt(window.location.search.split('=')[1]) + 1;
var SCT = "PNK-0714-";

if(key < 10) SCT += '00' + key;
else if(key < 100) SCT += '0' + key;
else SCT += key;

sochungtu.val(SCT);


function initNhapKho() {
	content.STT = 1;
	countSend 	= 0;
	countRes		= 0
	flag				= false;
	
	sum.html('Tổng: ' + content.STT + ' cọc');

	// Set SoChungTu value
	key += 1; SCT = "PNK-0714-";
	if(key < 10) SCT += '00' + key;
	else if(key < 100) SCT += '0' + key;
	else SCT += key;
	sochungtu.val(SCT);

	// Setup data table
	var row = $("#tbody-template").html();
	var template = Handlebars.compile(row);
  table.html(template());

  // activation datatime picker
  table.find('.mydate:last').datetimepicker({
    format: 'dd/MM/yyyy'
  }).data('datetimepicker').setDate((new Date).getTime());

	$('.mydate').data('datetimepicker').setDate((new Date).getTime());
}


InsertData.click( function() {
	if(checkOutData(sochungtu) && checkOutData(ngaychungtu) && checkOutData(mathietke))
	{
		// CheckIn value on data table
		var rows = table.find('tr'),
				flag = false;

		$.each(rows, function(key, row) {
			(function(row){
				var inputs 		= $(row).find('td>input'),
						chieudai 	= $(inputs[1]).val(), // ChieuDai is munber => nhập text => this.val() = rỗng
						msc 	 		= $(inputs[2]).val(), 
						first  		= msc.substring(0,3);

				// MSC và ChieuDai == "" => Khong bao loi, nhung k insert
				if(msc == "" && chieudai == "" && content.STT > 0)
					content.STT -= 1;

				else  {
					if(	msc.length != 9 || first != "14." 
						|| parseInt(chieudai) > 99 || chieudai == "") {						
						alert('Nhập liệu không đúng !!');
						flag = true;
						return;
					}
				}
			})(row);
		});

		// Insert data 
		if (flag == false && content.STT != 0) {			
			$(this).attr("disabled", true);
			loading.fadeIn(300);
			// insert table: Chứng Tù
			InsertChungTung();
		}
		else
			alert('Nhập liệu không đúng !!');
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

		second += 2000;
	});

	flag = true;
}

function InsertCocChungTu(row, rowId) {
	var inputs = $(row).find('td>input');

	if($(inputs[1]).val() != "" && $(inputs[2]).val() != "") {
		var insert = [];
		insert.push('INSERT INTO ');
		insert.push(Coc_tableId);
		insert.push(' (NgaySanXuat, ChieuDai, MSC, SoChungTu, TinhTrang) VALUES (');

		$.each(inputs, function(key, input) {
	    insert.push("'"+ $(input).val() +"',");
		});

		insert.push("'"+ rowId +"',");
		insert.push("0 )");

		countSend++;
		query(insert.join(''), "CocChungTu");
	}
}

/* ------------------------------------------------------------*/
//		Send an SQL query to Fusion Tables.
/* ------------------------------------------------------------*/
function query(query, call) {
  var lowerCaseQuery = query.toLowerCase();
  var path = '/fusiontables/v1/query';

  var callback = function() {
    return function(resp) {
    	console.log(resp);

    	if(call === "ChungTu") {
    		var rowChungTuID = resp.rows[0][0];

    		InsertCocChungTus(rowChungTuID);
    	}
    	
    	if(call === "CocChungTu") {
    		// resquet number received
	      countRes++;

	      // finish Insert
	      if((countSend) == countRes && flag === true) {

	      	loading.fadeOut(300);
	      	InsertData.attr("disabled", false);

		      // setup attributs
		      initNhapKho();
	      }
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


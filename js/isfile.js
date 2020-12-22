
/**
 * ファイル存在チェック
 * @param fp ファイルパス
 * @param callback チェック後に呼び出されるコールバック
 */
function is_file(fp,callback){
	
	$.ajax({
		url: fp,
		cache: false
	}).done(function(data) {
		callback(true);
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		callback(false);
	});

}

/**
 * ファイル存在チェック
 * @param fp ファイルパス
 */
function is_file2(fp){
	
	var flg=null;
	
	$.ajax({
		url: fp,
		cache: false,
		async:false
	}).done(function(data) {
		flg=true;
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		flg=false;
	});
	
	return flg;

}
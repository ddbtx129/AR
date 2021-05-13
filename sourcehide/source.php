<?php

/* 直接アクセス禁止設定 */
if($_SERVER["REQUEST_METHOD"] === 'POST'){
    /* 本命のソース
       ※見せたくないソースをここに記載します */
    echo "function HideSource(){

    /* ここから処理を記載する */
    let block = document.createElement('div');
    block.style.height = '40px';
    block.style.width = '40px';
    block.style.background = '#00b5ad';
    block.style.borderRadius = '5px';
    block.style.position = 'fixed';
    block.style.top = '50%';
    block.style.left = '50%';
    document.body.appendChild(block);
    /* ここまで */
};";

}else{
    /* 直接アクセスされた場合のダミー記述 */
    echo 'アクセス……拒否しますっ！！(>_<)';
}

?>
/**
 * [localStorageClient.js]
 */


const LocalStorageClient = function (window) {
    this._windowLocalStorage = window ? window.localStorage : null;
};


LocalStorageClient.prototype._getText = function (keyName) {
    return this._windowLocalStorage ? this._windowLocalStorage.getItem(keyName) : '';
};
LocalStorageClient.prototype._setText = function (keyName, text) {
    if( this._windowLocalStorage ){
        if(text && text.length > 0){
            this._windowLocalStorage.setItem(
                keyName, 
                text
            );    
        }else{
            this._windowLocalStorage.removeItem(keyName);
        }
    }
};


// ToDo: 各種の「識別キー」文字列は、ちゃんと定数で定義しなおすとこ。
LocalStorageClient.prototype.getLocalStoredText = function () {
    return this._getText('TWEETDROP_LOCAL_TEXT');
};
LocalStorageClient.prototype.setLocalStoredText = function (text) {
    this._setText('TWEETDROP_LOCAL_TEXT',text);
};



export { LocalStorageClient as default };




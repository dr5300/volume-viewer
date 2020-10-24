'use strict';

class XMLHttpRequestMeta {
    constructor(openMethod, openUrl, sendBody, responseType, headerName, headerValue) {
        this.openMethod = openMethod;
        this.openUrl = openUrl;
        this.sendBody = sendBody ? sendBody : JSON.stringify({});
        this.responseType = responseType ? responseType : 'json';
        this.headerName = headerName ? headerName : 'Content-Type';
        this.headerValue = headerValue ? headerValue : 'application/json';
    }

}
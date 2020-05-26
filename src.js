// ==UserScript==
// @name         SEO functions for Chrome Dev Tools
// @namespace    http://opensourceseo.org
// @version      0.1
// @description  seo functions for the chrome dev tools console
// @author       David Sottimano @dsottimano
// @include      https://*
// @include      http://*
// @grant        GM_addStyle
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @grant        GM_openInTab
// @noframes
// ==/UserScript==

//main object, attach it to the window so we can call the functions from the devtools console
var seo = {}
unsafeWindow.seo = seo;


//private functions, these are used by the main object but are not callable from the dev tools console
var _privateseo = {}

//creates the button in the bottom right on the page
_privateseo.createDiv = () => {
var body = document.querySelector("body")
var div = document.createElement("div");
var node = document.createTextNode("This is new.");
var button = document.createElement("button");
button.innerHTML = "CSS ON";
body.appendChild(div);
div.appendChild(button);
div.setAttribute("id", "seoscriptdiv");
div.style.cssText = `
position: fixed !important;
right: 2% !important;
bottom: 2% !important;
z-index: 99999999999999 !important;

`
button.setAttribute("id", "seoscript");
button.style.cssText = `
    background: #fff;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    color: #1a73e8;
    cursor: pointer;
    display: inline-block;
    outline: 0;
    overflow: hidden;
    border-radius: 4px;
    border: 1px solid #dadce0;
    -webkit-box-shadow: none;
    box-shadow: none;
    font: 500 10px/30px Google Sans,Noto Sans,Noto Sans JP,Noto Sans KR,Noto Naskh Arabic,Noto Sans Thai,Noto Sans Hebrew,Noto Sans Bengali,sans-serif;
    line-height: 34px;
    `

var seoButton = document.getElementById("seoscript")
seoButton.addEventListener("click", (e)=>{
e.preventDefault();
  if (seoButton.innerHTML == "CSS ON") {
    seo.removeCss()
    seoButton.innerHTML = "CSS OFF";
  } else {
    seoButton.innerHTML = "CSS ON";
    seo.addCss()
  }
})
seoButton.addEventListener("contextmenu", (e)=>{
e.preventDefault();
seoButton.style.visibility = 'hidden';
})

}

_privateseo.arrayToCSV = function (objArray) {
     const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
     let str = `${Object.keys(array[0]).map(value => `"${value}"`).join("\t")}` + '\r\n';

     return array.reduce((str, next) => {
         str += `${Object.values(next).map(value => `"${value}"`).join("\t")}` + '\r\n';
         return str;
        }, str);
 }

_privateseo.clipBoardMessage = "The output has been copied to your clipboard and also displayed below:";

//private functions end


//callable functions start, these are the functions we can use in the dev tools console


seo.info = function () {
console.log('%c 🛠️ SEO Console tools! 🛠️ ', 'background: #222; color: #bada55; font-size:26px;');
console.log("Note: to remove the CSS button on the page, right click on it");
console.group("%c 🔎 Extraction", 'color: red; font-size:16px;');
console.log("seo.getAllLinks(): extracts all links from page and copies to clipboard");
console.log("seo.getInternalLinks(): extracts all internal links from page and copies to clipboard");
console.log("seo.getExternalLinks(): extracts all external links from page and copies to clipboard");
console.log("seo.getHreflang(): extracts all hreflang annotations from page and copies to clipboard");
console.groupEnd();
console.group("%c 🔒 Security", 'color: red; font-size:16px;');
console.log("seo.securityTests(): runs sucuri and https scan in new tabs");
console.groupEnd();
console.group("%c 🤖 Google Tests", 'color: red; font-size:16px;');
console.log("seo.googleTests(): runs mobile friendly, SDTT, and rich results mobile tests in new tabs");
console.log("seo.getRankingFactors(): runs Google NLP against word embeddings to return on-page ranking factors in a new tab");
console.groupEnd();
console.group("%c 🍭 CSS Styling", 'color: red; font-size:16px;');
console.log("seo.removeCss(): removes the injected css from the script");
console.log("seo.addCss(): injects css from the script");
console.groupEnd();
console.group("%c 🕵🏾 Google emulation", 'color: red; font-size:16px;');
console.log("seo.bypassGoogleBlock(): opens new tab through translate proxy");
console.groupEnd();
console.group("%c 🌐 Domain Information", 'color: red; font-size:16px;');
console.log("seo.getDomainInformation(): opens dns, whois and builtwith for the current domain in new tabs");
console.groupEnd();


};

//styling functions start //
seo.removeCss = function () {
    document.getElementById("seoScriptsMainCss").remove();
}


//add your custom css in the css variable below. for example, you can add specific styling for any element here
seo.addCss = ()=>{
    let css = `
    a[rel~=nofollow] {
	text-decoration: underline wavy red !important;
	}
    .shSP {max-width: none !important}';
      `
    let head = document.head || document.getElementsByTagName('head')[0]
    let seoScriptStyle = document.createElement('style');
    seoScriptStyle.setAttribute("id", "seoScriptsMainCss");
    head.appendChild(seoScriptStyle);
    seoScriptStyle.type = 'text/css';
    seoScriptStyle.appendChild(document.createTextNode(css));
}
//styling functions end//



//extraction functions start//

seo.getAllLinks = ()=> {
    let links = [...$x("//a/@href")].map(x=>x.nodeValue) || [];
    if (links.length == 0) return "No links found on this page";
    console.info(_privateseo.clipBoardMessage)
    copy(links.join("\n"))
    return console.table(links);
}

seo.getInternalLinks = ()=> {
    let links = [...$x("//a/@href")].map(x=>x.nodeValue) || []
    var results = [];

    for (var i = 0; i < links.length; i++) {
        !links[i].startsWith("http") ? links[i] = new URL(links[i],window.location.protocol + "//" + window.location.hostname) : links[i] = new URL(links[i])
        if (links[i].hostname == window.location.hostname) results.push(links[i].href)
    }
    console.info(_privateseo.clipBoardMessage)
    copy(results.join("\n"))
    return console.table(results);
}

seo.getExternalLinks = ()=> {
    let links = [...$x("//a/@href")].map(x=>x.nodeValue) || []
    var results = [];

    for (var i = 0; i < links.length; i++) {
        !links[i].startsWith("http") ? links[i] = new URL(links[i],window.location.protocol + "//" + window.location.hostname) : links[i] = new URL(links[i])
        if (links[i].hostname !== window.location.hostname) results.push(links[i].href)
    }
    console.info(_privateseo.clipBoardMessage)
    copy(results.join("\n"))
    return console.table(results);
}

seo.getHreflang = ()=> {
    var hreflangObj = [...$x("//link[@rel='alternate']/@hreflang")].map(x=>x.ownerElement)
    if (hreflangObj.length < 1) return console.log("no hreflang found");
    var results = [];

    for (var i = 0; i < hreflangObj.length; i++) {
       results.push({
       "url" : hreflangObj[i].href,
       "hreflang" : hreflangObj[i].hreflang
       })
    }
    console.info(_privateseo.clipBoardMessage)
    copy(_privateseo.arrayToCSV(results))
    return console.table(results);
}


seo.bypassGoogleBlock = () => {
    GM_openInTab("https://translate.google.com/translate?hl=en&sl=es&tl=en&u="+encodeURIComponent(window.location.href), {"loadInBackground": true})
}

seo.googleTests = () => {
    GM_openInTab("https://search.google.com/test/mobile-friendly?utm_source=gws&utm_medium=onebox&utm_campaign=suit&url="+encodeURIComponent(window.location.href), {"loadInBackground": true})
    GM_openInTab("https://search.google.com/structured-data/testing-tool/u/0/#url="+encodeURIComponent(window.location.href), {"loadInBackground": true})
    GM_openInTab("https://search.google.com/test/rich-results?url="+encodeURIComponent(window.location.href), {"loadInBackground": true})
}

seo.securityTests = () => {
    GM_openInTab("https://sitecheck.sucuri.net/results/"+window.location.href, {"loadInBackground": true})
    GM_openInTab("https://www.sslshopper.com/ssl-checker.html#"+window.location.hostname, {"loadInBackground": true})

}

seo.getRankingFactors = () => {
    window.location = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}

seo.getDomainInformation = () => {
GM_openInTab("https://whois.domaintools.com/"+encodeURIComponent(window.location.hostname), {"loadInBackground": true})
GM_openInTab("https://spyonweb.com/"+encodeURIComponent(window.location.hostname), {"loadInBackground": true})
GM_openInTab("https://builtwith.com/?"+encodeURIComponent(window.location.hostname), {"loadInBackground": true})

}

//on window load, i.e. when the page finishes loading, let's start some functions

//create the button
_privateseo.createDiv();
//add the css stylesheet
seo.addCss()
//send the console menu to the dev tools console
seo.info()





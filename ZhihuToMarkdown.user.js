// ==UserScript==
// @name         ZhihuToMarkdown
// @namespace    http://github.com/JiaHui-Nie/ZhihuToMarkdown
// @version      1.0
// @description  Download zhihu passage to markdown.
// @author       JiaHui-Nie
// @match        https://zhuanlan.zhihu.com/p/*
// @icon         https://weibo.iiilab.com/favicon.ico
// @grant        GM_download
// ==/UserScript==

function ParseElement(element) {
    let text = "";
    Array.from(element.childNodes).forEach(child => {
        text += ParseElement(child);
    })
    switch (element.nodeName) {
        case "H1":
            return "# " + text + "\n";
        case "H2":
            return "## " + text + "\n";
        case "H3":
            return "### " + text + "\n";
        case "H4":
            return "#### " + text + "\n";
        case "H5":
            return "##### " + text + "\n";
        case "H6":
            return "###### " + text + "\n";
        case "#text":
            return element.nodeValue;
        case "BR":
            return "\n";
        case "HR":
            return "\n---\n";
        case "IMG":
            if (element.classList.contains("ztext-gif")){
                // wait to done
            }
            return "![](" + element.getAttribute("src") + ")\n";
        case "A":
            if (element.classList.contains("external")) {
                return "[" + text + "](" + element.getAttribute("href") + ")";
            }
            if (element.classList.contains("LinkCard")) {
                return "[" + element.getAttribute("data-text") + "](" + element.getAttribute("href") + ")";
            }
            return text;
        case "B":
            return "**" + text.trim() + "**";
        case "BLOCKQUOTE":
            return " > " + text.replaceAll("\n", "\n > ");
        case "P":
            return text+"\n\n";
        case "OL":
            for (let i = 1; text.indexOf(" - ") != -1; i++) {
                text = text.replace(" - ", String(i) + '. ');
            }
            return "\n" + text + "\n";
        case "UL":
            return "\n" + text + "\n";
        case "LI":
            return " - " + text + "\n";
        case "FIGCAPTION":
            return "<center>" + text + "</center>\n";
        case "CODE":
            if (element.classList.length){
                return "```" + element.classList[0].replaceAll("language-", "") + "\n" + element.innerText + "\n```\n";
            }
            else{
                return "`"+element.innerText+"`";
            }
        case "SPAN":
            if (element.classList.contains("ztext-math")) {
                return "$" + element.getAttribute("data-tex") + "$";
            }
            return text;
        case "DIV":
            if (element.classList.contains("GifPlayer-icon")){
                return "";
            }
            return text;
        case "PRE":
            return text;
        case "FIGURE":
            return text;
        case "svg":
            if (element.classList.contains("ZDI")) {
                return "";
            }
            return text;
        default:
            console.log("!!!Could not save: ");
            console.log(element);
            return element.innerHTML;
    }
}

function DownloadMarkdown() {

    let title_object = document.getElementsByClassName("Post-Title")[0];
    var title = title_object.textContent;

    let content_object = document.getElementsByClassName("Post-RichText")[0];
    var text = ParseElement(content_object);

    var file = new Blob([text], { type: "text/plain", });
    GM_download({ url: file, name: title, savaAs: true });
}

(function () {
    'use strict';

    let author = document.getElementsByClassName("Post-Author")[0];

    var button = document.createElement('button');
    button.innerHTML = '保存';
    button.classList.add("Button", "FollowButton", "Button--blue");
    button.style.marginLeft = '25px';
    button.addEventListener('click', DownloadMarkdown);

    author.appendChild(button);
})();
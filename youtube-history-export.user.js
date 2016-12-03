// ==UserScript==
// @name        Youtube History Export
// @namespace   clyvari
// @include     https://www.youtube.com/*
// @version     1.0.0
// @grant       none
// ==/UserScript==

/// <reference path="typings/youtube-history-export.d.ts" />

(() =>
{
  /**
   * @param {[clyvari.KeyValueType]} objectArray
   */
  var Objects2TSV = objectArray =>
  {
    var tsv = "";
    var separator="\t";
    if(!objectArray || objectArray.length < 1) { return tsv; }
    
    var headers = Object.keys(objectArray[0]);
    tsv+= headers.join(separator);
    objectArray.forEach(row =>
    {
      /** @type {[ValueType]} */
      var cols = [];
      headers.forEach(h => cols.push(row[h] || ""));
      tsv += "\n" + cols.join(separator);
    });
    return tsv;
  };
  
  /**
   * @param {Element} element
   */
  var FormatAsYoutubeButton = element => { element.className = "yt-uix-button yt-uix-button-size-default yt-uix-button-default"; return element; }
  
  /**
   * @param {Node} headerList
   */
  var CreateSectionHeaderListEntry = headerList => headerList.appendChild(document.createElement('li'));
  
  /**
   * @param {Element} vidsListPtr
   */
  var RetrieveVidsInfo = vidsListPtr =>
  {
    /** @type {[clyvari.YoutubeHistoryExport.HistoryEntry]} */
    var vidsList = [];
    do
    {
      var content = vidsListPtr.getElementsByClassName('yt-lockup-content');
      if(!content || content.length < 1) { continue; }

      var vidInfoBlock = content[0].firstElementChild;
      var vidLinkElem = vidInfoBlock.getElementsByTagName('a')[0];
      var userLinkElem = vidInfoBlock.nextElementSibling.getElementsByTagName('a')[0];
      
      vidsList.push({title: vidLinkElem.title, url: vidLinkElem.href, user: userLinkElem.href});
      
    } while( (vidsListPtr = vidsListPtr.nextElementSibling) !== null)
    return vidsList;
  }
  
  /**
   * @param {any} data
   * @param {string} type
   */
  var GetDownloadableURL = (data, type) => URL.createObjectURL(new Blob([data], {type: type}));
  
  /**
   * @callback LinkFormatterCallback
   * @param {Element} element
   */

  /**
   * @param {string} url
   * @param {string} title
   * @param {string} name
   * @param {HTMLElement} location
   * @param {clyvari.YoutubeHistoryExport.LinkFormatterCallback} LinkFormatter
   * @param {boolean} autoDl
   * @param {boolean} remove
   */
  var StartDownload = (url, title, name, location, LinkFormatter, autoDl = false, remove = false) =>
  {
    var dataLink = document.createElement('a');
    LinkFormatter(dataLink);
    
    dataLink.href = url;
    dataLink.download = name;
    
    autoDl = autoDl || !location;
    location = location || document.body;
    title = autoDl ? "" : title;
    
    dataLink.title = title;
    dataLink.textContent = title;
    
    location.appendChild(dataLink);
    if(autoDl) { dataLink.click(); }
    if(remove)
    {
      setTimeout(() =>
      {
        location.removeChild(dataLink);
        window.URL.revokeObjectURL(url);
      }, 100);
    }
  }
  
  var PageLoadHandler = () =>
  {
    if(location.pathname !== '/feed/history') { return; }

    var vidsListHeader = document.getElementById('browse-items-primary')
                                   .firstElementChild // ol.section-list-*
                                   .firstElementChild //
                                   .firstElementChild // ol.item-section-*
                                   .firstElementChild // item-section-header
                                   ;
    var vidsListPtr = vidsListHeader.nextElementSibling; // first list item
    var dlLinkLocation = CreateSectionHeaderListEntry(vidsListHeader.firstElementChild /* ul container */);


    StartDownload(GetDownloadableURL(Objects2TSV(RetrieveVidsInfo(vidsListPtr))
                                        ,"text/tab-separated-values"
                                       )
                   , "Download Youtube History"
                   , 'youtube_history_data.tsv'
                   , dlLinkLocation
                   , FormatAsYoutubeButton
                  );
                  
  }
  
  window.addEventListener("spfdone", PageLoadHandler);
  document.addEventListener("DOMContentLoaded", PageLoadHandler);
})();

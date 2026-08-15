// Fetch albums JSON and populate album section with fallback data and graceful error handling
(function(){
  function qs(id){ return document.getElementById(id); }

  // Minimal fallback data used when fetch() is blocked (file:// CORS).
  var defaultData = {
    albums: [
      {
        id: 'araym',
        storageDir: 'ARAYM',
        title: 'A Ride Across Your Mind',
        releaseDate: 'January 25th, 2019',
        releaseDate_fr: '25 janvier 2019',
        image: 'img/albums/A Ride Across Your Mind.jpg',
        bandcamp: { embedSrc: '', link: '' },
        downloads: { mp3: [], flac: [], lyrics: null }
      }
    ]
  };

  function tryParseInline(){
    try{
      var el = document.getElementById('albums-data');
      if(!el) return null;
      return JSON.parse(el.textContent || el.innerText || '{}');
    }catch(e){ return null; }
  }

  function safeJoin() {
    return Array.prototype.slice.call(arguments).filter(Boolean).join('/').replace(/\\/g,'/').replace(/\/\/+/g,'/');
  }

  function buildHref(base, album, fileHref){
    if(!fileHref) return '';
    // if absolute URL or starts with a leading slash or already under audio/, return as-is
    if(/^(https?:)?\/\//.test(fileHref) || fileHref.indexOf('/') === 0 || fileHref.indexOf('audio/') === 0) return fileHref;
    var dir = album.storageDir || album.id || '';
    if(base) return safeJoin(base, dir, fileHref);
    return safeJoin(dir, fileHref);
  }

  function renderDownloads(album, data){
    var dl = album.downloads || {};
    var html = '<div class="album-download-list">';
    if(Array.isArray(dl.flac) && dl.flac.length){
      html += '<div class="download-section"><strong>FLAC</strong><br/>';
      dl.flac.forEach(function(f){ var href = buildHref(data.storageBase, album, f.href); html += '<a class="download-link" target="_blank" href="'+href+'" download>'+ (f.name || f.href) +'</a><br/>'; });
      html += '</div>';
    }
    if(Array.isArray(dl.mp3) && dl.mp3.length){
      html += '<div class="download-section mt-2"><strong>MP3</strong><br/>';
      dl.mp3.forEach(function(f){ var href = buildHref(data.storageBase, album, f.href); html += '<a class="download-link" target="_blank" href="'+href+'" download>'+ (f.name || f.href) +'</a><br/>'; });
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderAlbumCard(album, data, index){
    var lang = document.documentElement.lang || 'en';
    var date = (lang.indexOf('fr') === 0 && album.releaseDate_fr) ? album.releaseDate_fr : album.releaseDate || '';
    var imgSrc = album.image || 'img/albums/placeholder.png';
    var reverseClass = (index % 2 === 1) ? ' album-item-reverse' : '';

    var bandcampHTML = '';
    if(album.bandcamp && album.bandcamp.embedSrc){
      // embedded player (height controlled by CSS)
      bandcampHTML = '<div class="mt-2 album-bandcamp-embed"> <iframe style="border:0;width:100%;" src="'+album.bandcamp.embedSrc+'" seamless></iframe></div>';
    }

    var downloadsHTML = renderDownloads(album, data);
    var dl = album.downloads || {};

    var langKey = (lang.indexOf('fr') === 0) ? 'fr' : 'en';
    var ctaLabel = (langKey === 'fr') ? 'Écouter' : 'Listen';
    var ctaLink = (album.bandcamp && album.bandcamp.link) ? album.bandcamp.link : (album.url || '#');
    var lyricsLabel = (langKey === 'fr') ? 'Paroles' : 'Lyrics';
    var downloadLabel = (langKey === 'fr') ? 'Fichiers audio FLAC et MP3 disponibles ici' : 'Flac and MP3 audio files available here';

    var html = '';
    html += '<article class="album-item'+reverseClass+'">';
    html += '<div class="album-image">';
    html += '<a href="'+(ctaLink||'#')+'" target="_blank" rel="noopener">';
    html += '<img src="'+imgSrc+'" alt="'+(album.title||'')+'">';
    html += '</a>';
    html += '</div>';

    html += '<div class="album-content">';
    html += '<h3>'+(album.title||'')+'</h3>';
    html += '<p class="text-muted">'+date+'</p>';
    html += '<div class="album-inner-row">';
    // prepare player content, possibly including download/lyrics buttons beneath
    var playerContent = (bandcampHTML || '');
    var downloadsColumn = '';
    var downloadButtonHTML = '';
    var lyricsButtonHTML = '';
    // Read downloads info from data file (localized labels, single href). Fallback to legacy album.downloadLink.
    var downloadHref = '';
    var downloadLabelText = downloadLabel;
    if(album.downloads){
      downloadHref = album.downloads.href || '';
      if(album.downloads.label){
        if(typeof album.downloads.label === 'object'){
          downloadLabelText = album.downloads.label[langKey] || album.downloads.label.en || downloadLabel;
        } else {
          downloadLabelText = album.downloads.label;
        }
      }
    } else if(album.downloadLink){
      if(typeof album.downloadLink === 'object'){
        downloadHref = album.downloadLink[langKey] || album.downloadLink.en || album.downloadLink.fr || '';
      } else {
        downloadHref = album.downloadLink;
      }
    }
    if(downloadHref){
      downloadButtonHTML = '<a class="btn btn-outline-primary btn-block" href="'+downloadHref+'" target="_blank" rel="noopener">'+downloadLabelText+'</a>';
    }

    // Prefer album.lyrics.href with localized name, then legacy structures
    var lyricsHref = '';
    var lyricsName = lyricsLabel;
    if(album.lyrics){
      if(album.lyrics.href){
        lyricsHref = album.lyrics.href;
        if(album.lyrics.name){
          if(typeof album.lyrics.name === 'object'){
            lyricsName = album.lyrics.name[langKey] || album.lyrics.name.en || lyricsLabel;
          } else {
            lyricsName = album.lyrics.name;
          }
        }
      } else if(album.lyrics[langKey] && album.lyrics[langKey].href){
        // backward-compat: per-locale lyric objects
        lyricsHref = album.lyrics[langKey].href;
        lyricsName = album.lyrics[langKey].name || lyricsLabel;
      }
    }
    if(!lyricsHref && album.downloadLyricsLink){
      lyricsHref = album.downloadLyricsLink;
      lyricsName = lyricsLabel;
    }
    if(!lyricsHref && dl.lyrics && dl.lyrics.href){
      lyricsHref = buildHref(data.storageBase, album, dl.lyrics.href);
      lyricsName = (dl.lyrics && dl.lyrics.name) ? dl.lyrics.name : lyricsLabel;
    }
    if(lyricsHref){
      lyricsButtonHTML = '<a class="btn btn-outline-primary btn-block btn-lyrics" href="'+lyricsHref+'" target="_blank" rel="noopener">'+lyricsName+'</a>';
    }

    if(downloadHref){
      playerContent += downloadButtonHTML + lyricsButtonHTML;
      // render player column (center) with buttons below
      html += '<div class="album-player flex-grow-1">' + playerContent + '</div>';
    } else {
      // render player column
      html += '<div class="album-player flex-grow-1">' + playerContent + '</div>';
      // right: downloads accordion (only if there are per-file lists)
      downloadsColumn = '';
      if(downloadsHTML && downloadsHTML.trim() !== '<div class="album-download-list"></div>'){
        downloadsColumn = '<div class="album-downloads" style="min-width:220px;">'+ downloadsHTML +'</div>';
      }
      if(lyricsButtonHTML) downloadsColumn += lyricsButtonHTML;
      if(downloadsColumn) html += downloadsColumn;
    }
    html += '</div>';

    html += '</div>';
    html += '</article>';
    return html;
  }

  // fetch JSON and render all albums/recordings
  // If a JS-provided global exists (preferred for file:// usage), use it first
  if(window.ALBUMS_DATA){
    var data = window.ALBUMS_DATA;
    var container = qs('recordings-grid');
    if(container){
      var items = (data && data.albums && data.albums.slice()) || [];
      var html = '';
      items.forEach(function(a, i){ html += renderAlbumCard(a, data, i); });
      container.innerHTML = html;
    }
  } else {
    fetch('js/albums-data.json')
      .then(function(res){ if(!res.ok) throw new Error('Status '+res.status); return res.json(); })
      .then(function(data){
        var container = qs('recordings-grid');
        if(!container) return;
        var items = (data && data.albums && data.albums.slice()) || [];
        var html = '';
        items.forEach(function(a, i){ html += renderAlbumCard(a, data, i); });
        container.innerHTML = html;
      })
      .catch(function(err){
        console.warn('albums.js: failed to load albums JSON (likely file:// CORS). Trying inline JSON or fallback.', err);
        var data = tryParseInline() || defaultData;
        var container = qs('recordings-grid');
        if(!container) return;
        var items = (data && data.albums && data.albums.slice()) || [];
        var html = '';
        items.forEach(function(a, i){ html += renderAlbumCard(a, data, i); });
        container.innerHTML = html;
      });
  }

})();

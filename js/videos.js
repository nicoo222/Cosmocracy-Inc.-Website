(function ($) {
  "use strict";

  function getLanguage() {
    var language = document.documentElement.getAttribute("lang") || "en";
    return language.toLowerCase().indexOf("fr") === 0 ? "fr" : "en";
  }

  function getText(value, language) {
    if (typeof value === "string") {
      return value;
    }

    return value[language] || value.en || "";
  }

  function createVideoItem(video, index, language, useDirectLink) {
    var modalId = "video-modal-" + (index + 1);
    var title = getText(video.title, language);
    var closeLabel = language === "fr" ? "Fermer" : "Close";
    var embedUrl = "https://www.youtube.com/embed/" + video.youtubeId;
    var watchUrl = "https://www.youtube.com/watch?v=" + video.youtubeId;

    if (useDirectLink) {
      return [
        '<div class="col-lg-4 col-md-6 mb-4">',
        '<a class="video-thumb" href="' + watchUrl + '" target="_blank" rel="noopener" aria-label="' + title + '">',
        '<img class="img-fluid z-depth-1 img-link" src="' + video.thumbnail + '" alt="' + title + '">',
        "</a>",
        "</div>"
      ].join("");
    }

    return [
      '<div class="col-lg-4 col-md-6 mb-4">',
      '<button type="button" class="video-thumb" data-toggle="modal" data-target="#' + modalId + '" aria-label="' + title + '">',
      '<img class="img-fluid z-depth-1 img-link" src="' + video.thumbnail + '" alt="' + title + '">',
      "</button>",
      '<div class="modal fade video-modal" id="' + modalId + '" tabindex="-1" role="dialog" aria-hidden="true">',
      '<div class="modal-dialog modal-lg" role="document">',
      '<div class="modal-content">',
      '<div class="modal-body mb-0 p-0">',
      '<div class="embed-responsive embed-responsive-16by9 z-depth-1-half">',
      '<iframe class="embed-responsive-item" title="' + title + '" data-src="' + embedUrl + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
      "</div>",
      "</div>",
      '<div class="modal-footer justify-content-center">',
      '<span class="h4 text-center text-muted">' + title + "</span>",
      '<button type="button" class="btn btn-outline-primary btn-rounded btn-md ml-4" data-dismiss="modal">' + closeLabel + "</button>",
      "</div>",
      "</div>",
      "</div>",
      "</div>",
      "</div>"
    ].join("");
  }

  function renderVideos() {
    var container = $("#videos-grid");
    if (!container.length || !window.COSMO_VIDEOS) {
      return;
    }

    var language = getLanguage();
    var useDirectLink = window.location.protocol === "file:";
    container.html(window.COSMO_VIDEOS.map(function (video, index) {
      return createVideoItem(video, index, language, useDirectLink);
    }).join(""));

    if (useDirectLink) {
      return;
    }

    $(".video-modal").on("show.bs.modal", function () {
      var iframe = $(this).find("iframe");
      iframe.attr("src", iframe.data("src"));
    });

    $(".video-modal").on("hidden.bs.modal", function () {
      $(this).find("iframe").attr("src", "");
    });
  }

  $(document).ready(renderVideos);
})(jQuery);

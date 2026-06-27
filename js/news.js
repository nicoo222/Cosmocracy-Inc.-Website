(function ($) {
  "use strict";

  function getLanguage() {
    var language = document.documentElement.getAttribute("lang") || "en";
    return language.toLowerCase().indexOf("fr") === 0 ? "fr" : "en";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function createNewsDate(news) {
    if (!news.month && !news.date) {
      return "";
    }

    return [
      '<div class="post-date">',
      '<span class="month">' + escapeHtml(news.month) + "</span>",
      '<span class="date">' + escapeHtml(news.date) + "</span>",
      "</div>"
    ].join("");
  }

  function createNewsEmbed(news) {
    if (!news.embed || news.embed.type !== "soundcloud") {
      return "";
    }

    return '<iframe width="100%" height="220" scrolling="no" frameborder="no" allow="autoplay" src="' + escapeHtml(news.embed.url) + '"></iframe>';
  }

  function createNewsItem(news) {
    var link = news.url || "#";
    var ctaLink = news.ctaUrl || link;
    var image = news.image ? '<img src="' + escapeHtml(news.image) + '" alt="">' : "";
    var title = news.title
      ? '<h3 class="post-title"><a href="' + escapeHtml(link) + '" target="_blank">' + escapeHtml(news.title) + "</a></h3>"
      : "";
    var description = news.description
      ? '<p class="post-description">' + escapeHtml(news.description) + "</p>"
      : "";
    var cta = news.cta
      ? '<a href="' + escapeHtml(ctaLink) + '" target="_blank" class="read-more">' + escapeHtml(news.cta) + '<i class="fa fa-chevron-right"></i></a>'
      : "";

    return [
      '<div class="post-slide10">',
      image,
      createNewsDate(news),
      createNewsEmbed(news),
      title,
      description,
      cta,
      "</div>"
    ].join("");
  }

  function renderNews() {
    var container = $("#news-slider");
    if (!container.length || !window.COSMO_NEWS) {
      return;
    }

    var language = getLanguage();
    var news = window.COSMO_NEWS[language] || window.COSMO_NEWS.en || [];

    container.html(news.map(createNewsItem).join(""));
    container.owlCarousel({
      items: 4,
      itemsDesktop: [1199, 3],
      itemsDesktopSmall: [980, 2],
      itemsMobile: [600, 1],
      navigation: true,
      navigationText: ["‹", "›"],
      pagination: true,
      autoPlay: false
    });

    equalizeNewsCards(container);
    container.find("img").on("load", function () {
      equalizeNewsCards(container);
    });
    $(window).on("resize", function () {
      equalizeNewsCards(container);
    });
  }

  function equalizeNewsCards(container) {
    var cards = container.find(".post-slide10");
    var maxHeight = 0;

    cards.css("min-height", "");
    cards.each(function () {
      maxHeight = Math.max(maxHeight, $(this).outerHeight());
    });
    cards.css("min-height", maxHeight + "px");
  }

  $(document).ready(renderNews);
})(jQuery);

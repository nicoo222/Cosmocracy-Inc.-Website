(function ($) {
  "use strict";

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getLanguage() {
    var language = document.documentElement.getAttribute("lang") || "fr";
    return language.toLowerCase().indexOf("en") === 0 ? "en" : "fr";
  }

  function getText(value, language) {
    if (typeof value === "string") {
      return value;
    }

    return value[language] || value.fr || value.en || "";
  }

  function createProjectItem(project, index, language) {
    var reverseClass = index % 2 === 1 ? " related-project-item-reverse" : "";
    var title = getText(project.title, language) || "Projet connexe";
    var link = project.url || "#";
    var description = getText(project.description, language);
    var cta = getText(project.cta, language) || (language === "en" ? "Discover" : "Découvrir");

    return [
      '<article class="related-project-item' + reverseClass + '">',
      '<a class="related-project-image" href="' + escapeHtml(link) + '" target="_blank" rel="noopener">',
      '<img src="' + escapeHtml(project.image) + '" alt="' + escapeHtml(title) + '">',
      "</a>",
      '<div class="related-project-content">',
      '<h3>' + escapeHtml(title) + "</h3>",
      '<p>' + escapeHtml(description) + "</p>",
      '<a class="btn btn-primary btn-xl" href="' + escapeHtml(link) + '" target="_blank" rel="noopener">' + escapeHtml(cta) + "</a>",
      "</div>",
      "</article>"
    ].join("");
  }

  function createHeroImage(project) {
    if (!project.image) {
      return "";
    }

    return [
      '<div class="related-projects-hero-image" style="background-image: url(\'' + escapeHtml(project.image) + '\');">',
      "</div>"
    ].join("");
  }

  function renderHeroCollage(projects) {
    var container = $("#related-projects-hero-collage");
    if (!container.length) {
      return;
    }

    container.html(projects.map(createHeroImage).join(""));
  }

  function renderRelatedProjects() {
    var container = $("#related-projects-list");
    if (!container.length || !window.COSMO_RELATED_PROJECTS) {
      return;
    }

    var language = getLanguage();
    renderHeroCollage(window.COSMO_RELATED_PROJECTS);
    container.html(window.COSMO_RELATED_PROJECTS.map(function (project, index) {
      return createProjectItem(project, index, language);
    }).join(""));
  }

  $(document).ready(renderRelatedProjects);
})(jQuery);

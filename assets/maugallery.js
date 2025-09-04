(function ($) {
  $.fn.mauGallery = function (options) {
    var options = $.extend({}, $.fn.mauGallery.defaults, options);
    var tagsCollection = [];

    return this.each(function () {
      $.fn.mauGallery.methods.createRowWrapper($(this));

      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }

      $.fn.mauGallery.listeners(options);

      $(this)
        .children(".gallery-item")
        .each(function () {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);

          var theTag = $(this).data("gallery-tag");
          if (options.showTags && theTag !== undefined && tagsCollection.indexOf(theTag) === -1) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags($(this), options.tagsPosition, tagsCollection);
      }

      $(this).fadeIn(500);
    });
  };

  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,       
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  $.fn.mauGallery.listeners = function (options) {
    
    $(".gallery-item").on("click", function () {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      }
    });

    
    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);

    
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };

  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (!element.children().first().hasClass("row")) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },

    wrapItemInColumn(element, columns) {
      if (columns && columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns && columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        if (columns.sm) columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        if (columns.md) columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        if (columns.lg) columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        if (columns.xl) columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(`Columns should be numbers or objects. ${typeof columns} given.`);
      }
    },

    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },

    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },

   
    openLightBox(element, lightboxId) {
      const id = lightboxId || "galleryLightbox";
      const modalEl = document.getElementById(id);
      if (!modalEl) return;

      $(modalEl).find(".lightboxImage").attr("src", element.attr("src"));

      if (window.bootstrap && bootstrap.Modal) {
        const instance = bootstrap.Modal.getOrCreateInstance(modalEl);
        instance.show();
      } else if (typeof $(modalEl).modal === "function") {
        $(modalEl).modal("show");
      }
    },

    
    createLightBox(gallery, lightboxId, navigation) {
      const id = lightboxId || "galleryLightbox";

      
      if (document.getElementById(id)) return;

      gallery.append(`
        <div class="modal fade" id="${id}" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-body" style="position:relative;">
                ${navigation
                  ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;transform:translateY(-50%);padding:4px 8px;border-radius:4px;">&lt;</div>'
                  : '<span style="display:none;"></span>'
                }
                <img class="lightboxImage img-fluid" alt="Contenu de l\'image affichée dans la modale au clique"/>
                ${navigation
                  ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;transform:translateY(-50%);padding:4px 8px;border-radius:4px;">&gt;</div>'
                  : '<span style="display:none;"></span>'
                }
              </div>
            </div>
          </div>
        </div>
      `);
    },

    
    _collectFilteredImages() {
      const activeTag = $(".tags-bar span.active-tag").data("images-toggle") || "all";
      const images = [];
      $(".item-column img.gallery-item").each(function () {
        const ok = (activeTag === "all") || ($(this).data("gallery-tag") === activeTag);
        if (ok) images.push($(this));
      });
      return images;
    },

    prevImage(lightboxId) {
      const id = lightboxId || "galleryLightbox";
      const modalEl = document.getElementById(id);
      if (!modalEl) return;

      const activeSrc = $(".lightboxImage", modalEl).attr("src");
      const images = $.fn.mauGallery.methods._collectFilteredImages();
      if (!images.length) return;

      let idx = images.findIndex($img => $img.attr("src") === activeSrc);
      if (idx === -1) idx = 0;

      const prevIdx = (idx - 1 + images.length) % images.length;
      $(".lightboxImage", modalEl).attr("src", images[prevIdx].attr("src"));
    },

    nextImage(lightboxId) {
      const id = lightboxId || "galleryLightbox";
      const modalEl = document.getElementById(id);
      if (!modalEl) return;

      const activeSrc = $(".lightboxImage", modalEl).attr("src");
      const images = $.fn.mauGallery.methods._collectFilteredImages();
      if (!images.length) return;

      let idx = images.findIndex($img => $img.attr("src") === activeSrc);
      if (idx === -1) idx = 0;

      const nextIdx = (idx + 1) % images.length;
      $(".lightboxImage", modalEl).attr("src", images[nextIdx].attr("src"));
    },

    showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      $.each(tags, function (index, value) {
        tagItems += `<li class="nav-item active">
          <span class="nav-link" data-images-toggle="${value}">${value}</span></li>`;
      });

      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },

    filterByTag() {
      if ($(this).hasClass("active-tag")) return;

      $(".active-tag").removeClass("active active-tag").attr("aria-pressed", "false");
      $(this).addClass("active active-tag").attr("aria-pressed", "true");

      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function () {
        var $col = $(this).parents(".item-column");
        $col.hide();

        if (tag === "all" || $(this).data("gallery-tag") === tag) {
          $col.show(300);
        }
      });
    }
  };
})(jQuery);

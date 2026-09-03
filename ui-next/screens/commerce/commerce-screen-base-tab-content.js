import { template, insert } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createComponent, Show } from '../../../../core/vendor/solid-js/dist/solid.js';
import { Divider } from '../../../../core/ui-next/components/divider.js';
import { ImageCacheTrigger } from '../../../../core/ui-next/components/image-cache.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { ThrobberSuspense } from '../../../../core/ui-next/components/throbber.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="text-base w-full text-center my-4"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flex flex-col flex-auto pb-4 relative w-full"data-name=commerce-screen-base-tab-content></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-col flex-auto items-center mx-8 mb-5 pl-8 pr-8 pt-2 relative"><div class="absolute h-6 -top-0\\.5 -left-1\\.5 -right-1\\.5"></div><div class="absolute h-6 -bottom-0\\.5 -left-1\\.5 -right-1\\.5 -scale-y-100"></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex flex-col w-full min-h-6"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex flex-col w-full"><div class="flex flex-row w-full items-center"><div class="grow text-secondary uppercase font-title"></div></div></div>`);
const CommerceScreenBaseTabContentComponent = (props) => {
  return [(() => {
    var _el$ = _tmpl$();
    insert(_el$, createComponent(L10n.Compose, {
      get text() {
        return props.description;
      }
    }));
    return _el$;
  })(), (() => {
    var _el$2 = _tmpl$3(), _el$3 = _el$2.firstChild, _el$5 = _el$3.nextSibling;
    _el$2.style.setProperty("background-color", "rgba(5, 7, 13,0.8)");
    _el$3.style.setProperty("border-image-source", "url(blp:hud_section-line)");
    _el$3.style.setProperty("border-image-slice", "4 32 0 32 fill");
    _el$3.style.setProperty("border-image-width", "auto");
    insert(_el$2, createComponent(ThrobberSuspense, {
      "class": "size-full",
      get children() {
        return [createComponent(ImageCacheTrigger, {}), (() => {
          var _el$4 = _tmpl$2();
          insert(_el$4, createComponent(Show, {
            get when() {
              return props.title;
            },
            get fallback() {
              return createComponent(Show, {
                get when() {
                  return props.headerBar;
                },
                get children() {
                  var _el$6 = _tmpl$4();
                  insert(_el$6, () => props.headerBar, null);
                  insert(_el$6, createComponent(Divider.Horizontal, {
                    margin: 2
                  }), null);
                  return _el$6;
                }
              });
            },
            children: (title) => (() => {
              var _el$7 = _tmpl$5(), _el$8 = _el$7.firstChild, _el$9 = _el$8.firstChild;
              insert(_el$9, createComponent(L10n.Compose, {
                get text() {
                  return title();
                }
              }));
              insert(_el$8, () => props.headerBar, null);
              insert(_el$7, createComponent(Divider.Horizontal, {
                margin: 2
              }), null);
              return _el$7;
            })()
          }), null);
          insert(_el$4, () => props.children, null);
          return _el$4;
        })()];
      }
    }), _el$5);
    _el$5.style.setProperty("border-image-source", "url(blp:hud_section-line)");
    _el$5.style.setProperty("border-image-slice", "4 32 0 32 fill");
    _el$5.style.setProperty("border-image-width", "auto");
    return _el$2;
  })()];
};
const CommerceScreenBaseTabContent = ComponentRegistry.register({
  name: "CommerceScreenBaseTabContent",
  createInstance: CommerceScreenBaseTabContentComponent,
  images: ["blp:hud_section-line"]
});

export { CommerceScreenBaseTabContent };
//# sourceMappingURL=commerce-screen-base-tab-content.js.map

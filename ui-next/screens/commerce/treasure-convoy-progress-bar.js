import { template, insert } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createMemo, createComponent, Index, createRenderEffect } from '../../../../core/vendor/solid-js/dist/solid.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="w-full flex flex-col"><div class="w-full flex flex-row text-secondary"><div class=grow></div></div><div class="w-full h-4 flex flex-row p-1 mt-2"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flex-auto h-full"></div>`);
const TreasureConvoyProgressBarComponent = (props) => {
  const items = createMemo(() => Array.from({
    length: props.segmentCount
  }, (_, i) => i));
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$2.nextSibling;
    insert(_el$3, createComponent(L10n.Compose, {
      text: "LOC_COMMERCE_TREASURE_FLEET_LOADING"
    }));
    insert(_el$2, createComponent(L10n.Compose, {
      text: "LOC_COMMERCE_TREASURE_FLEET_PROGRESS",
      get args() {
        return [props.currentValue, props.segmentCount];
      }
    }), null);
    _el$4.style.setProperty("background-color", "rgba(0, 0, 0, 0.4)");
    _el$4.style.setProperty("border", "solid 2px rgba(64, 68, 83, 1)");
    insert(_el$4, createComponent(Index, {
      get each() {
        return items();
      },
      children: (_, i) => (() => {
        var _el$5 = _tmpl$2();
        createRenderEffect((_p$) => {
          var _v$ = !!(i < items().length - 1), _v$2 = i >= props.currentValue ? "rgba(58, 115, 65, 0.2)" : "rgba(58, 115, 65, 1)";
          _v$ !== _p$.e && _el$5.classList.toggle("mr-1", _p$.e = _v$);
          _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$5.style.setProperty("background-color", _v$2) : _el$5.style.removeProperty("background-color"));
          return _p$;
        }, {
          e: void 0,
          t: void 0
        });
        return _el$5;
      })()
    }));
    return _el$;
  })();
};
const TreasureConvoyProgressBar = ComponentRegistry.register({
  name: "TreasureConvoyProgressBar",
  createInstance: TreasureConvoyProgressBarComponent
});

export { TreasureConvoyProgressBar };
//# sourceMappingURL=treasure-convoy-progress-bar.js.map

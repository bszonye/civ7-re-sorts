import { template, insert, classList } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, createMemo, createEffect, createComponent, createRenderEffect, Show } from '../../../../core/vendor/solid-js/dist/solid.js';
import { Icon } from '../../../../core/ui-next/components/icon.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { TradeRouteCriteriaTooltip } from '../../tooltips/trade-route-criteria-tooltip.js';
import style from '../../components/styles/line-through.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="w-full flex items-center"><div></div></div>`);
const CommerceCriteriaDisplayComponent = (props) => {
  const [criteriaMetIcon, setCriteriaMetIcon] = createSignal("");
  const isNegativeOrDoesNotApply = createMemo(() => props.status.isNegative || !props.status.appliesToCurrentCiv);
  createEffect(() => {
    setCriteriaMetIcon(isNegativeOrDoesNotApply() ? "url('blp:dip_esp_fail_icon')" : "url('blp:dip_esp_success_icon')");
  });
  const content = (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
    insert(_el$, createComponent(Icon, {
      "class": "size-6 mr-2",
      get name() {
        return criteriaMetIcon();
      },
      isUrl: true
    }), _el$2);
    insert(_el$2, () => props.status.statusText ?? "Unset status text");
    createRenderEffect((_p$) => {
      var _v$ = {
        "opacity-50 line-through decoration-secondary": !props.status.appliesToCurrentCiv
      }, _v$2 = !!props.status.isNegative;
      _p$.e = classList(_el$, _v$, _p$.e);
      _v$2 !== _p$.t && _el$2.classList.toggle("text-negative", _p$.t = _v$2);
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$;
  })();
  return createComponent(Show, {
    get when() {
      return isNegativeOrDoesNotApply();
    },
    fallback: content,
    get children() {
      return createComponent(TradeRouteCriteriaTooltip, {
        get text() {
          return props.status.tooltipKey;
        },
        get header() {
          return props.status.statusText;
        },
        get isNegative() {
          return props.status.isNegative;
        },
        get appliesToCurrentCiv() {
          return props.status.appliesToCurrentCiv;
        },
        children: content
      });
    }
  });
};
const CommerceCriteriaDisplay = ComponentRegistry.register({
  name: "CommerceCriteriaDisplay",
  createInstance: CommerceCriteriaDisplayComponent,
  styles: [style],
  images: ["blp:dip_esp_fail_icon", "blp:dip_esp_success_icon"]
});

export { CommerceCriteriaDisplay };
//# sourceMappingURL=commerce-criteria-display.js.map

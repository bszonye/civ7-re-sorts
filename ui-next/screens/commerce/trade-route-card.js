import { template, insert } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { splitProps, createSignal, createMemo, createEffect, createComponent, mergeProps, For, Show } from '../../../../core/vendor/solid-js/dist/solid.js';
import { getMajorLeader } from '../../../../core/ui/utilities/diplomacy-utilities.js';
import { ComponentID } from '../../../../core/ui/utilities/utilities-component-id.js';
import { Layout } from '../../../../core/ui/utilities/utilities-layout.js';
import { Activatable } from '../../../../core/ui-next/components/activatable.js';
import { CardFrame } from '../../../../core/ui-next/components/card-frame.js';
import { Icon } from '../../../../core/ui-next/components/icon.js';
import { useImageCache } from '../../../../core/ui-next/components/image-cache.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { IsControllerActive } from '../../../../core/ui-next/services/input.js';
import { FramedResource } from '../../components/framed-resource.js';
import { LeaderWithRibbon } from '../../components/leader-with-ribbon.js';
import { CommerceCriteriaDisplay } from './commerce-criteria-display.js';
import { useCommerceScreenContext, TradeRouteAvailabiltyType } from './commerce-screen-model.js';
import { ResourceTooltip } from '../../tooltips/resource-tooltip.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-row text-secondary uppercase text-lg mb-1 items-center"><div class="flex flex-row mr-3 items-center justify-center size-9 bg-center bg-cover bg-no-repeat"></div><div class=font-title></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<p class="mt-1 mr-13 font-fit-shrink"></p>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-row flex-wrap mt-4 mr-13"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class=mt-2></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="size-12 mt-2 flex flex-row text-sm items-center justify-center bg-center bg-contain bg-no-repeat text-white -mt-3"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="absolute top-1 right-1 flex flex-col items-center"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="mt-2 p-2 flex flex-col justify-between"></div>`);
const TradeCardSymbol = Symbol();
const TRADE_ROUTE_CARD_MARGIN_RIGHT = Layout.pixelsToScreenPixels(12);
const TradeRouteCardComponent = (props) => {
  const [local, cardFrameProps] = splitProps(props, ["tradeRoute", "autoFocus", "class", "onFocus"]);
  const model = useCommerceScreenContext();
  const [majorLeaderId, setMajorLeaderId] = createSignal(PlayerIds.NO_PLAYER);
  const isSelected = createMemo(() => ComponentID.isMatch(model.selectedTradeRouteId() ?? null, props.tradeRoute.cityID));
  const autoFocusFirstItem = createMemo(() => {
    return isSelected();
  });
  createEffect(() => {
    const majorLeader = getMajorLeader(local.tradeRoute.leaderId);
    if (!majorLeader) {
      return;
    }
    setMajorLeaderId(majorLeader.id);
  });
  const images = {
    ticketSelectedCSS: "url(blp:base_ticket-select-bg)"
  };
  const imageCache = useImageCache();
  imageCache.registerImages(TradeCardSymbol, Object.values(images));
  const content = createComponent(CardFrame, mergeProps(cardFrameProps, {
    get ["class"]() {
      return `px-4 pt-4 pb-2 flex flex-col mb-2 mt-2 relative focusable-card ${local.class ?? ""}`;
    },
    get classList() {
      return {
        disabled: local.tradeRoute.availability === TradeRouteAvailabiltyType.Unavailable
      };
    },
    get children() {
      return [createComponent(Activatable, {
        disableFocus: true,
        onActivate: () => {
          model.clickCityName(local.tradeRoute.cityID);
        },
        get children() {
          var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
          _el$2.style.setProperty("background-image", 'url("blp:banner_hex")');
          insert(_el$2, createComponent(Icon, {
            "class": "size-8",
            get name() {
              return local.tradeRoute.cityIcon;
            }
          }));
          insert(_el$3, createComponent(L10n.Compose, {
            get text() {
              return local.tradeRoute.cityName;
            }
          }));
          return _el$;
        }
      }), (() => {
        var _el$4 = _tmpl$2();
        insert(_el$4, () => local.tradeRoute.domainString);
        return _el$4;
      })(), (() => {
        var _el$5 = _tmpl$3();
        insert(_el$5, createComponent(For, {
          get each() {
            return local.tradeRoute.incomingResources;
          },
          children: (resource, index) => createComponent(ResourceTooltip, mergeProps(resource, {
            get children() {
              return (() => {
                const [focused, setFocused] = createSignal(false);
                return createComponent(
                  Activatable,
                  {
                    "class": "size-13 mb-4 pointer-events-auto mr-2 hover\\:scale-125 focus\\:scale-125",
                    get classList() {
                      return {
                        "focused-resource": focused()
                      };
                    },
                    onFocus: () => setFocused(true),
                    onBlur: () => setFocused(false),
                    get disabled() {
                      return !isSelected();
                    },
                    get autoFocus() {
                      return createMemo(() => index() === 0)() && autoFocusFirstItem();
                    },
                    suppressPointerChanges: true,
                    get children() {
                      return createComponent(FramedResource, mergeProps({
                        size: 13
                      }, resource));
                    }
                  }
                );
              })();
            }
          }))
        }));
        return _el$5;
      })(), (() => {
        var _el$6 = _tmpl$4();
        insert(_el$6, () => local.tradeRoute.yieldElement);
        return _el$6;
      })(), createComponent(Show, {
        get when() {
          return majorLeaderId() !== PlayerIds.NO_PLAYER;
        },
        get children() {
          var _el$7 = _tmpl$6();
          insert(_el$7, createComponent(LeaderWithRibbon, mergeProps(() => ({
            leaderId: majorLeaderId(),
            size: 20,
            representsCityState: local.tradeRoute.isCityState,
            cityId: local.tradeRoute.cityID
          }))), null);
          insert(_el$7, createComponent(Show, {
            get when() {
              return !local.tradeRoute.isCityState;
            },
            get children() {
              var _el$8 = _tmpl$5();
              _el$8.style.setProperty("background-image", 'url("blp:relationships_normal-tab-button")');
              insert(_el$8, () => "+" + local.tradeRoute.relationshipChange);
              return _el$8;
            }
          }), null);
          return _el$7;
        }
      }), createComponent(Show, {
        get when() {
          return local.tradeRoute.availability === TradeRouteAvailabiltyType.Unavailable;
        },
        get children() {
          var _el$9 = _tmpl$7();
          _el$9.style.setProperty("background-color", "rgba(0,0,0, 0.4)");
          insert(_el$9, createComponent(For, {
            get each() {
              return local.tradeRoute.statuses;
            },
            children: (status) => createComponent(CommerceCriteriaDisplay, {
              status
            })
          }));
          return _el$9;
        }
      })];
    }
  }));
  return createComponent(Activatable, {
    get name() {
      return `${Locale.compose(local.tradeRoute.cityName)}-Trade-Route-Card`;
    },
    "class": "focusable-card-activatable trade-route-card",
    get autoFocus() {
      return local.autoFocus;
    },
    onActivate: () => model.setSelectedTradeRouteId(props.tradeRoute.cityID),
    get disabled() {
      return !IsControllerActive() || props.disabled || model.selectedTradeRouteId() !== void 0;
    },
    get onFocus() {
      return local.onFocus;
    },
    suppressPointerChanges: true,
    children: content
  });
};
const TradeRouteCard = ComponentRegistry.register({
  name: "TradeRouteCard",
  createInstance: TradeRouteCardComponent
});

export { TRADE_ROUTE_CARD_MARGIN_RIGHT, TradeRouteCard };
//# sourceMappingURL=trade-route-card.js.map

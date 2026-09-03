import { template, insert } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, createMemo, createComponent, For, mergeProps, Show } from '../../../../core/vendor/solid-js/dist/solid.js';
import { ComponentID } from '../../../../core/ui/utilities/utilities-component-id.js';
import { CollapsibleContainer } from '../../../../core/ui-next/components/collapsible-container.js';
import { Icon } from '../../../../core/ui-next/components/icon.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { ScrollArea } from '../../../../core/ui-next/components/scroll-area.js';
import { SpatialSlot } from '../../../../core/ui-next/components/slot.js';
import { createLayoutComplete } from '../../../../core/ui-next/utilities/solid-utilities.js';
import { GamepadTrayItemProvider } from '../../components/gamepad-tray-item-provider.js';
import { CommerceScreenBaseTabContent } from './commerce-screen-base-tab-content.js';
import { useCommerceScreenContext } from './commerce-screen-model.js';
import { TreasureConvoyCard } from './treasure-convoy-card.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-row flex-wrap flex-auto relative"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flex flex-col flex-wrap text-wrap text-center items-center justify-center my-4"><div class="text-secondary uppercase"></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-row flex-wrap flex-auto relative mt-6"></div>`);
const TreasureResourceContainer = (props) => {
  const model = useCommerceScreenContext();
  const layoutComplete = createLayoutComplete();
  const [focusedConvoyCard, setFocusedConvoyCard] = createSignal();
  const firstVisibleSectionIndex = createMemo(() => {
    let visibleSectionIndex = -1;
    props.sections.forEach((section, index) => {
      if (visibleSectionIndex > -1) {
        return;
      }
      if (section.fleets.length > 0) {
        visibleSectionIndex = index;
      }
    });
    return visibleSectionIndex;
  });
  const shouldAutoFocusConvoyCard = (convoyCityID, sectionIndex, fleetIndex) => {
    if (!layoutComplete()) {
      return false;
    }
    if (focusedConvoyCard() === void 0) {
      return sectionIndex === firstVisibleSectionIndex() && fleetIndex === 0;
    }
    return ComponentID.isMatch(focusedConvoyCard(), convoyCityID);
  };
  const gamepadTrayItems = createMemo(() => {
    if (model.selectedTreasureConvoyId()) {
      const selectedCity = Cities.get(model.selectedTreasureConvoyId());
      if (selectedCity) {
        const deselectRouteLabel = Locale.compose("LOC_COMMERCE_GAMEPAD_STOP_VIEWING_CONTAINER_HINT", Locale.compose(selectedCity.name));
        return [{
          hotkeyAction: "cancel",
          name: "cancel-treasure-convoy-edit",
          navTrayText: deselectRouteLabel,
          onActivate: () => model.setSelectedTreasureConvoyId()
        }];
      }
      console.warn("commerce-screen-treasure-tab.tsx: When getting gamepadTrayItems, couldn't find city with ID", model.selectedTreasureConvoyId());
    } else {
      if (focusedConvoyCard()) {
        const focusedCity = Cities.get(focusedConvoyCard());
        if (focusedCity) {
          const selectRouteLabel = Locale.compose("LOC_COMMERCE_GAMEPAD_VIEW_CONTAINER_HINT", Locale.compose(focusedCity.name));
          return [{
            hotkeyAction: "accept",
            name: "treasure-convoy-edit",
            navTrayText: selectRouteLabel
            // activate handled by activatable in treasure-convoy-card.tsx
          }];
        }
      }
    }
    return [];
  });
  return createComponent(SpatialSlot, {
    name: "Commerce-Screen-Treasure-Tab",
    "class": "flex-auto",
    get children() {
      return createComponent(CommerceScreenBaseTabContent, {
        title: "LOC_COMMERCE_TREASURE_FLEETS_TITLE",
        description: "LOC_COMMERCE_TREASURE_EMPTY_DESCRIPTION",
        get children() {
          return createComponent(GamepadTrayItemProvider, {
            "class": "flex-auto",
            name: "treasure-convoy-gamepad-items",
            items: gamepadTrayItems,
            get children() {
              return createComponent(ScrollArea, {
                "class": "flex-auto",
                get children() {
                  var _el$ = _tmpl$();
                  insert(_el$, createComponent(For, {
                    get each() {
                      return props.sections;
                    },
                    children: (section, index) => createComponent(CollapsibleContainer, mergeProps(() => section.collapsibleContainerData, {
                      "class": "w-full",
                      headerClass: "font-title fxs-header",
                      get disableFocus() {
                        return model.selectedTreasureConvoyId() !== void 0;
                      },
                      get children() {
                        return createComponent(Show, {
                          get when() {
                            return section.fleets.length == 0 && section.emptyTitle != void 0;
                          },
                          get fallback() {
                            return (() => {
                              var _el$4 = _tmpl$3();
                              insert(_el$4, createComponent(For, {
                                get each() {
                                  return section.fleets;
                                },
                                children: (fleet, subIndex) => createComponent(TreasureConvoyCard, {
                                  fleet,
                                  get inGeneratingConvoysSection() {
                                    return section.generatingConvoys;
                                  },
                                  onFocus: () => setFocusedConvoyCard(fleet.cityID),
                                  get autoFocus() {
                                    return shouldAutoFocusConvoyCard(fleet.cityID, index(), subIndex());
                                  }
                                })
                              }));
                              return _el$4;
                            })();
                          },
                          get children() {
                            var _el$2 = _tmpl$2(), _el$3 = _el$2.firstChild;
                            insert(_el$3, createComponent(L10n.Compose, {
                              text: "LOC_COMMERCE_TREASURE_FLEETS_EMPTY_TITLE"
                            }));
                            insert(_el$2, createComponent(Icon, {
                              "class": "bg-center bg-contain bg-no-repeat w-16 h-4",
                              name: "url(popup_middle_decor)"
                            }), null);
                            insert(_el$2, createComponent(L10n.Compose, {
                              text: "LOC_COMMERCE_TREASURE_FLEETS_EMPTY_DESCRIPTION"
                            }), null);
                            return _el$2;
                          }
                        });
                      }
                    }))
                  }));
                  return _el$;
                }
              });
            }
          });
        }
      });
    }
  });
};

export { TreasureResourceContainer };
//# sourceMappingURL=commerce-screen-treasure-tab.js.map

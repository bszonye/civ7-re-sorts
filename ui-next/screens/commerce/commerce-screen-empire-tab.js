import { template, use, insert, classList } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, onMount, onCleanup, createMemo, createComponent, Show, For, mergeProps, createRenderEffect } from '../../../../core/vendor/solid-js/dist/solid.js';
import { Layout } from '../../../../core/ui/utilities/utilities-layout.js';
import { Activatable } from '../../../../core/ui-next/components/activatable.js';
import { CardFrame } from '../../../../core/ui-next/components/card-frame.js';
import { FiligreeTitle } from '../../../../core/ui-next/components/filigree-title.js';
import { Icon } from '../../../../core/ui-next/components/icon.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { OrnateCard } from '../../../../core/ui-next/components/ornate-card.js';
import { PortraitIcon } from '../../../../core/ui-next/components/portrait-icon.js';
import { ScrollArea } from '../../../../core/ui-next/components/scroll-area.js';
import { SpatialSlot } from '../../../../core/ui-next/components/slot.js';
import { Tooltip } from '../../../../core/ui-next/components/tooltip.js';
import { IsControllerActive } from '../../../../core/ui-next/services/input.js';
import { createLayoutComplete } from '../../../../core/ui-next/utilities/solid-utilities.js';
import { GamepadTrayItemProvider } from '../../components/gamepad-tray-item-provider.js';
import { CommerceScreenBaseTabContent } from './commerce-screen-base-tab-content.js';
import { useCommerceScreenContext } from './commerce-screen-model.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="text-secondary self-center text-center text-accent-2"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="empire-resource-cards-row flex flex-row flex-wrap flex-auto relative"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="ml-1 text-white"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex flex-col w-full grow items-center mt-8"><div class="mb-2 w-full"></div><div class="w-full text-center items-center flex-col px-2"></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex flex-col w-full justify-center items-center mt-1 mb-1"><div class="flex flex-row flex-wrap"></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="mx-2 h-10 w-0\\.5 bg-accent"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="flex flex-row items-center mb-1 px-2"></div>`);
const EMPIRE_CARD_MARGIN_RIGHT = Layout.pixelsToScreenPixels(20);
const DEFAULT_EMPIRE_CARD_WIDTH = Layout.pixelsToScreenPixels(384);
const EmpireResourceContainer = (props) => {
  const model = useCommerceScreenContext();
  let cardsRowRef;
  let cardsRowResizeObserver;
  let isApplyingMeasuredWidths = false;
  let hasScheduledWrapCheck = false;
  const [empireResourceCardWidth, setEmpireResourceCardWidth] = createSignal(void 0);
  const [hasCheckedForWrap, setHasCheckedForWrap] = createSignal(false);
  const [numCardsInFirstRow, setNumCardsInFirstRow] = createSignal(0);
  const applyMeasuredWidths = (applyFunction) => {
    isApplyingMeasuredWidths = true;
    applyFunction();
    delayByFrame(() => {
      isApplyingMeasuredWidths = false;
    });
  };
  const scheduleWrapCheck = () => {
    if (hasScheduledWrapCheck) {
      return;
    }
    hasScheduledWrapCheck = true;
    delayByFrame(() => {
      hasScheduledWrapCheck = false;
      checkForWrap();
    });
  };
  onMount(() => {
    cardsRowResizeObserver = new ResizeObserver(() => {
      if (isApplyingMeasuredWidths) {
        return;
      }
      scheduleWrapCheck();
    });
    if (cardsRowRef) {
      cardsRowResizeObserver.observe(cardsRowRef);
      scheduleWrapCheck();
    }
  });
  onCleanup(() => {
    cardsRowResizeObserver?.disconnect();
  });
  const checkForWrap = () => {
    if (!cardsRowRef) {
      return;
    }
    const availableWidth = cardsRowRef.clientWidth || 0;
    if (availableWidth <= 0) {
      return;
    }
    const rowCardCount = Math.max(1, Math.floor((availableWidth + EMPIRE_CARD_MARGIN_RIGHT) / (DEFAULT_EMPIRE_CARD_WIDTH + EMPIRE_CARD_MARGIN_RIGHT)));
    const cards = cardsRowRef.querySelectorAll(".empire-resource-card");
    if (cards.length === 0) {
      setHasCheckedForWrap(false);
      return;
    }
    const hasWrappedRows = cards.length > rowCardCount;
    if (!hasWrappedRows) {
      const needsWidthReset = empireResourceCardWidth() !== void 0;
      const needsRowCountReset = numCardsInFirstRow() !== 0;
      if (needsWidthReset || needsRowCountReset) {
        applyMeasuredWidths(() => {
          if (needsWidthReset) {
            setEmpireResourceCardWidth(void 0);
          }
          if (needsRowCountReset) {
            setNumCardsInFirstRow(0);
          }
          setHasCheckedForWrap(true);
        });
        return;
      }
      setHasCheckedForWrap(true);
      return;
    }
    const fittedWidth = (availableWidth - EMPIRE_CARD_MARGIN_RIGHT * rowCardCount) / rowCardCount;
    const nextWidth = Math.max(1, Math.floor(fittedWidth * 100) / 100) + "px";
    const needsRowCountUpdate = numCardsInFirstRow() !== rowCardCount;
    const needsWidthUpdate = empireResourceCardWidth() !== nextWidth;
    if (needsRowCountUpdate || needsWidthUpdate) {
      applyMeasuredWidths(() => {
        if (needsRowCountUpdate) {
          setNumCardsInFirstRow(rowCardCount);
        }
        if (needsWidthUpdate) {
          setEmpireResourceCardWidth(nextWidth);
        }
        setHasCheckedForWrap(true);
      });
      return;
    }
    setHasCheckedForWrap(true);
  };
  const layoutComplete = createLayoutComplete();
  const [focusedResourceCard, setFocusedResourceCard] = createSignal();
  function shouldAutoFocusResourceCard(resourceValue, index) {
    if (!layoutComplete()) {
      return false;
    }
    if (focusedResourceCard() === void 0) {
      return index === 0;
    }
    return focusedResourceCard() === resourceValue;
  }
  function getResourceDefinitonFromResourceValue(resourceValue) {
    const uniqueResource = Players.get(GameContext.localPlayerID)?.Resources?.getResources().find((uniqueResourceValue) => {
      return uniqueResourceValue.value === resourceValue;
    });
    if (!uniqueResource) {
      console.error("commerce-screen-empire-tab: Unable to get unique resource value for selected empire resource");
      return;
    }
    return GameInfo.Resources.lookup(uniqueResource.uniqueResource.resource);
  }
  const gamepadTrayItems = createMemo(() => {
    if (model.selectedEmpireResource()) {
      const selectedResourceDefinition = getResourceDefinitonFromResourceValue(model.selectedEmpireResource());
      if (selectedResourceDefinition) {
        const deselectResourceLabel = Locale.compose("LOC_COMMERCE_GAMEPAD_STOP_VIEWING_CONTAINER_HINT", Locale.compose(selectedResourceDefinition.Name));
        return [{
          hotkeyAction: "cancel",
          name: "cancel-empire-resource-edit",
          navTrayText: deselectResourceLabel,
          onActivate: () => model.setSelectedEmpireResource()
        }];
      }
      console.warn("commerce-screen-treasure-tab.tsx: When getting gamepadTrayItems, couldn't find city with ID", model.selectedTreasureConvoyId());
    } else if (focusedResourceCard()) {
      const focusedResourceDefinition = getResourceDefinitonFromResourceValue(focusedResourceCard());
      if (focusedResourceDefinition) {
        const selectResourceLabel = Locale.compose("LOC_COMMERCE_GAMEPAD_VIEW_CONTAINER_HINT", Locale.compose(focusedResourceDefinition.Name));
        return [{
          hotkeyAction: "accept",
          name: "empire-resource-edit",
          navTrayText: selectResourceLabel
          // activate handled by activatable below
        }];
      }
    }
    return [];
  });
  return createComponent(SpatialSlot, {
    name: "Commerce-Screen-Empire-Tab",
    "class": "flex-auto",
    get children() {
      return createComponent(CommerceScreenBaseTabContent, {
        title: "LOC_COMMERCE_EMPIRE_RESOURCE_TITLE",
        description: "LOC_COMMERCE_EMPIRE_RESOURCES_DESCRIPTION",
        get children() {
          return createComponent(GamepadTrayItemProvider, {
            "class": "flex-auto",
            name: "treasure-convoy-gamepad-items",
            items: gamepadTrayItems,
            get children() {
              return createComponent(ScrollArea, {
                "class": "flex-auto",
                useProxy: true,
                get children() {
                  var _el$ = _tmpl$2();
                  var _ref$ = cardsRowRef;
                  typeof _ref$ === "function" ? use(_ref$, _el$) : cardsRowRef = _el$;
                  insert(_el$, createComponent(Show, {
                    get when() {
                      return props.empireResourceData.length == 0;
                    },
                    get children() {
                      var _el$2 = _tmpl$();
                      insert(_el$2, createComponent(L10n.Compose, {
                        text: "LOC_COMMERCE_NO_EMPIRE_RESOURCES_DESCRIPTION"
                      }));
                      return _el$2;
                    }
                  }), null);
                  insert(_el$, createComponent(For, {
                    get each() {
                      return props.empireResourceData;
                    },
                    children: (resourceData, index) => createComponent(Activatable, {
                      get name() {
                        return `${Locale.compose(resourceData.title)}-resource-card`;
                      },
                      "class": "focusable-card-activatable",
                      onFocus: () => setFocusedResourceCard(resourceData.resourceValue),
                      get autoFocus() {
                        return shouldAutoFocusResourceCard(resourceData.resourceValue, index());
                      },
                      onActivate: () => model.setSelectedEmpireResource(resourceData.resourceValue),
                      get disabled() {
                        return !IsControllerActive() || model.selectedEmpireResource() !== void 0;
                      },
                      suppressPointerChanges: true,
                      get children() {
                        return createComponent(OrnateCard, {
                          get iconSrc() {
                            return resourceData.iconSrc;
                          },
                          get ["class"]() {
                            return `flex flex-col items-center justify-between relative pb-1 empire-resource-card ${hasCheckedForWrap() ? "opacity-100" : "opacity-0"}`;
                          },
                          get style() {
                            return {
                              width: empireResourceCardWidth() !== void 0 ? empireResourceCardWidth() : DEFAULT_EMPIRE_CARD_WIDTH + "px",
                              "margin-right": numCardsInFirstRow() === 0 || (index() + 1) % numCardsInFirstRow() !== 0 ? EMPIRE_CARD_MARGIN_RIGHT + "px" : "0px"
                            };
                          },
                          get childrenInFront() {
                            return createComponent(Icon, {
                              "class": "absolute top-2 size-6",
                              get name() {
                                return `url(blp:${resourceData.isTreasure ? "restype_treasure" : "restype_empire_v2"})`;
                              }
                            });
                          },
                          get children() {
                            return [(() => {
                              var _el$3 = _tmpl$4(), _el$4 = _el$3.firstChild, _el$6 = _el$4.nextSibling;
                              insert(_el$4, createComponent(FiligreeTitle.Plain, {
                                get text() {
                                  return resourceData.title;
                                },
                                get children() {
                                  var _el$5 = _tmpl$3();
                                  insert(_el$5, () => `[${resourceData.amount}]`);
                                  return _el$5;
                                }
                              }));
                              insert(_el$6, createComponent(For, {
                                get each() {
                                  return resourceData.description;
                                },
                                children: (description) => createComponent(CardFrame, {
                                  "class": "w-full",
                                  get children() {
                                    var _el$9 = _tmpl$7();
                                    insert(_el$9, createComponent(Show, {
                                      get when() {
                                        return resourceData.isCombatResource;
                                      },
                                      get children() {
                                        return [createComponent(Icon, {
                                          "class": "size-8",
                                          name: "url(blp:pedia_combat)"
                                        }), _tmpl$6()];
                                      }
                                    }), null);
                                    insert(_el$9, createComponent(Show, {
                                      get when() {
                                        return model.selectedEmpireResource() === resourceData.resourceValue;
                                      },
                                      get fallback() {
                                        return createComponent(L10n.Stylize, {
                                          "class": "py-1 self-center text-center",
                                          text: description,
                                          disableTooltips: true
                                        });
                                      },
                                      get children() {
                                        return createComponent(L10n.Stylize, {
                                          "class": "py-1 self-center text-center",
                                          text: description
                                        });
                                      }
                                    }), null);
                                    return _el$9;
                                  }
                                })
                              }));
                              return _el$3;
                            })(), (() => {
                              var _el$7 = _tmpl$5(), _el$8 = _el$7.firstChild;
                              insert(_el$7, createComponent(FiligreeTitle.Plain, {
                                text: "LOC_COMMERCE_EMPIRE_RESOURCES_ORIGIN_TITLE"
                              }), _el$8);
                              insert(_el$8, createComponent(For, {
                                get each() {
                                  return resourceData.resourceOriginData;
                                },
                                children: (originData, index2) => createComponent(Tooltip.Text, {
                                  header: "LOC_COMMERCE_EMPIRE_ORIGIN_CITIES",
                                  get text() {
                                    return resourceData.tooltips[originData.leaderId];
                                  },
                                  showFiligrees: false,
                                  get children() {
                                    return createComponent(Activatable, {
                                      name: "empire-resource-origin-portrait",
                                      "class": "hover\\:scale-125 focus\\:scale-125",
                                      get autoFocus() {
                                        return createMemo(() => index2() === 0)() && model.selectedEmpireResource() === resourceData.resourceValue;
                                      },
                                      get disabled() {
                                        return createMemo(() => !!IsControllerActive())() && model.selectedEmpireResource() !== resourceData.resourceValue;
                                      },
                                      suppressPointerChanges: true,
                                      get children() {
                                        return createComponent(PortraitIcon, mergeProps({
                                          "class": "-mx-2 -my-1"
                                        }, () => ({
                                          playerId: originData.leaderId,
                                          size: 14
                                        })));
                                      }
                                    });
                                  }
                                })
                              }));
                              return _el$7;
                            })()];
                          }
                        });
                      }
                    })
                  }), null);
                  createRenderEffect((_$p) => classList(_el$, {
                    "h-full justify-center": props.empireResourceData.length === 0
                  }, _$p));
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

export { EmpireResourceContainer };
//# sourceMappingURL=commerce-screen-empire-tab.js.map

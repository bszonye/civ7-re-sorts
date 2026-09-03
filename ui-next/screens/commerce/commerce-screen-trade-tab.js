import { template, use, insert } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, onMount, onCleanup, createMemo, createEffect, createComponent, For, mergeProps, Show } from '../../../../core/vendor/solid-js/dist/solid.js';
import { getRelationship } from '../../../../core/ui/utilities/diplomacy-utilities.js';
import { ComponentID } from '../../../../core/ui/utilities/utilities-component-id.js';
import { Layout } from '../../../../core/ui/utilities/utilities-layout.js';
import { AudioContextProvider } from '../../../../core/ui-next/components/audio-context-provider.js';
import { CollapsibleContainer } from '../../../../core/ui-next/components/collapsible-container.js';
import { Dropdown, DropdownItem } from '../../../../core/ui-next/components/dropdown.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { ScrollArea } from '../../../../core/ui-next/components/scroll-area.js';
import { SearchBar } from '../../../../core/ui-next/components/search-bar.js';
import { SpatialSlot } from '../../../../core/ui-next/components/slot.js';
import { IsControllerActive } from '../../../../core/ui-next/services/input.js';
import { ViewExperience } from '../../../../core/ui-next/services/view-experience.js';
import { compareSettlementNames, compareSettlementTypes } from '../../../../core/ui-next/utilities/settlement-utilities.js';
import { createLayoutComplete } from '../../../../core/ui-next/utilities/solid-utilities.js';
import { GamepadTrayItemProvider } from '../../components/gamepad-tray-item-provider.js';
import { CommerceScreenBaseTabContent } from './commerce-screen-base-tab-content.js';
import { useCommerceScreenContext, TradeRouteSortType } from './commerce-screen-model.js';
import { TRADE_ROUTE_CARD_MARGIN_RIGHT, TradeRouteCard } from './trade-route-card.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-row flex-wrap flex-auto relative"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="top-0 right-3 flex flex-row items-center"><div class="font-title uppercase text-secondary"></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class=ml-2></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="w-full flex flex-row justify-center items-center mt-2 text-accent-2 p-4"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="trade-route-cards-row flex-row flex flex-wrap w-full items-start"></div>`);
const DEFAULT_CARD_WIDTH = Layout.pixelsToScreenPixels(512);
const TradeRoutesContainer = (props) => {
  const model = useCommerceScreenContext();
  const layoutComplete = createLayoutComplete();
  let cardsContainerRef;
  let cardsContainerResizeObserver;
  let isApplyingMeasuredWidths = false;
  let hasScheduledWrapCheck = false;
  const [tradeRouteCardWidth, setTradeRouteCardWidth] = createSignal(void 0);
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
    cardsContainerResizeObserver = new ResizeObserver(() => {
      if (isApplyingMeasuredWidths) {
        return;
      }
      scheduleWrapCheck();
    });
    if (cardsContainerRef) {
      cardsContainerResizeObserver.observe(cardsContainerRef);
      scheduleWrapCheck();
    }
  });
  onCleanup(() => {
    cardsContainerResizeObserver?.disconnect();
  });
  const checkForWrap = () => {
    if (!cardsContainerRef) {
      return;
    }
    const availableWidth = cardsContainerRef.clientWidth || 0;
    if (availableWidth <= 0) {
      return;
    }
    const rowCardCount = Math.max(1, Math.floor((availableWidth + TRADE_ROUTE_CARD_MARGIN_RIGHT) / (DEFAULT_CARD_WIDTH + TRADE_ROUTE_CARD_MARGIN_RIGHT)));
    const cardRows = Array.from(cardsContainerRef.querySelectorAll(".trade-route-cards-row"));
    const hasWrappedRows = cardRows.some((row) => {
      const cards = row.querySelectorAll(".trade-route-card");
      return cards.length > rowCardCount;
    });
    if (!hasWrappedRows) {
      const needsWidthReset = tradeRouteCardWidth() !== void 0;
      const needsRowCountReset = numCardsInFirstRow() !== 0;
      if (needsWidthReset || needsRowCountReset) {
        applyMeasuredWidths(() => {
          if (needsWidthReset) {
            setTradeRouteCardWidth(void 0);
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
    const fittedWidth = (availableWidth - TRADE_ROUTE_CARD_MARGIN_RIGHT * rowCardCount) / rowCardCount;
    const nextWidth = Math.max(1, Math.floor(fittedWidth * 100) / 100) + "px";
    const needsRowCountUpdate = numCardsInFirstRow() !== rowCardCount;
    const needsWidthUpdate = tradeRouteCardWidth() !== nextWidth;
    if (needsRowCountUpdate || needsWidthUpdate) {
      applyMeasuredWidths(() => {
        if (needsRowCountUpdate) {
          setNumCardsInFirstRow(rowCardCount);
        }
        if (needsWidthUpdate) {
          setTradeRouteCardWidth(nextWidth);
        }
        setHasCheckedForWrap(true);
      });
      return;
    }
    setHasCheckedForWrap(true);
  };
  const tradeRouteSortItems = [{
    type: TradeRouteSortType.SettlementType,
    locKey: "LOC_COMMERCE_RESOURCE_SORT_FILTER_DEFAULT_LABEL"
  }, {
    type: TradeRouteSortType.Resource,
    locKey: "LOC_COMMERCE_TRADE_SORT_BY_RESOURCE"
  }, {
    type: TradeRouteSortType.LeaderName,
    locKey: "LOC_COMMERCE_TRADE_SORT_BY_LEADER_NAME"
  }, {
    type: TradeRouteSortType.LeaderRelationship,
    locKey: "LOC_COMMERCE_TRADE_SORT_BY_LEADER_RELATIONSHIP"
  }, {
    type: TradeRouteSortType.SettlementName,
    locKey: "LOC_COMMERCE_SORT_BY_SETTLEMENT_NAME"
  }];
  const sortFunction = createMemo(() => {
    const sortingType = model.selectedTradeRouteSorting()?.type || TradeRouteSortType.Unset;
    function sortByResourceCount(a, b) {
      return b.incomingResources.length - a.incomingResources.length;
    }
    function sortByLeaderName(a, b) {
      if (a.leaderId === b.leaderId) {
        return 0;
      }
      const leaderA = Players.get(a.leaderId);
      const leaderB = Players.get(b.leaderId);
      if (!leaderA) {
        return 1;
      }
      if (!leaderB) {
        return -1;
      }
      if (leaderA.isMajor && leaderB.isMinor) {
        return -1;
      }
      if (leaderA.isMinor && leaderB.isMajor) {
        return 1;
      }
      const leaderANameString = Locale.compose(leaderA.leaderName);
      const leaderBNameString = Locale.compose(leaderB.leaderName);
      return Locale.compare(leaderANameString, leaderBNameString);
    }
    function sortByLeaderRelationship(a, b) {
      if (a.leaderId === b.leaderId) {
        return 0;
      }
      const leaderA = Players.get(a.leaderId);
      const leaderB = Players.get(b.leaderId);
      if (!leaderA) {
        return 1;
      }
      if (!leaderB) {
        return -1;
      }
      if (leaderA.isMajor && leaderB.isMinor) {
        return -1;
      }
      if (leaderA.isMinor && leaderB.isMajor) {
        return 1;
      }
      const relationshipA = getRelationship(GameContext.localPlayerID, a.leaderId);
      const relationshipB = getRelationship(GameContext.localPlayerID, b.leaderId);
      return relationshipB.amount - relationshipA.amount;
    }
    function sortBySettlementName(a, b) {
      return compareSettlementNames(a.cityID, b.cityID);
    }
    function sortBySettlementType(a, b) {
      return compareSettlementTypes(a.cityID, b.cityID);
    }
    switch (sortingType) {
      case TradeRouteSortType.Resource: {
        return sortByResourceCount;
      }
      case TradeRouteSortType.LeaderName: {
        return sortByLeaderName;
      }
      case TradeRouteSortType.LeaderRelationship: {
        return sortByLeaderRelationship;
      }
      case TradeRouteSortType.SettlementName: {
        return sortBySettlementName;
      }
      case TradeRouteSortType.SettlementType: {
        return sortBySettlementType;
      }
    }
    return sortByResourceCount;
  });
  const [textFilter, setTextFilter] = createSignal("");
  const tradeRouteSearchResults = createMemo(() => {
    return model.tradeRouteSearch(textFilter());
  });
  function tradeRouteIsIncludedInFilter(tradeRouteData) {
    if (textFilter() === "") {
      return true;
    }
    return tradeRouteSearchResults().has(ComponentID.toString(tradeRouteData.cityID));
  }
  createEffect(() => {
    props.tradeRouteSections.forEach((tradeRouteSection) => {
      tradeRouteSection.tradeRoutes.sort(sortFunction());
    });
  });
  const [isSorting, setIsSorting] = createSignal(false);
  const [focusedTradeRoute, setFocusedTradeRoute] = createSignal();
  const shouldAutoFocusDropdown = createMemo(() => isSorting());
  const autoFocusRouteIsPermitted = createMemo(() => !shouldAutoFocusDropdown());
  const firstVisibleSectionIndex = createMemo(() => {
    let visibleSectionIndex = -1;
    props.tradeRouteSections.forEach((section, index) => {
      if (visibleSectionIndex > -1) {
        return;
      }
      if (section.tradeRoutes.length > 0) {
        visibleSectionIndex = index;
      }
    });
    return visibleSectionIndex;
  });
  const shouldAutoFocusRoute = (routeCityId, sectionIndex, routeIndex) => {
    if (!autoFocusRouteIsPermitted()) {
      return false;
    }
    if (!layoutComplete()) {
      return false;
    }
    if (focusedTradeRoute() === void 0) {
      return sectionIndex === firstVisibleSectionIndex() && routeIndex === 0;
    }
    return ComponentID.isMatch(focusedTradeRoute(), routeCityId);
  };
  const gamepadTrayItems = createMemo(() => {
    if (model.selectedTradeRouteId()) {
      const selectedCity = Cities.get(model.selectedTradeRouteId());
      if (selectedCity) {
        const deselectRouteLabel = Locale.compose("LOC_COMMERCE_GAMEPAD_STOP_VIEWING_CONTAINER_HINT", Locale.compose(selectedCity.name));
        return [{
          hotkeyAction: "cancel",
          name: "cancel-traderoute-edit",
          navTrayText: deselectRouteLabel,
          onActivate: () => model.setSelectedTradeRouteId()
        }];
      }
      console.warn("commerce-screen-trade-tab.tsx: When getting gamepadTrayItems, couldn't find city with ID", model.selectedTradeRouteId());
      return [];
    } else {
      const items = [{
        hotkeyAction: "shell-action-2",
        name: "sort-traderoutes",
        navTrayText: "LOC_COMMERCE_SORT_LABEL",
        onActivate: () => {
          setIsSorting((prev) => !prev);
        }
      }];
      if (focusedTradeRoute()) {
        const focusedCity = Cities.get(focusedTradeRoute());
        if (focusedCity) {
          const selectRouteLabel = Locale.compose("LOC_COMMERCE_GAMEPAD_VIEW_CONTAINER_HINT", Locale.compose(focusedCity.name));
          items.push({
            hotkeyAction: "accept",
            name: "traderoute-edit",
            navTrayText: selectRouteLabel
            // activate handled by activatable in trade-route-card.tsx
          });
        }
      }
      return items;
    }
  });
  return createComponent(SpatialSlot, {
    name: "Commerce-Screen-Trade-Tab",
    "class": "flex-auto",
    get children() {
      return createComponent(CommerceScreenBaseTabContent, {
        title: "LOC_COMMERCE_TRADE_ROUTES_TITLE",
        description: "LOC_COMMERCE_TRADE_ROUTES_DESCRIPTION",
        get headerBar() {
          return (() => {
            var _el$2 = _tmpl$2(), _el$3 = _el$2.firstChild;
            insert(_el$2, createComponent(Show, {
              get when() {
                return createMemo(() => ViewExperience() === UIViewExperience.Desktop)() && !IsControllerActive();
              },
              get children() {
                return createComponent(SearchBar, {
                  value: textFilter,
                  setValue: setTextFilter,
                  "class": "mr-4"
                });
              }
            }), _el$3);
            insert(_el$3, createComponent(L10n.Compose, {
              text: "LOC_COMMERCE_SORT_LABEL"
            }));
            insert(_el$2, createComponent(AudioContextProvider, {
              segment: "Filters",
              get children() {
                return createComponent(Dropdown, {
                  "class": "ml-2 w-60 pointer-events-auto grow-0 min-h-14",
                  selectedItemTemplate: (item) => (() => {
                    var _el$4 = _tmpl$3();
                    insert(_el$4, createComponent(L10n.Compose, {
                      get text() {
                        return item.locKey;
                      }
                    }));
                    return _el$4;
                  })(),
                  onItemSelected: (item) => model.setSelectedTradeRouteSorting(item),
                  get defaultValue() {
                    return tradeRouteSortItems[0];
                  },
                  get disableFocus() {
                    return !isSorting();
                  },
                  get autoFocus() {
                    return shouldAutoFocusDropdown();
                  },
                  onFocus: () => setFocusedTradeRoute(),
                  get children() {
                    return createComponent(For, {
                      each: tradeRouteSortItems,
                      children: (item) => createComponent(DropdownItem, {
                        value: item,
                        get children() {
                          return createComponent(L10n.Compose, {
                            get text() {
                              return item.locKey;
                            }
                          });
                        }
                      })
                    });
                  }
                });
              }
            }), null);
            return _el$2;
          })();
        },
        get children() {
          return createComponent(GamepadTrayItemProvider, {
            "class": "flex-auto",
            name: "traderoute-gamepad-items",
            items: gamepadTrayItems,
            get children() {
              return createComponent(ScrollArea, {
                "class": "flex-auto",
                useProxy: true,
                get children() {
                  var _el$ = _tmpl$();
                  var _ref$ = cardsContainerRef;
                  typeof _ref$ === "function" ? use(_ref$, _el$) : cardsContainerRef = _el$;
                  insert(_el$, createComponent(For, {
                    get each() {
                      return props.tradeRouteSections;
                    },
                    children: (section, index) => createComponent(CollapsibleContainer, mergeProps(() => section.collapsibleContainerData, {
                      "class": "text-secondary w-full mb-2",
                      headerClass: "font-title fxs-header",
                      get disableFocus() {
                        return model.selectedTradeRouteId() !== void 0 || isSorting();
                      },
                      get children() {
                        var _el$5 = _tmpl$5();
                        insert(_el$5, createComponent(Show, {
                          get when() {
                            return section.tradeRoutes.length == 0 && section.emptyDescription != "";
                          },
                          get children() {
                            var _el$6 = _tmpl$4();
                            insert(_el$6, createComponent(L10n.Compose, {
                              get text() {
                                return section.emptyDescription;
                              }
                            }));
                            return _el$6;
                          }
                        }), null);
                        insert(_el$5, createComponent(For, {
                          get each() {
                            return section.tradeRoutes;
                          },
                          children: (tradeRoute, subIndex) => createComponent(Show, {
                            get when() {
                              return tradeRouteIsIncludedInFilter(tradeRoute);
                            },
                            get children() {
                              return createComponent(TradeRouteCard, {
                                tradeRoute,
                                onFocus: () => setFocusedTradeRoute(tradeRoute.cityID),
                                get autoFocus() {
                                  return shouldAutoFocusRoute(tradeRoute.cityID, index(), subIndex());
                                },
                                get disabled() {
                                  return isSorting();
                                },
                                get ["class"]() {
                                  return `${hasCheckedForWrap() ? "opacity-100" : "opacity-0"}`;
                                },
                                get style() {
                                  return {
                                    width: tradeRouteCardWidth() !== void 0 ? tradeRouteCardWidth() : DEFAULT_CARD_WIDTH + "px",
                                    "margin-right": numCardsInFirstRow() > 0 && (subIndex() + 1) % numCardsInFirstRow() !== 0 || numCardsInFirstRow() === 0 && hasCheckedForWrap() ? TRADE_ROUTE_CARD_MARGIN_RIGHT + "px" : "0px"
                                  };
                                }
                              });
                            }
                          })
                        }), null);
                        return _el$5;
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

export { TradeRoutesContainer };
//# sourceMappingURL=commerce-screen-trade-tab.js.map

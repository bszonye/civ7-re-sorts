import { template, insert, className, setAttribute } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, createMemo, createEffect, on, createComponent, untrack, Show, mergeProps, createRenderEffect, For } from '../../../../core/vendor/solid-js/dist/solid.js';
import { ComponentID } from '../../../../core/ui/utilities/utilities-component-id.js';
import { Icon as Icon$1 } from '../../../../core/ui/utilities/utilities-image.js';
import { Layout } from '../../../../core/ui/utilities/utilities-layout.js';
import { Activatable } from '../../../../core/ui-next/components/activatable.js';
import { AudioContextProvider } from '../../../../core/ui-next/components/audio-context-provider.js';
import { CardFrame } from '../../../../core/ui-next/components/card-frame.js';
import { CollapsibleContainer } from '../../../../core/ui-next/components/collapsible-container.js';
import { ConfirmationDialog } from '../../../../core/ui-next/components/confirmation-dialog.js';
import { Divider } from '../../../../core/ui-next/components/divider.js';
import { createTypedDragAndDrop, useDraggableContext, useDragAndDropContext, DragEndStatus } from '../../../../core/ui-next/components/drag-and-drop.js';
import { Dropdown, DropdownItem } from '../../../../core/ui-next/components/dropdown.js';
import { Icon } from '../../../../core/ui-next/components/icon.js';
import { ImageButton } from '../../../../core/ui-next/components/image-button.js';
import { useImageCache } from '../../../../core/ui-next/components/image-cache.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { ScrollArea } from '../../../../core/ui-next/components/scroll-area.js';
import { SpatialSlot, HSlot } from '../../../../core/ui-next/components/slot.js';
import { Tooltip } from '../../../../core/ui-next/components/tooltip.js';
import { useAudio } from '../../../../core/ui-next/services/audio-support.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { IsControllerActive, ActiveInputDevice } from '../../../../core/ui-next/services/input.js';
import { LayoutModel } from '../../../../core/ui-next/utilities/layout-utilities.js';
import { FramedResource } from '../../components/framed-resource.js';
import { GamepadTrayItemProvider } from '../../components/gamepad-tray-item-provider.js';
import { YieldDelta } from '../../components/yield-delta.js';
import { CommerceScreenBaseTabContent } from './commerce-screen-base-tab-content.js';
import { useCommerceScreenContext, gamepadLog, getResourceName, ResourceContainerSelectionState, getCityName } from './commerce-screen-model.js';
import { FactoryTypeDisplay } from './factory-type-display.js';
import { ResourceTooltip } from '../../tooltips/resource-tooltip.js';
import { Hotkeys } from '../../../../core/ui-next/components/hotkeys.js';
import style from './commerce-screen.scss.js';

var
  _tmpl$ = template(`<div></div>`),
//_tmpl$2 = template(`<div><div tabindex=1 data-name=available-resources-container class="flex flex-col h-full w-full relative pb-4"></div></div>`),
  _tmpl$2 = template(`<div><div tabindex=1 data-name=available-resources-container class="flex flex-col h-full w-full relative pb-0"></div></div>`),
//_tmpl$3 = template(`<div data-name=commerce-unassigned-resources class=flex-auto></div>`),
  _tmpl$3 = template(`<div data-name=commerce-unassigned-resources class=flex-auto></div>`),
  _tmpl$4 = template(`<div class="text-accent-2 m-2"></div>`),
  _tmpl$5 = template(`<div class="flex flex-row mb-1 relative"><div class=text-secondary></div></div>`),
  _tmpl$6 = template(`<div class="w-full h-0\\.5 mt-1 mb-2 opacity-50"></div>`),
//_tmpl$7 = template(`<div class="flex flex-row flex-wrap relative"></div>`),
  _tmpl$7 = template(`<div class="flex flex-row flex-wrap -mr-3 relative"></div>`),
  _tmpl$8 = template(`<div class="flex flex-row items-center justify-center self-end pr-4"></div>`),
//_tmpl$9 = template(`<div tabindex=2 data-name=slotted-resource-container class="flex flex-col flex-auto pb-4 relative"></div>`),
  _tmpl$9 = template(`<div tabindex=2 data-name=slotted-resource-container class="flex flex-col flex-auto pb-0 relative"></div>`),
  _tmpl$10 = template(`<div class="w-full flex flex-col"></div>`),
  _tmpl$11 = template(`<div class="city-type-pill rounded-full min-w-7 flex flex-row justify-center items-center px-2 ml-2"><span></span></div>`),
  _tmpl$12 = template(`<div class="city-type-pill rounded-full min-w-7 flex flex-row justify-center items-center px-2 ml-2"></div>`),
  _tmpl$13 = template(`<div class="flex flex-row items-center text-xs text-accent-1"></div>`),
//_tmpl$14 = template(`<div class="flex flex-row items-center"><div class="mr-2 size-9 bg-center bg-cover bg-no-repeat relative"></div><div class="text-secondary font-title uppercase text-lg"></div></div>`),
  _tmpl$14 = template(`<div class="flex flex-row items-center"><div class="mr-2 -my-0\\.5 size-9 bg-center bg-cover bg-no-repeat relative"></div><div class="text-secondary font-title uppercase text-lg"></div></div>`),
  _tmpl$15 = template(`<div class="flex flex-row flex-wrap relative w-full justify-between"></div>`),
//_tmpl$16 = template(`<div class="flex flex-row items-center"><div class="flex flex-row max-h-full items-end"></div><div class="flex-auto flex flex-row"><div class=flex-auto><div class="flex flex-row flex-wrap mt-4 flex-auto"></div></div></div></div>`),
  _tmpl$16 = template(`<div class="flex flex-row items-start"><div class="flex flex-row max-h-full items-start"></div><div class="relative flex-auto flex flex-row"><div class=flex-auto><div class="flex flex-row flex-wrap mt-1 -mr-3 flex-auto"></div></div></div></div>`),
  _tmpl$17 = template(`<div class="flex items-center flex-col relative"></div>`),
  _tmpl$18 = template(`<div class=hidden></div>`),
  _tmpl$19 = template(`<div class="size-16 mr-3 relative flex flex-row justify-center"></div>`),
  _tmpl$20 = template(`<div class="w-full p-2 mb-2 relative"><div class="bg-center bg-no-repeat absolute inset-0 bg-cover opacity-20"></div><div class="absolute top-1 left-1 rotate-180 size-4 bg-contain opacity-30"></div><div class="absolute top-1 right-1 -rotate-90 size-4 bg-contain opacity-30"></div><div class="absolute bottom-1 left-1 rotate-90 size-4 bg-contain opacity-30"></div><div class="absolute bottom-1 right-1 size-4 bg-contain opacity-30"></div><div class="flex flex-row"><div class="flex flex-col relative items-start justify-center ml-3"><div class="uppercase mr-2 text-secondary font-title"></div><div class=text-accent-2></div></div></div></div>`),
  _tmpl$21 = template(`<div class="text-secondary w-full text-center -top-9 left-0"></div>`),
  _tmpl$22 = template(`<div class="flex flex-row flex-auto relative"></div>`),
  _tmpl$23 = template(`<div class="font-title uppercase text-secondary"></div>`),
  _tmpl$24 = template(`<div class="flex flex-row w-full items-center"><div class="flex flex-row items-center"><div class="text-secondary uppercase font-title flex-auto"></div><div class="flex flex-row mr-6"></div></div><div class="text-secondary uppercase font-title ml-2 pointer-events-none"></div></div>`),
  _tmpl$25 = template(`<div class="ml-2 flex flex-row"><div class="size-6 mr-1 bg-cover bg-center"></div></div>`),
  _tmpl$26 = template(`<div class=ml-2></div>`);
const DEBUG_DRAG_AND_DROP = false;
const [DragAndDrop, Draggable, Dropzone] = createTypedDragAndDrop();
const DraggableResource = (props) => {
  const model = useCommerceScreenContext();
  const [shouldAutoFocus, setShouldAutoFocus] = createSignal(false);
  function onActivate() {
    if (!model.isSlottingAvailable) {
      return;
    }
    if (props.resourceData.cityID) {
      if (IsControllerActive()) {
        model.setSelectedSettlementId(void 0);
      }
      model.clickSlottedResource({
        resourceValue: props.resourceData.resourceValue,
        cityID: props.resourceData.cityID
      });
    } else {
      model.clickAvailableResource({
        resourceValue: props.resourceData.resourceValue,
        cityID: props.resourceData.cityID
      });
    }
  }
  const isResourceSelected = createMemo(() => {
    return model.selectedResource().resourceValue == props.resourceData.resourceValue;
  });
  createEffect(() => {
    if (!IsControllerActive()) {
      return false;
    }
    const focusInitialResourceOnSettlementSelectedWithoutResourceSelected = model.selectedResource().resourceValue === -1 && (model.selectedSettlementId() ? ComponentID.isMatch(model.selectedSettlementId(), props.resourceData.cityID ?? null) : false) && props.isFirstResourceInSection;
    const shouldAutoFocus2 = focusInitialResourceOnSettlementSelectedWithoutResourceSelected;
    if (shouldAutoFocus2) {
      gamepadLog("AUTO-FOCUS " + getResourceName(props.resourceData));
    }
    setShouldAutoFocus(shouldAutoFocus2);
  });
  createEffect(on(model.isInSortAndFilterMode, (newValue) => {
    if (!newValue) {
      if (!props.resourceData.cityID && props.isFirstResourceInSection) {
        setShouldAutoFocus(true);
      }
    }
  }));
  const resourceName = createMemo(() => getResourceName({
    cityID: props.resourceData.cityID,
    resourceValue: props.resourceData.resourceValue
  }));
  return createComponent(Draggable, {
    get data() {
      return props.resourceData;
    },
    get debugId() {
      return "draggable-" + resourceName();
    },
    debugTrace: DEBUG_DRAG_AND_DROP,
    get children() {
      return (() => {
        const draggableContext = useDraggableContext();
        const semitransparent = createMemo(() => {
          return !model.canSelectResource(props.resourceData);
        });
        const enabled = createMemo(() => {
          if (isResourceSelected()) {
            return false;
          }
          if (!IsControllerActive()) {
            return !draggableContext.isDragging();
          }
          if (model.selectedSettlementId()) {
            if (!props.resourceData.cityID) {
              return false;
            }
            const sameSettlement = ComponentID.isMatch(model.selectedSettlementId(), props.resourceData.cityID);
            return sameSettlement;
          }
          if (model.selectedResource().resourceValue !== -1) {
            return false;
          }
          if (!props.resourceData.cityID) {
            return true;
          }
          return false;
        });
        const name = createMemo(() => Locale.compose(props.resourceData.resourceProps.resourceName));
        const onAnimEnd = (e) => {
          if (e.animationName !== "grow") {
            return;
          }
          const lastSlottedValues = untrack(() => model.lastSlottedResourceValues());
          if (lastSlottedValues.includes(props.resourceData.resourceValue) === false) {
            return;
          }
          const index = lastSlottedValues.indexOf(props.resourceData.resourceValue);
          lastSlottedValues.splice(index, 1);
          model.setLastSlottedResourceValues(lastSlottedValues);
        };
        const setSwapTargetIfAppropriate = () => {
          if (model.selectedResource().resourceValue === -1 || model.selectedResource().resourceValue === props.resourceData.resourceValue || !props.resourceData.canSwapWithSelectedResource()) {
            return;
          }
          model.setResourceSwapTarget(props.resourceData.resourceValue);
        };
        const unsetSwapTarget = () => {
          model.setResourceSwapTarget(-1);
        };
        createEffect(() => {
          if (props.isActiveDropzone) {
            setSwapTargetIfAppropriate();
          } else {
            unsetSwapTarget();
          }
        });
        return createComponent(Show, {
          get when() {
            return createMemo(() => !!enabled())() && !model.isInSortAndFilterMode();
          },
          get fallback() {
            return createComponent(ResourceTooltip, mergeProps(() => props.resourceData.resourceProps, {
              get children() {
                var _el$ = _tmpl$();
                _el$.addEventListener("blur", unsetSwapTarget);
                _el$.addEventListener("focus", setSwapTargetIfAppropriate);
                _el$.addEventListener("animationend", onAnimEnd);
                insert(_el$, createComponent(ResourceSlot, {
                  get data() {
                    return props.resourceData;
                  },
                  get semitransparent() {
                    return semitransparent();
                  }
                }));
                createRenderEffect(() => _el$.classList.toggle("last-slotted", !!model.wasResourceJustSlotted(props.resourceData.resourceValue)));
                return _el$;
              }
            }));
          },
          get children() {
            return createComponent(AudioContextProvider, {
              segment: "DraggableResource",
              get children() {
                return createComponent(ResourceTooltip, mergeProps(() => props.resourceData.resourceProps, {
                  get children() {
                    return createComponent(Activatable, {
                      get name() {
                        return `${name()}-Activatable`;
                      },
                      get autoFocus() {
                        return shouldAutoFocus();
                      },
                      "class": "draggable-resource hover\\:scale-125 focus\\:scale-125 relative size-16",
                      get classList() {
                        return {
                          "last-slotted": model.wasResourceJustSlotted(props.resourceData.resourceValue),
                          "focused-resource": IsControllerActive() && model.focusedResource().resourceValue === props.resourceData.resourceValue
                        };
                      },
                      onActivate,
                      onFocus: () => {
                        model.setFocusedResource({
                          resourceValue: props.resourceData.resourceValue,
                          cityID: props.resourceData.cityID
                        });
                        model.setFocusedSettlementId(void 0);
                        setSwapTargetIfAppropriate();
                      },
                      onBlur: () => {
                        unsetSwapTarget();
                      },
                      onMouseEnter: setSwapTargetIfAppropriate,
                      onMouseLeave: unsetSwapTarget,
                      get children() {
                        return createComponent(ResourceSlot, {
                          get data() {
                            return props.resourceData;
                          },
                          get semitransparent() {
                            return semitransparent();
                          }
                        });
                      }
                    });
                  }
                }));
              }
            });
          }
        });
      })();
    }
  });
};
const ResourceSlot = (props) => {
  const model = useCommerceScreenContext();
  const draggableContext = useDraggableContext();
  const showHighlight = createMemo(() => {
    const result = !draggableContext.isRenderingOverlay && model.selectedResource().resourceValue == props.data.resourceValue;
    return result;
  });
  const isFilteredOut = createMemo(() => {
    let result = false;
    const filter = model.selectedResourceFilter();
    if (filter) {
      result = filter != "DEFAULT" && !props.data.yieldTypes.includes(filter);
    }
    return result;
  });
  return createComponent(FramedResource, mergeProps({
    "class": "framed-resource mr-3",
    get classList() {
      return {
        "opacity-30": isFilteredOut(),
        "opacity-10": props.semitransparent && !showHighlight(),
        "scale-125": showHighlight()
      };
    }
  }, () => props.data.resourceProps, {
    get showHighlight() {
      return showHighlight();
    },
    size: 16,
    get isSwapTarget() {
      return createMemo(() => model.selectedResource().resourceValue !== -1)() && model.resourceSwapTarget() === props.data.resourceValue;
    },
    get children() {
      return createComponent(Icon, {
        "class": "pulse-highlight absolute size-16",
        name: "url(blp:resource_slot_select)",
        isUrl: true
      });
    }
  }));
};
const AvailableResourcesContainer = (props) => {
  const model = useCommerceScreenContext();
  return (() => {
    var _el$2 = _tmpl$2(), _el$3 = _el$2.firstChild;
    _el$2.style.setProperty("width", "22.8888888889rem");
    insert(_el$3, createComponent(ScrollArea, {
      "class": "flex-auto",
      reserveSpace: true,
      get allowGamepadPan() {
        return createMemo(() => model.focusedResource().resourceValue !== -1)() && model.focusedResource().cityID === void 0;
      },
      get children() {
        return createComponent(For, {
          get each() {
            return props.availableResourceSectionData;
          },
          children: (section, sectionIndex) => {
            return createComponent(CollapsibleContainer, {
              get titleText() {
                return section.collapsibleContainerData.titleText;
              },
              get titleIcon() {
                return section.collapsibleContainerData.titleIcon;
              },
              "class": "text-secondary w-full h-auto mb-2",
              disableFocus: true,
              get children() {
                return createComponent(AvailableResourcesSection, {
                  section,
                  index: sectionIndex
                });
              }
            });
          }
        });
      }
    }));
    return _el$2;
  })();
};
const AvailableResourcesSection = (props) => {
  const model = useCommerceScreenContext();
  const dndContext = useDragAndDropContext();
  let activatable;
  const [isFocused, setIsFocused] = createSignal(false);
  const anyResourceSelected = createMemo(() => {
    return model.selectedResource().resourceValue !== -1;
  });
  const isEnabled = createMemo(() => {
    if (model.isSlottingAvailable) {
      const isDragging = dndContext.isDragging();
      if (isDragging === null && anyResourceSelected()) {
        return !IsControllerActive();
      }
    }
    return false;
  });
  const selectionState = createMemo(() => model.getResourceContainerSelectionState(props.section.isConnectedToTradeNetwork));
  return createComponent(Activatable, {
    ref(r$) {
      var _ref$ = activatable;
      typeof _ref$ === "function" ? _ref$(r$) : activatable = r$;
    },
    onActivate: () => {
      model.unslotSelectedResource();
    },
    onFocus: () => {
      setIsFocused(true);
      model.setFocusedSettlementId(void 0);
    },
    onBlur: () => setIsFocused(false),
    get disableFocus() {
      return selectionState() === ResourceContainerSelectionState.NotSelecting || !isEnabled();
    },
    get disabled() {
      return !isEnabled() || selectionState() === ResourceContainerSelectionState.CanNotSelect;
    },
    get suppressPointerChanges() {
      return selectionState() === ResourceContainerSelectionState.NotSelecting;
    },
    get children() {
      return createComponent(AvailableResourcesSectionInternal, mergeProps(props, {
        isParentFocused: isFocused
      }));
    }
  });
};
const AvailableResourcesSectionInternalSymbol = Symbol();
const AvailableResourcesSectionInternal = (props) => {
  const model = useCommerceScreenContext();
  const [sectionIsActiveDropzone, setSectionIsActiveDropzone] = createSignal(false);
  const images = {
    ticketPositiveCSS: "url(blp:base_ticket-positive_bg)",
    ticketNegativeCSS: "url(blp:base_ticket-negative_bg)",
    ticketSelectedCSS: "url(blp:base_ticket-select-bg)"
  };
  const imageCache = useImageCache();
  imageCache.registerImages(AvailableResourcesSectionInternalSymbol, Object.values(images));
  const isResourceSelected = createMemo(() => {
    const isSelected = model.selectedResource().resourceValue !== -1;
    return isSelected;
  });
  const canDrop = (draggable, _dropzone) => {
    const result = createMemo(() => {
      const resourceData = draggable.data;
      return props.section.isConnectedToTradeNetwork === model.resourceIsConnectedToTradeNetwork(resourceData.resourceValue);
    });
    return result;
  };
  function isFirstVisibleSubsection(subsectionIndex) {
    const firstPopulatedSubsectionIndex = props.section.subSections.findIndex((subSection) => subSection.resourceSlotData.length > 0);
    return subsectionIndex === firstPopulatedSubsectionIndex;
  }
  return createComponent(Dropzone, {
    debugId: "Available",
    data: {
      cityID: void 0
    },
    canDrop,
    onDragOver: () => setSectionIsActiveDropzone(true),
    onDragLeave: () => setSectionIsActiveDropzone(false),
    onDragDrop: () => setSectionIsActiveDropzone(false),
    debugTrace: DEBUG_DRAG_AND_DROP,
    get children() {
      return createComponent(CardFrame, {
        "class": "w-full my-2 py-2 pl-2 pr-2 flex flex-col",
        get style() {
          return createMemo(() => !!isResourceSelected())() ? createMemo(() => props.section.isConnectedToTradeNetwork === model.resourceIsConnectedToTradeNetwork(model.selectedResource().resourceValue))() ? sectionIsActiveDropzone() || props.isParentFocused() ? {
            "border-image-source": images.ticketSelectedCSS
          } : {
            "border-image-source": images.ticketPositiveCSS
          } : {
            "border-image-source": images.ticketNegativeCSS
          } : {};
        },
        get children() {
          return createComponent(Show, {
            get when() {
              return props.section.subSections.some((subSection) => subSection.resourceSlotData.length > 0);
            },
            get fallback() {
              return (() => {
                var _el$5 = _tmpl$4();
                insert(_el$5, createComponent(L10n.Compose, {
                  get text() {
                    return props.section.emptySubsectionsDescription;
                  }
                }));
                return _el$5;
              })();
            },
            get children() {
              var _el$4 = _tmpl$3();
              insert(_el$4, createComponent(For, {
                get each() {
                  return props.section.subSections;
                },
                children: (subSection, subsectionIndex) => createComponent(Show, {
                  get when() {
                    return subSection.resourceSlotData.length > 0;
                  },
                  get children() {
                    return [(() => {
                      var _el$6 = _tmpl$5(), _el$7 = _el$6.firstChild;
                      insert(_el$7, createComponent(L10n.Compose, {
                        get text() {
                          return subSection.title;
                        }
                      }));
                      return _el$6;
                    })(), (() => {
                      var _el$8 = _tmpl$6();
                      _el$8.style.setProperty("background", "linear-gradient(90deg, rgba(77, 83, 102, 1) 0%, rgba(77, 83, 102, 1) 100%)");
                      return _el$8;
                    })(), (() => {
                      var _el$9 = _tmpl$7();
                      insert(_el$9, createComponent(For, {
                        get each() {
                          return subSection.resourceSlotData;
                        },
                        children: (resourceSlot, resourceIndex) => {
                          const [resourceIsActiveDropzone, setResourceIsActiveDropzone] = createSignal(false);
                          const resourceName = createMemo(() => getResourceName({
                            resourceValue: resourceSlot.resourceValue
                          }));
                          return createComponent(Dropzone, {
                            "class": "size-19 mb-1",
                            get data() {
                              return {
                                resourceValue: resourceSlot.resourceValue
                              };
                            },
                            get debugId() {
                              return "dropzone-" + resourceName();
                            },
                            debugTrace: DEBUG_DRAG_AND_DROP,
                            onDragOver: () => setResourceIsActiveDropzone(true),
                            onDragLeave: () => setResourceIsActiveDropzone(false),
                            onDragDrop: () => setResourceIsActiveDropzone(false),
                            get children() {
                              return createComponent(DraggableResource, {
                                resourceData: resourceSlot,
                                get isFirstResourceInSection() {
                                  return createMemo(() => !!isFirstVisibleSubsection(subsectionIndex()))() && resourceIndex() === 0;
                                },
                                get isActiveDropzone() {
                                  return resourceIsActiveDropzone();
                                }
                              });
                            }
                          });
                        }
                      }));
                      return _el$9;
                    })()];
                  }
                })
              }));
              return _el$4;
            }
          });
        }
      });
    }
  });
};
const SlottedResourcesContainer = (props) => {
  const model = useCommerceScreenContext();
  const isReturnResourcesEnabled = createMemo(() => model.isSlottingAvailable && props.slottedResourceSectionData.some((sectionData) => sectionData.cityResources.some((cityData) => cityData.slottedResources.length > 0)) && model.selectedResource().resourceValue === -1);
  return (() => {
    var _el$10 = _tmpl$9();
    insert(_el$10, createComponent(ScrollArea, {
      "class": "flex-auto pl-2",
      get allowGamepadPan() {
        return model.focusedSettlementId() !== void 0 || model.selectedSettlementId() !== void 0;
      },
      get children() {
        return [createComponent(For, {
          get each() {
            return props.slottedResourceSectionData;
          },
          children: (section) => createComponent(CollapsibleContainer, {
            get titleText() {
              return section.collapsibleContainerData.titleText;
            },
            get titleIcon() {
              return section.collapsibleContainerData.titleIcon;
            },
            "class": "text-secondary w-full mb-2",
            disableFocus: true,
            get children() {
              return createComponent(Show, {
                get when() {
                  return section.cityResources.length > 0;
                },
                get fallback() {
                  return createComponent(CardFrame, {
                    "class": "w-full my-2 p-4 flex flex-col text-accent-2",
                    get children() {
                      return createComponent(L10n.Compose, {
                        get text() {
                          return section.emptyResourcesDescription;
                        }
                      });
                    }
                  });
                },
                get children() {
                  var _el$12 = _tmpl$10();
                  insert(_el$12, createComponent(For, {
                    get each() {
                      return section.cityResources;
                    },
                    children: (subSection, index) => {
                      return createComponent(CityResourceContainer, mergeProps({
                        get cityIndex() {
                          return index();
                        }
                      }, subSection));
                    }
                  }));
                  return _el$12;
                }
              });
            }
          })
        }), (() => {
          var _el$11 = _tmpl$8();
          insert(_el$11, createComponent(ConfirmationDialog, {
            name: "confirm-unassign-resources",
            onAccept: () => {
              const audioTrigger = useAudio("CommerceScreen/ReturnAllResources/Confirm");
              audioTrigger("activate");
              model.clearAllResources();
            },
            get title() {
              return createComponent(L10n.Compose, {
                text: "LOC_COMMERCE_UNASSIGN_ALL_RESOURCES_CONFIRMATION_TITLE"
              });
            },
            get content() {
              return createComponent(L10n.Compose, {
                text: "LOC_COMMERCE_UNASSIGN_ALL_RESOURCES_CONFIRMATION_CONTENT"
              });
            },
            get children() {
              return createComponent(Show, {
                get when() {
                  return IsControllerActive() === false;
                },
                get children() {
                  return [createComponent(L10n.Compose, {
                    text: "LOC_COMMERCE_UNASSIGN_ALL_RESOURCES_LABEL"
                  }), createComponent(Tooltip.Text, {
                    text: "LOC_COMMERCE_UNASSIGN_ALL_RESOURCES_TOOLTIP",
                    get children() {
                      return createComponent(AudioContextProvider, {
                        segment: "ReturnAllResources",
                        get children() {
                          return createComponent(ReturnResourceButton, {
                            "class": "ml-2 mr-0",
                            get classList() {
                              return {
                                "opacity-50": !isReturnResourcesEnabled()
                              };
                            },
                            get disabled() {
                              return !isReturnResourcesEnabled();
                            }
                          });
                        }
                      });
                    }
                  })];
                }
              });
            }
          }));
          return _el$11;
        })()];
      }
    }));
    return _el$10;
  })();
};
// const pillClassList = "city-type-pill rounded-full min-w-7 flex flex-row justify-center items-center px-2 ml-2";
const SettlementInfoCountSymbol = Symbol();
const SettlementInfoCount = (props) => {
  const imageCache = useImageCache();
  imageCache.registerImages(SettlementInfoCountSymbol, ["blp:icon_building_trade_routes", "blp:icon_building_warehouse", "blp:icon_building_water"]);
  const imageUrl = createMemo(() => {
    let result = "";
    switch (props.type) {
      case "tradeRoute":
        result = "blp:icon_building_trade_routes";
        break;
      case "warehouse":
        result = "blp:icon_building_warehouse";
        break;
      case "water":
        result = "blp:icon_building_water";
        break;
    }
    return `url(${result})`;
  });
  return createComponent(Show, {
    get when() {
      return props.count > 0;
    },
    get children() {
      var _el$13 = _tmpl$11(), _el$14 = _el$13.firstChild;
      insert(_el$13, createComponent(Icon, {
        "class": "size-5 mr-1",
        get name() {
          return imageUrl();
        },
        isUrl: true
      }), _el$14);
      insert(_el$14, () => props.count);
      return _el$13;
    }
  });
};
const SettlementNameSymbol = Symbol();
const SettlementName = (props) => {
  const imageCache = useImageCache();
  imageCache.registerImages(SettlementNameSymbol, [
    "blp:banner_hex",
    "blp:hud_production_pill",
    // From `.city-type-pill
    "blp:focus_factory",
    "blp:focus_farm",
    "blp:focus_fort",
    "blp:focus_growth",
    "blp:focus_hub",
    "blp:focus_mining",
    "blp:focus_religious",
    "blp:focus_resort",
    "blp:focus_trade",
    "blp:focus_urban"
  ]);
  return (() => {
    var _el$15 = _tmpl$14(), _el$16 = _el$15.firstChild, _el$17 = _el$16.nextSibling;
    _el$16.style.setProperty("background-image", 'url("blp:banner_hex")');
    insert(_el$16, createComponent(Icon, {
      "class": "size-8 absolute top-1\\/2 left-1\\/2 -translate-1\\/2",
      get name() {
        return props.settlementIcon;
      }
    }));
    insert(_el$17, () => props.settlementName);
    insert(_el$15, createComponent(Show, {
      get when() {
        return LayoutModel.get().screenHeight() > Layout.pixelsToScreenPixels(720);
      },
      get children() {
        var _el$18 = _tmpl$13();
        insert(_el$18, createComponent(Tooltip.Text, {
          text: "LOC_COMMERCE_SETTLEMENT_INFO_TYPE_TOOLTIP",
          get children() {
            var _el$19 = _tmpl$12();
            insert(_el$19, () => props.settlementTypeName);
            return _el$19;
          }
        }), null);
        insert(_el$18, createComponent(Tooltip.Text, {
          text: "LOC_COMMERCE_SETTLEMENT_INFO_DISTANCE_TYPE_TOOLTIP",
          get children() {
            var _el$20 = _tmpl$12();
            insert(_el$20, () => props.settlementDistanceTypeName);
            return _el$20;
          }
        }), null);
        insert(_el$18, createComponent(Show, {
          get when() {
            return props.isTown;
          },
          get children() {
            return createComponent(Tooltip.Text, {
              text: "LOC_COMMERCE_SETTLEMENT_INFO_TOWN_FOCUS_TOOLTIP",
              get children() {
                var _el$21 = _tmpl$11(), _el$22 = _el$21.firstChild;
                insert(_el$21, createComponent(Icon, {
                  "class": "size-7 -my-1 -ml-2",
                  get name() {
                    return props.townFocusIcon;
                  },
                  isUrl: true
                }), _el$22);
                insert(_el$22, () => props.townFocusName);
                return _el$21;
              }
            });
          }
        }), null);
        insert(_el$18, createComponent(Show, {
          get when() {
            return props.hasRail;
          },
          get children() {
            return createComponent(Tooltip.Text, {
              text: "LOC_COMMERCE_SETTLEMENT_INFO_RAIL_TOOLTIP",
              get children() {
                var _el$23 = _tmpl$11(), _el$24 = _el$23.firstChild;
                insert(_el$23, createComponent(Icon, {
                  "class": "size-6 -my-0\\.5 -ml-1 mr-0\\.5",
                  name: "url(blp:action_movebyrail)",
                  isUrl: true
                }), _el$24);
                insert(_el$24, createComponent(L10n.Compose, {
                  text: "LOC_BUILDING_RAIL_STATION_NAME"
                }));
                return _el$23;
              }
            });
          }
        }), null);
        insert(_el$18, createComponent(Tooltip.Text, {
          text: "LOC_COMMERCE_SETTLEMENT_INFO_WAREHOUSE_TOOLTIP",
          get children() {
            return createComponent(SettlementInfoCount, {
              type: "warehouse",
              get count() {
                return props.warehouseCount;
              }
            });
          }
        }), null);
        insert(_el$18, createComponent(Tooltip.Text, {
          text: "LOC_COMMERCE_SETTLEMENT_INFO_WATER_TOOLTIP",
          get children() {
            return createComponent(SettlementInfoCount, {
              type: "water",
              get count() {
                return props.waterCount;
              }
            });
          }
        }), null);
        return _el$18;
      }
    }), null);
    return _el$15;
  })();
};
const ReturnResourceButton = (props) => {
  return createComponent(ImageButton, mergeProps(props, {
    imageData: {
      base: "url(blp:resource_return_button_default.png)",
      focus: "url(blp:resource_return_button_hover.png)"
    },
    size: "7"
  }));
};
const CityResourceContainerInternalSymbol = Symbol();
const CityResourceContainerInternal = (props) => {
  const model = useCommerceScreenContext();
  const imageCache = useImageCache();
  const [mouseIsOverCity, setMouseIsOverCity] = createSignal(false);
  const images = {
    ticketHighlightedCSS: "url(blp:base_ticket-select-bg)",
    ticketPositiveCSS: "url(blp:base_ticket-positive_bg)",
    ticketNegativeCSS: "url(blp:base_ticket-negative_bg)",
    resourceEmptySlotCSS: "url(blp:resource_empty_slotv2)",
    successIconCSS: "url(blp:dip_esp_success_icon)",
    failIconCSS: "url(blp:dip_esp_fail_icon)"
  };
  imageCache.registerImages(CityResourceContainerInternalSymbol, Object.values(images));
  const [bottomButtonIconCSS, setBottomButtonIconCSS] = createSignal("");
  const [leftButtonIconCSS, setLeftButtonIconCSS] = createSignal("");
  createEffect(() => {
    setBottomButtonIconCSS(`url(blp:${Icon$1.getIconFromActionName("accept", ActiveInputDevice()) ?? ""})`);
    setLeftButtonIconCSS(`url(blp:${Icon$1.getIconFromActionName("shell-action-1", ActiveInputDevice()) ?? ""})`);
  });
  const selectionState = createMemo(() => model.getResourceContainerSelectionState(model.cityIsConnectedToTradeNetwork(props.cityID), {
    cityID: props.cityID,
    canAssignResourceToSettlement: props.canAssignSelectedResourceToSettlement
  }));
  const getEmptySlotOpacity = () => {
    if (model.selectedResource().resourceValue === -1) {
      return "opacity-50";
    }
    if (model.selectedResource().cityID?.id === props.cityID.id || selectionState() === ResourceContainerSelectionState.CanNotSelect) {
      return "opacity-10";
    }
    if (selectionState() === ResourceContainerSelectionState.CanSelect) {
      return "opacity-80";
    }
    return "opacity-50";
  };
  const canDrop = (draggable, dropzone) => {
    const memo = createMemo(() => {
      if (model.isInSortAndFilterMode()) {
        return false;
      }
      if (dropzone.data.resourceValue) {
        return model.canDropResourceOnTarget(draggable.data, props.cityID, dropzone.data.resourceValue);
      }
      return selectionState() === ResourceContainerSelectionState.CanSelect;
    });
    return memo;
  };
  const isReturnResourcesEnabled = createMemo(() => model.isSlottingAvailable && props.slottedResources.length > 0 && model.selectedResource().resourceValue === -1);
  const settlementIsFocused = createMemo(() => ComponentID.isMatch(model.focusedSettlementId() ?? null, props.cityID));
  const settlementIsSelected = createMemo(() => ComponentID.isMatch(model.selectedSettlementId() ?? null, props.cityID));
  const shouldShowGhostResource = createMemo(() => {
    const hasSelectedResource = model.selectedResource().resourceValue !== -1;
    const settlementIsSelectedOrFocused = settlementIsFocused() || settlementIsSelected();
    const settlementIsNotUnselectable = selectionState() !== ResourceContainerSelectionState.CanNotSelect;
    const selectedResourcesIsInSettlement = ComponentID.isMatch(model.selectedResource().cityID ?? null, props.cityID);
    return IsControllerActive() && hasSelectedResource && settlementIsSelectedOrFocused && settlementIsNotUnselectable && !selectedResourcesIsInSettlement;
  });
  const autoFocusGhost = createMemo(() => {
    if (model.isInSortAndFilterMode()) {
      return false;
    }
    return settlementIsSelected() && model.selectedResource().resourceValue !== -1;
  });
  return (() => {
    var _el$25 = _tmpl$17();
    insert(_el$25, createComponent(CardFrame, {
      tabIndex: -1,
      onFocus: () => setMouseIsOverCity(true),
      onBlur: () => setMouseIsOverCity(false),
      get ["class"]() {
        return `w-full mt-2 mb-2 px-2 pb-0 ${selectionState() === ResourceContainerSelectionState.CanSelect || selectionState() === ResourceContainerSelectionState.CanNotSelect ? "pt-1" : "pt-1"} flex flex-col relative`;
      },
      get style() {
        return createMemo(() => !!(IsControllerActive() && props.parentIsFocusedOrSelected()))() ? {
          "border-image-source": images.ticketHighlightedCSS
        } : createMemo(() => selectionState() === ResourceContainerSelectionState.CanSelect)() ? mouseIsOverCity() ? {
          "border-image-source": images.ticketHighlightedCSS
        } : {
          "border-image-source": images.ticketPositiveCSS
        } : selectionState() === ResourceContainerSelectionState.CanNotSelect ? {
          "border-image-source": images.ticketNegativeCSS
        } : {};
      },
      get children() {
        return createComponent(Dropzone, {
          get debugId() {
            return "City-" + getCityName(props.cityID);
          },
          get data() {
            return {
              cityID: props.cityID
            };
          },
          canDrop,
          onDragOver: () => setMouseIsOverCity(true),
          onDragLeave: () => setMouseIsOverCity(false),
          onDragDrop: () => setMouseIsOverCity(false),
          debugTrace: DEBUG_DRAG_AND_DROP,
          get children() {
            return [(() => {
              var _el$26 = _tmpl$15();
              insert(_el$26, createComponent(Show, {
                get when() {
                  return model.selectedResource().resourceValue === -1;
                },
                get fallback() {
                  return createComponent(SettlementName, mergeProps(() => props.settlementNameData));
                },
                get children() {
                  return createComponent(Activatable, {
                    disableFocus: true,
                    onActivate: () => {
                      model.clickCityName(props.cityID);
                    },
                    get children() {
                      return createComponent(SettlementName, mergeProps(() => props.settlementNameData));
                    }
                  });
                }
              }), null);
              insert(_el$26, createComponent(Show, {
                get when() {
                  return props.factoryResourceData.hasFactory;
                },
                get children() {
                  return createComponent(FactoryTypeDisplay, mergeProps(() => props.factoryResourceData));
                }
              }), null);
              return _el$26;
            })(), createComponent(Divider.Horizontal, {
              margin: 1
            }), (() => {
              var _el$27 = _tmpl$16(), _el$28 = _el$27.firstChild, _el$29 = _el$28.nextSibling, _el$30 = _el$29.firstChild, _el$31 = _el$30.firstChild;
              _el$31.style.rowGap = '0.2222222222rem';  // TRIX
              insert(_el$28, () => createComponent(For, {
                get each() {
                  return props.yieldDeltas;
                },
                children: (yieldDelta, index) => createComponent(YieldDelta, {
                  get classList() {
                    return {
                      "flex-col-reverse": true,
                      "text-sm": true,
                      "mb-1": true,
                      "ml-3": index() > 0 && index() < props.yieldDeltas.length
                    };
                  },
                  get yieldIconSrc() {
                    return yieldDelta.yieldIconSrc;
                  },
                  get yieldTotal() {
                    return yieldDelta.yieldTotal;
                  },
                  get yieldDelta() {
                    return yieldDelta.yieldDelta;
                  }
                })
              }));
              insert(_el$27, createComponent(Divider.Vertical, {
                margin: 2
              }), _el$29);
              insert(_el$31, createComponent(Show, {
                get when() {
                  return props.slottedResources.length > 0;
                },
                get fallback() {
                  return (
                    //Stops a blank "" being rendered by a For loop with no iterations
                    _tmpl$18()
                  );
                },
                get children() {
                  return createComponent(For, {
                    get each() {
                      return props.slottedResources;
                    },
                    children: (slottedResource, slotIndex) => {
                      const [resourceIsActiveDropzone, setResourceIsActiveDropzone] = createSignal(false);
                      const resourceName = createMemo(() => getResourceName({
                        cityID: slottedResource.cityID,
                        resourceValue: slottedResource.resourceValue
                      }));
                      return createComponent(
                        Dropzone,
                        {
                          "class": "size-19 mb-0",
                          get debugId() {
                            return "Resource Dropzone-" + resourceName();
                          },
                          get data() {
                            return {
                              cityID: props.cityID,
                              resourceValue: slottedResource.resourceValue
                            };
                          },
                          canDrop,
                          debugTrace: DEBUG_DRAG_AND_DROP,
                          onDragOver: () => setResourceIsActiveDropzone(true),
                          onDragLeave: () => setResourceIsActiveDropzone(false),
                          onDragDrop: () => setResourceIsActiveDropzone(false),
                          get children() {
                            return createComponent(DraggableResource, {
                              resourceData: slottedResource,
                              get isFirstResourceInSection() {
                                return slotIndex() === 0;
                              },
                              get isActiveDropzone() {
                                return resourceIsActiveDropzone();
                              }
                            });
                          }
                        }
                      );
                    }
                  });
                }
              }), null);
              insert(_el$31, createComponent(For, {
                get each() {
                  return props.availableSlots;
                },
                children: (_availableSlot, index) => createComponent(Show, {
                  get when() {
                    return createMemo(() => index() === 0)() && shouldShowGhostResource();
                  },
                  get fallback() {
                    return (() => {
                      var _el$34 = _tmpl$();
                      createRenderEffect((_p$) => {
                        var _v$ = `size-16 mb-2 mr-3 bg-contain bg-no-repeat bg-center relative flex items-center justify-center ${getEmptySlotOpacity()}`, _v$2 = images.resourceEmptySlotCSS;
                        _v$ !== _p$.e && className(_el$34, _p$.e = _v$);
                        _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$34.style.setProperty("background-image", _v$2) : _el$34.style.removeProperty("background-image"));
                        return _p$;
                      }, {
                        e: void 0,
                        t: void 0
                      });
                      return _el$34;
                    })();
                  },
                  get children() {
                    var _el$33 = _tmpl$19();
                    insert(_el$33, createComponent(Activatable, {
                      name: "assignment-slot",
                      get autoFocus() {
                        return autoFocusGhost();
                      },
                      "class": "hover\\:scale-125 focus\\:scale-125 relative",
                      get classList() {
                        return {
                          "opacity-20": !model.ghostResourceFocused(),
                          "opacity-60 focused-resource": model.ghostResourceFocused()
                        };
                      },
                      get disableFocus() {
                        return settlementIsSelected() === false;
                      },
                      get disabled() {
                        return settlementIsSelected() === false;
                      },
                      onFocus: () => {
                        model.setGhostResourceFocused(true);
                        model.setFocusedResource({
                          resourceValue: -1
                        });
                      },
                      onBlur: () => model.setGhostResourceFocused(false),
                      onActivate: () => {
                        model.slotSelectedResource(props.cityID);
                        model.setSelectedSettlementId(void 0);
                      },
                      get children() {
                        return createComponent(FramedResource, mergeProps(() => model.getSelectedResourceProps()));
                      }
                    }), null);
                    insert(_el$33, createComponent(Show, {
                      get when() {
                        return !model.selectedSettlementId() || model.ghostResourceFocused();
                      },
                      get children() {
                        return createComponent(Icon, {
                          "class": "absolute size-8 top-0",
                          get name() {
                            return createMemo(() => !!settlementIsSelected())() ? bottomButtonIconCSS() : leftButtonIconCSS();
                          },
                          isUrl: true
                        });
                      }
                    }), null);
                    return _el$33;
                  }
                })
              }), null);
              insert(_el$29, createComponent(Show, {
                get when() {
                  return IsControllerActive() === false;
                },
                get children() {
                  return createComponent(Tooltip.Text, {
                    get text() {
                      return Locale.compose("LOC_COMMERCE_UNASSIGN_RESOURCES", Locale.compose(props.settlementNameData.settlementName));
                    },
                    get children() {
                      return createComponent(AudioContextProvider, {
                        segment: "ReturnResources",
                        get children() {
                          return createComponent(Show, {
                            get when() {
                              return isReturnResourcesEnabled();
                            },
                            get fallback() {
                              return createComponent(ReturnResourceButton, {
                                "class": "absolute -top-10 right-0",
                                disabled: true
                              });
                            },
                            get children() {
                              return createComponent(ReturnResourceButton, {
                                "class": "absolute -top-10 right-0",
                                onActivate: () => {
                                  model.clearAllResources(props.cityID);
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                }
              }), null);
              createRenderEffect(() => setAttribute(_el$30, "data-name", `city-resource-container-${Locale.compose(props.settlementNameData.settlementName)}`));
              return _el$27;
            })()];
          }
        });
      }
    }), null);
    insert(_el$25, createComponent(Show, {
      get when() {
        return selectionState() === ResourceContainerSelectionState.CanSelect;
      },
      get fallback() {
        return createComponent(Show, {
          get when() {
            return selectionState() === ResourceContainerSelectionState.CanNotSelect;
          },
          get children() {
            return createComponent(Icon, {
              "class": "size-8 absolute top-3",
              get name() {
                return images.failIconCSS;
              },
              isUrl: true
            });
          }
        });
      },
      get children() {
        return createComponent(Icon, {
          "class": "size-8 absolute top-3",
          get name() {
            return images.successIconCSS;
          },
          isUrl: true
        });
      }
    }), null);
    return _el$25;
  })();
};
const CityResourceContainer = (props) => {
  const model = useCommerceScreenContext();
  const [isFocused, setIsFocused] = createSignal(false);
  const dndContext = useDragAndDropContext();
  const isFocusable = createMemo(() => {
    if (model.isInSortAndFilterMode()) {
      return false;
    }
    if (IsControllerActive()) {
      return model.selectedSettlementId() === void 0;
    }
    const isResourceSelected = model.selectedResource().resourceValue !== -1;
    const isDragging = dndContext.isDragging();
    if (isDragging === null && isResourceSelected) {
      return true;
    }
    return false;
  });
  const selectionState = createMemo(() => model.getResourceContainerSelectionState(model.cityIsConnectedToTradeNetwork(props.cityID), {
    cityID: props.cityID,
    canAssignResourceToSettlement: props.canAssignSelectedResourceToSettlement
  }));
  const isDisabled = createMemo(() => {
    return selectionState() === ResourceContainerSelectionState.CanNotSelect;
  });
  const onFocus = () => {
    gamepadLog("onFocus called for", getCityName(props.cityID));
    model.setFocusedSettlementId(props.cityID);
    model.setFocusedResource({
      resourceValue: -1,
      cityID: void 0
    });
    setIsFocused(true);
  };
  const onBlur = () => {
    gamepadLog("onBlur called for", getCityName(props.cityID));
    setIsFocused(false);
  };
  const cityName = untrack(() => {
    const myCity = Cities.get(props.cityID);
    if (!myCity) {
      return "unknown-city";
    }
    return Locale.compose(myCity.name);
  });
  const playerHasUnassignedResources = createMemo(() => model.data.resourceTabData.availableResourceSectionData.some((section) => {
    return section.subSections.some((subSection) => subSection.resourceSlotData.length > 0);
  }));
  const [autoFocusSettlement, setAutoFocusSettlement] = createSignal(false);
  createEffect(() => {
    if (!IsControllerActive()) {
      setAutoFocusSettlement(false);
      return;
    }
    if (model.isInSortAndFilterMode()) {
      setAutoFocusSettlement(false);
      return;
    }
    const focusSettlementOnSettlementDeselectedWithNoResourceSelected = model.selectedResource().resourceValue === -1 && model.prevSelectedSettlementId() && ComponentID.isMatch(props.cityID, model.prevSelectedSettlementId());
    const focusSettlementOnResourceSelected = model.isFirstAssignableCity(props.cityID) && model.selectedResource().resourceValue !== -1;
    const focusSettlementOnResourceDeselectedAndNoUnassignedResources = model.prevSelectedResource().resourceValue !== -1 && ComponentID.isMatch(model.prevSelectedResource().cityID ?? null, props.cityID) && !playerHasUnassignedResources();
    const focusInitialSettlementWhenNoAvailableResources = !model.hasUnassignedResources() && props.cityIndex === 0;
    const shouldAutoFocus = !model.selectedSettlementId() && (focusSettlementOnSettlementDeselectedWithNoResourceSelected || focusSettlementOnResourceSelected || focusSettlementOnResourceDeselectedAndNoUnassignedResources) || focusInitialSettlementWhenNoAvailableResources;
    if (shouldAutoFocus) {
      gamepadLog("AUTO-FOCUS " + getCityName(props.cityID), "( focusSettlementOnSettlementDeselectedWithNoResourceSelected:", focusSettlementOnSettlementDeselectedWithNoResourceSelected, ",focusSettlementOnResourceSelected:", focusSettlementOnResourceSelected, ",focusSettlementOnResourceDeselectedAndNoUnassignedResources:", focusSettlementOnResourceDeselectedAndNoUnassignedResources, ")");
    }
    setAutoFocusSettlement(shouldAutoFocus);
  });
  return createComponent(Activatable, {
    "class": "relative",
    get tabIndex() {
      return props.cityIndex + 1;
    },
    get autoFocus() {
      return autoFocusSettlement();
    },
    name: `${cityName}-city-resource-activatable`,
    onActivate: () => {
      if (IsControllerActive()) {
        if (model.settlementHasSlottedResources(props.cityID)) {
          model.setSelectedSettlementId(props.cityID);
        }
      } else {
        model.slotSelectedResource(props.cityID);
      }
    },
    onFocus: () => onFocus(),
    onBlur: () => onBlur(),
    get disabled() {
      return isDisabled();
    },
    get disableFocus() {
      return !isFocusable();
    },
    get suppressPointerChanges() {
      return selectionState() === ResourceContainerSelectionState.NotSelecting;
    },
    get children() {
      return createComponent(CityResourceContainerInternal, mergeProps(props, {
        parentIsFocusedOrSelected: () => isFocused() || ComponentID.isMatch(props.cityID, model.selectedSettlementId() ?? null)
      }));
    }
  });
};
const WarningBannerSymbol = Symbol();
const WarningBanner = () => {
  const images = {
    warningBannerBaseCSS: "url(blp:warning_banner_base)",
    warningBannerImageCSS: "url(blp:warning_banner_image)",
    playerDetailCSS: "url(blp:mp_player_detail)",
    iconWarningCSS: "url(blp:buildicon_warning)"
  };
  const cache = useImageCache();
  cache.registerImages(WarningBannerSymbol, Object.values(images));
  return (() => {
    var _el$35 = _tmpl$20(), _el$36 = _el$35.firstChild, _el$37 = _el$36.nextSibling, _el$38 = _el$37.nextSibling, _el$39 = _el$38.nextSibling, _el$40 = _el$39.nextSibling, _el$41 = _el$40.nextSibling, _el$42 = _el$41.firstChild, _el$43 = _el$42.firstChild, _el$44 = _el$43.nextSibling;
    _el$35.style.setProperty("border-image-slice", "22 180 fill");
    _el$35.style.setProperty("border-image-width", "22px 180px");
    insert(_el$41, createComponent(Icon, {
      "class": "size-12",
      get name() {
        return images.iconWarningCSS;
      },
      isUrl: true
    }), _el$42);
    insert(_el$43, createComponent(L10n.Compose, {
      text: "LOC_UI_RESOURCE_ALLOCATION_UNAVAILABLE"
    }));
    insert(_el$44, createComponent(L10n.Compose, {
      text: "LOC_UI_RESOURCE_ALLOCATION_RESOURCE_SLOT_REQUIRED"
    }));
    createRenderEffect((_p$) => {
      var _v$3 = images.warningBannerBaseCSS, _v$4 = images.warningBannerImageCSS, _v$5 = images.playerDetailCSS, _v$6 = images.playerDetailCSS, _v$7 = images.playerDetailCSS, _v$8 = images.playerDetailCSS;
      _v$3 !== _p$.e && ((_p$.e = _v$3) != null ? _el$35.style.setProperty("border-image-source", _v$3) : _el$35.style.removeProperty("border-image-source"));
      _v$4 !== _p$.t && ((_p$.t = _v$4) != null ? _el$36.style.setProperty("background-image", _v$4) : _el$36.style.removeProperty("background-image"));
      _v$5 !== _p$.a && ((_p$.a = _v$5) != null ? _el$37.style.setProperty("background-image", _v$5) : _el$37.style.removeProperty("background-image"));
      _v$6 !== _p$.o && ((_p$.o = _v$6) != null ? _el$38.style.setProperty("background-image", _v$6) : _el$38.style.removeProperty("background-image"));
      _v$7 !== _p$.i && ((_p$.i = _v$7) != null ? _el$39.style.setProperty("background-image", _v$7) : _el$39.style.removeProperty("background-image"));
      _v$8 !== _p$.n && ((_p$.n = _v$8) != null ? _el$40.style.setProperty("background-image", _v$8) : _el$40.style.removeProperty("background-image"));
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0,
      n: void 0
    });
    return _el$35;
  })();
};
const CommerceResourcesContainerComponent = (props) => {
  const model = useCommerceScreenContext();
  const audioTrigger = useAudio("DraggableResource");
  const yieldHighlightDropdownItems = ["DEFAULT", "YIELD_FOOD", "YIELD_PRODUCTION", "YIELD_GOLD", "YIELD_SCIENCE", "YIELD_CULTURE", "YIELD_HAPPINESS", "YIELD_DIPLOMACY"];
  const onDragStart = (draggable) => {
    const data = draggable.data;
    if (data.cityID) {
      model.clickSlottedResource({
        cityID: data.cityID,
        resourceValue: data.resourceValue
      });
    } else {
      model.clickAvailableResource({
        resourceValue: data.resourceValue
      });
    }
  };
  const onDragEnd = (_draggable, status) => {
    if (status === DragEndStatus.RejectedByDropzone) {
      model.deselectSelectedResource();
      audioTrigger("dropReject");
    }
  };
  const onDragDrop = (draggable, dropzone) => {
    const resource = draggable.data;
    const cityID = dropzone.data.cityID;
    const targetResourceValue = dropzone.data.resourceValue;
    if (targetResourceValue) {
      if (cityID) {
        model.clickSlottedResource({
          cityID,
          resourceValue: targetResourceValue
        });
      } else {
        model.clickAvailableResource({
          resourceValue: targetResourceValue
        });
      }
    } else if (cityID) {
      if (resource.cityID === void 0 || !ComponentID.isMatch(cityID, resource.cityID)) {
        model.slotSelectedResource(cityID, Input.isShiftDown());
      } else {
        model.deselectSelectedResource();
      }
    } else {
      model.unslotSelectedResource(Input.isShiftDown());
    }
  };
  const disableDND = createMemo(() => {
    return !model.isSlottingAvailable;
  });
  const [gamepadTrayItems, setGamepadTrayItems] = createSignal([]);
  createEffect(on(model.focusedSettlementId, (newId, prevId) => {
    if (ComponentID.isMatch(newId ?? null, prevId ?? null)) {
      return;
    }
    gamepadLog("Focused Settlement changed:", getCityName(newId), "( was", getCityName(prevId), ")");
    setGamepadTrayItems(model.getGamepadTrayItems());
  }));
  createEffect(on(model.selectedSettlementId, (newId, prevId) => {
    if (ComponentID.isMatch(newId ?? null, prevId ?? null)) {
      return;
    }
    gamepadLog("Selected Settlement changed:", getCityName(newId), "( was", getCityName(prevId), ")");
    setGamepadTrayItems(model.getGamepadTrayItems());
  }));
  createEffect(on(model.focusedResource, (newValue, prevValue) => {
    if (newValue.resourceValue === prevValue?.resourceValue) {
      return;
    }
    gamepadLog("Focused Resource changed:", getResourceName(newValue), "( was", getResourceName(prevValue), ")");
    setGamepadTrayItems(model.getGamepadTrayItems());
  }));
  createEffect(on(model.selectedResource, (newValue, prevValue) => {
    if (newValue.resourceValue === prevValue?.resourceValue) {
      return;
    }
    gamepadLog("Selected Resource changed:", getResourceName(newValue), "( was", getResourceName(prevValue), ")");
    setGamepadTrayItems(model.getGamepadTrayItems());
  }));
  createEffect(on(model.ghostResourceFocused, (newValue, prevValue) => {
    if (newValue === prevValue) {
      return;
    }
    gamepadLog("Ghost Resource changed focus:", newValue);
    setGamepadTrayItems(model.getGamepadTrayItems());
  }));
  const [autoFocusFilters, setAutoFocusFilters] = createSignal(false);
  const [disableFilters, setDisableFilters] = createSignal(true);
  createEffect(() => {
    setDisableFilters(!model.isInSortAndFilterMode());
    setAutoFocusFilters(model.isInSortAndFilterMode());
  });
  return createComponent(CommerceScreenBaseTabContent, {
    description: "LOC_COMMERCE_RESOURCE_ALLOCATION_DESCRIPTION",
    get headerBar() {
      return (() => {
        var _el$47 = _tmpl$24(), _el$48 = _el$47.firstChild, _el$49 = _el$48.firstChild, _el$50 = _el$49.nextSibling, _el$51 = _el$48.nextSibling;
        _el$48.style.setProperty("width", "22.8888888889rem");
        insert(_el$49, createComponent(L10n.Compose, {
          text: "LOC_COMMERCE_AVAILABLE_RESOURCES_TITLE"
        }));
        insert(_el$50, createComponent(For, {
          get each() {
            return props.unslottedBonuses;
          },
          children: (unslottedBonus) => (() => {
            var _el$54 = _tmpl$25(), _el$55 = _el$54.firstChild;
            insert(_el$54, () => `+${unslottedBonus.bonusAmount}`, null);
            createRenderEffect((_$p) => (_$p = unslottedBonus.iconSrc) != null ? _el$55.style.setProperty("background-image", _$p) : _el$55.style.removeProperty("background-image"));
            return _el$54;
          })()
        }));
        insert(_el$51, createComponent(L10n.Compose, {
          text: "LOC_COMMERCE_SETTLEMENTS_TITLE"
        }));
        insert(_el$47, createComponent(HSlot, {
          name: "filter-and-sort",
          "class": "ml-8 flex flex-row flex-auto items-center justify-end",
          get children() {
            return [(() => {
              var _el$52 = _tmpl$23();
              insert(_el$52, createComponent(L10n.Compose, {
                text: "LOC_ADVANCED_START_FILTER"
              }));
              return _el$52;
            })(), createComponent(AudioContextProvider, {
              segment: "Filters",
              get children() {
                return [createComponent(Dropdown, {
                  "class": "ml-2 mr-4 max-w-60 flex-auto pointer-events-auto min-h-14",
                  selectedItemTemplate: (item) => (() => {
                    var _el$56 = _tmpl$26();
                    insert(_el$56, createComponent(L10n.Stylize, {
                      text: item !== "DEFAULT" ?  `LOC_${item}` :
                      "LOC_COMMERCE_RESOURCE_SORT_FILTER_DEFAULT_LABEL"
                    }));
                    return _el$56;
                  })(),
                  get defaultValue() {
                    return yieldHighlightDropdownItems[0];
                  },
                  onItemSelected: (item) => model.setSelectedResourceFilter(item),
                  get disableFocus() {
                    return disableFilters();
                  },
                  get autoFocus() {
                    return autoFocusFilters();
                  },
                  tabIndex: 1,
                  get children() {
                    return createComponent(For, {
                      each: yieldHighlightDropdownItems,
                      children: (item) => createComponent(DropdownItem, {
                        "class": "text-sm py-1\\.5 px-2",
                        value: item,
                        get children() {
                          return createComponent(Show, {
                            when: item !== "DEFAULT",
                            get fallback() {
                              return (() => {
                                var _el$57 = _tmpl$26();
                                insert(_el$57, createComponent(L10n.Stylize, {
                                  text: "LOC_COMMERCE_RESOURCE_SORT_FILTER_DEFAULT_LABEL"
                                }));
                                return _el$57;
                              })();
                            },
                            get children() {
                              return createComponent(L10n.Stylize, {
                                text: `LOC_${item}`
                              });
                            }
                          });
                        }
                      })
                    });
                  }
                }), (() => {
                  var _el$53 = _tmpl$23();
                  const sortDirection = createMemo(() => {
                    return model.selectedSortDirection() < 0 ?
                      "bz-sort-descending" : "bz-sort-ascending";
                  });
                  insert(_el$53, createComponent(Activatable, {
                    "class": "bz-sort-button relative -my-1 h-16 min-w-14 flex-col justify-center items-center",
                    onActivate: () => {
                      model.toggleSelectedSortDirection();
                    },
                    get children() {
                      return [createComponent(Icon, {
                        get ["class"]() {
                          return `bz-sort-up ${sortDirection()}`;
                        },
                        name: "url(blp:fi_action_move_64.png)",
                        isUrl: true
                      }), createComponent(L10n.Stylize, {
                        "class": "bz-sort-label",
                        text: "LOC_COMMERCE_SORT_LABEL"
                      }), createComponent(Icon, {
                        get ["class"]() {
                          return `bz-sort-down ${sortDirection()}`;
                        },
                        name: "url(blp:fi_action_move_64.png)",
                        isUrl: true
                      })];
                    }
                  }));
                  return _el$53;
                })(), createComponent(Dropdown, {
                  "class": "ml-2 max-w-80 flex-auto pointer-events-auto min-h-14",
                  selectedItemTemplate: (json) => (() => {
                    const [key, _value] = JSON.parse(json);
                    var _el$58 = _tmpl$26();
                    insert(_el$58, createComponent(L10n.Stylize, {
                      text: key
                    }));
                    return _el$58;
                  })(),
                  get defaultValue() {
                    const index = model.selectedSettlementSortIndex();
                    const [key, value] =
                      Object.entries(model.resourceSettlementSortItems)[index];
                    return JSON.stringify([ key, value ]);
                  },
                  onItemSelected: (json) => {
                    const [_key, value] = JSON.parse(json);
                    model.setSelectedSettlementSortType(value)
                  },
                  get disableFocus() {
                    return disableFilters();
                  },
                  tabIndex: 2,
                  get children() {
                    return createComponent(For, {
                      get each() {
                        return Object.entries(model.resourceSettlementSortItems);
                      },
                      children: ([key, value]) => createComponent(DropdownItem, {
                        "class": "text-sm py-1\\.5 px-2",
                        value: JSON.stringify([ key, value ]),
                        get children() {
                          return createComponent(L10n.Stylize, {
                            text: key
                          });
                        }
                      })
                    });
                  }
                })];
              }
            })];
          }
        }), null);
        return _el$47;
      })();
    },
    get children() {
      return [createComponent(Hotkeys, {
        get hotkeys() {
          return [{
            hotkeyAction: "cycle-next",
            onActivate: model.onNextSettlementSortType
          },
          {
            hotkeyAction: "cycle-prev",
            onActivate: model.onPrevSettlementSortType
          },
          {
            hotkeyAction: "unit-skip-turn",
            onActivate: model.toggleSelectedSortDirection
          }];
        }
      }), createComponent(GamepadTrayItemProvider, {
        "class": "flex-auto",
        name: "commerce-resource-gamepad-tray-context",
        items: gamepadTrayItems,
        get children() {
          return [(() => {
            var _el$45 = _tmpl$21();
            insert(_el$45, createComponent(Show, {
              get when() {
                return !model.isSlottingAvailable;
              },
              get children() {
                return createComponent(WarningBanner, {});
              }
            }));
            return _el$45;
          })(), createComponent(DragAndDrop, {
            onDragStart,
            onDragEnd,
            onDragDrop,
            get disabled() {
              return disableDND();
            },
            debugTrace: DEBUG_DRAG_AND_DROP,
            get children() {
              return createComponent(SpatialSlot, {
                name: "commerce-resources-container",
                "class": "flex-auto relative",
                get children() {
                  var _el$46 = _tmpl$22();
                  insert(_el$46, createComponent(AvailableResourcesContainer, props), null);
                  insert(_el$46, createComponent(SlottedResourcesContainer, props), null);
                  return _el$46;
                }
              });
            }
          })];
        }
      })];
    }
  });
};
const CommerceResourcesContainer = ComponentRegistry.register({
  name: "CommerceResourcesContainer",
  createInstance: CommerceResourcesContainerComponent,
  styles: [style]
});

export { CommerceResourcesContainer };
//# sourceMappingURL=commerce-screen-resources-tab.js.map
// vim: sw=2 et

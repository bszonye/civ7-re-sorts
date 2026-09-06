/* eslint-disable no-useless-assignment */
import { createSignal, createSelector, onCleanup, onMount, createMemo, createEffect, untrack, batch, createContext, useContext } from '../../../../core/vendor/solid-js/dist/solid.js';
import { createMutable } from '../../../../core/vendor/solid-js/store/dist/store.js';
import ContextManager from '../../../../core/ui/context-manager/context-manager.js';
import { ComponentID } from '../../../../core/ui/utilities/utilities-component-id.js';
import { Icon } from '../../../../core/ui/utilities/utilities-image.js';
import UpdateGate from '../../../../core/ui/utilities/utilities-update-gate.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { useAudio } from '../../../../core/ui-next/services/audio-support.js';
import { IsControllerActive } from '../../../../core/ui-next/services/input.js';
import { ModelRegistry, ModelLifecycle } from '../../../../core/ui-next/services/model-registry.js';
import { createEngineEvent } from '../../../../core/ui-next/utilities/game-core-utilities.js';
import { FullTextSearch } from '../../../../core/ui-next/utilities/search-utils.js';
import { compareSettlementTypes, compareSettlementNames } from '../../../../core/ui-next/utilities/settlement-utilities.js';
import CityYields from '../../../ui/utilities/utilities-city-yields.js';
import { ConstructibleHasTagType } from '../../../ui/utilities/utilities-tags.js';

// TRIX: persistent sort directions
// TODO: store configuration across reloads?
let persistSettlementSortType = -1;
const persistSettlementSortDirection = [
  // starting sort directions
  +1,  // Default
  +1,  // Settlement Name
  -1,  // Available Resource Slots
  -1,  // Total Resource Slots
  -1,  // Warehouse Count
  -1,  // Home/Distant Lands
  -1,  // Rail Connected
  -1,  // Has Factory
  -1,  // Food Yield
  -1,  // Production Yield
  -1,  // Gold Yield
  -1,  // Science Yield
  -1,  // Culture Yield
  -1,  // Happiness Yield
  -1,  // Influence Yield
];

const DEBUG_RESOURCE_SWAPPING = false;
const DEBUG_GAMEPAD = false;
var TradeRouteAvailabiltyType = /* @__PURE__ */ ((TradeRouteAvailabiltyType2) => {
  TradeRouteAvailabiltyType2[TradeRouteAvailabiltyType2["Unset"] = 0] = "Unset";
  TradeRouteAvailabiltyType2[TradeRouteAvailabiltyType2["Established"] = 1] = "Established";
  TradeRouteAvailabiltyType2[TradeRouteAvailabiltyType2["Available"] = 2] = "Available";
  TradeRouteAvailabiltyType2[TradeRouteAvailabiltyType2["Unavailable"] = 3] = "Unavailable";
  return TradeRouteAvailabiltyType2;
})(TradeRouteAvailabiltyType || {});
var ResourceContainerSelectionState = /* @__PURE__ */ ((ResourceContainerSelectionState2) => {
  ResourceContainerSelectionState2[ResourceContainerSelectionState2["NotSelecting"] = 0] = "NotSelecting";
  ResourceContainerSelectionState2[ResourceContainerSelectionState2["CanSelect"] = 1] = "CanSelect";
  ResourceContainerSelectionState2[ResourceContainerSelectionState2["CanNotSelect"] = 2] = "CanNotSelect";
  return ResourceContainerSelectionState2;
})(ResourceContainerSelectionState || {});
var TradeRouteSortType = /* @__PURE__ */ ((TradeRouteSortType2) => {
  TradeRouteSortType2[TradeRouteSortType2["Unset"] = 0] = "Unset";
  TradeRouteSortType2[TradeRouteSortType2["Resource"] = 1] = "Resource";
  TradeRouteSortType2[TradeRouteSortType2["LeaderName"] = 2] = "LeaderName";
  TradeRouteSortType2[TradeRouteSortType2["LeaderRelationship"] = 3] = "LeaderRelationship";
  TradeRouteSortType2[TradeRouteSortType2["SettlementName"] = 4] = "SettlementName";
  TradeRouteSortType2[TradeRouteSortType2["SettlementType"] = 5] = "SettlementType";
  return TradeRouteSortType2;
})(TradeRouteSortType || {});
var ResourceSettlementSortType = /* @__PURE__ */ ((ResourceSettlementSortType2) => {
  ResourceSettlementSortType2[ResourceSettlementSortType2["SettlementType"] = 0] = "SettlementType";
  ResourceSettlementSortType2[ResourceSettlementSortType2["Name"] = 1] = "Name";
  ResourceSettlementSortType2[ResourceSettlementSortType2["OpenSlots"] = 2] = "OpenSlots";
  ResourceSettlementSortType2[ResourceSettlementSortType2["TotalSlots"] = 3] = "TotalSlots";
  ResourceSettlementSortType2[ResourceSettlementSortType2["WarehouseCount"] = 4] = "WarehouseCount";
  ResourceSettlementSortType2[ResourceSettlementSortType2["DistanceType"] = 5] = "DistanceType";
  ResourceSettlementSortType2[ResourceSettlementSortType2["RailConnected"] = 6] = "RailConnected";
  ResourceSettlementSortType2[ResourceSettlementSortType2["HasFactory"] = 7] = "HasFactory";
  ResourceSettlementSortType2[ResourceSettlementSortType2["Food"] = 8] = "Food";
  ResourceSettlementSortType2[ResourceSettlementSortType2["Production"] = 9] = "Production";
  ResourceSettlementSortType2[ResourceSettlementSortType2["Gold"] = 10] = "Gold";
  ResourceSettlementSortType2[ResourceSettlementSortType2["Science"] = 11] = "Science";
  ResourceSettlementSortType2[ResourceSettlementSortType2["Culture"] = 12] = "Culture";
  ResourceSettlementSortType2[ResourceSettlementSortType2["Happiness"] = 13] = "Happiness";
  ResourceSettlementSortType2[ResourceSettlementSortType2["Influence"] = 14] = "Influence";
  return ResourceSettlementSortType2;
})(ResourceSettlementSortType || {});
var ResourceTabInteractionTypeFlag = /* @__PURE__ */ ((ResourceTabInteractionTypeFlag2) => {
  ResourceTabInteractionTypeFlag2[ResourceTabInteractionTypeFlag2["SettlementFocused"] = 8] = "SettlementFocused";
  ResourceTabInteractionTypeFlag2[ResourceTabInteractionTypeFlag2["SettlementSelected"] = 4] = "SettlementSelected";
  ResourceTabInteractionTypeFlag2[ResourceTabInteractionTypeFlag2["ResourceFocused"] = 2] = "ResourceFocused";
  ResourceTabInteractionTypeFlag2[ResourceTabInteractionTypeFlag2["ResourceSelected"] = 1] = "ResourceSelected";
  return ResourceTabInteractionTypeFlag2;
})(ResourceTabInteractionTypeFlag || {});
var ResourceTabInteractionCombo = /* @__PURE__ */ ((ResourceTabInteractionCombo2) => {
  ResourceTabInteractionCombo2[ResourceTabInteractionCombo2["SelectedResourceFocusedSettlement"] = 9] = "SelectedResourceFocusedSettlement";
  ResourceTabInteractionCombo2[ResourceTabInteractionCombo2["FocusedSettlement"] = 8] = "FocusedSettlement";
  ResourceTabInteractionCombo2[ResourceTabInteractionCombo2["SelectedResourceSelectedSettlementFocusedResource"] = 7] = "SelectedResourceSelectedSettlementFocusedResource";
  ResourceTabInteractionCombo2[ResourceTabInteractionCombo2["SelectedSettlementFocusedResource"] = 6] = "SelectedSettlementFocusedResource";
  ResourceTabInteractionCombo2[ResourceTabInteractionCombo2["FocusedResource"] = 2] = "FocusedResource";
  return ResourceTabInteractionCombo2;
})(ResourceTabInteractionCombo || {});
function gamepadLog(...args) {
  if (DEBUG_GAMEPAD) {
    console.debug("[commerce-screen-model.gamepadLog]", ...args);
  }
}
function createCommerceScreenModel() {
  function indexResourceTypes() {
    const yieldTagTypes = /* @__PURE__ */ new Map([
      ["FOOD", "YIELD_FOOD"],
      ["PRODUCTION", "YIELD_PRODUCTION"],
      ["GOLD", "YIELD_GOLD"],
      ["SCIENCE", "YIELD_SCIENCE"],
      ["CULTURE", "YIELD_CULTURE"],
      ["HAPPINESS", "YIELD_HAPPINESS"]
    ]);
    const resourceYields = /* @__PURE__ */ new Map();
    GameInfo.Resources.forEach((resource) => {
      resourceYields.set(resource.ResourceType, /* @__PURE__ */ new Set());
    });
    GameInfo.TypeTags.forEach((typeTag) => {
      const yields = resourceYields.get(typeTag.Type);
      if (yields != null) {
        const yieldType = yieldTagTypes.get(typeTag.Tag);
        if (yieldType != null) {
          yields.add(yieldType);
        }
      }
    });
    return resourceYields;
  }
  const resourceYieldTags = indexResourceTypes();
  function getYieldTypes(resourceType) {
    let yieldTypes = [];
    const yields = resourceYieldTags.get(resourceType);
    if (yields) {
      yieldTypes = [...yields];
    }
    return yieldTypes;
  }
  const slottedResourceIndices = {};
  const [lastSlottedResourceValues, setLastSlottedResourceValues] = createSignal([]);
  const wasSlottedLast = createSelector(lastSlottedResourceValues, (resourceValue, list) => {
    return list.includes(resourceValue);
  });
  onCleanup(() => {
    sendConsideredAssigningResources();
  });
  onMount(() => {
    const resourceCapChanged = createEngineEvent("ResourceCapChanged");
    const resourceAssigned = createEngineEvent("ResourceAssigned");
    const resourceUnassigned = createEngineEvent("ResourceUnassigned");
    let pendingUnassignments = [];
    const updateGate = new UpdateGate(() => {
      if (updateGate.callTriggers.includes("resource_unassigned")) {
        pendingUnassignments.forEach((location) => {
          const resourceValue = GameplayMap.getIndexFromLocation(location);
          const playerCities = Players.get(GameContext.localPlayerID)?.Cities?.getCities();
          if (!playerCities) {
            console.error("commerce-screen-model: Unable to get list of player cities for local player");
            return;
          }
          for (const city2 of playerCities) {
            if (city2.Resources && city2.Resources?.getAssignedResources().find((resource2) => {
              return resource2.value == resourceValue;
            })) {
              return;
            }
          }
          const cityID = GameplayMap.getOwningCityFromXY(location.x, location.y);
          if (!cityID) {
            console.error("commerce-screen-model: failed to get city id from unassigned resource");
            return;
          }
          const city = Cities.get(cityID);
          if (!city) {
            console.error("commerce-screen-model: failed to get city object from cityID:" + cityID);
            return;
          }
          const resource = Game.Resources.getResourceOnPlot(resourceValue);
          const resourceDef = GameInfo.Resources.lookup(resource.resource);
          if (!resourceDef) {
            console.error("commerce-screen-model: failed to get resource object for unassigned resource");
            return;
          }
          const yieldTypes = getYieldTypes(resourceDef.ResourceType);
          const uniqueResource = Players.get(GameContext.localPlayerID)?.Resources?.getResources().find((uniqueResourceValue) => {
            return uniqueResourceValue.value == resourceValue;
          });
          if (!uniqueResource) {
            console.error(
              "commerce-screen-model: Unable to get unique resource value for unassigned resource"
            );
            return;
          }
          const resourceProps = getResourceProps(uniqueResource);
          if (!resourceProps) {
            console.error("commerce-screen-model: failed to get resource props object for uniqueResource");
            return;
          }
          const canSwapWithSelectedResource = createMemo(() => {
            return canSwapResources(resourceValue, selectedResource().resourceValue);
          });
          const resourceSlotData = {
            cityID: void 0,
            resourceType: resourceDef.ResourceType,
            resourceProps,
            resourceValue,
            yieldTypes,
            canSwapWithSelectedResource
          };
          let sectionIndex = 0;
          if (!cityIsConnectedToTradeNetwork(city)) {
            sectionIndex = 1;
          }
          const subSectionIndex = model.data.resourceTabData.availableResourceSectionData[sectionIndex].subSections.findIndex((subSection) => {
            return subSection.type == resourceDef.ResourceClassType;
          });
          model.data.resourceTabData.availableResourceSectionData[sectionIndex].subSections[subSectionIndex].resourceSlotData.push(resourceSlotData);
        });
        pendingUnassignments = [];
        model.isResourceSelected = false;
        sortSlottedResourcesBySlotIndex(model.data.resourceTabData.slottedResourceSectionData);
        handleDeselectSelectedResource();
        updateUnslottedBonuses();
        updateIsSlottingAvailable();
      }
    });
    createEffect(() => {
      const resourceCapChangedEventData = resourceCapChanged();
      if (!resourceCapChangedEventData) {
        return;
      }
      if (resourceCapChangedEventData.cityID && Cities.get(resourceCapChangedEventData.cityID)?.owner != GameContext.localPlayerID) {
        return;
      }
      if (resourceCapChanged()) {
        updateIsSlottingAvailable();
        updateSlottedResources();
      }
    });
    createEffect(() => {
      const resourceAssignedEventData = resourceAssigned();
      if (!resourceAssignedEventData) {
        return;
      }
      if (resourceAssignedEventData.player != GameContext.localPlayerID) {
        return;
      }
      untrack(() => {
        const cityID = resourceAssignedEventData.targetCity;
        const sectionIndex = Cities.get(cityID)?.Trade?.isInTradeNetwork() ? 0 : 1;
        const cityResources = model.data.resourceTabData.slottedResourceSectionData[sectionIndex].cityResources;
        const subSectionIndex = cityResources.findIndex((city) => {
          return ComponentID.isMatch(city.cityID, cityID);
        });
        if (subSectionIndex == -1) {
          console.error("commerce-screen-model: unable to find subsection with matching cityID to " + cityID);
          return;
        }
        const resourceValue = GameplayMap.getIndexFromLocation(resourceAssignedEventData.location);
        const resource = Game.Resources.getResourceOnPlot(resourceValue);
        const resourceDef = GameInfo.Resources.lookup(resource.resource);
        if (!resourceDef) {
          console.error("commerce-screen-model: failed to get resource object for newly assigned resource");
          return;
        }
        if (cityResources[subSectionIndex].slottedResources.findIndex(
          (r) => r.resourceValue == resourceValue
        ) == -1) {
          const yieldTypes = getYieldTypes(resourceDef.ResourceType);
          let uniqueResource;
          const playerCity = Cities.get(cityID);
          if (playerCity?.Resources) {
            const availableSlots = [];
            const assignedResources = playerCity.Resources.getAssignedResources();
            const numAvailableSlots = playerCity.Resources.getAssignedResourcesCap() - assignedResources.length;
            for (let i = 0; i < numAvailableSlots; i++) {
              availableSlots.push(i);
            }
            cityResources[subSectionIndex].availableSlots = availableSlots;
            for (const assignedResource of assignedResources) {
              if (assignedResource.value === resourceValue) {
                uniqueResource = assignedResource;
                break;
              }
            }
            if (resourceDef.ResourceClassType == "RESOURCECLASS_FACTORY") {
              cityResources[subSectionIndex].factoryResourceData = populateFactoryResourceDataForCity(
                playerCity.id,
                playerCity.Resources
              );
            }
            cityResources[subSectionIndex].yieldDeltas = getCityYieldDeltas(
              cityID,
              sectionIndex,
              subSectionIndex
            );
          }
          if (!uniqueResource) {
            console.error("commerce-screen-model: cannot get unique resource from city");
            return;
          }
          const resourceProps = getResourceProps(uniqueResource);
          if (!resourceProps) {
            console.error("commerce-screen-model: cannot get resource props from uniqueResource");
            return;
          }
          const canSwapWithSelectedResource = createMemo(() => {
            return canSwapResources(resourceValue, selectedResource().resourceValue);
          });
          const resourceSlotData = {
            cityID,
            resourceType: resourceDef.ResourceType,
            resourceProps,
            resourceValue,
            yieldTypes,
            canSwapWithSelectedResource
          };
          cityResources[subSectionIndex].slottedResources.push(resourceSlotData);
        }
        const originCityID = GameplayMap.getOwningCityFromXY(
          resourceAssignedEventData.location.x,
          resourceAssignedEventData.location.y
        );
        if (!originCityID) {
          console.error("commerce-screen-model: Unable to get origin city for newly assigned resource");
          return;
        }
        const unassignedSectionIndex = Cities.get(originCityID)?.Trade?.isInTradeNetwork() ? 0 : 1;
        const unassignedSubSectionIndex = model.data.resourceTabData.availableResourceSectionData[unassignedSectionIndex].subSections.findIndex((subSection) => {
          return subSection.type == resourceDef.ResourceClassType;
        });
        const resourceIndex = model.data.resourceTabData.availableResourceSectionData[unassignedSectionIndex].subSections[unassignedSubSectionIndex].resourceSlotData.findIndex((availableResource) => {
          return availableResource.resourceValue == resourceValue;
        });
        if (resourceIndex != -1) {
          model.data.resourceTabData.availableResourceSectionData[unassignedSectionIndex].subSections[unassignedSubSectionIndex].resourceSlotData.splice(resourceIndex, 1);
        }
        model.isResourceSelected = false;
        sortSlottedResourcesBySlotIndex(model.data.resourceTabData.slottedResourceSectionData);
        handleDeselectSelectedResource();
        updateUnslottedBonuses();
        updateIsSlottingAvailable();
      });
    });
    createEffect(() => {
      const resourceUnassignedEventData = resourceUnassigned();
      if (!resourceUnassignedEventData) {
        return;
      }
      if (resourceUnassignedEventData.player != GameContext.localPlayerID) {
        return;
      }
      untrack(() => {
        const eventLocation = resourceUnassignedEventData.location;
        const resourceValue = GameplayMap.getIndexFromLocation(eventLocation);
        const sectionIndex = model.data.resourceTabData.slottedResourceSectionData.findIndex((section) => {
          return section.cityResources.find((city) => {
            return city.cityID.id == resourceUnassignedEventData.targetCity.id;
          });
        });
        if (sectionIndex == -1) {
          return;
        }
        const cityResources = model.data.resourceTabData.slottedResourceSectionData[sectionIndex].cityResources;
        const cityIndex = cityResources.findIndex((city) => {
          return city.cityID.id == resourceUnassignedEventData.targetCity.id;
        });
        if (cityIndex == -1) {
          return;
        }
        const slottedResources = model.data.resourceTabData.slottedResourceSectionData[sectionIndex].cityResources[cityIndex].slottedResources;
        const resourceIndex = slottedResources.findIndex((resource) => {
          return resource.resourceValue == resourceValue;
        });
        if (resourceIndex != -1) {
          slottedResources.splice(resourceIndex, 1);
          const playerCity = Cities.get(cityResources[cityIndex].cityID);
          if (playerCity?.Resources) {
            const availableSlots = [];
            const numAvailableSlots = playerCity.Resources.getAssignedResourcesCap() - playerCity.Resources.getAssignedResources().length;
            for (let i = 0; i < numAvailableSlots; i++) {
              availableSlots.push(i);
            }
            cityResources[cityIndex].availableSlots = availableSlots;
            const resource = Game.Resources.getResourceOnPlot(resourceValue);
            const resourceDef = GameInfo.Resources.lookup(resource.resource);
            if (!resourceDef) {
              console.error(
                "commerce-screen-model: failed to get resource object for newly assigned resource"
              );
              return;
            }
            if (resourceDef.ResourceClassType == "RESOURCECLASS_FACTORY") {
              cityResources[cityIndex].factoryResourceData = populateFactoryResourceDataForCity(
                playerCity.id,
                playerCity.Resources
              );
            }
            model.data.resourceTabData.slottedResourceSectionData[sectionIndex].cityResources[cityIndex].yieldDeltas = getCityYieldDeltas(playerCity.id, sectionIndex, cityIndex);
          }
        }
        pendingUnassignments.push(eventLocation);
        updateGate.call("resource_unassigned");
      });
    });
  });
  const [selectedResourceFilter, setSelectedResourceFilter] = createSignal("DEFAULT");
  const [selectedTradeRouteFilter, setSelectedTradeRouteFilter] = createSignal();
  const sortKey = (icon, type) => {
    const name = Locale.compose(`LOC_COMMERCE_RESOURCE_SETTLEMENT_SORT_${type}`);
    return [`[icon:${icon}]`, name].join(" ");
  }
  const yieldKey = (y) => sortKey(
    `YIELD_${y == "INFLUENCE" ? "DIPLOMACY" : y}`,
    `${y}_${y == "WAREHOUSE" ? "COUNT" : "YIELD"}`
  );
  const resourceSettlementSortItems = {};
  resourceSettlementSortItems["LOC_COMMERCE_RESOURCE_SORT_FILTER_DEFAULT_LABEL"] = 0 /* SettlementType */;
  resourceSettlementSortItems[`[icon:CITY_URBAN] ${Locale.compose("LOC_COMMERCE_SORT_BY_SETTLEMENT_NAME")}`] = 1 /* Name */;
  resourceSettlementSortItems[sortKey("NOTIFICATION_DISCOVER_CONTINENT", "DISTANCE_TYPE")] = 5 /* DistanceType */;
  if (Game.age == Game.getHash("AGE_MODERN")) {
    resourceSettlementSortItems[sortKey("ROUTE_RAILROAD", "RAIL_CONNECTED")] = 6 /* RailConnected */;
    resourceSettlementSortItems[sortKey("RESOURCECLASS_FACTORY", "HAS_FACTORY")] = 7 /* HasFactory */;
  }
  resourceSettlementSortItems[yieldKey("WAREHOUSE")] = 4 /* WarehouseCount */;
  resourceSettlementSortItems[yieldKey("FOOD")] = 8 /* Food */;
  resourceSettlementSortItems[yieldKey("PRODUCTION")] = 9 /* Production */;
  resourceSettlementSortItems[yieldKey("GOLD")] = 10 /* Gold */;
  resourceSettlementSortItems[yieldKey("SCIENCE")] = 11 /* Science */;
  resourceSettlementSortItems[yieldKey("CULTURE")] = 12 /* Culture */;
  resourceSettlementSortItems[yieldKey("HAPPINESS")] = 13 /* Happiness */;
  resourceSettlementSortItems[yieldKey("INFLUENCE")] = 14 /* Influence */;
  resourceSettlementSortItems["LOC_COMMERCE_RESOURCE_SETTLEMENT_SORT_TOTAL_SLOTS"] = 3 /* TotalSlots */;
  resourceSettlementSortItems["LOC_COMMERCE_RESOURCE_SETTLEMENT_SORT_OPEN_SLOTS"] = 2 /* OpenSlots */;
  const [selectedSettlementSortType, setSelectedSettlementSortType] = createSignal(
    persistSettlementSortType /* SettlementType */
  );
  const [selectedSortDirection, setSelectedSortDirection] = createSignal(1);
  createEffect(() => {
    function compareYields(a, b, yieldIndex) {
      const yieldComparison = b.yieldDeltas[yieldIndex].yieldTotal - a.yieldDeltas[yieldIndex].yieldTotal;
      if (yieldComparison === 0) {
        return compareSettlementTypes(a.cityID, b.cityID);
      }
      return yieldComparison;
    }
    model.data.resourceTabData.slottedResourceSectionData.forEach((slottedResourceSection) => {
      const type = selectedSettlementSortType();
      persistSettlementSortType = type;
      const d = persistSettlementSortDirection[type];
      if (d != selectedSortDirection()) setSelectedSortDirection(d);
      switch (selectedSettlementSortType()) {
        default:
        case 0 /* SettlementType */: {
          slottedResourceSection.cityResources.sort((a, b) => {
            return d * compareSettlementTypes(a.cityID, b.cityID);
          });
          break;
        }
        case 1 /* Name */: {
          slottedResourceSection.cityResources.sort((a, b) => {
            return d * compareSettlementNames(a.cityID, b.cityID);
          });
          break;
        }
        case 2 /* OpenSlots */: {
          slottedResourceSection.cityResources.sort((a, b) => {
            const availableSlotComparison = b.availableSlots.length - a.availableSlots.length;
            // TRIX: secondary sort on total slots
            const aSlots = a.slottedResources.length + a.availableSlots.length;
            const bSlots = b.slottedResources.length + b.availableSlots.length;
            const totalSlotComparison = bSlots - aSlots;
            return -d * (availableSlotComparison || totalSlotComparison || compareSettlementTypes(a.cityID, b.cityID));
          });
          break;
        }
        case 3 /* TotalSlots */: {
          slottedResourceSection.cityResources.sort((a, b) => {
            const aSlots = a.slottedResources.length + a.availableSlots.length;
            const bSlots = b.slottedResources.length + b.availableSlots.length;
            const totalSlotComparison = bSlots - aSlots;
            return -d * (totalSlotComparison || compareSettlementTypes(a.cityID, b.cityID));
          });
          break;
        }
        case 4 /* WarehouseCount */: {
          slottedResourceSection.cityResources.sort((a, b) => {
            const warehouseComparison = b.settlementNameData.warehouseCount - a.settlementNameData.warehouseCount;
            return -d * (warehouseComparison || compareSettlementTypes(a.cityID, b.cityID));
          });
          break;
        }
        case 5 /* DistanceType */: {
          slottedResourceSection.cityResources.sort((a, b) => {
            if (a.isDistantLands === b.isDistantLands) {
              return -d * compareSettlementTypes(a.cityID, b.cityID);
            }
            return -d * (b.isDistantLands ? 1 : -1);
          });
          break;
        }
        case 6 /* RailConnected */: {
          slottedResourceSection.cityResources.sort((a, b) => {
            if (a.settlementNameData.hasRail === b.settlementNameData.hasRail) {
              return -d * compareSettlementTypes(a.cityID, b.cityID);
            }
            return -d * (b.settlementNameData.hasRail ? 1 : -1);
          });
          break;
        }
        case 7 /* HasFactory */: {
          slottedResourceSection.cityResources.sort((a, b) => {
            if (a.factoryResourceData.hasFactory === b.factoryResourceData.hasFactory) {
              return -d * compareSettlementTypes(a.cityID, b.cityID);
            }
            return -d * (b.factoryResourceData.hasFactory ? 1 : -1);
          });
          break;
        }
        case 8 /* Food */: {
          slottedResourceSection.cityResources.sort((a, b) => {
            return -d * compareYields(a, b, 0);
          });
          break;
        }
        case 9 /* Production */: {
          slottedResourceSection.cityResources.sort((a, b) => {
            return -d * compareYields(a, b, 1);
          });
          break;
        }
        case 10 /* Gold */: {
          slottedResourceSection.cityResources.sort((a, b) => {
            return -d * compareYields(a, b, 2);
          });
          break;
        }
        case 11 /* Science */: {
          slottedResourceSection.cityResources.sort((a, b) => {
            return -d * compareYields(a, b, 3);
          });
          break;
        }
        case 12 /* Culture */: {
          slottedResourceSection.cityResources.sort((a, b) => {
            return -d * compareYields(a, b, 4);
          });
          break;
        }
        case 13 /* Happiness */: {
          slottedResourceSection.cityResources.sort((a, b) => {
            return -d * compareYields(a, b, 5);
          });
          break;
        }
        case 14 /* Influence */: {
          slottedResourceSection.cityResources.sort((a, b) => {
            return -d * compareYields(a, b, 6);
          });
          break;
        }
      }
    });
  });
  const [selectedResource, setSelectedResource] = createSignal({
    resourceValue: -1,
    cityID: void 0
  });
  const [prevSelectedResource, setPrevSelectedResource] = createSignal({
    resourceValue: -1,
    cityID: void 0
  });
  const [focusedResource, setFocusedResource] = createSignal({
    resourceValue: -1,
    cityID: void 0
  });
  const [ghostResourceFocused, setGhostResourceFocused] = createSignal(false);
  const [selectedSettlementId, setSelectedSettlementId] = createSignal();
  const [prevSelectedSettlementId, setPrevSelectedSettlementId] = createSignal();
  const [focusedSettlementId, setFocusedSettlementId] = createSignal();
  const [firstAssignableCityId, setFirstAssignableCityId] = createSignal();
  const [selectedTradeRouteId, setSelectedTradeRouteId] = createSignal();
  const [selectedTreasureConvoyId, setSelectedTreasureConvoyId] = createSignal();
  const [selectedEmpireResource, setSelectedEmpireResource] = createSignal();
  createEffect(() => {
    let cityId;
    model.data.resourceTabData.slottedResourceSectionData.forEach((section) => {
      if (cityId) {
        return;
      }
      section.cityResources.forEach((subSection) => {
        if (cityId) {
          return;
        }
        if (subSection.canAssignSelectedResourceToSettlement()) {
          cityId = subSection.cityID;
        }
      });
    });
    const resource = Game.Resources.getResourceOnPlot(model.selectedResource().resourceValue);
    const resourceDef = GameInfo.Resources.lookup(resource.resource);
    if (resourceDef) {
      if (cityId) {
        const city = Cities.get(cityId);
        if (city) {
          gamepadLog(
            "First assignable city Id for",
            Locale.compose(resourceDef.Name),
            ":",
            Locale.compose(city.name)
          );
        }
      } else {
        gamepadLog("No assignable city found for", Locale.compose(resourceDef.Name));
      }
    }
    setFirstAssignableCityId(cityId);
  });
  const isFirstAssignableCity = createSelector(
    firstAssignableCityId,
    (a, b) => ComponentID.isMatch(a ?? null, b ?? null)
  );
  const [resourceSwapTarget, setResourceSwapTarget] = createSignal(-1);
  const [isInSortAndFilterMode, setIsInSortAndFilterMode] = createSignal(false);
  const [tabName, setTabName] = createSignal("");
  createEffect(() => {
    if (isInSortAndFilterMode()) {
      resetResourceTab(false);
    }
  });
  function resetResourceTab(includeSortAndFilterMode = true) {
    setSelectedSettlementId();
    setPrevSelectedSettlementId();
    setFocusedSettlementId();
    setSelectedResource({ resourceValue: -1 });
    setPrevSelectedResource({ resourceValue: -1 });
    setFocusedResource({ resourceValue: -1 });
    if (includeSortAndFilterMode) {
      setIsInSortAndFilterMode(false);
    }
  }
  function resetTradeTab() {
    setSelectedTradeRouteId();
  }
  function resetEmpireTab() {
    setSelectedEmpireResource();
  }
  function resetTreasureTab() {
    setSelectedTreasureConvoyId();
  }
  function handleChangeTabs(tab) {
    switch (tabName()) {
      case "Resources":
        resetResourceTab();
        break;
      case "Trade":
        resetTradeTab();
        break;
      case "Empire":
        resetEmpireTab();
        break;
      case "Treasure":
        resetTreasureTab();
        break;
    }
    setTabName(tab?.name);
  }
  function handleSetSelectedSettlementId(newID) {
    if (!newID) {
      batch(() => {
        setSelectedSettlementId((prev) => {
          setPrevSelectedSettlementId(prev);
          return void 0;
        });
      });
      return;
    }
    const city = Cities.get(newID);
    if (!city) {
      return;
    }
    setSelectedSettlementId(newID);
  }
  let canSlot = true;
  const localPlayerResources = Players.get(GameContext.localPlayerID)?.Resources;
  canSlot = localPlayerResources ? !localPlayerResources.isRessourceAssignmentLocked() : false;
  let hasSlottedConnectedResources = false;
  let hasSlottedDisconnectedResources = false;
  function getCityYieldDeltas(cityID, sectionIndex, subSectionIndex) {
    const cityYieldDeltas = CityYields.getCityYieldDetails(cityID);
    const newYieldDeltas = [];
    cityYieldDeltas.forEach((cityYieldDelta, index) => {
      const currentYieldValue = Number(parseFloat(cityYieldDelta.value).toFixed(1));
      const newYieldValue = currentYieldValue - model.data.resourceTabData.slottedResourceSectionData[sectionIndex].cityResources[subSectionIndex].baseYields[index].yieldTotal;
      if (!cityYieldDelta.type) {
        return;
      }
      const newYieldDelta = {
        yieldIconSrc: `url(${UI.getIcon(cityYieldDelta.type, "YIELD")})`,
        yieldDelta: Number(parseFloat(newYieldValue.toString()).toFixed(1)),
        yieldTotal: currentYieldValue
      };
      newYieldDeltas.push(newYieldDelta);
    });
    return newYieldDeltas;
  }
  function updateIsSlottingAvailable() {
    const localPlayerResources2 = Players.get(GameContext.localPlayerID)?.Resources;
    if (localPlayerResources2 && !localPlayerResources2.isRessourceAssignmentLocked()) {
      model.isSlottingAvailable = true;
    } else {
      model.isSlottingAvailable = false;
    }
  }
  function canAssignSelectedResourceToSettlement(cityID) {
    let focusedCityResourceData;
    model.data.resourceTabData.slottedResourceSectionData.forEach((section) => {
      if (focusedCityResourceData) {
        return;
      }
      focusedCityResourceData = section.cityResources.find(
        (resources) => ComponentID.isMatch(resources.cityID, cityID)
      );
    });
    return focusedCityResourceData?.canAssignSelectedResourceToSettlement() || false;
  }
  function getResourceContainerSelectionState(isConnectedToTradeNetwork, cityData) {
    const anyResourceSelected = selectedResource().resourceValue !== -1;
    const selectedResourceIsConnectedToTradeNetwork = anyResourceSelected && resourceIsConnectedToTradeNetwork(selectedResource().resourceValue);
    if (!cityData) {
      if (anyResourceSelected) {
        if (selectedResourceIsConnectedToTradeNetwork === isConnectedToTradeNetwork) {
          return 1 /* CanSelect */;
        }
        return 2 /* CanNotSelect */;
      }
      return 0 /* NotSelecting */;
    }
    const selectedResourceBelongsToThisSettlement = ComponentID.isMatch(
      model.selectedResource().cityID ?? null,
      cityData.cityID
    );
    const isSettlementSelectable = anyResourceSelected && (cityData.canAssignResourceToSettlement() || selectedResourceBelongsToThisSettlement);
    if (anyResourceSelected) {
      if (isSettlementSelectable || selectedResourceBelongsToThisSettlement) {
        return 1 /* CanSelect */;
      }
      return 2 /* CanNotSelect */;
    }
    return 0 /* NotSelecting */;
  }
  function canSelectResource(resourceSlot) {
    const isAnyResourceSelected = selectedResource().resourceValue !== -1;
    const amISelected = selectedResource().resourceValue === resourceSlot.resourceValue;
    const selectedResourceIsInSameContainer = ComponentID.isMatch(
      selectedResource().cityID ?? null,
      resourceSlot.cityID ?? null
    );
    let tradeNetworkConnectionMatches = true;
    if (resourceSlot.cityID) {
      const mySettlement = Cities.get(resourceSlot.cityID);
      tradeNetworkConnectionMatches = cityIsConnectedToTradeNetwork(mySettlement) === resourceIsConnectedToTradeNetwork(selectedResource().resourceValue);
    }
    if (!isAnyResourceSelected) {
      return true;
    }
    if (amISelected) {
      return true;
    }
    if (selectedResourceIsInSameContainer) {
      return false;
    }
    if (tradeNetworkConnectionMatches) {
      return resourceSlot.canSwapWithSelectedResource();
    }
    return false;
  }
  function canDropResourceOnTarget(resourceSlot, targetCityID, targetResourceValue) {
    if (!model.isSlottingAvailable || resourceSlot.resourceValue === -1) {
      return false;
    }
    if (targetResourceValue !== void 0) {
      if (resourceSlot.resourceValue === targetResourceValue) {
        return false;
      }
      if (targetCityID && resourceSlot.cityID && ComponentID.isMatch(resourceSlot.cityID, targetCityID)) {
        return false;
      }
      return canSwapResources(resourceSlot.resourceValue, targetResourceValue);
    }
    if (targetCityID) {
      if (resourceSlot.cityID && ComponentID.isMatch(resourceSlot.cityID, targetCityID)) {
        return false;
      }
      return canAssignSelectedResourceToSettlement(targetCityID);
    }
    return false;
  }
  function canStartPlayerOperation(operationType, args) {
    const result = Game.PlayerOperations.canStart(
      GameContext.localPlayerID,
      operationType,
      args,
      false
    );
    return result.Success;
  }
  function tryRequestPlayerOperation(operationType, args) {
    if (!canStartPlayerOperation(operationType, args)) {
      return false;
    }
    Game.PlayerOperations.sendRequest(GameContext.localPlayerID, operationType, args);
    return true;
  }
  function canSwapResources(resourceValue1, resourceValue2) {
    if (resourceValue1 === -1 || resourceValue2 === -1) {
      return false;
    }
    const location1 = GameplayMap.getLocationFromIndex(resourceValue1);
    const location2 = GameplayMap.getLocationFromIndex(resourceValue2);
    const args = { Location: location1, Location2: location2 };
    return canStartPlayerOperation(PlayerOperationTypes.SWAP_RESOURCES, args);
  }
  function getResourcePropsFromDefinition(resourceDefinition, originCityId) {
    const originCity = originCityId ? Cities.get(originCityId) : null;
    const resourceTypeName = `LOC_${resourceDefinition.ResourceClassType}_NAME`;
    let originImportFlagProps = void 0;
    let classType = resourceDefinition.ResourceClassType;
    if (originCity) {
      if (classType === "RESOURCECLASS_TREASURE") {
        const localPlayer = Players.get(GameContext.localPlayerID);
        if (localPlayer) {
          if (localPlayer.isDistantLands(originCity.location)) {
            classType = "RESOURCECLASS_TREASURE_FLEET";
          }
        }
      }
      if (originCity.owner !== GameContext.localPlayerID) {
        const playerColors = UI.Color.getPlayerColors(originCity.originalOwner);
        if (playerColors) {
          const colorVariants = UI.Color.createPlayerColorVariants(playerColors);
          originImportFlagProps = {
            primaryColor: colorVariants.primaryColor.mainColor,
            secondaryColor: colorVariants.secondaryColor.mainColor
          };
        }
      }
    }
    return {
      resourceName: resourceDefinition.Name,
      resourceIcon: `url(blp:${UI.getIconBLP(resourceDefinition?.ResourceType ?? "")})`,
      resourceType: resourceTypeName,
      resourceTypeIcon: `url(blp:${UI.getIconBLP(classType)})`,
      resourceOrigin: originCity?.name,
      tooltipText: resourceDefinition.Tooltip,
      importFlag: originImportFlagProps
    };
  }
  function getResourceProps(uniqueResourceValue, originCityOverride) {
    const resourceDefinition = GameInfo.Resources.lookup(uniqueResourceValue.uniqueResource.resource);
    if (!resourceDefinition) {
      console.error("commerce-screen-model.tsx::getResourceProps: couldn't find resource definition");
      return;
    }
    return getResourcePropsFromDefinition(
      resourceDefinition,
      originCityOverride ?? Game.Resources.getOriginCity(uniqueResourceValue.value)
    );
  }
  function getSelectedResourceProps() {
    const selectedResourceValue = model.selectedResource().resourceValue;
    if (selectedResourceValue === -1) {
      return;
    }
    const uniqueResource = Players.get(GameContext.localPlayerID)?.Resources?.getResources().find((uniqueResourceValue) => {
      return uniqueResourceValue.value === selectedResourceValue;
    });
    if (!uniqueResource) {
      console.error(
        "commerce-screen-model.tsx::getResourcePropsFromResourceValue: couldn't find resource uniqueResource"
      );
      return;
    }
    return getResourceProps(uniqueResource);
  }
  function cityIsConnectedToTradeNetwork(city) {
    if (!city) {
      return false;
    }
    if (city.owner != GameContext.localPlayerID) {
      return true;
    }
    if (city.Trade?.isInTradeNetwork()) {
      return true;
    }
    return false;
  }
  function resourceIsConnectedToTradeNetwork(resourceValue) {
    const originCityID = Game.Resources.getOriginCity(resourceValue);
    const originCity = Cities.get(originCityID);
    return cityIsConnectedToTradeNetwork(originCity);
  }
  function clearAllResources(cityID, type) {
    function clearResourcesFromCity(cityIDInternal) {
      const city = Cities.get(cityIDInternal);
      if (!city || !city.Resources) {
        return;
      }
      const previouslyAssignedResources = city.Resources.getAssignedResources().map(
        (uniqueResourceValue) => uniqueResourceValue.value
      ).filter(
        (plot) => !type || Game.Resources.getResourceOnPlot(plot)?.resource == type
      );
      const args = {
        ResourceType: type ?? ResourceTypes.NO_RESOURCE,
        City: cityIDInternal.id,
        Action: PlayerOperationParameters.Clear
      };
      if (tryRequestPlayerOperation(PlayerOperationTypes.ASSIGN_RESOURCE, args)) {
        setLastSlottedResourceValues(previouslyAssignedResources);
      }
    }
    if (cityID) {
      clearResourcesFromCity(cityID);
      return;
    }
    const localPlayer = Players.get(GameContext.localPlayerID);
    localPlayer?.Cities?.getCities().forEach((city) => clearResourcesFromCity(city.id));
  }
  function getGamepadTrayItems() {
    const focusedSettlement = focusedSettlementId();
    const selectedSettlement = selectedSettlementId();
    const selectedResourceData = selectedResource();
    const focusedResourceData = focusedResource();
    const ghostResourceIsFocused = ghostResourceFocused();
    if (IsControllerActive() === false) {
      return [];
    }
    let mask = 0;
    if (selectedSettlement !== void 0) {
      mask |= 4 /* SettlementSelected */;
    }
    if (focusedSettlement !== void 0) {
      mask |= 8 /* SettlementFocused */;
    }
    if (selectedResourceData.resourceValue !== -1) {
      mask |= 1 /* ResourceSelected */;
    }
    if (focusedResourceData.resourceValue !== -1) {
      mask |= 2 /* ResourceFocused */;
    }
    let editCityLabel = "";
    let cancelEditCityLabel = "";
    if (focusedSettlement) {
      const focusedCity = Cities.get(focusedSettlement);
      if (focusedCity) {
        editCityLabel = Locale.compose(
          canSlot ? "LOC_COMMERCE_GAMEPAD_SELECT_CITY_HINT" : "LOC_COMMERCE_GAMEPAD_VIEW_CONTAINER_HINT",
          Locale.compose(focusedCity.name)
        );
      }
    }
    if (selectedSettlement) {
      const selectedCity = Cities.get(selectedSettlement);
      if (selectedCity) {
        cancelEditCityLabel = Locale.compose(
          canSlot ? "LOC_COMMERCE_GAMEPAD_DESELECT_CITY_HINT" : "LOC_COMMERCE_GAMEPAD_STOP_VIEWING_CONTAINER_HINT",
          Locale.compose(selectedCity.name)
        );
      }
    }
    const selectSettlement = {
      name: "Edit-Resources",
      hotkeyAction: "accept",
      navTrayText: editCityLabel
    };
    const selectResource = {
      name: "Select-Resource",
      hotkeyAction: "accept",
      navTrayText: "LOC_COMMERCE_GAMEPAD_SELECT_RESOURCE_HINT"
    };
    const assignResource2 = {
      name: "Assign-resource",
      hotkeyAction: "accept",
      navTrayText: "LOC_COMMERCE_GAMEPAD_ASSIGN_RESOURCE_HINT"
    };
    const swapResource = {
      name: "Resource-Swap",
      hotkeyAction: "accept",
      navTrayText: "LOC_COMMERCE_GAMEPAD_SWAP_RESOURCE_HINT"
    };
    const deselectSettlement = {
      name: "Deselect-Settlement",
      hotkeyAction: "cancel",
      navTrayText: cancelEditCityLabel,
      onActivate: () => {
        gamepadLog("Cancelling resource editing from settlement with ID:", selectedSettlement?.id);
        handleSetSelectedSettlementId(void 0);
      }
    };
    const deselectResource = {
      name: "Deselect-Resource",
      hotkeyAction: "cancel",
      navTrayText: "LOC_COMMERCE_GAMEPAD_DESELECT_RESOURCE_HINT",
      onActivate: () => {
        gamepadLog("Deselecting selected resource", focusedSettlement?.id);
        handleDeselectSelectedResource();
      }
    };
    const quickAssign = {
      name: "Quick-Assign",
      hotkeyAction: "shell-action-1",
      navTrayText: "LOC_COMMERCE_GAMEPAD_QUICK_ASSIGN_HINT",
      onActivate: () => {
        handleSlotSelectedResource(focusedSettlement);
      }
    };
    const toggleSortAndFilterMode = {
      name: "Toggle-Sort-Filter-Mode",
      hotkeyAction: "shell-action-2",
      navTrayText: "LOC_UI_FILTER_SORT_FILTERS",
      onActivate: () => {
        setIsInSortAndFilterMode((prev) => !prev);
      }
    };
    const unassignResources = (focusedCity) => ({
      name: "Unassign-Resources",
      hotkeyAction: "shell-action-3",
      navTrayText: Locale.compose("LOC_COMMERCE_UNASSIGN_RESOURCES", Locale.compose(focusedCity.name)),
      onActivate: () => {
        clearAllResources(focusedSettlement);
        setSelectedSettlementId(void 0);
      }
    });
    const unassignResource2 = (options) => ({
      name: "Unassign-Resource",
      hotkeyAction: "shell-action-3",
      navTrayText: "LOC_COMMERCE_GAMEPAD_UNASSIGN_RESOURCE_HINT",
      onActivate: () => {
        gamepadLog(
          "Unassigning resource",
          focusedResourceData.resourceValue,
          "from settlement with ID:",
          selectedSettlement?.id ?? focusedSettlement?.id ?? "unknown"
        );
        const { success, resourcesRemaining } = handleUnslotResource(focusedResourceData);
        if (!options.changeFocusAfterAction) {
          return;
        }
        if (!success || resourcesRemaining === 0) {
          setSelectedSettlementId(void 0);
          return;
        }
      }
    });
    const trayItems = [];
    if (model.selectedResource().resourceValue === -1) {
      if (!model.selectedSettlementId()) {
        trayItems.push(toggleSortAndFilterMode);
      }
    } else {
      trayItems.push(deselectResource);
    }
    switch (mask) {
      case 2 /* FocusedResource */: {
        return model.isSlottingAvailable ? [...trayItems, assignResource2] : trayItems;
      }
      case 8 /* FocusedSettlement */: {
        const focusedCity = Cities.get(focusedSettlement);
        if (!focusedCity) {
          return trayItems;
        }
        const focusedCityResources = focusedCity.Resources;
        if (!focusedCityResources?.getAssignedResources().length) {
          return trayItems;
        }
        return model.isSlottingAvailable ? [...trayItems, selectSettlement, unassignResources(focusedCity)] : [...trayItems, selectSettlement];
      }
      case 6 /* SelectedSettlementFocusedResource */: {
        return model.isSlottingAvailable ? [
          ...trayItems,
          selectResource,
          unassignResource2({ changeFocusAfterAction: true }),
          deselectSettlement
        ] : [...trayItems, deselectSettlement];
      }
      case 9 /* SelectedResourceFocusedSettlement */: {
        if (ComponentID.isMatch(focusedSettlement, selectedResourceData.cityID ?? null)) {
          return trayItems;
        }
        if (canAssignSelectedResourceToSettlement(focusedSettlement) === false) {
          return trayItems;
        }
        const focusedCity = Cities.get(focusedSettlement);
        if (!focusedCity) {
          return trayItems;
        }
        const focusedCityResources = focusedCity.Resources;
        if (!focusedCityResources) {
          return trayItems;
        }
        if (focusedCityResources.getAssignedResources().length === 0) {
          return [...trayItems, quickAssign];
        } else {
          return [...trayItems, selectSettlement, quickAssign];
        }
      }
      case 7 /* SelectedResourceSelectedSettlementFocusedResource */: {
        if (ghostResourceIsFocused) {
          return [...trayItems, assignResource2, deselectSettlement];
        }
        return [...trayItems, swapResource, deselectSettlement];
      }
      default: {
        return trayItems;
      }
    }
  }
  function settlementHasSlottedResources(cityID) {
    const city = Cities.get(cityID);
    if (!city || !city.Resources) {
      return;
    }
    return city.Resources.getAssignedResources().length > 0;
  }
  function updateSlottedResources() {
    const localPlayer = Players.get(GameContext.localPlayerID);
    const localPlayerCities = localPlayer?.Cities?.getCities();
    hasSlottedConnectedResources = hasSlottedDisconnectedResources = false;
    if (!localPlayerCities) {
      return;
    }
    localPlayerCities.forEach((playerCity) => {
      const sectionIndex = model.data.resourceTabData.slottedResourceSectionData.findIndex((section) => {
        return section.cityResources.find((city) => {
          return city.cityID.id == playerCity.id.id;
        });
      });
      if (sectionIndex == -1) {
        return;
      }
      const cityIndex = model.data.resourceTabData.slottedResourceSectionData[sectionIndex].cityResources.findIndex((city) => {
        return city.cityID.id == playerCity.id.id;
      });
      if (cityIndex == -1) {
        return;
      }
      const cityResources = model.data.resourceTabData.slottedResourceSectionData[sectionIndex].cityResources[cityIndex];
      cityResources.slottedResources = populateCityResourceData(playerCity);
      if (!playerCity.Resources) {
        return;
      }
      cityResources.factoryResourceData = populateFactoryResourceDataForCity(playerCity.id, playerCity.Resources);
      const availableSlots = [];
      const numAvailableSlots = playerCity.Resources.getAssignedResourcesCap() - playerCity.Resources.getAssignedResources().length;
      for (let i = 0; i < numAvailableSlots; i++) {
        availableSlots.push(i);
      }
      model.data.resourceTabData.slottedResourceSectionData[sectionIndex].cityResources[cityIndex].availableSlots = availableSlots;
      const newYieldDeltas = [];
      const cityYieldDeltas = CityYields.getCityYieldDetails(playerCity.id);
      cityYieldDeltas.forEach((cityYieldDelta, index) => {
        const currentYieldValue = Number(parseFloat(cityYieldDelta.value).toFixed(1));
        const newYieldValue = currentYieldValue - model.data.resourceTabData.slottedResourceSectionData[sectionIndex].cityResources[cityIndex].baseYields[index].yieldTotal;
        if (!cityYieldDelta.type) {
          return;
        }
        const newYieldDelta = {
          yieldIconSrc: `url(${UI.getIcon(cityYieldDelta.type, "YIELD")})`,
          yieldDelta: Number(parseFloat(newYieldValue.toString()).toFixed(1)),
          yieldTotal: currentYieldValue
        };
        newYieldDeltas.push(newYieldDelta);
      });
      model.data.resourceTabData.slottedResourceSectionData[sectionIndex].cityResources[cityIndex].yieldDeltas = newYieldDeltas;
    });
  }
  function sendConsideredAssigningResources() {
    const args = {};
    tryRequestPlayerOperation(PlayerOperationTypes.CONSIDER_ASSIGN_RESOURCE, args);
  }
  function handleClickClose() {
    ContextManager.pop("screen-resource-allocation");
  }
  function handleClickUnimprovedTreasure(location) {
    Camera.lookAtPlot(location);
  }
  function handleClickTreasureFleet(cityID) {
    const player = Players.get(GameContext.localPlayerID);
    if (!player) {
      return;
    }
    const treasureFleet = Players.get(GameContext.localPlayerID)?.Units?.getUnits().find((unit) => {
      return unit.originCityId == cityID.id && unit.type == player.Units?.getBuildUnit("UNIT_TREASURE_FLEET");
    });
    if (treasureFleet) {
      Camera.lookAtPlot(treasureFleet.location);
    }
  }
  function handleClickCityName(cityID) {
    const city = Cities.get(cityID);
    if (!city) {
      return;
    }
    Camera.lookAtPlot(city.location);
  }
  function handleClickAvailableResource(resourceData) {
    if (model.selectedResource().resourceValue !== -1 && model.selectedResource().cityID !== void 0) {
      const targetCity = model.selectedResource().cityID;
      swapItemSlotIndices(
        model.selectedResource().cityID,
        model.selectedResource().resourceValue,
        resourceData.cityID,
        resourceData.resourceValue
      );
      handleUnslotSelectedResource();
      assignResource(targetCity, resourceData.resourceValue);
      const audioTrigger = useAudio("CommerceScreen/ResourceSlotting");
      audioTrigger("dropSwap");
      const resourceType = resourceNameShort(getResourceTypeFromValue(resourceData.resourceValue));
      audioTrigger("dropAccept", { resourceType });
    } else if (model.selectedResource().resourceValue != -1) {
      handleDeselectSelectedResource();
    } else if (model.selectedResource().resourceValue === resourceData.resourceValue) {
      handleUnslotSelectedResource();
    } else {
      batch(() => {
        setSelectedResource(resourceData);
        model.isResourceSelected = true;
      });
    }
  }
  function handleClickSlottedResource(resourceData) {
    const selectedResource2 = model.selectedResource();
    if (resourceData.cityID == null && selectedResource2.cityID == null || resourceData.cityID && selectedResource2.cityID && ComponentID.isMatch(resourceData.cityID, selectedResource2.cityID)) {
      handleDeselectSelectedResource();
      return;
    }
    if (model.selectedResource().resourceValue !== -1) {
      if (model.selectedResource().cityID) {
        handleSlotSelectedResource(resourceData.cityID, resourceData.resourceValue);
      } else if (resourceData.cityID) {
        const location = GameplayMap.getLocationFromIndex(resourceData.resourceValue);
        const location2 = GameplayMap.getLocationFromIndex(model.selectedResource().resourceValue);
        const swapResult = swapResources(location, location2);
        if (swapResult) {
          swapItemSlotIndices(
            model.selectedResource().cityID,
            model.selectedResource().resourceValue,
            resourceData.cityID,
            resourceData.resourceValue
          );
          setLastSlottedResourceValues([model.selectedResource().resourceValue, resourceData.resourceValue]);
          const audioTrigger = useAudio("CommerceScreen/ResourceSlotting");
          audioTrigger("dropSwap");
          const resourceType = resourceNameShort(
            getResourceTypeFromValue(model.selectedResource().resourceValue)
          );
          audioTrigger("dropAccept", { resourceType });
        }
      }
    } else {
      setSelectedResource(resourceData);
      model.isResourceSelected = true;
    }
  }
  function handleSlotSelectedResource(targetCityID, targetResourceValue) {
    const audioTrigger = useAudio("CommerceScreen/ResourceSlotting");
    const selection = model.selectedResource();
    if (selection.cityID?.id === targetCityID?.id) {
      handleDeselectSelectedResource();
      return;
    }
    if (selection.resourceValue != -1) {
      const resourceType = resourceNameShort(
        getResourceTypeFromValue(selection.resourceValue)
      );
      if (targetResourceValue === true) {
        // move all resources of the same type
        const resource = Game.Resources.getResourceOnPlot(selection.resourceValue);
        const type = resource.resource;
        const info = GameInfo.Resources.lookup(resource.resource);
        // get the pool of resources
        const pool = ((plot, cityID) => {
          const data = model.data.resourceTabData;
          if (cityID) {
            // get slotted resources for city
            const index = +(!Cities.get(cityID)?.Trade?.isInTradeNetwork());
            const section = data.slottedResourceSectionData[index];
            const city = section.cityResources
              .find(city => ComponentID.isMatch(city.cityID, cityID));
            return city.slottedResources;
          } else {
            // get available resources for resource class
            const loc = GameplayMap.getLocationFromIndex(plot);
            const cityID = GameplayMap.getOwningCityFromXY(loc.x, loc.y);
            const index = +(!Cities.get(cityID)?.Trade?.isInTradeNetwork());
            const section = data.availableResourceSectionData[index];
            const rctype = section.subSections
              .find(sub => sub.type == info.ResourceClassType);
            return rctype.resourceSlotData;
          }
        })(selection.resourceValue, selection.cityID);
        // get the plots for all the matching resources
        const plots = pool.map(r => r.resourceValue)
          .filter(plot => Game.Resources.getResourceOnPlot(plot)?.resource == type);
        // move the resources
        const moved = [];
        for (const plot of plots) {
          addItemSlotIndex(targetCityID, plot);
          const assignResult = assignResource(targetCityID, plot);
          if (!assignResult) break;
          moved.push(plot);
        }
        setLastSlottedResourceValues(plots);
        if (moved.length) {
          audioTrigger("dropAccept", { resourceType });
        } else {
          audioTrigger("dropReject");
        }
        return;
      } else if (targetResourceValue && selection.cityID != void 0) {
        const location = GameplayMap.getLocationFromIndex(targetResourceValue);
        const location2 = GameplayMap.getLocationFromIndex(selection.resourceValue);
        const swapResult = swapResources(location, location2);
        if (swapResult) {
          swapItemSlotIndices(
            selection.cityID,
            selection.resourceValue,
            targetCityID,
            targetResourceValue
          );
          setLastSlottedResourceValues([selection.resourceValue, targetResourceValue]);
          audioTrigger("dropSwap");
          audioTrigger("dropAccept", { resourceType });
          return;
        }
        audioTrigger("dropReject");
        return;
      }
      addItemSlotIndex(targetCityID, selection.resourceValue);
      const assignResult = assignResource(targetCityID, selection.resourceValue);
      setLastSlottedResourceValues([selection.resourceValue]);
      if (assignResult) {
        audioTrigger("dropAccept", { resourceType });
      } else {
        audioTrigger("dropReject");
      }
    }
  }
  function swapResources(location1, location2) {
    const args = { Location: location1, Location2: location2 };
    return tryRequestPlayerOperation(PlayerOperationTypes.SWAP_RESOURCES, args);
  }
  function assignResource(targetCityID, resourceValue) {
    const location = GameplayMap.getLocationFromIndex(resourceValue);
    const args = { Location: location, City: targetCityID.id };
    return tryRequestPlayerOperation(PlayerOperationTypes.ASSIGN_RESOURCE, args);
  }
  function unassignResource(targetCityID, resourceValue) {
    const location = GameplayMap.getLocationFromIndex(resourceValue);
    const args = {
      Location: location,
      City: targetCityID.id,
      Action: PlayerOperationParameters.Deactivate
    };
    return tryRequestPlayerOperation(PlayerOperationTypes.ASSIGN_RESOURCE, args);
  }
  function handleUnslotResource(resource) {
    if (resource.cityID === void 0) {
      return { success: false, resourcesRemaining: -1 };
    }
    const audioTrigger = useAudio("CommerceScreen/ResourceSlotting");
    if (!unassignResource(resource.cityID, resource.resourceValue)) {
      audioTrigger("dropReject");
      return { success: false, resourcesRemaining: -1 };
    }
    const { remainingIndexCount } = removeItemSlotIndex(resource.cityID, resource.resourceValue);
    audioTrigger("dropUnassign");
    setLastSlottedResourceValues([resource.resourceValue]);
    return { success: true, resourcesRemaining: remainingIndexCount };
  }
  function handleUnslotSelectedResource(all) {
    const selection = model.selectedResource();
    if (selection.resourceValue == -1) return;
    if (all) {
      const resource = Game.Resources.getResourceOnPlot(selection.resourceValue);
      clearAllResources(selection.cityID, resource.resource);
      const audioTrigger = useAudio("CommerceScreen/ReturnResources");
      audioTrigger("activate");
      return;
    }
    handleUnslotResource(selection);
    handleDeselectSelectedResource();
  }
  function handleDeselectSelectedResource() {
    setSelectedResource((prev) => {
      setPrevSelectedResource(prev);
      return { resourceValue: -1, cityID: void 0, isConnected: false };
    });
  }
  function populateCityResourceData(city) {
    const slottedResourceData = [];
    const cityResources = city.Resources;
    if (!cityResources) {
      return slottedResourceData;
    }
    cityResources.getAssignedResources().forEach((resource) => {
      const resourceDefinition = GameInfo.Resources.lookup(resource.uniqueResource.resource);
      if (!resourceDefinition) {
        return;
      }
      const resourceProps = getResourceProps(resource);
      if (!resourceProps) {
        return;
      }
      if (resourceIsConnectedToTradeNetwork(resource.value)) {
        hasSlottedConnectedResources = true;
      } else {
        hasSlottedDisconnectedResources = true;
      }
      const yieldTypes = getYieldTypes(resourceDefinition.ResourceType);
      const canSwapWithSelectedResource = createMemo(() => {
        return canSwapResources(resource.value, selectedResource().resourceValue);
      });
      slottedResourceData.push({
        resourceType: resourceDefinition.ResourceType,
        resourceProps,
        resourceValue: resource.value,
        cityID: city.id,
        yieldTypes,
        canSwapWithSelectedResource
      });
    });
    return slottedResourceData;
  }
  function sortResourceSlotData(a, b) {
    const resourceAName = Locale.compose(a.resourceType);
    const resourceBName = Locale.compose(b.resourceType);
    if (resourceAName === resourceBName) {
      const aIsImport = a.resourceProps.importFlag !== void 0;
      const bIsImport = b.resourceProps.importFlag !== void 0;
      if (!aIsImport && bIsImport) {
        return -1;
      }
      if (aIsImport === bIsImport) {
        return 0;
      }
      if (!bIsImport && aIsImport) {
        return 1;
      }
    }
    return resourceAName < resourceBName ? -1 : 1;
  }
  function sortAvailableResources(availableResources) {
    availableResources.forEach(
      (availableResourceSection) => availableResourceSection.subSections.forEach(
        (subSection) => subSection.resourceSlotData.sort(sortResourceSlotData)
      )
    );
  }
  function debugPrintSlotIndices(cityID) {
    if (!DEBUG_RESOURCE_SWAPPING) {
      return;
    }
    function printCitySlotIndices(slottedResourceRecord) {
      const result = [];
      Object.entries(slottedResourceRecord.record).forEach(([resourceValue, slotIndex]) => {
        const resource = Game.Resources.getResourceOnPlot(parseInt(resourceValue));
        const resourceDef = GameInfo.Resources.lookup(resource.resource);
        result.push(Locale.compose(resourceDef?.Name ?? "") + ":" + slotIndex);
      });
      return result;
    }
    if (cityID) {
      const city = Cities.get(cityID);
      if (city) {
        const cityName = Locale.compose(city.name);
        const result = printCitySlotIndices(slottedResourceIndices[ComponentID.toString(cityID)]);
        console.debug("DebugResources:", `${cityName} changed:`, result);
      }
      return;
    }
    Object.entries(slottedResourceIndices).forEach(([key, slotMap]) => {
      const city = Cities.get(ComponentID.fromString(key));
      if (city) {
        const cityName = Locale.compose(city.name);
        const result = printCitySlotIndices(slotMap);
        console.debug(cityName, result);
      }
    });
  }
  function sortSlottedResourcesBySlotIndex(slottedResources) {
    reIndexSlottedResources(model.data.resourceTabData.slottedResourceSectionData);
    slottedResources.forEach((slottedResourceSection) => {
      slottedResourceSection.cityResources.forEach((cityResourceData) => {
        cityResourceData.slottedResources.sort(
          (a, b) => slottedResourceIndices[ComponentID.toString(cityResourceData.cityID)].record[a.resourceValue] - slottedResourceIndices[ComponentID.toString(cityResourceData.cityID)].record[b.resourceValue]
        );
      });
    });
  }
  function updateUnslottedBonuses() {
    let numAvailableResources = 0;
    model.data.resourceTabData.availableResourceSectionData.forEach((section) => {
      section.subSections.forEach((subSection) => {
        numAvailableResources += subSection.resourceSlotData.length;
      });
    });
    const unslottedBonuses = [];
    GameInfo.Yields.forEach((yieldDefinition) => {
      const unassignedBonus = Players.get(GameContext.localPlayerID)?.Resources?.getUnassignedResourceYieldBonus(
        Database.makeHash(yieldDefinition.YieldType)
      );
      if (unassignedBonus === void 0 || unassignedBonus == 0) {
        return;
      }
      unslottedBonuses.push({
        iconSrc: `url(${Icon.getYieldIcon(yieldDefinition.YieldType)})`,
        bonusAmount: unassignedBonus * numAvailableResources
      });
    });
    model.data.resourceTabData.unslottedBonuses = unslottedBonuses;
  }
  function sortSlottedResources(slottedResources) {
    slottedResources.forEach((slottedResourceSection) => {
      slottedResourceSection.cityResources.forEach((cityResourceData) => {
        cityResourceData.slottedResources.sort(sortResourceSlotData);
      });
    });
    reIndexSlottedResources(slottedResources, { force: true });
    debugPrintSlotIndices();
  }
  function getResourceTypeFromValue(resourceValue) {
    const resource = Game.Resources.getResourceOnPlot(resourceValue);
    const resourceDef = GameInfo.Resources.lookup(resource.resource);
    return resourceDef?.ResourceType ?? "RESOURCE_UNKNOWN";
  }
  function resourceNameShort(resourceType) {
    return resourceType.split("_")[1].toLowerCase();
  }
  function swapItemSlotIndices(cityIdA, resourceValueA, cityIdB, resourceValueB) {
    let keyA = "";
    let indexA = -1;
    if (cityIdA) {
      keyA = ComponentID.toString(cityIdA);
      indexA = slottedResourceIndices[keyA].record[resourceValueA];
    }
    let keyB = "";
    let indexB = -1;
    if (cityIdB) {
      keyB = ComponentID.toString(cityIdB);
      indexB = slottedResourceIndices[keyB].record[resourceValueB];
    }
    if (cityIdA) {
      delete slottedResourceIndices[keyA].record[resourceValueA];
      slottedResourceIndices[keyA].record[resourceValueB] = indexA;
      debugPrintSlotIndices(cityIdA);
    }
    if (cityIdB) {
      delete slottedResourceIndices[keyB].record[resourceValueB];
      slottedResourceIndices[keyB].record[resourceValueA] = indexB;
      debugPrintSlotIndices(cityIdB);
    }
  }
  function addItemSlotIndex(cityID, resourceValue) {
    const city = Cities.get(cityID);
    if (!city) {
      console.error(`commerce-screen-model::addItemSlotIndex: city with id ${cityID} can't be found`);
      return;
    }
    if (!city.Resources) {
      console.error(`commerce-screen-model::addItemSlotIndex: city with id ${cityID} has no Resources object.`);
      return;
    }
    const key = ComponentID.toString(cityID);
    slottedResourceIndices[key].record[resourceValue] = city.Resources.getAssignedResources().length;
    slottedResourceIndices[key].isDirty = true;
  }
  function removeItemSlotIndex(cityID, resourceValue) {
    const key = ComponentID.toString(cityID);
    delete slottedResourceIndices[key].record[resourceValue];
    const remainingIndices = Object.values(slottedResourceIndices[key].record).length;
    slottedResourceIndices[key].isDirty = true;
    return { remainingIndexCount: remainingIndices };
  }
  function reIndexSlottedResources(slottedResources, options = { force: false }) {
    slottedResources.forEach((slottedResourceSection) => {
      slottedResourceSection.cityResources.forEach((cityData) => {
        const key = ComponentID.toString(cityData.cityID);
        let updatedResources = [];
        if (slottedResourceIndices[key]) {
          if (!slottedResourceIndices[key].isDirty && !options.force) {
            return;
          }
          updatedResources = Object.keys(slottedResourceIndices[key].record);
          slottedResourceIndices[key].isDirty = false;
        } else {
          slottedResourceIndices[key] = { isDirty: false, record: {} };
        }
        cityData.slottedResources.forEach((resourceSlotData, index) => {
          const resourceIndex = updatedResources.indexOf("" + resourceSlotData.resourceValue);
          if (resourceIndex > -1) {
            updatedResources.splice(resourceIndex, 1);
          }
          slottedResourceIndices[key].record[resourceSlotData.resourceValue] = index;
        });
        updatedResources.forEach(
          (resourceValue) => delete slottedResourceIndices[key].record[parseInt(resourceValue)]
        );
        debugPrintSlotIndices(cityData.cityID);
      });
    });
  }
  function populateAvailableResources(slottedResources) {
    const allAvailableResources = [];
    const availableConnectedResources = {
      collapsibleContainerData: {
        titleText: "LOC_COMMERCE_CONNECTED_TITLE",
        titleIcon: "url(blp:trade_link_positive)"
      },
      subSections: [],
      isConnectedToTradeNetwork: true,
      emptySubsectionsDescription: hasSlottedConnectedResources ? "LOC_COMMERCE_NO_UNASSIGNED_CONNECTED_RESOURCES" : "LOC_COMMERCE_NO_UNASSIGNED_CONNECTED_RESOURCES_NO_RESOURCES"
    };
    const availableDisconnectedResources = {
      collapsibleContainerData: {
        titleText: "LOC_COMMERCE_DISCONNECTED_TITLE",
        titleIcon: "url(blp:trade_link_negative)"
      },
      subSections: [],
      isConnectedToTradeNetwork: false,
      emptySubsectionsDescription: hasSlottedDisconnectedResources ? "LOC_COMMERCE_NO_UNASSIGNED_DISCONNECTED_RESOURCES" : "LOC_COMMERCE_NO_UNASSIGNED_DISCONNECTED_RESOURCES_NO_RESOURCES"
    };
    const connectedCityResources = {
      title: "LOC_RESOURCECLASS_CITY_NAME",
      resourceSlotData: [],
      type: "RESOURCECLASS_CITY"
    };
    const connectedFactoryResources = {
      title: "LOC_RESOURCECLASS_FACTORY_NAME",
      resourceSlotData: [],
      type: "RESOURCECLASS_FACTORY"
    };
    const connectedBonusResources = {
      title: "LOC_RESOURCECLASS_BONUS_NAME",
      resourceSlotData: [],
      type: "RESOURCECLASS_BONUS"
    };
    const disconnectedCityResources = {
      title: "LOC_RESOURCECLASS_CITY_NAME",
      resourceSlotData: [],
      type: "RESOURCECLASS_CITY"
    };
    const disconnectedFactoryResources = {
      title: "LOC_RESOURCECLASS_FACTORY_NAME",
      resourceSlotData: [],
      type: "RESOURCECLASS_FACTORY"
    };
    const disconnectedBonusResources = {
      title: "LOC_RESOURCECLASS_BONUS_NAME",
      resourceSlotData: [],
      type: "RESOURCECLASS_BONUS"
    };
    localPlayerResources?.getResources().forEach((resource) => {
      if (slottedResources.find((section) => {
        return section.cityResources.find((cityResources) => {
          return cityResources.slottedResources.find((slottedResource) => {
            return slottedResource.resourceValue == resource.value;
          });
        });
      })) {
        return;
      }
      const playerResource = GameInfo.Resources.lookup(resource.uniqueResource.resource);
      if (!playerResource) {
        return;
      }
      const isFactoryResource = playerResource.ResourceClassType == "RESOURCECLASS_FACTORY";
      const isBonusResource = playerResource.ResourceClassType == "RESOURCECLASS_BONUS";
      const originCityID = Game.Resources.getOriginCity(resource.value);
      const originCity = Cities.get(originCityID);
      if (playerResource.ResourceClassType == "RESOURCECLASS_EMPIRE" || playerResource.ResourceClassType == "RESOURCECLASS_TREASURE") {
        return;
      }
      const _isBeingRazed = originCity?.isBeingRazed ?? false;
      const yieldTypes = getYieldTypes(playerResource.ResourceType);
      const resourceProps = getResourceProps(resource);
      if (!resourceProps) {
        return;
      }
      const canSwapWithSelectedResource = createMemo(() => {
        return canSwapResources(resource.value, selectedResource().resourceValue);
      });
      const resourceSlotData = {
        resourceType: playerResource.ResourceType,
        resourceProps,
        resourceValue: resource.value,
        yieldTypes,
        canSwapWithSelectedResource
      };
      if (cityIsConnectedToTradeNetwork(originCity)) {
        if (isFactoryResource) {
          connectedFactoryResources.resourceSlotData.push(resourceSlotData);
        } else if (isBonusResource) {
          connectedBonusResources.resourceSlotData.push(resourceSlotData);
        } else {
          connectedCityResources.resourceSlotData.push(resourceSlotData);
        }
      } else {
        if (isFactoryResource) {
          disconnectedFactoryResources.resourceSlotData.push(resourceSlotData);
        } else if (isBonusResource) {
          disconnectedBonusResources.resourceSlotData.push(resourceSlotData);
        } else {
          disconnectedCityResources.resourceSlotData.push(resourceSlotData);
        }
      }
    });
    availableConnectedResources.subSections.push(connectedCityResources);
    availableConnectedResources.subSections.push(connectedBonusResources);
    availableConnectedResources.subSections.push(connectedFactoryResources);
    availableDisconnectedResources.subSections.push(disconnectedCityResources);
    availableDisconnectedResources.subSections.push(disconnectedBonusResources);
    availableDisconnectedResources.subSections.push(disconnectedFactoryResources);
    allAvailableResources.push(availableConnectedResources);
    allAvailableResources.push(availableDisconnectedResources);
    return allAvailableResources;
  }
  function populateEmpireResources() {
    const empireResources = [];
    Players.get(GameContext.localPlayerID)?.Resources?.getResources().forEach((resource) => {
      const playerResource = GameInfo.Resources.lookup(resource.uniqueResource.resource);
      if (!playerResource || playerResource.ResourceClassType != "RESOURCECLASS_EMPIRE" && playerResource.ResourceClassType != "RESOURCECLASS_TREASURE") {
        return;
      }
      const resourceIndex = empireResources.findIndex((r) => {
        return r.type == playerResource.ResourceType;
      });
      const originCityID = Game.Resources.getOriginCity(resource.value);
      const originCity = Cities.get(originCityID);
      if (!originCity) {
        return;
      }
      const originPlayer = Players.get(originCity.owner);
      if (!originPlayer) {
        return;
      }
      if (resourceIndex != -1) {
        const originDataIndex = empireResources[resourceIndex].resourceOriginData.findIndex((o) => {
          return o.leaderId == originPlayer.id;
        });
        if (originDataIndex == -1) {
          empireResources[resourceIndex].resourceOriginData.push({
            leaderId: originPlayer.id,
            resourceOriginCities: {
              [originCity.id.id]: {
                contributionCount: 1,
                localisedName: Locale.compose(originCity.name)
              }
            }
          });
        } else {
          if (!empireResources[resourceIndex].originLeaderIds.includes(originCity.owner)) {
            empireResources[resourceIndex].originLeaderIds.push(originCity.owner);
          }
          const originData = empireResources[resourceIndex].resourceOriginData[originDataIndex];
          const originCityIndex = Object.keys(originData.resourceOriginCities).findIndex((c) => {
            return Number(c) == originCityID.id;
          });
          if (originCityIndex === -1) {
            originData.resourceOriginCities[originCityID.id] = {
              contributionCount: 1,
              localisedName: Locale.compose(originCity.name)
            };
          } else {
            originData.resourceOriginCities[originCityID.id].contributionCount++;
          }
        }
        empireResources[resourceIndex].amount++;
        return;
      }
      const originCiv = GameInfo.Civilizations.lookup(originPlayer.civilizationType);
      if (!originCiv) {
        return;
      }
      const resourceData = {
        iconSrc: `url(${UI.getIcon(playerResource.ResourceType, "RESOURCE")})`,
        resourceValue: resource.value,
        title: playerResource.Name,
        description: [playerResource.Tooltip],
        originLeaderIds: [originCity.owner],
        tooltips: {},
        resourceOriginData: [
          {
            leaderId: originPlayer.id,
            resourceOriginCities: {
              [originCityID.id]: {
                contributionCount: 1,
                localisedName: Locale.compose(originCity.name)
              }
            }
          }
        ],
        isTreasure: playerResource.ResourceClassType == "RESOURCECLASS_TREASURE",
        // TODO: Hook up to real data once it exists: https://2kfxs.atlassian.net/browse/IGP-125701
        // isCombatResource: playerResource.affectsCombat;
        isCombatResource: false,
        amount: 1,
        type: playerResource.ResourceType
      };
      empireResources.push(resourceData);
      return;
    });
    empireResources.sort((a, b) => a.amount < b.amount ? 1 : -1);
    empireResources.forEach((resource) => {
      resource.resourceOriginData.forEach((originPlayer) => {
        const player = Players.get(originPlayer.leaderId);
        if (!player) {
          return;
        }
        const cityContributionStrings = [];
        for (const resourceOriginCityData of Object.values(originPlayer.resourceOriginCities)) {
          cityContributionStrings.push(
            Locale.compose(
              "LOC_COMMERCE_EMPIRE_ORIGIN_CITY_CONTRIBUTION_COUNTER",
              resourceOriginCityData.contributionCount,
              resourceOriginCityData.localisedName
            )
          );
        }
        resource.tooltips[originPlayer.leaderId] = Locale.stylize(cityContributionStrings.join("[N]"));
      });
    });
    return empireResources;
  }
  function populateSlottedResources() {
    const connectedCities = {
      collapsibleContainerData: {
        titleText: Locale.compose("LOC_COMMERCE_CONNECTED_TITLE"),
        titleIcon: "url(blp:trade_link_positive)"
      },
      cityResources: [],
      emptyResourcesDescription: "LOC_COMMERCE_NO_CONNECTED_SETTLEMENTS"
    };
    const disconnectedCities = {
      collapsibleContainerData: {
        titleText: Locale.compose("LOC_COMMERCE_DISCONNECTED_TITLE"),
        titleIcon: "url(blp:trade_link_negative)"
      },
      cityResources: [],
      emptyResourcesDescription: "LOC_COMMERCE_NO_DISCONNECTED_SETTLEMENTS"
    };
    hasSlottedConnectedResources = hasSlottedDisconnectedResources = false;
    const localPlayer = Players.get(GameContext.localPlayerID);
    const localPlayerCities = localPlayer?.Cities?.getCities();
    if (localPlayerCities != void 0 && localPlayer != null) {
      const availableFactoryResources = [];
      if (Game.age == Game.getHash("AGE_MODERN")) {
        localPlayer.Resources?.getResources().forEach((resource) => {
          const playerResource = GameInfo.Resources.lookup(resource.uniqueResource.resource);
          if (playerResource?.ResourceClassType == "RESOURCECLASS_FACTORY" && !availableFactoryResources.find((factoryResource) => {
            return factoryResource.name == playerResource.Name;
          })) {
            availableFactoryResources.push({
              icon: `url(${UI.getIcon(playerResource.ResourceType)})`,
              resourceValue: resource.value,
              description: playerResource.Tooltip,
              name: playerResource.Name
            });
          }
        });
      }
      localPlayerCities.forEach((city) => {
        if (!city.Resources) {
          return;
        }
        const resourceYields = [];
        CityYields.getCityYieldDetails(city.id).forEach((cityYield) => {
          resourceYields.push({
            yieldIconSrc: `url(${UI.getIcon(cityYield.type, "YIELD")})`,
            yieldDelta: 0,
            yieldTotal: Number(parseFloat(cityYield.value).toFixed(1))
          });
        });
        const factoryResourceData = populateFactoryResourceDataForCity(
          city.id,
          city.Resources
        );
        const availableSlots = [];
        for (let i = 0; i < city.Resources.getAssignedResourcesCap() - city.Resources.getAssignedResources().length; i++) {
          availableSlots.push(i);
        }
        const localPlayer2 = Players.get(GameContext.localPlayerID);
        if (!localPlayer2) {
          return;
        }
        const [canAssignResource, setCanAssignResource] = createSignal(false);
        createEffect(() => {
          if (model.selectedResource().resourceValue === -1) {
            setCanAssignResource(false);
            return;
          }
          const cityID = cityResourceData.cityID;
          const city2 = Cities.get(cityID);
          if (!city2) {
            return;
          }
          const location = GameplayMap.getLocationFromIndex(model.selectedResource().resourceValue);
          const args = {
            Location: location,
            City: city2.id.id
          };
          setCanAssignResource(canStartPlayerOperation(PlayerOperationTypes.ASSIGN_RESOURCE, args));
        });
        const slottedResources = populateCityResourceData(city);
        let settlementIcon = "";
        let settlementTypeName = "";
        if (city.isCapital) {
          settlementIcon = "url(blp:res_capital)";
          settlementTypeName = Locale.compose("LOC_CAPITAL_SELECT_PROMOTION_CAPITAL");
        } else if (city.isTown) {
          settlementIcon = "url(blp:Yield_Towns)";
          settlementTypeName = Locale.compose("LOC_CAPITAL_SELECT_PROMOTION_NONE");
        } else {
          settlementIcon = "url(blp:Yield_Cities)";
          settlementTypeName = Locale.compose("LOC_CAPITAL_SELECT_PROMOTION_CITY");
        }
        const cityGrowthType = city.Growth?.growthType || GrowthTypes.EXPAND;
        let cityGrowthIcon = "";
        if (cityGrowthType === GrowthTypes.EXPAND) {
          cityGrowthIcon = UI.getIconBLP("PROJECT_GROWTH");
        }
        const cityProjectType = city.Growth?.projectType || ProjectTypes.NO_PROJECT;
        let cityProjectTypeName = "LOC_UI_FOOD_CHOOSER_FOCUS_GROWTH";
        if (cityProjectType !== ProjectTypes.NO_PROJECT) {
          const projectTypeDefinition = GameInfo.Projects.lookup(cityProjectType);
          if (projectTypeDefinition) {
            cityProjectTypeName = `LOC_${projectTypeDefinition.ProjectType}_NAME`;
            if (cityProjectTypeName) {
              cityGrowthIcon = UI.getIconBLP(projectTypeDefinition.ProjectType);
            }
          }
        }
        let hasRailStation = false;
        if (city.Constructibles?.hasConstructible("BUILDING_RAIL_STATION", false)) {
          hasRailStation = true;
        }
        const tradeConnectionCount = city.Trade?.numRoutes || 0;
        let warehouseCount = 0;
        let waterBuildingCount = 0;
        city.Constructibles?.getIds().forEach((constructibleId) => {
          const constructible = Constructibles.getByComponentID(constructibleId);
          if (!constructible) {
            return;
          }
          const constructibleDefinition = GameInfo.Constructibles.lookup(
            constructible.type
          );
          if (!constructibleDefinition) {
            return;
          }
          if (ConstructibleHasTagType(constructibleDefinition.ConstructibleType, "WATER")) {
            waterBuildingCount++;
          }
          if (ConstructibleHasTagType(constructibleDefinition.ConstructibleType, "WAREHOUSE")) {
            warehouseCount++;
          }
        });
        const cityResourceData = {
          settlementNameData: {
            settlementIcon,
            settlementName: Locale.compose(city.name),
            settlementTypeName,
            settlementDistanceTypeName: city.isDistantLands ? Locale.compose("LOC_PLOT_TOOLTIP_HEMISPHERE_WEST") : Locale.compose("LOC_PLOT_TOOLTIP_HEMISPHERE_EAST"),
            isTown: city.isTown,
            townFocusName: Locale.compose(cityProjectTypeName),
            townFocusIcon: `url(blp:${cityGrowthIcon})`,
            hasRail: hasRailStation,
            tradeConnectionCount,
            warehouseCount,
            waterCount: waterBuildingCount
          },
          cityID: city.id,
          isDistantLands: city.isDistantLands,
          baseYields: resourceYields,
          yieldDeltas: resourceYields,
          factoryResourceData,
          availableSlots,
          canAssignSelectedResourceToSettlement: canAssignResource,
          slottedResources
        };
        if (city.Trade?.isInTradeNetwork()) {
          connectedCities.cityResources.push(cityResourceData);
        } else {
          disconnectedCities.cityResources.push(cityResourceData);
        }
      });
    }
    connectedCities.cityResources.sort((a, b) => {
      return compareSettlementTypes(a.cityID, b.cityID);
    });
    disconnectedCities.cityResources.sort((a, b) => {
      return compareSettlementTypes(a.cityID, b.cityID);
    });
    return [connectedCities, disconnectedCities];
  }
  function populateFactoryResourceDataForCity(cityId, cityResources) {
    const factoryResourceType = cityResources.getFactoryResource();
    const factoryResourceDefinition = GameInfo.Resources.lookup(factoryResourceType);
    const resource = factoryResourceDefinition ? getResourcePropsFromDefinition(factoryResourceDefinition) : null;
    let unassignTooltipText;
    const city = Cities.get(cityId);
    if (resource && city) {
      unassignTooltipText = Locale.compose(
        "LOC_COMMERCE_UNASSIGN_FACTORY_RESOURCES",
        Locale.compose(resource?.resourceName),
        Locale.compose(city.name)
      );
    }
    const factoryResourceData = {
      cityID: cityId,
      hasFactory: cityResources.isTreasureConstructiblePrereqMet() && Game.age == Game.getHash("AGE_MODERN") && (cityResources.getNumFactoryResources() == 0 || factoryResourceDefinition != null),
      isProducingFactoryResource: cityResources.getNumFactoryResources() > 0,
      resource,
      unassignResourceTooltip: unassignTooltipText
    };
    return factoryResourceData;
  }
  function populateTreasureFleetData() {
    const generatingFleets = [];
    const notGeneratingFleets = [];
    const player = Players.get(GameContext.localPlayerID);
    if (!player) {
      console.error("createCommerceScreenModel::populateTreasureFleetData: No player found");
      return { sections: [] };
    }
    player.Cities?.getCities().forEach((city) => {
      if (!city.Resources) {
        return;
      }
      const treasureResources = [];
      const statuses = [];
      let isDistantLand = true;
      let numImproved = 0;
      city.getPurchasedPlots().forEach((plotIndex) => {
        const plot = GameplayMap.getLocationFromIndex(plotIndex);
        const resource = GameplayMap.getResourceType(plot.x, plot.y);
        const resourceDef = GameInfo.Resources.lookup(resource);
        if (!resourceDef || resourceDef.ResourceClassType != "RESOURCECLASS_TREASURE") {
          return;
        }
        isDistantLand = isDistantLand && player.isDistantLands({
          x: plot.x,
          y: plot.y
        });
        const plotConstructibles = MapConstructibles.getHiddenFilteredConstructibles(plot.x, plot.y);
        let hasDamagedConstructible = false;
        plotConstructibles.forEach((constructible) => {
          const instance = Constructibles.getByComponentID(constructible);
          if (instance?.damaged) {
            hasDamagedConstructible = true;
            return;
          }
        });
        let tooltip = "";
        let improved = false;
        if (MapCities.getDistrict(plot.x, plot.y) != null) {
          improved = !hasDamagedConstructible;
          if (hasDamagedConstructible) {
            tooltip = Locale.compose("LOC_COMMERCE_TREASURE_PLOT_DAMAGED");
          } else if (!isDistantLand) {
            tooltip = Locale.compose("LOC_COMMERCE_TREASURE_FLEET_DISTANT_LAND_STATUS_TOOLTIP");
            return;  // TRIX: no point including these, they can't be fixed
          }
        } else {
          tooltip = Locale.compose("LOC_COMMERCE_TREASURE_PLOT_NEEDS_IMPROVEMENT");
        }
        if (improved) {
          numImproved++;
        }
        const resourceProps = getResourcePropsFromDefinition(resourceDef, city.id);
        treasureResources.push({
          resourceProps,
          tooltip,
          isImproved: improved,
          location: { x: plot.x, y: plot.y },
          isDamaged: hasDamagedConstructible
        });
      });
      statuses.push({
        statusText: Locale.compose("LOC_COMMERCE_TREASURE_FLEET_DISTANT_LAND_STATUS"),
        isNegative: !isDistantLand,
        tooltipKey: "LOC_COMMERCE_TREASURE_FLEET_DISTANT_LAND_STATUS_TOOLTIP",
        appliesToCurrentCiv: true
      });
      statuses.push({
        statusText: Locale.compose("LOC_COMMERCE_TREASURE_FLEET_NO_IMPROVED_STATUS"),
        isNegative: numImproved === 0,
        tooltipKey: "LOC_COMMERCE_TREASURE_FLEET_NO_IMPROVED_STATUS_TOOLTIP",
        appliesToCurrentCiv: true
      });
      if (treasureResources.length === 0 && city.Resources.getAutoTreasureFleetValue() === 0) {
        return;
      }
      let settlementIcon = "";
      if (city.isCapital) {
        settlementIcon = "url(blp:res_capital)";
      } else if (city.isTown) {
        settlementIcon = "url(blp:Yield_Towns)";
      } else {
        settlementIcon = "url(blp:Yield_Cities)";
      }
      const goldName = Locale.compose("LOC_YIELD_GOLD_NAME");
      const treasureFleetText = L10n.Stylize({
        text: Locale.stylize(
          "LOC_COMMERCE_TREASURE_FLEET_SUMMARY",
          city.Resources.getProducedTreasureFleetGold(),
          goldName,
          city.Resources.getProducedTreasureFleetGDP()
        )
      });
      const resourceValue = city.Resources.getProducedTreasureFleetPoints() + city.Resources.getAutoTreasureFleetValue();
      const progressGoal = Game.Diplomacy.modifyByGameSpeed(
        city.Resources.getGlobalTurnsUntilTreasureGenerated()
      );
      const turnsRemaining = city.Resources.getTurnsUntilTreasureGenerated();
      const progress = progressGoal - turnsRemaining;
      const treasureFleet = {
        cityIcon: settlementIcon,
        cityName: city.name,
        resources: treasureResources,
        progress,
        progressGoal,
        resourceValue,
        numImproved,
        treasureFleetText,
        cityID: city.id,
        statuses,
        isDistantLand
      };
      if (resourceValue > 0) {
        generatingFleets.push(treasureFleet);
      } else {
        notGeneratingFleets.push(treasureFleet);
      }
    });
    const generatingSection = {
      fleets: generatingFleets,
      collapsibleContainerData: {
        titleText: Locale.compose("LOC_COMMERCE_GENERATING_TREASURE_CONVOY"),
        centerTitle: true
      },
      emptyTitle: Locale.compose("LOC_COMMERCE_NO_TREASURE_FLEETS_ESTABLISHED"),
      emptyDescription: Locale.compose("LOC_COMMERCE_NO_TREASURE_FLEETS_ESTABLISHED_DESCRIPTION"),
      generatingConvoys: true
    };
    const notGeneratingSection = {
      fleets: notGeneratingFleets,
      collapsibleContainerData: {
        titleText: Locale.compose("LOC_COMMERCE_NOT_GENERATING_TITLE"),
        centerTitle: true
      },
      generatingConvoys: false
    };
    const treasureTabData = {
      sections: [generatingSection, notGeneratingSection]
    };
    return treasureTabData;
  }
  const resourceClassSortingScores = {
    LOC_RESOURCECLASS_CITY_NAME: 1,
    LOC_RESOURCECLASS_BONUS_NAME: 2,
    LOC_RESOURCECLASS_EMPIRE_NAME: 3,
    LOC_RESOURCECLASS_TREASURE_NAME: 4,
    LOC_RESOURCECLASS_FACTORY_NAME: 5
  };
  function getTradeRouteDataFromTradeRoute(route, localPlayerTrade, options = { swapParticipants: false }) {
    const targetCity = Cities.get(options.swapParticipants ? route.nearestCityId : route.targetCityId);
    const recipientCity = Cities.get(options.swapParticipants ? route.targetCityId : route.nearestCityId);
    if (!targetCity || !recipientCity) {
      return null;
    }
    const targetPlayer = Players.get(targetCity.owner);
    if (!targetPlayer) {
      return null;
    }
    const targetPlayerDiplomacy = targetPlayer.Diplomacy;
    if (!targetPlayerDiplomacy) {
      return null;
    }
    const domainKey = route.domain === DomainType.DOMAIN_LAND ? "LAND" : "SEA";
    const domainText = Locale.compose(`LOC_COMMERCE_TRADE_DOMAIN_${domainKey}`);
    const domainDeliveryText = Locale.compose("LOC_COMMERCE_TRADE_DELIVERED_TO", recipientCity.name, domainText);
    const resources = [];
    route.importPayloads.forEach((resource) => {
      const resourceProps = getResourceProps(resource, targetCity.id);
      if (!resourceProps) {
        return;
      }
      resources.push(resourceProps);
    });
    resources.sort((a, b) => {
      if (a.resourceType !== b.resourceType) {
        return resourceClassSortingScores[a.resourceType] - resourceClassSortingScores[b.resourceType];
      }
      if (a.resourceName !== b.resourceName) {
        return Locale.compose(a.resourceName) < Locale.compose(b.resourceName) ? -1 : 1;
      }
      return 0;
    });
    let cityIcon = "";
    if (targetCity.isCapital) {
      cityIcon = "url(blp:res_capital)";
    } else if (targetCity.isTown) {
      cityIcon = "url(blp:Yield_Towns)";
    } else {
      cityIcon = "url(blp:Yield_Cities)";
    }
    const cityName = Locale.compose(targetCity.name);
    let yieldsString = "";
    route.exportYields.forEach((yieldAmount, index) => {
      const yieldDefinition = GameInfo.Yields.lookup(yieldAmount.yieldType);
      if (yieldDefinition) {
        yieldsString += Locale.compose(
          "LOC_BUILDING_PLACEMENT_YIELD_WITH_ICON",
          yieldAmount.amount,
          yieldDefinition.IconString,
          yieldDefinition.Name
        );
        if (index < route.exportYields.length - 1) {
          yieldsString += ",";
        }
      }
    });
    const yieldElement = L10n.Stylize({
      text: Locale.stylize(
        "LOC_TRADE_LENS_YIELD_EXPORT",
        yieldsString,
        targetPlayer.isMinor ? cityName : targetPlayer.name
      )
    });
    const resourceNames = [];
    const resourceTypes = [];
    resources.forEach((resource) => {
      const name = Locale.compose(resource.resourceName);
      const type = Locale.compose(resource.resourceType);
      if (resourceNames.includes(name) === false) {
        resourceNames.push(name);
      }
      if (resourceTypes.includes(type) === false) {
        resourceTypes.push(type);
      }
    });
    const resourceText = [resourceNames.join(" "), resourceTypes.join(" ")].join(" ");
    const tradeRouteData = {
      availability: 0 /* Unset */,
      cityName,
      cityIcon,
      isCityState: targetPlayer.isMinor,
      domainString: domainDeliveryText,
      incomingResources: resources,
      relationshipChange: localPlayerTrade.getPotentialRelationshipGainFromTradeRouteWith(targetCity.owner),
      yieldElement,
      cityID: targetCity.id,
      leaderId: targetPlayer.id,
      statuses: [],
      fullText: Locale.toLower(
        [
          cityName,
          Locale.compose(recipientCity.name),
          resourceText,
          domainText,
          Locale.compose(targetPlayer.leaderName)
        ].join(" ")
      )
    };
    const tradeRoutesToTarget = localPlayerTrade.countPlayerTradeRoutesTo(targetCity.owner);
    const tradeRouteCapacityForTarget = localPlayerTrade.getTradeCapacityFromPlayer(targetCity.owner);
    const tradeRouteCapacityReached = tradeRoutesToTarget >= tradeRouteCapacityForTarget;
    const statusIncludesCapacityReached = route.status?.includes(TradeRouteStatus.NEED_MORE_FRIENDSHIP) ?? false;
    const capacityCriteriaAppliesToCurrentCiv = !tradeRouteCapacityReached || statusIncludesCapacityReached;
    tradeRouteData.statuses.push({
      statusText: Locale.compose(
        "LOC_COMMERCE_TRADE_STATUS_CAPACITY",
        tradeRoutesToTarget,
        tradeRouteCapacityForTarget
      ),
      isNegative: statusIncludesCapacityReached,
      tooltipKey: capacityCriteriaAppliesToCurrentCiv ? "LOC_COMMERCE_TRADE_STATUS_CAPACITY_TOOLTIP" : "LOC_COMMERCE_TRADE_STATUS_CAPACITY_INAPPLICABLE_TOOLTIP",
      appliesToCurrentCiv: capacityCriteriaAppliesToCurrentCiv
    });
    tradeRouteData.statuses.push({
      statusText: Locale.compose("LOC_COMMERCE_TRADE_STATUS_IN_RANGE"),
      isNegative: route.status?.includes(TradeRouteStatus.DISTANCE) ?? false,
      tooltipKey: "LOC_COMMERCE_TRADE_STATUS_IN_RANGE_TOOLTIP",
      // TODO: We don't have a way from here to know if the distance criteria is met, unlike capacity and war
      appliesToCurrentCiv: true
    });
    const atWar = targetPlayerDiplomacy.isAtWarWith(GameContext.localPlayerID);
    const statusIncludesAtWar = route.status?.includes(TradeRouteStatus.AT_WAR) ?? false;
    const atPeaceCriteriaAppliesToCurrentCiv = !atWar || statusIncludesAtWar;
    tradeRouteData.statuses.push({
      statusText: Locale.compose("LOC_COMMERCE_TRADE_STATUS_AT_PEACE"),
      isNegative: statusIncludesAtWar,
      tooltipKey: atPeaceCriteriaAppliesToCurrentCiv ? "LOC_COMMERCE_TRADE_STATUS_AT_PEACE_TOOLTIP" : "LOC_COMMERCE_TRADE_STATUS_AT_PEACE_INAPPLICABLE_TOOLTIP",
      appliesToCurrentCiv: atPeaceCriteriaAppliesToCurrentCiv
    });
    return tradeRouteData;
  }
  const tradeRouteSearch = new FullTextSearch("TradeRouteFilter");
  const tradeRouteFuzzySearch = (text) => tradeRouteSearch.find(text);
  function populateTradeRoutes() {
    const tradeRouteTabData = {
      tradeRouteSections: []
    };
    const activeTradeRouteSection = {
      tradeRoutes: [],
      collapsibleContainerData: {
        titleText: Locale.compose("LOC_COMMERCE_ACTIVE_TRADE_ROUTES_TITLE"),
        centerTitle: true
      },
      emptyDescription: Locale.compose("LOC_COMMERCE_ACTIVE_TRADE_ROUTES_EMPTY_DESCRIPTION")
    };
    const availableTradeRouteSection = {
      tradeRoutes: [],
      collapsibleContainerData: {
        titleText: Locale.compose("LOC_COMMERCE_AVAILABLE_TRADE_ROUTES_TITLE"),
        centerTitle: true
      },
      emptyDescription: "LOC_COMMERCE_AVAILABLE_TRADE_ROUTES_EMPTY_DESCRIPTION"
    };
    const unavailableTradeRouteSection = {
      tradeRoutes: [],
      collapsibleContainerData: {
        titleText: Locale.compose("LOC_COMMERCE_UNAVAILABLE_TRADE_ROUTES_TITLE"),
        centerTitle: true,
        initiallyCollapsed: true
      },
      emptyDescription: "LOC_COMMERCE_UNAVAILABLE_TRADE_ROUTES_EMPTY_DESCRIPTION"
    };
    const localPlayerTrade = Players.get(GameContext.localPlayerID)?.Trade;
    if (!localPlayerTrade) {
      console.error("commerce-screen-model: Unable to get trade object for local player");
      return tradeRouteTabData;
    }
    const eOptions = TradeRouteSearchOptions.INCLUDE_FAILED + TradeRouteSearchOptions.EXTENDED_STATUS;
    localPlayerTrade.projectPossibleTradeRoutes(eOptions)?.forEach((route) => {
      if (route.status?.includes(TradeRouteStatus.NO_RESOURCES)) {
        return;
      }
      const alreadyExists = route.status?.includes(TradeRouteStatus.ALREADY_EXISTS) ?? false;
      const tradeRouteData = getTradeRouteDataFromTradeRoute(route, localPlayerTrade);
      if (!tradeRouteData) {
        return;
      }
      if (alreadyExists) {
        tradeRouteData.availability = 1 /* Established */;
        activeTradeRouteSection.tradeRoutes.push(tradeRouteData);
      } else if (route.status?.includes(TradeRouteStatus.SUCCESS)) {
        tradeRouteData.availability = 2 /* Available */;
        availableTradeRouteSection.tradeRoutes.push(tradeRouteData);
      } else {
        tradeRouteData.availability = 3 /* Unavailable */;
        unavailableTradeRouteSection.tradeRoutes.push(tradeRouteData);
      }
    });
    function appendTradeRouteSearchData(tradeRouteSection) {
      const searchData = [];
      tradeRouteSection.tradeRoutes.forEach((route) => {
        searchData.push({
          key: ComponentID.toString(route.cityID),
          title: route.cityName,
          fullText: route.fullText
        });
      });
      tradeRouteSearch.addSearchData(searchData);
    }
    appendTradeRouteSearchData(activeTradeRouteSection);
    appendTradeRouteSearchData(availableTradeRouteSection);
    appendTradeRouteSearchData(unavailableTradeRouteSection);
    tradeRouteTabData.tradeRouteSections = [
      activeTradeRouteSection,
      availableTradeRouteSection,
      unavailableTradeRouteSection
    ];
    return tradeRouteTabData;
  }
  function populateData() {
    const treasureTabData = populateTreasureFleetData();
    const tradeRouteTabData = populateTradeRoutes();
    const slottedResources = populateSlottedResources();
    sortSlottedResources(slottedResources);
    const availableResources = populateAvailableResources(slottedResources);
    sortAvailableResources(availableResources);
    let numAvailableResources = 0;
    availableResources.forEach((section) => {
      section.subSections.forEach((subSection) => {
        numAvailableResources += subSection.resourceSlotData.length;
      });
    });
    const unslottedBonuses = [];
    GameInfo.Yields.forEach((yieldDefinition) => {
      const unassignedBonus = Players.get(GameContext.localPlayerID)?.Resources?.getUnassignedResourceYieldBonus(
        Database.makeHash(yieldDefinition.YieldType)
      );
      if (unassignedBonus === void 0 || unassignedBonus == 0) {
        return;
      }
      unslottedBonuses.push({
        iconSrc: `url(${Icon.getYieldIcon(yieldDefinition.YieldType)})`,
        bonusAmount: unassignedBonus * numAvailableResources
      });
    });
    const resourceTabData = {
      availableResourceSectionData: availableResources,
      slottedResourceSectionData: slottedResources,
      unslottedBonuses
    };
    const ornatePanelData = {
      topIconSrc: "",
      topIconTint: "",
      topIconBackgroundTint: "",
      backgroundImageSrc: "",
      name: "Commerce-Screen",
      id: "commerce-screen"
    };
    const localPlayer = Players.get(GameContext.localPlayerID);
    if (localPlayer != null) {
      const civDefinition = GameInfo.Civilizations.lookup(localPlayer.civilizationType);
      if (civDefinition) {
        ornatePanelData.topIconSrc = Icon.getCivSymbolCSSFromCivilizationType(civDefinition.CivilizationType);
        const civInfo = GameInfo.LoadingInfo_Civilizations.lookup(civDefinition?.CivilizationType);
        const civImagePath = window.innerWidth >= 1080 ? civInfo?.BackgroundImageHigh : civInfo?.BackgroundImageLow;
        const civImage = civImagePath ? `url(${civImagePath})` : "";
        ornatePanelData.backgroundImageSrc = civImage;
      }
      const playerColor = UI.Color.getPlayerColors(GameContext.localPlayerID);
      if (playerColor) {
        const variants = UI.Color.createPlayerColorVariants(playerColor);
        ornatePanelData.topIconBackgroundTint = variants.primaryColor.tintColor;
        ornatePanelData.topIconTint = variants.secondaryColor.mainColor;
      }
    }
    const commerceScreenData = {
      resourceTabData,
      empireTabData: { empireResourceData: populateEmpireResources() },
      tradeRouteTabData,
      treasureTabData,
      ornatePanelData
    };
    return commerceScreenData;
  }
  function selectedSettlementSortIndex() {  // TRIX
    const type = selectedSettlementSortType();
    const items = Object.entries(resourceSettlementSortItems);
    const index = items.findIndex(([_, value]) => value == type);
    return index < 0 ? 0 : index;
  }
  function onNextSettlementSortType() {  // TRIX
    const index = selectedSettlementSortIndex();
    const items = Object.values(resourceSettlementSortItems);
    const next = (index + 1) % items.length;
    setSelectedSettlementSortType(items.at(next));
    const audioTrigger = useAudio();
    audioTrigger("Dropdown", "dropdown-close");
  }
  function onPrevSettlementSortType() {  // TRIX
    const index = selectedSettlementSortIndex();
    const items = Object.values(resourceSettlementSortItems);
    const next = index - 1;
    setSelectedSettlementSortType(items.at(next));
    const audioTrigger = useAudio();
    audioTrigger("Dropdown", "dropdown-open");
  }
  function toggleSelectedSortDirection(direction) {  // TRIX
    const type = selectedSettlementSortType();
    if (!direction) direction = persistSettlementSortDirection[type] * -1;
    setSelectedSortDirection(persistSettlementSortDirection[type] = direction);
    const audioTrigger = useAudio("CommerceScreen/ResourceSlotting");
    audioTrigger("dropSwap");
  }
  function clearFactoryResources(CityID) {
    const city = Cities.get(CityID);
    if (!city) {
      return false;
    }
    const args = {
      ResourceType: city.Resources?.getFactoryResource(),
      City: CityID.id,
      Action: PlayerOperationParameters.Clear
    };
    return tryRequestPlayerOperation(PlayerOperationTypes.ASSIGN_RESOURCE, args);
  }
  function hasUnassignedResources() {
    return model.data.resourceTabData.availableResourceSectionData.some(
      (availableSection) => availableSection.subSections.some((subsection) => subsection.resourceSlotData.length > 0)
    );
  }
  const model = createMutable({
    data: populateData(),
    isResourceSelected: false,
    isSlottingAvailable: canSlot,
    clickAvailableResource: handleClickAvailableResource,
    slotSelectedResource: handleSlotSelectedResource,
    clickSlottedResource: handleClickSlottedResource,
    unslotSelectedResource: handleUnslotSelectedResource,
    deselectSelectedResource: handleDeselectSelectedResource,
    selectedResource,
    prevSelectedResource,
    getSelectedResourceProps,
    focusedResource,
    setFocusedResource,
    selectedSettlementId,
    prevSelectedSettlementId,
    setSelectedSettlementId: handleSetSelectedSettlementId,
    focusedSettlementId,
    setFocusedSettlementId,
    ghostResourceFocused,
    setGhostResourceFocused,
    clickCloseButton: handleClickClose,
    clickUnimprovedTreasure: handleClickUnimprovedTreasure,
    clickTreasureFleet: handleClickTreasureFleet,
    clickCityName: handleClickCityName,
    selectedTradeRouteId,
    setSelectedTradeRouteId,
    selectedEmpireResource,
    setSelectedEmpireResource,
    selectedTreasureConvoyId,
    setSelectedTreasureConvoyId,
    isFirstAssignableCity,
    selectedResourceFilter,
    setSelectedResourceFilter,
    resourceSettlementSortItems,
    selectedSettlementSortType,
    setSelectedSettlementSortType,
    selectedSettlementSortIndex,  // TRIX
    onNextSettlementSortType,  // TRIX
    onPrevSettlementSortType,  // TRIX
    selectedSortDirection,  // TRIX
    setSelectedSortDirection,  // TRIX
    toggleSelectedSortDirection,  // TRIX
    selectedTradeRouteSorting: selectedTradeRouteFilter,
    setSelectedTradeRouteSorting: setSelectedTradeRouteFilter,
    clearFactoryResources,
    canSelectResource,
    canDropResourceOnTarget,
    canAssignSelectedResourceToSettlement,
    getResourceContainerSelectionState,
    resourceIsConnectedToTradeNetwork,
    cityIsConnectedToTradeNetwork: (cityId) => cityIsConnectedToTradeNetwork(Cities.get(cityId)),
    clearAllResources,
    getGamepadTrayItems,
    wasResourceJustSlotted: wasSlottedLast,
    lastSlottedResourceValues,
    setLastSlottedResourceValues,
    resourceSwapTarget,
    setResourceSwapTarget,
    isInSortAndFilterMode,
    setIsInSortAndFilterMode,
    settlementHasSlottedResources,
    onTabChanged: handleChangeTabs,
    hasUnassignedResources,
    tradeRouteSearch: tradeRouteFuzzySearch
  });
  return model;
}
function getCityName(cityID, context = "settlement") {
  if (!cityID) {
    return context === "settlement" ? "None" : "Unassigned";
  }
  const city = Cities.get(cityID);
  if (city) {
    return Locale.compose(city.name);
  } else return "Unknown Settlement";
}
function getResourceName(resource) {
  if (!resource || resource.resourceValue === -1) {
    return resource ? "None" : "Undefined";
  }
  const name = getCityName(resource.cityID, "resource") + ": ";
  const resourceData = Game.Resources.getResourceOnPlot(resource.resourceValue);
  const resourceDef = GameInfo.Resources.lookup(resourceData.resource);
  if (resourceDef) {
    return name + Locale.compose(resourceDef.Name) + `(${resource.resourceValue})`;
  } else {
    return name + "Unknown Resource";
  }
}
const CommerceScreenModel = ModelRegistry.register(
  "CommerceScreenModel",
  ModelLifecycle.SharedInstance,
  createCommerceScreenModel
);
const CommerceScreenContext = createContext();
function useCommerceScreenContext() {
  const context = useContext(CommerceScreenContext);
  if (!context) {
    throw new Error("Unable to get Commerce screen context!");
  }
  return context;
}

export { CommerceScreenContext, CommerceScreenModel, ResourceContainerSelectionState, TradeRouteAvailabiltyType, TradeRouteSortType, createCommerceScreenModel, gamepadLog, getCityName, getResourceName, useCommerceScreenContext };
//# sourceMappingURL=commerce-screen-model.js.map
// vim: sw=2 et

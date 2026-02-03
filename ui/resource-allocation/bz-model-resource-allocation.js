import bzReSortsOptions from '/bz-re-sorts/ui/options/bz-re-sorts-options.js';
import { R as ResourceAllocation } from '/base-standard/ui/resource-allocation/model-resource-allocation.chunk.js';
import { C as ConstructibleHasTagType } from '/base-standard/ui/utilities/utilities-tags.chunk.js';

// name sorting
const localeOrder = (a, b) => {
    // TODO: ideally this would use case-insensitive comparison instead,
    //       but the game doesn't seem to support Intl.Collator options.
    // const locale = Locale.getCurrentDisplayLocale();
    // nameA.localeCompare(nameB, locale, { sensitivity: "base" });
    const nameA = Locale.compose(a.name).toUpperCase();
    const nameB = Locale.compose(b.name).toUpperCase();
    return nameA.localeCompare(nameB);
};

// resource sorting
var RClassOrder;
(function (RClassOrder) {
    RClassOrder[RClassOrder["RESOURCECLASS_EMPIRE"] = 0] = "RESOURCECLASS_EMPIRE";
    RClassOrder[RClassOrder["RESOURCECLASS_CITY"] = 1] = "RESOURCECLASS_CITY";
    RClassOrder[RClassOrder["RESOURCECLASS_BONUS"] = 2] = "RESOURCECLASS_BONUS";
    RClassOrder[RClassOrder["RESOURCECLASS_TREASURE"] = 3] = "RESOURCECLASS_TREASURE";
    RClassOrder[RClassOrder["RESOURCECLASS_FACTORY"] = 4] = "RESOURCECLASS_FACTORY";
})(RClassOrder || (RClassOrder = {}));
const resourceClassOrder = (a, b) => {
    const groupA = RClassOrder[a.classType] ?? -1;
    const groupB = RClassOrder[b.classType] ?? -1;
    return groupA - groupB;
};
const resourceOrder = (a, b) => resourceClassOrder(a, b) || localeOrder(a, b);

// settlement sorting
var STypeOrder;
(function (STypeOrder) {
    STypeOrder[STypeOrder["Capital"] = 0] = "Capital";
    STypeOrder[STypeOrder["City"] = 1] = "City";
    STypeOrder[STypeOrder["Town"] = 2] = "Town";
})(STypeOrder || (STypeOrder = {}));
const settlementTypeOrder = (a, b) => {
    if (!bzReSortsOptions.groupByType) return 0;
    // group by capital, city, town
    const groupA = STypeOrder[a.settlementType] ?? -1;
    const groupB = STypeOrder[b.settlementType] ?? -1;
    return groupA - groupB;
};
const slotsOrder = (a, b) => a.bzFactory - b.bzFactory ||
    a.resourceCap - b.resourceCap || a.bzSlotBonus - b.bzSlotBonus;
const warehouseOrder = (a, b) => a.bzWarehouses.length - b.bzWarehouses.length;
const yieldOrder = (a, b) => {
    const type = ResourceAllocation.bzSortOrder;
    return (a.bzYields.get(type) ?? 0) - (b.bzYields.get(type) ?? 0);
}
const sortSettlements = () => {
    const list = ResourceAllocation.availableCities;
    const order = ResourceAllocation.bzSortOrder;
    const direction = ResourceAllocation.bzSortReverse ? -1 : +1;
    const f =
        order == "NAME" ? localeOrder :
        order == "YIELD_WAREHOUSE" ? warehouseOrder :
        order == "SLOTS" ? slotsOrder :
        yieldOrder;
    const settlementOrder = (a, b) =>
        settlementTypeOrder(a, b) || direction * f(a, b) || localeOrder(a, b);
    list.sort(settlementOrder);
};
const updateSettlements = (list) => {
    const age = GameInfo.Ages.lookup(Game.age);
    for (const item of list) {
        item.currentResources.sort(resourceOrder);
        item.visibleResources.sort(resourceOrder);
        item.treasureResources.sort(resourceOrder);
        const city = Cities.get(item.id);
        // get town focus info
        if (city.isTown) {
            const ptype = city.Growth?.projectType ?? null;
            const focus = ptype && GameInfo.Projects.lookup(ptype);
            if (focus) item.settlementTypeName = focus.Name;
            if (city.Growth?.growthType == GrowthTypes.EXPAND) {
                item.settlementIcon = "focus_growth";
            } else if (focus) {
                item.settlementIcon = UI.getIcon(focus.ProjectType);
            }
        }
        // get numeric yields
        item.bzYields = new Map();
        for (const y of GameInfo.Yields) {
            const type = y.YieldType;
            item.bzYields.set(type, city.Yields?.getYield(type) ?? 0);
        }
        // count warehouses
        item.bzWarehouses = city.Constructibles.getIds()
            .map(id => Constructibles.getByComponentID(id))
            .map(item => GameInfo.Constructibles.lookup(item.type)?.ConstructibleType)
            .filter(type => ConstructibleHasTagType(type, "WAREHOUSE"));
        // calculate slot tiebreakers
        const stype = [Locale.compose(item.settlementTypeName)];
        const hasBuilding = (b) => city.Constructibles?.hasConstructible(b, false);
        item.bzFactory = 0;
        item.bzSlotBonus = 0;
        switch (age.ChronologyIndex) {
            case 0:  // antiquity
                if (!city.isCapital) {
                    if (!city.isTown) item.bzSlotBonus += 1;
                }
                break;
            case 1:  // exploration
                if (city.isDistantLands) {
                    item.bzSlotBonus += 1;
                    stype.push(Locale.compose("LOC_PLOT_TOOLTIP_HEMISPHERE_WEST"));
                } else {
                    stype.push(Locale.compose("LOC_PLOT_TOOLTIP_HEMISPHERE_EAST"));
                }
                break;
            case 2:  // modern
                if (city.isCapital) {
                    item.bzSlotBonus += 1;
                }
                if (hasBuilding("BUILDING_PORT")) {
                    item.bzSlotBonus += 1;
                    stype.push(Locale.compose("LOC_BUILDING_PORT_NAME"));
                }
                if (hasBuilding("BUILDING_RAIL_STATION")) {
                    item.bzSlotBonus += 1;
                    stype.push(Locale.compose("LOC_BUILDING_RAIL_STATION_NAME"));
                }
                if (item.hasFactory) {
                    item.bzFactory = 1;
                    stype.push(Locale.compose("LOC_BUILDING_FACTORY_NAME"));
                }
                break;
        }
        if (city.isTown) item.bzSlotBonus -= 0.5;
        item.settlementTypeName = stype.join(" • ");
    }
    sortSettlements();
}

ResourceAllocation.bzSortOrder = "SLOTS";
ResourceAllocation.bzSortReverse = true;
ResourceAllocation.bzUnassignAll = new Map();
ResourceAllocation.bzUnassignQueue = new Map();
// patch ResourceAllocation.update
const RA_update = ResourceAllocation.update;
ResourceAllocation.update = function(...args) {
    RA_update.apply(this, args);
    updateSettlements(this._availableCities);
    this._empireResources.sort(resourceOrder);
    this._treasureResources.sort(resourceOrder);
    this._uniqueEmpireResources.sort(resourceOrder);
    this._uniqueTreasureResources.sort(resourceOrder);
    this._allAvailableResources.sort(resourceOrder);
    this._availableBonusResources.sort(resourceOrder);
    this._availableResources.sort(resourceOrder);
    this._availableFactoryResources.sort(resourceOrder);
    this.bzUnassignResources();  // process remaining resources
}
// add ResourceAllocation.bzUnassignResources
ResourceAllocation.bzUnassignResources = function(resources=[]) {
    if (this.isResourceAssignmentLocked) return 0;
    // skip locked resources (out of network or being razed)
    resources = resources.filter(r => r.isInTradeNetwork && !r.isBeingRazed);
    // add new resources for unassignment
    for (const resource of resources) {
        if (this.bzUnassignAll.has(resource.value)) continue;
        this.bzUnassignAll.set(resource.value, resource);
        this.bzUnassignQueue.set(resource.value, resource);
    }
    if (this.bzUnassignAll.size == 0) return 0;
    // get operation parameters for all assigned resources
    const lpid = GameContext.localPlayerID;
    const op = PlayerOperationTypes.ASSIGN_RESOURCE;
    const assignment = new Map();
    for (const ac of this.availableCities) {
        for (const resource of ac.currentResources) {
            const args = {
                Location: GameplayMap.getLocationFromIndex(resource.value),
                City: ac.id.id,
                Action: PlayerOperationParameters.Deactivate,
            };
            assignment.set(resource.value, args);
        }
    }
    // remove completed unassignments
    for (const value of this.bzUnassignAll.keys()) {
        if (assignment.has(value)) continue;
        this.bzUnassignAll.delete(value);
        this.bzUnassignQueue.delete(value);
    }
    // unassign resources
    for (const resource of this.bzUnassignQueue.values()) {
        const args = assignment.get(resource.value);
        const result = Game.PlayerOperations.canStart(lpid, op, args, false);
        if (result.Success) Game.PlayerOperations.sendRequest(lpid, op, args);
        if (!resource.bonusResourceSlots) this.bzUnassignQueue.delete(resource.value);
    }
    return resources.length;
}

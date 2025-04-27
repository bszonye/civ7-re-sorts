import bzReSortsOptions from '/bz-re-sorts/ui/options/bz-re-sorts-options.js';
import ResourceAllocation from '/base-standard/ui/resource-allocation/model-resource-allocation.js';

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
const factoryOrder = (a, b) => {
    if (!bzReSortsOptions.groupByReq) return 0;
    // group factories
    if (a.hasFactory && !b.hasFactory) return -1;
    if (b.hasFactory && !a.hasFactory) return +1;
    return 0;
};
const bonusOrder = (a, b) => {
    if (!bzReSortsOptions.groupByReq) return 0;
    // sort by number of bonus conditions met
    return b.bzBonusOrder - a.bzBonusOrder;
};
const nullOrder = (_a, _b) => 0;
const slotsOrder = (a, b) => a.resourceCap - b.resourceCap;
const yieldOrder = (a, b) => {
    const ayield = a.yields.find(y => y.type == ResourceAllocation.bzSortOrder);
    const byield = b.yields.find(y => y.type == ResourceAllocation.bzSortOrder);
    return (ayield?.valueNum ?? 0) - (byield?.valueNum ?? 0);
}
export const sortSettlements = () => {
    const list = ResourceAllocation.availableCities;
    const order = ResourceAllocation.bzSortOrder;
    const direction = ResourceAllocation.bzSortReverse ? -1 : +1;
    const f = order == "NAME" ? nullOrder : order == "SLOTS" ? slotsOrder : yieldOrder;
    const settlementOrder = (a, b) =>
        factoryOrder(a, b) || settlementTypeOrder(a, b) || bonusOrder(a, b) ||
            -direction * f(a, b) || direction * localeOrder(a, b);
    list.sort(settlementOrder);
};
const updateSettlements = (list) => {
    const age = GameInfo.Ages.lookup(Game.age);
    for (const item of list) {
        item.currentResources.sort(resourceOrder);
        item.visibleResources.sort(resourceOrder);
        item.treasureResources.sort(resourceOrder);
        item.bzBonusOrder = 0;
        const stype = [Locale.compose(item.settlementTypeName)];
        const city = Cities.get(item.id);
        const hasBuilding = (b) => city.Constructibles?.hasConstructible(b, false);
        switch (age.ChronologyIndex) {
            case 0:  // antiquity
                if (!city.isTown && !city.isCapital) {
                    item.bzBonusOrder = +1;
                }
                break;
            case 1:  // exploration
                if (city.isDistantLands) {
                    item.bzBonusOrder = +1;
                    stype.push(Locale.compose("LOC_PLOT_TOOLTIP_HEMISPHERE_WEST"));
                } else {
                    stype.push(Locale.compose("LOC_PLOT_TOOLTIP_HEMISPHERE_EAST"));
                }
                break;
            case 2:  // modern
                if (hasBuilding("BUILDING_RAIL_STATION")) {
                    item.bzBonusOrder = +1;
                    stype.push(Locale.compose("LOC_BUILDING_RAIL_STATION_NAME"));
                }
                if (hasBuilding("BUILDING_PORT")) {
                    item.bzBonusOrder = +1;
                    stype.push(Locale.compose("LOC_BUILDING_PORT_NAME"));
                }
                break;
        }
        item.settlementTypeName = stype.join(" • ");
    }
    // initialize sort order
    if (!ResourceAllocation.bzSortOrder) {
        ResourceAllocation.bzSortOrder = bzReSortsOptions.sortOrder;
        ResourceAllocation.bzSortReverse = false;
    }
    sortSettlements();
}

const initialize = () => {
    const proto = Object.getPrototypeOf(ResourceAllocation);
    const update = proto.update;
    proto.update = function(...args) {
        update.apply(this, args);
        updateSettlements(this._availableCities);
        this._empireResources.sort(resourceOrder);
        this._uniqueEmpireResources.sort(resourceOrder);
        this._allAvailableResources.sort(resourceOrder);
        this._availableBonusResources.sort(resourceOrder);
        this._availableResources.sort(resourceOrder);
        this._availableFactoryResources.sort(resourceOrder);
        this._treasureResources.sort(resourceOrder);
    }
};
engine.whenReady.then(initialize);

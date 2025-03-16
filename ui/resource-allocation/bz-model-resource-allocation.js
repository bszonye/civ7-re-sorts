import bzReSortsOptions from '/bz-re-sorts/ui/options/bz-re-sorts-options.js';
import ResourceAllocation from '/base-standard/ui/resource-allocation/model-resource-allocation.js';

const BZ_RESOURCECLASS_SORT = {
    RESOURCECLASS_EMPIRE: 1,
    RESOURCECLASS_CITY: 2,
    RESOURCECLASS_BONUS: 3,
    RESOURCECLASS_TREASURE: 4,
    RESOURCECLASS_FACTORY: 5,
}
const resourceSort = (a, b) => {
    // first sort empire, city, bonus, treasure, factory
    const groupA = BZ_RESOURCECLASS_SORT[a.classType] ?? 0;
    const groupB = BZ_RESOURCECLASS_SORT[b.classType] ?? 0;
    if (groupA != groupB) return groupA - groupB;
    // then sort by name
    const nameA = Locale.compose(a.name);
    const nameB = Locale.compose(b.name);
    return nameA.localeCompare(nameB);
}
const BZ_SETTLEMENT_SORT = {
    Capital: 1,
    City: 2,
    Town: 3,
}
const settlementSort = (a, b) => {
    if (bzReSortsOptions.sortCitiesByRequirement) {
        // group factories
        if (a.hasFactory && !b.hasFactory) return -1;
        if (b.hasFactory && !a.hasFactory) return +1;
    }
    if (bzReSortsOptions.sortCitiesByType) {
        // group by capital, city, town
        const groupA = BZ_SETTLEMENT_SORT[a.settlementType] ?? 0;
        const groupB = BZ_SETTLEMENT_SORT[b.settlementType] ?? 0;
        if (groupA != groupB) return groupA - groupB;
    }
    if (bzReSortsOptions.sortCitiesByRequirement) {
        // group city bonus types (Rail Station, Distant Lands)
        if (a.hasCityBonus && !b.hasCityBonus) return -1;
        if (b.hasCityBonus && !a.hasCityBonus) return +1;
    }
    if (bzReSortsOptions.sortCitiesBySlots) {
        // sort by total resource slots
        const groupA = a.resourceCap;
        const groupB = b.resourceCap;
        if (groupA != groupB) return groupB - groupA;
    }
    // then sort by name
    const nameA = Locale.compose(a.name).toUpperCase();
    const nameB = Locale.compose(b.name).toUpperCase();
    // TODO: ideally this would use case-insensitive comparison instead,
    //       but the game doesn't seem to support Intl.Collator options.
    // const locale = Locale.getCurrentDisplayLocale();
    // nameA.localeCompare(nameB, locale, { sensitivity: "base" });
    return nameA.localeCompare(nameB);
};
const updateSettlements = (list) => {
    const age = GameInfo.Ages.lookup(Game.age);
    for (const item of list) {
        item.currentResources.sort(resourceSort);
        item.visibleResources.sort(resourceSort);
        item.treasureResources.sort(resourceSort);
        item.hasCityBonus = false;
        const city = Cities.get(item.id);
        if (city.isTown) continue;
        switch (age.ChronologyIndex) {
            case 0:  // antiquity
                item.hasCityBonus = !city.isCapital;
                break;
            case 1:  // exploration
                item.hasCityBonus = city.isDistantLands;
                break;
            case 2:  // modern
                item.hasCityBonus = city.Constructibles?.hasConstructible("BUILDING_RAIL_STATION", false);
                break;
        }
    }
    list.sort(settlementSort);
}

const initialize = () => {
    const proto = Object.getPrototypeOf(ResourceAllocation);
    const update = proto.update;
    proto.update = function(...args) {
        update.apply(this, args);
        updateSettlements(this._availableCities);
        this._empireResources.sort(resourceSort);
        this._uniqueEmpireResources.sort(resourceSort);
        this._allAvailableResources.sort(resourceSort);
        this._availableBonusResources.sort(resourceSort);
        this._availableResources.sort(resourceSort);
        this._availableFactoryResources.sort(resourceSort);
        this._treasureResources.sort(resourceSort);
    }
};
engine.whenReady.then(initialize);

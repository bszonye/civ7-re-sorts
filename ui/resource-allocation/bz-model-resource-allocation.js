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
    const classA = BZ_RESOURCECLASS_SORT[a.classType] ?? 0;
    const classB = BZ_RESOURCECLASS_SORT[b.classType] ?? 0;
    if (classA != classB) return classA - classB;
    // then sort by name
    const typeA = Locale.compose(a.type);
    const typeB = Locale.compose(b.type);
    return typeA.localeCompare(typeB);
}
const BZ_SETTLEMENT_SORT = {
    Capital: 1,
    City: 2,
    Town: 3,
}
const settlementSort = (a, b) => {
    // first sort capital, city, town
    const classA = BZ_SETTLEMENT_SORT[a.settlementType] ?? 0;
    const classB = BZ_SETTLEMENT_SORT[b.settlementType] ?? 0;
    if (classA != classB) return classA - classB;
    // then sort by name
    const nameA = Locale.compose(a.name);
    const nameB = Locale.compose(b.name);
    return nameA.localeCompare(nameB);
};

const initialize = () => {
    const proto = Object.getPrototypeOf(ResourceAllocation);
    const update = proto.update;
    proto.update = function(...args) {
        update.apply(this, args);
        this._availableCities.sort(settlementSort);
        for (const city of this._availableCities) {
            city.currentResources.sort(resourceSort);
            city.visibleResources.sort(resourceSort);
            city.treasureResources.sort(resourceSort);
        }
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

import '/core/ui/options/options.js';  // make sure this loads first
import { CategoryType } from '/core/ui/options/options-helpers.js';
import { Options, OptionType } from '/core/ui/options/model-options.js';
import ModSettings from '/bz-re-sorts/ui/options/mod-options-decorator.js';

const MOD_ID = "bz-re-sorts";

export var bzSortOrder;
(function (bzSortOrder) {
        bzSortOrder[bzSortOrder["NAME"] = 0] = "NAME";
        bzSortOrder[bzSortOrder["SLOTS"] = 1] = "SLOTS";
        bzSortOrder[bzSortOrder["YIELD_FOOD"] = 2] = "YIELD_FOOD";
        bzSortOrder[bzSortOrder["YIELD_PRODUCTION"] = 2] = "YIELD_PRODUCTION";
        bzSortOrder[bzSortOrder["YIELD_GOLD"] = 2] = "YIELD_GOLD";
        bzSortOrder[bzSortOrder["YIELD_SCIENCE"] = 2] = "YIELD_SCIENCE";
        bzSortOrder[bzSortOrder["YIELD_CULTURE"] = 2] = "YIELD_CULTURE";
        bzSortOrder[bzSortOrder["YIELD_HAPPINESS"] = 2] = "YIELD_HAPPINESS";
        bzSortOrder[bzSortOrder["YIELD_DIPLOMACY"] = 2] = "YIELD_DIPLOMACY";
})(bzSortOrder || (bzSortOrder = {}));
const sortOrderOptions = [
    { label: 'LOC_OPTIONS_BZ_RE_SORTS_SORT_BY_NAME', value: bzSortOrder.NAME },
    { label: 'LOC_OPTIONS_BZ_RE_SORTS_SORT_BY_SLOTS', value: bzSortOrder.SLOTS },
    { label: 'LOC_YIELD_FOOD', value: bzSortOrder.YIELD_FOOD },
    { label: 'LOC_YIELD_PRODUCTION', value: bzSortOrder.YIELD_PRODUCTION },
    { label: 'LOC_YIELD_GOLD', value: bzSortOrder.YIELD_GOLD },
    { label: 'LOC_YIELD_SCIENCE', value: bzSortOrder.YIELD_SCIENCE },
    { label: 'LOC_YIELD_CULTURE', value: bzSortOrder.YIELD_CULTURE },
    { label: 'LOC_YIELD_HAPPINESS', value: bzSortOrder.YIELD_HAPPINESS },
    { label: 'LOC_YIELD_DIPLOMACY', value: bzSortOrder.YIELD_DIPLOMACY },
];
const BZ_DEFAULT_OPTIONS = {
    sortOrder: bzSortOrder.SLOTS,
    groupByType: true,
    groupByReq: true,
};
const bzReSortsOptions = new class {
    data = { ...BZ_DEFAULT_OPTIONS };
    constructor() {
        const modSettings = ModSettings.load(MOD_ID);
        this.data = {
            sortOrder:
            modSettings.sortOrder ??
            BZ_DEFAULT_OPTIONS.sortOrder,
            groupByType:
            modSettings.groupByType ??
            modSettings.sortCitiesByType ??  // legacy
            BZ_DEFAULT_OPTIONS.groupByType,
            groupByReq:
            modSettings.groupByReq ??
            modSettings.sortCitiesByRequirement ??  // legacy
            BZ_DEFAULT_OPTIONS.groupByReq,
        }
        console.warn(`DATA bz-re-sorts=${JSON.stringify(this.data)}`);
    }
    save() {
        ModSettings.save(MOD_ID, this.data);
    }
    get groupByReq() {
        return this.data.groupByReq;
    }
    set groupByReq(flag) {
        this.data.groupByReq = !!flag;
        this.save();
    }
    get groupByType() {
        return this.data.groupByType;
    }
    set groupByType(flag) {
        this.data.groupByType = !!flag;
        this.save();
    }
    get sortOrder() {
        return this.data.sortOrder;
    }
    set sortOrder(order) {
        this.data.sortOrder = order;
        this.save();
    }
};
const onInitSortOrder = (info) => {
    info.selectedItemIndex = bzReSortsOptions.sortOrder;
};
const onUpdateSortOrder = (_info, order) => {
    bzReSortsOptions.sortOrder = order;
};
Options.addInitCallback(() => {
    Options.addOption({
        category: CategoryType.Mods,
        // @ts-ignore
        group: "bz_mods",
        type: OptionType.Dropdown,
        id: "bz-re-sorts-order",
        initListener: onInitSortOrder,
        updateListener: onUpdateSortOrder,
        label: "LOC_OPTIONS_BZ_RE_SORTS_SORT_ORDER",
        description: "LOC_OPTIONS_BZ_RE_SORTS_SORT_ORDER_DESCRIPTION",
        dropdownItems: sortOrderOptions,
    });
});
const onInitGroupByType = (info) => {
    info.currentValue = bzReSortsOptions.groupByType;
};
const onUpdateGroupByType = (_info, flag) => {
    bzReSortsOptions.groupByType = flag;
};
Options.addInitCallback(() => {
    Options.addOption({
        category: CategoryType.Mods,
        // @ts-ignore
        group: "bz_mods",
        type: OptionType.Checkbox,
        id: "bz-re-sorts-group-by-type",
        initListener: onInitGroupByType,
        updateListener: onUpdateGroupByType,
        label: "LOC_OPTIONS_BZ_RE_SORTS_GROUP_BY_TYPE",
        description: "LOC_OPTIONS_BZ_RE_SORTS_GROUP_BY_TYPE_DESCRIPTION",
    });
});
const onInitGroupByReq = (info) => {
    info.currentValue = bzReSortsOptions.sortCitiesByRequirement;
};
const onUpdateGroupByReq = (_info, flag) => {
    bzReSortsOptions.sortCitiesByRequirement = flag;
};
Options.addInitCallback(() => {
    Options.addOption({
        category: CategoryType.Mods,
        // @ts-ignore
        group: "bz_mods",
        type: OptionType.Checkbox,
        id: "bz-re-sorts-group-by-req",
        initListener: onInitGroupByReq,
        updateListener: onUpdateGroupByReq,
        label: "LOC_OPTIONS_BZ_RE_SORTS_GROUP_BY_REQ",
        description: "LOC_OPTIONS_BZ_RE_SORTS_GROUP_BY_REQ_DESCRIPTION",
    });
});

export { bzReSortsOptions as default };

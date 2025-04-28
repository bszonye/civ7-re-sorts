import '/core/ui/options/options.js';  // make sure this loads first
import { CategoryType } from '/core/ui/options/options-helpers.js';
import { Options, OptionType } from '/core/ui/options/model-options.js';
import ModSettings from '/bz-re-sorts/ui/options/mod-options-decorator.js';

const MOD_ID = "bz-re-sorts";

const BZ_DEFAULT_OPTIONS = {
    groupByType: true,
    groupByReq: true,
};
const bzReSortsOptions = new class {
    data = { ...BZ_DEFAULT_OPTIONS };
    constructor() {
        const modSettings = ModSettings.load(MOD_ID);
        this.data = {
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
};
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
    info.currentValue = bzReSortsOptions.groupByReq;
};
const onUpdateGroupByReq = (_info, flag) => {
    bzReSortsOptions.groupByReq = flag;
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

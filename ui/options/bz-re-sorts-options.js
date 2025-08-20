import '/core/ui/options/screen-options.js';  // make sure this loads first
import { C as CategoryType, O as Options, a as OptionType } from '/core/ui/options/editors/index.chunk.js';
import ModSettings from '/bz-re-sorts/ui/options/mod-options-decorator.js';

const MOD_ID = "bz-re-sorts";

const BZ_DEFAULT_OPTIONS = {
    groupByType: false,
};
const bzReSortsOptions = new class {
    data = { ...BZ_DEFAULT_OPTIONS };
    constructor() {
        const modSettings = ModSettings.load(MOD_ID);
        this.data = {
            groupByType: modSettings?.groupByType ??  BZ_DEFAULT_OPTIONS.groupByType,
        }
        console.warn(`DATA bz-re-sorts=${JSON.stringify(this.data)}`);
    }
    save() {
        ModSettings.save(MOD_ID, this.data);
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
export { bzReSortsOptions as default };

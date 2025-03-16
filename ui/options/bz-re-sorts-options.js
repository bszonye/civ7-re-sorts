import '/core/ui/options/options.js';  // make sure this loads first
import { CategoryType } from '/core/ui/options/options-helpers.js';
import { Options, OptionType } from '/core/ui/options/model-options.js';
import ModSettings from '/bz-re-sorts/ui/options/mod-options-decorator.js';

const MOD_ID = "bz-re-sorts";

const bzReSortsOptions = new class {
    data = {
        sortCitiesByType: true,
        sortCitiesByRequirement: true,
        sortCitiesBySlots: false,
    };
    constructor() {
        const modSettings = ModSettings.load(MOD_ID);
        if (modSettings) this.data = modSettings;
    }
    save() {
        ModSettings.save(MOD_ID, this.data);
    }
    get sortCitiesByRequirement() {
        return this.data.sortCitiesByRequirement;
    }
    set sortCitiesByRequirement(flag) {
        this.data.sortCitiesByRequirement = !!flag;
        this.save();
    }
    get sortCitiesBySlots() {
        return this.data.sortCitiesBySlots;
    }
    set sortCitiesBySlots(flag) {
        this.data.sortCitiesBySlots = !!flag;
        this.save();
    }
    get sortCitiesByType() {
        return this.data.sortCitiesByType;
    }
    set sortCitiesByType(flag) {
        this.data.sortCitiesByType = !!flag;
        this.save();
    }
};
const onInitSortCitiesByType = (info) => {
    info.currentValue = bzReSortsOptions.sortCitiesByType;
};
const onUpdateSortCitiesByType = (_info, flag) => {
    bzReSortsOptions.sortCitiesByType = flag;
};
Options.addInitCallback(() => {
    Options.addOption({
        category: CategoryType.Mods,
        // @ts-ignore
        group: "bz_mods",
        type: OptionType.Checkbox,
        id: "bz-sort-cities-by-type",
        initListener: onInitSortCitiesByType,
        updateListener: onUpdateSortCitiesByType,
        label: "LOC_OPTIONS_BZ_SORT_CITIES_BY_TYPE",
        description: "LOC_OPTIONS_BZ_SORT_CITIES_BY_TYPE_DESCRIPTION",
    });
});
const onInitSortCitiesByRequirement = (info) => {
    info.currentValue = bzReSortsOptions.sortCitiesByRequirement;
};
const onUpdateSortCitiesByRequirement = (_info, flag) => {
    bzReSortsOptions.sortCitiesByRequirement = flag;
};
Options.addInitCallback(() => {
    Options.addOption({
        category: CategoryType.Mods,
        // @ts-ignore
        group: "bz_mods",
        type: OptionType.Checkbox,
        id: "bz-sort-cities-by-requirement",
        initListener: onInitSortCitiesByRequirement,
        updateListener: onUpdateSortCitiesByRequirement,
        label: "LOC_OPTIONS_BZ_SORT_CITIES_BY_REQUIREMENT",
        description: "LOC_OPTIONS_BZ_SORT_CITIES_BY_REQUIREMENT_DESCRIPTION",
    });
});
const onInitSortCitiesBySlots = (info) => {
    info.currentValue = bzReSortsOptions.sortCitiesBySlots;
};
const onUpdateSortCitiesBySlots = (_info, flag) => {
    bzReSortsOptions.sortCitiesBySlots = flag;
};
Options.addInitCallback(() => {
    Options.addOption({
        category: CategoryType.Mods,
        // @ts-ignore
        group: "bz_mods",
        type: OptionType.Checkbox,
        id: "bz-sort-cities-by-slots",
        initListener: onInitSortCitiesBySlots,
        updateListener: onUpdateSortCitiesBySlots,
        label: "LOC_OPTIONS_BZ_SORT_CITIES_BY_SLOTS",
        description: "LOC_OPTIONS_BZ_SORT_CITIES_BY_SLOTS_DESCRIPTION",
    });
});

export { bzReSortsOptions as default };

import '/core/ui/options/screen-options.js';  // make sure this loads first
import { C as CategoryType, O as Options, a as OptionType } from '/core/ui/options/editors/index.chunk.js';
// set up mod options tab
import ModOptions from '/bz-re-sorts/ui/options/mod-options.js';

const bzReSortsOptions = new class {
    modID = "bz-re-sorts";
    defaults = {
        groupByType: Number(true),
    };
    data = {};
    load(optionID) {
        const value = ModOptions.load(this.modID, optionID);
        if (value == null) {
            const value = this.defaults[optionID];
            console.warn(`LOAD ${this.modID}.${optionID}=${value} (default)`);
            return value;
        }
        return value;
    }
    save(optionID) {
        const value = Number(this.data[optionID]);
        ModOptions.save(this.modID, optionID, value);
    }
    get groupByType() {
        this.data.groupByType ??= Boolean(this.load("groupByType"));
        return this.data.groupByType;
    }
    set groupByType(flag) {
        this.data.groupByType = Boolean(flag);
        this.save("groupByType");
    }
};

Options.addInitCallback(() => {
    Options.addOption({
        category: CategoryType.Mods,
        group: "bz_mods",
        type: OptionType.Checkbox,
        id: "bz-re-sorts-group-by-type",
        initListener: (info) => info.currentValue = bzReSortsOptions.groupByType,
        updateListener: (_info, value) => bzReSortsOptions.groupByType = value,
        label: "LOC_OPTIONS_BZ_RE_SORTS_GROUP_BY_TYPE",
        description: "LOC_OPTIONS_BZ_RE_SORTS_GROUP_BY_TYPE_DESCRIPTION",
    });
});

export { bzReSortsOptions as default };

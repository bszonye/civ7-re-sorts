import ResourceAllocation from '/base-standard/ui/resource-allocation/model-resource-allocation.js';
import Databind from '/core/ui/utilities/utilities-core-databinding.js';

const BZ_HEAD_STYLE = [
`
.bz-hide-factories .bz-factory,
.bz-hide-towns .bz-town {
    display: none;
}
.bz-re-sorts screen-resource-allocation .available-resources-column.hover-enabled:hover {
    background-color: #0000;
    background-image: linear-gradient(180deg, #0000 0%, #E5D2ACB0 100%);
}
.bz-re-sorts .city-top-container img,
.bz-re-sorts .city-top-container p {
    pointer-events: none;
}
.bz-re-sorts .city-top-container:hover {
    color: #E5D2AC;
}
.bz-sort-button {
    position: relative;
    pointer-events: auto;
    background-size: contain;
    background-repeat: no-repeat;
    border-radius: 0.3333333333rem;
}
.bz-sort-button.bz-sort-slots {
    background-size: 1.1111111111rem;
    background-position: center;
    filter: sepia(0.5) brightness(1.5);
}
.bz-sort-button.bz-sort-bonuses {
    background-size: 1.1111111111rem;
    background-position: center;
}
.bz-sort-button:hover {
    background-color: #E5D2AC;
    transition-property: background-color;
    transition-duration: 0.25s;
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
}
.bz-sort-arrow {
    position: absolute;
    pointer-events: none;
    top: 0.7222222222rem;
    transform: rotate(-90deg);
    background-image: url("blp:Action_Move");
    background-size: 1.3333333333rem;
    background-position: center;
    background-repeat: no-repeat;
    filter: drop-shadow(0 0 0.0555555556rem black) fxs-color-tint(#E5D2AC);
    opacity: 0;
}
.bz-sort-selected .bz-sort-arrow { opacity: 1; }
.bz-sort-reversed .bz-sort-arrow {
    transform: rotate(-90deg) scale(-1, 1);
    top: -0.7222222222rem;
}
`,
];
BZ_HEAD_STYLE.map(style => {
    const e = document.createElement('style');
    e.textContent = style;
    document.head.appendChild(e);
});
document.body.classList.add("bz-re-sorts");

const CITY_ICON = 'url("blp:Yield_Cities_20")';
const SLOTS_ICON = 'url("fs://game/res_addslot")';
const bzSortOrderControls = [
    { order: 'NAME', icon: CITY_ICON, },
    { order: 'YIELD_FOOD', reverse: true, },
    { order: 'YIELD_PRODUCTION', reverse: true, },
    { order: 'YIELD_GOLD', reverse: true, },
    { order: 'YIELD_SCIENCE', reverse: true, },
    { order: 'YIELD_CULTURE', reverse: true, },
    { order: 'YIELD_HAPPINESS', reverse: true, },
    { order: 'YIELD_DIPLOMACY', reverse: true, },
    { order: 'SLOTS', reverse: true, icon: SLOTS_ICON, style: 'bz-sort-slots'},
];
export class bzScreenResourceAllocation {
    static c_prototype;
    constructor(component) {
        this.component = component;
        component.bzComponent = this;
        this.Root = this.component.Root;
        this.availableResourceCol = null;
        this.showFactoriesListener = this.onShowFactoriesChanged.bind(this);
        this.showTownsListener = this.onShowTownsChanged.bind(this);
        this.resourceInputListener = this.onResourceInput.bind(this);
        this.targetInputListener = this.onTargetInput.bind(this);
        this.sortOrderActivateListener = this.onSortOrderActivate.bind(this);
        this.patchPrototypes(this.component);
        Controls.preloadImage('res_capital', 'screen-resource-allocation');
    }
    patchPrototypes(component) {
        const c_prototype = Object.getPrototypeOf(component);
        if (bzScreenResourceAllocation.c_prototype == c_prototype) return;
        // patch component methods
        const proto = bzScreenResourceAllocation.c_prototype = c_prototype;
        // afterInitialize
        const afterInitialize = this.afterInitialize;
        const onInitialize = proto.onInitialize;
        proto.onInitialize = function(...args) {
            const c_rv = onInitialize.apply(this, args);
            const after_rv = afterInitialize.apply(this.bzComponent, args);
            return after_rv ?? c_rv;
        }
    }
    afterInitialize() {
        // replace filter handlers
        const showFactories = this.Root.querySelector(".show-factories");
        if (showFactories) {
            showFactories.removeEventListener('component-value-changed',
                this.component.onShowFactoriesChanged);
            showFactories.addEventListener('component-value-changed',
                this.showFactoriesListener);
        }
        const showTowns = this.Root.querySelector(".show-cities");
        if (showTowns) {
            showTowns.removeEventListener('component-value-changed',
                this.component.onShowTownsChanged);
            showTowns.addEventListener('component-value-changed',
                this.showTownsListener);
        }
    }
    unassignAllResources(cityID) {
        const bonusSlots = (res) => {
            const slots = GameInfo.Resources.lookup(res.type)?.BonusResourceSlots ?? 0;
            // camels add an extra slot (possibly a bug)
            return slots && slots + 1;
        }
        const resources = ResourceAllocation.availableCities
                .find(e => e.id.id == cityID)?.currentResources;
        if (!resources || !resources.length) return;
        resources.sort((a, b) => bonusSlots(b) - bonusSlots(a));
        let slots = resources.length;
        let tries = 0;
        // unassign resources over time to avoid loud clicks
        // or camels getting stuck in their slots
        const unassignInterval = setInterval(() => {
            if (10 <= ++tries) clearInterval(unassignInterval);  // failsafe
            const current = ResourceAllocation.availableCities
                .find(e => e.id.id == cityID)?.currentResources ?? [];
            if (slots < current.length && tries < 5) return;
            // unassign slots right to left
            const res = resources[--slots];
            ResourceAllocation.unassignResource(res.value);
            tries = 0;
            if (slots < 1) clearInterval(unassignInterval);  // last loop
        }, 50);
    }
    onShowFactoriesChanged(event) {
        document.body.classList.toggle("bz-hide-factories", !event.detail.value);
    }
    onShowTownsChanged(event) {
        document.body.classList.toggle("bz-hide-towns", !event.detail.value);
    }
    onResourceInput(event) {
        // only recognize completed middle-clicks
        if (event.detail.status != InputActionStatuses.FINISH) return;
        if (event.detail.name != "mousebutton-middle") return;
        // don't interrupt resource assignment
        if (ResourceAllocation.hasSelectedResource()) return;
        // middle-click on settlement name
        if (event.target.classList.contains('city-top-container')) {
            const cityEntry = event.target.parentElement?.parentElement;
            const cityIDAttribute = cityEntry?.getAttribute('data-city-id');
            if (!cityIDAttribute) {
                console.error("bz-screen-resource-allocation: invalid city-id");
                return;
            }
            const cityID = parseInt(cityIDAttribute);
            this.unassignAllResources(cityID);
        }
        // middle-click on resource
        if (event.target.classList.contains('city-resource')) {
            this.component.onAssignedResourceActivate(event);
            this.component.onUnassignActivated(event);
        }
    }
    onTargetInput(event) {
        const v = event.detail;
        if (v.status == InputActionStatuses.FINISH && v.name == "mousebutton-left") {
            if (ResourceAllocation.hasSelectedAssignedResource) {
                this.component.onUnassignActivated(event);
            }
        }
    }
    onSortOrderActivate(event) {
        if (!(event.target instanceof HTMLElement)) return;
        const order = event.target.getAttribute("data-bz-sort-order");
        const reverse = event.target.getAttribute("data-bz-sort-reverse") === "true";
        if (order == ResourceAllocation.bzSortOrder) {
            ResourceAllocation.bzSortReverse = !ResourceAllocation.bzSortReverse;
        } else {
            ResourceAllocation.bzSortOrder = order;
            ResourceAllocation.bzSortReverse = reverse;
        }
        ResourceAllocation.update();
    }
    beforeAttach() { }
    afterAttach() {
        // add sorting controls
        const factories = this.Root.querySelector(".show-factories-container");
        factories.classList.add("mr-3");  // make room
        this.filterContainer = this.component.filterContainer;
        const sortControls = document.createElement('div');
        sortControls.classList.value = "flex items-end mr-3";
        const sortLabel = document.createElement('div');
        sortLabel.classList.value = "text-xs mr-1 mb-1";
        sortLabel.setAttribute('data-l10n-id', "LOC_SORT_DROPDOWN_SELECTION");
        sortControls.appendChild(sortLabel);
        for (const info of bzSortOrderControls) {
            const button = document.createElement('fxs-activatable');
            button.classList.value = "bz-sort-button size-8";
            if (info.style) button.classList.add(info.style);
            const icon = info.icon ?? UI.getIconCSS(info.order);
            button.style.backgroundImage = icon;
            button.setAttribute("tabindex", "-1");
            button.setAttribute('data-bz-sort-order', info.order);
            button.setAttribute('data-bz-sort-reverse', info.reverse ?? false);
            Databind.classToggle(button, 'bz-sort-selected', `{{g_ResourceAllocationModel.bzSortOrder}}=="${info.order}"`);
            Databind.classToggle(button, 'bz-sort-reversed', `{{g_ResourceAllocationModel.bzSortReverse}}`);
            button.addEventListener('action-activate', this.sortOrderActivateListener);
            const arrow = document.createElement('div');
            arrow.classList.value = "bz-sort-arrow size-8";
            button.appendChild(arrow);
            sortControls.appendChild(button);
        }
        this.filterContainer.appendChild(sortControls);
        // improve filters (Show Factories, Show Towns)
        for (const cityEntry of this.Root.querySelectorAll(".city-outer")) {
            cityEntry.setAttribute('data-bind-class-toggle',
                `bz-factory:{{entry.hasFactory}};bz-town:{{entry.settlementType}}=='Town'`);
        }
        // restyle settlement entries
        for (const outer of this.Root.querySelectorAll(".city-outer")) {
            // tighten margins
            outer.style.marginBottom = '0.6666666667rem';
            const inner = outer.querySelector(".city-entry-internal");
            inner.style.margin = 0;
            inner.style.marginTop = '0.2222222222rem';
            const title = inner.querySelector(".city-top-container");
            title.style.marginBottom = 0;
            const yields = inner.querySelector(".city-yield-bar");
            yields.style.lineHeight = 2;  // better spacing for large text
            yields.style.marginTop = 0;
            yields.lastChild.style.marginTop = yields.lastChild.style.marginBottom = 0;
            const treasure = outer.querySelector(".city-treasure-resource-container");
            if (treasure) {
                // better fit and justification
                treasure.classList.add("flex-row-reverse", "items-center");
                treasure.style.top = 0;
                treasure.style.right = '0.2222222222rem';
                treasure.lastChild.classList.add("mr-1");
                treasure.lastChild.classList.remove("self-end");
            }
            const factory = outer.querySelector(".city-factory-resource-container");
            if (factory) {
                // better fit and centering
                factory.classList.add("items-center");
                factory.classList.remove("items-start");
                factory.style.padding = '0.3333333333rem';
                factory.firstChild.style.margin = 0;
                factory.firstChild.style.marginLeft = '0.3333333333rem';
            }
            // restyle settlement type in bz capsule style
            const stype = title.querySelector(".settlement-type-text");
            stype.classList.remove('font-title', 'uppercase', 'ml-1');
            stype.classList.add('leading-snug', 'bg-primary-5', 'rounded-3xl', 'ml-2', 'px-2');
        }
        // event handlers
        for (const title of this.Root.querySelectorAll(".city-top-container")) {
            title.addEventListener('engine-input', this.resourceInputListener);
        }
        for (const resource of this.Root.querySelectorAll(".city-resource")) {
            resource.addEventListener('engine-input', this.resourceInputListener);
        }
        const acolumn = this.component.availableResourceCol;
        acolumn.classList.add('pointer-events-auto');
        acolumn.setAttribute('data-bind-class-toggle', 'hover-enabled:{{g_ResourceAllocationModel.hasSelectedAssignedResource}}');
        acolumn.addEventListener('engine-input', this.targetInputListener);
        for (const scrollable of acolumn.querySelectorAll("fxs-scrollable")) {
            scrollable.addEventListener('engine-input', this.targetInputListener);
        }
    }
    beforeDetach() { }
    afterDetach() { }
    onAttributeChanged(_name, _prev, _next) { }
}
Controls.decorate('screen-resource-allocation', (component) => new bzScreenResourceAllocation(component));

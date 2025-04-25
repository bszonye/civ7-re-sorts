import ResourceAllocation from '/base-standard/ui/resource-allocation/model-resource-allocation.js';
const BZ_HEAD_STYLE = [
`
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
`,
];
BZ_HEAD_STYLE.map(style => {
    const e = document.createElement('style');
    e.textContent = style;
    document.head.appendChild(e);
});
document.body.classList.add("bz-re-sorts");

export class bzScreenResourceAllocation {
    static c_prototype;
    constructor(component) {
        this.component = component;
        component.bzComponent = this;
        this.Root = this.component.Root;
        this.availableResourceCol = null;
        this.resourceInputListener = this.onResourceInput.bind(this);
        this.targetInputListener = this.onTargetInput.bind(this);
        this.patchPrototypes(this.component);
    }
    patchPrototypes(component) {
        const c_prototype = Object.getPrototypeOf(component);
        if (bzScreenResourceAllocation.c_prototype == c_prototype) return;
        // patch component methods
        const _proto = bzScreenResourceAllocation.c_prototype = c_prototype;
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
        const tmax = 2 * slots + 1;
        // unassign resources slowly (about 125ms each) to avoid loud
        // clicks or camels getting stuck in their slots
        const unassignInterval = setInterval(() => {
            if (tmax <= ++tries) clearInterval(unassignInterval);  // timeout
            const city = ResourceAllocation.availableCities
                .find(e => e.id.id == cityID);
            const emptySlots = city.emptySlots.length;
            // unassign slots right to left
            const res = resources[slots - 1];
            if (emptySlots < bonusSlots(res)) return;  // wait for more empty slots
            ResourceAllocation.unassignResource(res.value);
            --slots;
            if (slots < 1) clearInterval(unassignInterval);  // last loop
        }, 125);
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
    beforeAttach() { }
    afterAttach() {
        // restyle settlement type in bz capsule style
        const stypes = this.Root.querySelectorAll(".settlement-type-text");
        for (const stype of stypes) {
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

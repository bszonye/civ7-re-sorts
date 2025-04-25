const BZ_HEAD_STYLE = [
`
.bz-re-sorts screen-resource-allocation .available-resources-column.hover-enabled:hover {
    background-color: #0000;
    background-image: linear-gradient(180deg, #0000 0%, #E5D2AC66 100%);
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
    beforeAttach() { }
    afterAttach() {
        // restyle settlement type in bz capsule style
        const stypes = this.Root.querySelectorAll(".settlement-type-text");
        for (const stype of stypes) {
            stype.classList.remove('font-title', 'uppercase', 'ml-1');
            stype.classList.add('leading-snug', 'bg-primary-5', 'rounded-3xl', 'ml-2', 'px-2');
        }
        // event handlers
        for (const resource of this.Root.querySelectorAll(".city-resource")) {
            resource.addEventListener('engine-input', this.resourceInputListener);
        }
        const acolumn = this.component.availableResourceCol;
        acolumn.classList.add('pointer-events-auto');
        acolumn.setAttribute('data-bind-class-toggle', 'hover-enabled:{{g_ResourceAllocationModel.selectedResource}}!=-1');
        acolumn.addEventListener('engine-input', this.targetInputListener);
        for (const scrollable of acolumn.querySelectorAll("fxs-scrollable")) {
            scrollable.addEventListener('engine-input', this.targetInputListener);
        }
    }
    beforeDetach() { }
    afterDetach() { }
    onAttributeChanged(_name, _prev, _next) { }
    onResourceInput(event) {
        const v = event.detail;
        if (v.status == InputActionStatuses.FINISH && v.name == "mousebutton-middle") {
            this.component.onAssignedResourceActivate(event);
            this.component.onUnassignActivated(event);
        }
    }
    onTargetInput(event) {
        const v = event.detail;
        if (v.status == InputActionStatuses.FINISH && v.name == "mousebutton-left") {
            this.component.onUnassignActivated(event);
        }
    }
}
Controls.decorate('screen-resource-allocation', (component) => new bzScreenResourceAllocation(component));

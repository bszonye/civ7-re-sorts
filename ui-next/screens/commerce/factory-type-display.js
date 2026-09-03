import { template, insert } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { useContext, createComponent, Show, mergeProps, createMemo } from '../../../../core/vendor/solid-js/dist/solid.js';
import { ComponentID } from '../../../../core/ui/utilities/utilities-component-id.js';
import { AudioContextProvider } from '../../../../core/ui-next/components/audio-context-provider.js';
import { Icon } from '../../../../core/ui-next/components/icon.js';
import { ImageButton } from '../../../../core/ui-next/components/image-button.js';
import { Tooltip } from '../../../../core/ui-next/components/tooltip.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { HotkeyContext } from '../../../../core/ui-next/services/hotkey.js';
import { IsControllerActive } from '../../../../core/ui-next/services/input.js';
import { useCommerceScreenContext } from './commerce-screen-model.js';
import { ResourceTooltip } from '../../tooltips/resource-tooltip.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-row items-center h-10"><div class="flex flex-row items-center p-1 bg-black rounded-lg"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="size-8 mr-1"></div>`);
const FactoryTypeDisplayComponent = (props) => {
  const model = useCommerceScreenContext();
  const cityIsSelectedForEditing = () => ComponentID.isMatch(model.selectedSettlementId() ?? null, props.cityID);
  const hotkeyContext = useContext(HotkeyContext);
  const imageButtonData = {
    imageData: {
      base: "url(blp:resource_return_button_default.png)",
      focus: "url(blp:resource_return_button_hover.png)"
    },
    size: "7"
  };
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
    insert(_el$, createComponent(Tooltip.Text, {
      get text() {
        return props.isProducingFactoryResource ? "LOC_COMMERCE_FACTORY_RESOURCES_LABEL" : "LOC_COMMERCE_FACTORY_RESOURCES_LABEL_NO_PRODUCTION";
      },
      get args() {
        return [props.resource?.resourceName || ""];
      },
      get children() {
        return createComponent(Icon, {
          "class": "size-8",
          name: "url(blp:restype_factory_v2.png)",
          isUrl: true
        });
      }
    }), _el$2);
    insert(_el$2, createComponent(Show, {
      get when() {
        return props.isProducingFactoryResource && props.resource;
      },
      get fallback() {
        return [_tmpl$2(), createComponent(ImageButton, mergeProps(imageButtonData, {
          disabled: true
        }))];
      },
      children: (resource) => [createComponent(ResourceTooltip, mergeProps(resource, {
        get children() {
          return createComponent(Icon, {
            "class": "size-8 mr-1",
            get name() {
              return resource().resourceIcon;
            },
            isUrl: true
          });
        }
      })), createComponent(AudioContextProvider, {
        segment: "ReturnResources",
        get children() {
          return createComponent(Show, {
            get when() {
              return props.unassignResourceTooltip;
            },
            get fallback() {
              return createComponent(ImageButton, mergeProps(imageButtonData, {
                get disableFocus() {
                  return createMemo(() => !!IsControllerActive())() && !cityIsSelectedForEditing();
                },
                get disabled() {
                  return !model.isSlottingAvailable || model.selectedResource().resourceValue !== -1;
                },
                onFocus: () => model.setFocusedResource({
                  resourceValue: -1,
                  cityID: void 0
                }),
                onActivate: () => model.clearFactoryResources(props.cityID)
              }));
            },
            children: (tooltipText) => createComponent(Tooltip.Text, {
              get text() {
                return tooltipText();
              },
              get children() {
                return createComponent(ImageButton, mergeProps(imageButtonData, {
                  get disableFocus() {
                    return createMemo(() => !!IsControllerActive())() && !cityIsSelectedForEditing();
                  },
                  get disabled() {
                    return !model.isSlottingAvailable || model.selectedResource().resourceValue !== -1;
                  },
                  onFocus: () => {
                    model.setFocusedResource({
                      resourceValue: -1,
                      cityID: void 0
                    });
                    delayByFrame(() => {
                      hotkeyContext.registerNavtray("accept", tooltipText());
                    });
                  },
                  onBlur: () => {
                    hotkeyContext.unregisterNavtray("accept");
                  },
                  onActivate: () => model.clearFactoryResources(props.cityID)
                }));
              }
            })
          });
        }
      })]
    }));
    return _el$;
  })();
};
const FactoryTypeDisplay = ComponentRegistry.register({
  name: "FactoryTypeDisplay",
  createInstance: FactoryTypeDisplayComponent
});

export { FactoryTypeDisplay };
//# sourceMappingURL=factory-type-display.js.map

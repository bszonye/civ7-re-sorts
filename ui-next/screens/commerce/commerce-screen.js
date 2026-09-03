import '../../../../core/vendor/solid-js/web/dist/web.js';
import { createMemo, onMount, createComponent, mergeProps, Show } from '../../../../core/vendor/solid-js/dist/solid.js';
import { defineLegacyComponent } from '../../../../core/ui-next/components/fxs-solid-component.js';
import { Tab } from '../../../../core/ui-next/components/tab.js';
import { useAudio } from '../../../../core/ui-next/services/audio-support.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { useLocalPlayerId } from '../../../../core/ui-next/utilities/game-core-utilities.js';
import { ScreenFrame } from '../../components/screen-frame.js';
import { EmpireResourceContainer } from './commerce-screen-empire-tab.js';
import { createCommerceScreenModel, CommerceScreenContext } from './commerce-screen-model.js';
import { CommerceResourcesContainer } from './commerce-screen-resources-tab.js';
import { TradeRoutesContainer } from './commerce-screen-trade-tab.js';
import { TreasureResourceContainer } from './commerce-screen-treasure-tab.js';
import style from './commerce-screen.scss.js';

const CommerceScreenComponent = (_props) => {
  const model = createCommerceScreenModel();
  const audioTrigger = useAudio("CommerceScreenPopup");
  const localPlayerId = useLocalPlayerId();
  const civName = createMemo(() => {
    const player = Players.get(localPlayerId());
    if (!player) {
      return "";
    }
    const civDefinition = GameInfo.Civilizations.lookup(player.civilizationType);
    if (!civDefinition) {
      return "";
    }
    return Locale.compose(civDefinition.Name);
  });
  onMount(() => {
    audioTrigger("popup-open");
  });
  const handleOnClosing = () => {
    audioTrigger("popup-close");
  };
  const title = createMemo(() => {
    return Locale.compose("LOC_COMMERCE_SCREEN_TITLE", civName());
  });
  function onContextChanged(activatedElement, _deactivatedElement) {
    if (activatedElement.nodeName.toLocaleLowerCase() === "screen-resource-allocation") {
      Input.setActiveContext(InputContext.Shell);
    }
  }
  return createComponent(CommerceScreenContext.Provider, {
    value: model,
    get children() {
      return createComponent(ScreenFrame, {
        name: "Commerce-Screen",
        panelContext: "screen-resource-allocation",
        audioContext: "CommerceScreen",
        get ornatePanelData() {
          return model.data.ornatePanelData;
        },
        get title() {
          return title();
        },
        onClosing: handleOnClosing,
        onContextChanged,
        get children() {
          return createComponent(Tab, {
            "class": "w-full flex flex-col flex-auto pointer-events-auto relative",
            get onTabChanged() {
              return model.onTabChanged;
            },
            get children() {
              return [createComponent(Tab.TabList, {
                "class": "w-187 self-center text-base font-base",
                nextHotkey: "nav-next",
                previousHotkey: "nav-previous"
              }), createComponent(Tab.Output, {}), createComponent(Tab.Item, {
                name: "Resources",
                title: () => "LOC_UI_RESOURCE_ALLOCATION_TITLE",
                body: () => createComponent(CommerceResourcesContainer, mergeProps(() => model.data.resourceTabData))
              }), createComponent(Tab.Item, {
                name: "Trade",
                title: () => "LOC_COMMERCE_TRADE_ROUTE_TAB",
                body: () => createComponent(TradeRoutesContainer, mergeProps(() => model.data.tradeRouteTabData))
              }), createComponent(Tab.Item, {
                name: "Empire",
                title: () => "LOC_RESOURCECLASS_EMPIRE_NAME",
                body: () => createComponent(EmpireResourceContainer, mergeProps(() => model.data.empireTabData))
              }), createComponent(Show, {
                get when() {
                  return Game.age == Database.makeHash("AGE_EXPLORATION");
                },
                get children() {
                  return createComponent(Tab.Item, {
                    name: "Treasure",
                    title: () => "LOC_RESOURCECLASS_TREASURE_NAME",
                    body: () => createComponent(TreasureResourceContainer, mergeProps(() => model.data.treasureTabData))
                  });
                }
              })];
            }
          });
        }
      });
    }
  });
};
const CommerceScreen = ComponentRegistry.register({
  name: "CommerceScreen",
  styles: [style],
  createInstance: CommerceScreenComponent
});
defineLegacyComponent("screen-resource-allocation", {
  classNames: ["fullscreen"]
}, () => {
  Input.setActiveContext(InputContext.Shell);
  return createComponent(CommerceScreen, {});
});

export { CommerceScreen };
//# sourceMappingURL=commerce-screen.js.map

/**
 * model-resource-allocation.ts
 * @copyright 2022-2023, Firaxis Games
 * @description Resource Allocation data model
 */

import CityYields, { CityYieldData } from '/base-standard/ui/utilities/utilities-city-yields.js';
import ActionHandler from '/core/ui/input/action-handler.js';
import { ComponentID } from '/core/ui/utilities/utilities-component-id.js'
import UpdateGate from '/core/ui/utilities/utilities-update-gate.js';

export interface ResourceEntry {
	selected: boolean;
	disabled: boolean;
	queued: boolean;
	bonusResourceSlots: number;
	type: string;
	classType: string;
	classTypeIcon: string | null;
	name: string;
	origin: string;
	bonus: string;
	value: number;
	count: number;
	isInTradeNetwork: boolean;
	isBeingRazed: boolean;
	canSpawnTreasureFleet: boolean;
}

export interface EmptySlot {
	tooltip: string;
	id: ComponentID;
}

export interface CityEntry {
	name: string;
	settlementType: string;
	settlementIcon: string;
	settlementTypeName: string,
	settlementAdditionalInfo: string;
	hasFactory: boolean;
	hasFactorySlot: boolean;
	hasTreasureResources: boolean;
	treasureVictoryPoints: number,
	globalTurnsUntilTreasureGenerated: number;
	turnsUntilTreasureGenerated: string,
	id: ComponentID;
	yields: CityYieldData[];
	currentResources: ResourceEntry[];
	visibleResources: ResourceEntry[];
	treasureResources: ResourceEntry[];
	factoryResources: ResourceEntry[];
	queuedResources: ResourceEntry[];
	emptySlots: EmptySlot[];
	allocatedResources: number;
	resourceCap: number;
	isInTradeNetwork: boolean;
	isBeingRazed: boolean;
}

class ResourceAllocationModel {
	private onUpdate?: (model: ResourceAllocationModel) => void;

	private _selectedResource: number = -1;
	private _hasSelectedAssignedResource: boolean = false;
	private _selectedResourceClass: string | null = null;
	private selectedCityID: ComponentID = ComponentID.getInvalidID();

	// All resource definitions for this player keyed by resource location value
	private allResources: Map<number, ResourceDefinition> = new Map();
	private isAllResourcesInit: boolean = false;

	// All queued resources values mapped to the city ComponentID they should be applied to
	private queuedResources: Map<number, ComponentID> = new Map();

	private _latestResource: ResourceEntry | null = null;
	private _empireResources: ResourceEntry[] = [];
	private _uniqueEmpireResources: ResourceEntry[] = [];
	private _allAvailableResources: ResourceEntry[] = [];
	private _availableBonusResources: ResourceEntry[] = [];
	private _availableResources: ResourceEntry[] = [];
	private _availableFactoryResources: ResourceEntry[] = [];
	private _treasureResources: ResourceEntry[] = [];
	private _uniqueTreasureResources: ResourceEntry[] = [];
	private _availableCities: CityEntry[] = [];
	private _selectedCityResources: CityEntry | null = null;

	shouldShowSelectedCityResources: boolean = false;
	shouldShowEmpireResourcesDetailed: boolean = false;
	shouldShowAvailableResources: boolean = true;

	_isResourceAssignmentLocked: boolean = false;

	private updateGate: UpdateGate = new UpdateGate(() => { this.update(); });

	constructor() {
		this.updateGate.call('constructor');

		engine.on('ResourceAssigned', this.onResourceAssigned, this);
		engine.on('ResourceUnassigned', this.onResourceUnassigned, this);
		engine.on('ResourceCapChanged', this.onResourceCapChanged, this);
		engine.on('TradeRouteAddedToMap', this.onTradeRouteAddedToMap, this);
	}

	set updateCallback(callback: (model: ResourceAllocationModel) => void) {
		this.onUpdate = callback;
	}

	get playerId(): PlayerId {
		return GameContext.localPlayerID;
	}

	get empireResources(): ResourceEntry[] {
		return this._empireResources;
	}

	get uniqueEmpireResources(): ResourceEntry[] {
		return this._uniqueEmpireResources;
	}

	get allAvailableResources(): ResourceEntry[] {
		return this._allAvailableResources;
	}

	get availableResources(): ResourceEntry[] {
		return this._availableResources;
	}

	get availableBonusResources(): ResourceEntry[] {
		return this._availableBonusResources;
	}

	get availableFactoryResources(): ResourceEntry[] {
		return this._availableFactoryResources;
	}

	get treasureResources(): ResourceEntry[] {
		return this._treasureResources;
	}

	get uniqueTreasureResources(): ResourceEntry[] {
		return this._uniqueTreasureResources;
	}

	get availableCities(): CityEntry[] {
		return this._availableCities;
	}

	get selectedCityResources(): CityEntry | null {
		return this._selectedCityResources;
	}

	get latestResource(): ResourceEntry | null {
		return this._latestResource;
	}

	get selectedResource(): number {
		return this._selectedResource;
	}

	get hasSelectedAssignedResource(): boolean {
		return this._hasSelectedAssignedResource;
	}

	get showUnassignResourceSlot(): boolean {
		return this._hasSelectedAssignedResource && !ActionHandler.isGamepadActive;
	}

	get selectedResourceClass(): string | null {
		return this._selectedResourceClass;
	}

	get isResourceAssignmentLocked(): boolean {
		return this._isResourceAssignmentLocked;
	}

	hasSelectedResource(): boolean {
		return (this._selectedResource != -1);
	}

	hasQueuedResources(): boolean {
		return (this.queuedResources.size > 0);
	}

	private update() {
		// If the game is in an environment where the player cannot interact (e.g., auto-play); early out.
		if ((GameContext.localObserverID == PlayerIds.NO_PLAYER) || (GameContext.localObserverID == PlayerIds.OBSERVER_ID) || Autoplay.isActive) {
			return;
		}

		this._empireResources = [];
		this._uniqueEmpireResources = [];
		this._allAvailableResources = [];
		this._availableBonusResources = [];
		this._availableResources = [];
		this._availableFactoryResources = [];
		this._treasureResources = [];
		this._uniqueTreasureResources = [];
		this._availableCities = [];

		const localPlayerID: PlayerId = GameContext.localPlayerID;
		const localPlayer: PlayerLibrary | null = Players.get(localPlayerID);
		if (!localPlayer) {
			console.error(`model-resource-allocation: Failed to retrieve PlayerLibrary for Player ${localPlayerID}`);
			return;
		}

		const playerResources: PlayerResources | undefined = localPlayer.Resources;
		if (!playerResources) {
			console.error(`model-resource-allocation: Failed to retrieve Resources for Player ${localPlayerID}`);
			return;
		}

		this._isResourceAssignmentLocked = playerResources.isRessourceAssignmentLocked();

		// Look up and cache resource definitions
		let nextAllResources = playerResources.getResources().map((resource: UniqueResourceValue) => {
			const resourceDefinition: ResourceDefinition | null = GameInfo.Resources.lookup(resource.uniqueResource.resource);
			if (resourceDefinition) {
				return [resource.value, resourceDefinition]
			} else {
				console.error(`model-resource-allocation: Failed to find resource definition for location ${resource.value}`);
				return;
			}
		});
		nextAllResources = nextAllResources.filter(resource => !!resource);
		const addedResources = (nextAllResources as Array<[number, ResourceDefinition]>).filter(([value = 0, _resource = {}]) => !this.allResources.has(value));
		const removedResources = Array.from(this.allResources).filter(([value, _resource]) => !nextAllResources.find(resource => resource?.[0] == value));
		this.allResources.clear();

		// change the latest resource only if we have initialized the allResources, and that a resource was added or the current latest was removed
		if (this.isAllResourcesInit && (addedResources.length || removedResources.length && removedResources.pop()?.[0] == this.latestResource?.value)) {
			const [latestResourceValue = 0, { BonusResourceSlots = 0, ResourceType = "", Name = "", Tooltip = "" } = {}] = addedResources.pop() ?? [];
			this._latestResource = {
				selected: latestResourceValue == this._selectedResource,
				disabled: false,
				queued: false,
				bonusResourceSlots: BonusResourceSlots,
				type: ResourceType,
				classType: "",
				classTypeIcon: "",
				name: Name,
				origin: "",
				bonus: Tooltip,
				value: latestResourceValue,
				count: 1,
				isInTradeNetwork: true,
				isBeingRazed: false,
				canSpawnTreasureFleet: false
			}
		}

		(nextAllResources as Array<[number, ResourceDefinition]>).forEach(resource => this.allResources.set(resource[0], resource[1]));
		this.isAllResourcesInit = true;

		const playerCities: PlayerCities | undefined = localPlayer.Cities;
		if (!playerCities) {
			console.error(`model-resource-allocation: Failed to retrieve Cities for Player ${localPlayerID}`);
			return;
		}

		playerCities.getCityIds().forEach((cityID: ComponentID) => {
			const city: City | null = Cities.get(cityID);

			if (city) {
				const cityResources: CityResources | undefined = city.Resources;
				const cityTrade: CityTrade | undefined = city.Trade;

				if (cityResources && cityTrade) {
					const currentResources: ResourceEntry[] = [];
					const visibleResources: ResourceEntry[] = [];
					const treasureResources: ResourceEntry[] = [];
					const factoryResources: ResourceEntry[] = [];

					if (city.Resources) {
						city.Resources.getAssignedResources().forEach((resource: UniqueResourceValue) => {
							const resourceDefinition: ResourceDefinition | undefined = this.allResources.get(resource.value);

							// Count the number of repeated resources per settlement
							let resourceCount: number = 0;
							city.Resources?.getAssignedResources().forEach((resourceToCount: UniqueResourceValue) => {
								const resourceToCountDefinition: ResourceDefinition | undefined = this.allResources.get(resourceToCount.value);
								if (resourceToCountDefinition) {

									if (resourceToCountDefinition?.Name === resourceDefinition?.Name) {
										resourceCount++;
									}
								}
							})

							// Push all resources into the currentResources array, since this array is used for other resource logic
							if (resourceDefinition) {

								const originCityID = Game.Resources.getOriginCity(resource.value);
								const originCity = Cities.get(originCityID);

								const isInTradeNetwork = this.inNetwork(localPlayerID, city);

								let tooltipText = "";

								if (originCity?.name) {
									tooltipText = Locale.stylize("{1_Name: upper}[N]{2_Class}[N]{3_Tooltip}[N]{4_Origin}[N][STYLE: text-negative][/STYLE]",
										resourceDefinition.Name,
										Locale.compose("LOC_RESOURCECLASS_TOOLTIP_NAME", Locale.compose("LOC_" + resourceDefinition.ResourceClassType + "_NAME")),
										resourceDefinition.Tooltip,
										Locale.compose("LOC_UI_RESOURCE_ORIGIN", originCity?.name));
								} else {
									tooltipText = Locale.stylize("{1_Name: upper}[N]{2_Class}[N]{3_Tooltip}",
										resourceDefinition.Name,
										Locale.compose("LOC_RESOURCECLASS_TOOLTIP_NAME", Locale.compose("LOC_" + resourceDefinition.ResourceClassType + "_NAME")),
										resourceDefinition.Tooltip);
								}

								currentResources.push({
									selected:
										resource.value == this._selectedResource
										&& isInTradeNetwork
										&& !this._isResourceAssignmentLocked
										&& !city.isBeingRazed,
									disabled: !!this.selectedResourceClass && resource.value != this.selectedResource,
									queued: false,
									bonusResourceSlots: resourceDefinition.BonusResourceSlots,
									type: resourceDefinition.ResourceType,
									name: resourceDefinition.Name,
									classType: resourceDefinition.ResourceClassType,
									classTypeIcon: UI.getIcon(resourceDefinition.ResourceClassType),
									origin: originCity?.name ?? "",
									bonus: tooltipText,
									value: resource.value,
									count: resourceCount,
									isInTradeNetwork: isInTradeNetwork,
									isBeingRazed: city.isBeingRazed,
									canSpawnTreasureFleet: false
								})

								// Modern Age Resources
								// Factory Resources are assigned to its own array, and the rest are assigned to visibleResources.
								// Push a single resource entry because a count will be displayed if it repeats.
								if (Game.age == Game.getHash("AGE_MODERN")) {
									if (resourceDefinition.ResourceClassType == "RESOURCECLASS_FACTORY") {
										if (!factoryResources.some(resourceToFind => resourceToFind.type === resourceDefinition.ResourceType)) {
											{
												factoryResources.push({
													selected:
														resource.value == this._selectedResource
														&& isInTradeNetwork
														&& !this._isResourceAssignmentLocked
														&& !city.isBeingRazed,
													disabled: !!this.selectedResourceClass && resource.value != this.selectedResource,
													queued: false,
													bonusResourceSlots: resourceDefinition.BonusResourceSlots,
													type: resourceDefinition.ResourceType,
													name: resourceDefinition.Name,
													classType: resourceDefinition.ResourceClassType,
													classTypeIcon: UI.getIcon(resourceDefinition.ResourceClassType),
													origin: originCity?.name ?? "",
													bonus: tooltipText,
													value: resource.value,
													count: resourceCount,
													isInTradeNetwork: isInTradeNetwork,
													isBeingRazed: city.isBeingRazed,
													canSpawnTreasureFleet: false
												})
											}
										}
									}
									else if (!visibleResources.some(resourceToFind => resourceToFind.type === resourceDefinition.ResourceType)) {
										visibleResources.push({
											selected:
												resource.value == this._selectedResource
												&& isInTradeNetwork
												&& !this._isResourceAssignmentLocked
												&& !city.isBeingRazed,
											disabled: !!this.selectedResourceClass && resource.value != this.selectedResource,
											queued: false,
											bonusResourceSlots: resourceDefinition.BonusResourceSlots,
											type: resourceDefinition.ResourceType,
											name: resourceDefinition.Name,
											classType: resourceDefinition.ResourceClassType,
											classTypeIcon: UI.getIcon(resourceDefinition.ResourceClassType),
											origin: originCity?.name ?? "",
											bonus: tooltipText,
											value: resource.value,
											count: resourceCount,
											isInTradeNetwork: isInTradeNetwork,
											isBeingRazed: city.isBeingRazed,
											canSpawnTreasureFleet: false
										})
									}
								}

								// Antiquity Age Resources
								else {
									// Push a single resource entry to the visibleResources array so they don't repeat.
									// Don't add resources to the array if they're already in the Factory Resources.
									// This is the array that will be shown to the player
									if (!visibleResources.some(resourceToFind => resourceToFind.type === resourceDefinition.ResourceType)) {
										visibleResources.push({
											selected:
												resource.value == this._selectedResource
												&& isInTradeNetwork
												&& !this._isResourceAssignmentLocked
												&& !city.isBeingRazed,
											disabled: !!this.selectedResourceClass && resource.value != this.selectedResource,
											queued: false,
											bonusResourceSlots: resourceDefinition.BonusResourceSlots,
											type: resourceDefinition.ResourceType,
											name: resourceDefinition.Name,
											classType: resourceDefinition.ResourceClassType,
											classTypeIcon: UI.getIcon(resourceDefinition.ResourceClassType),
											origin: originCity?.name ?? "",
											bonus: tooltipText,
											value: resource.value,
											count: resourceCount,
											isInTradeNetwork: isInTradeNetwork,
											isBeingRazed: city.isBeingRazed,
											canSpawnTreasureFleet: false
										})
									}
								}
							}

						})
					}

					const countAssignedResources: number = cityResources.getTotalCountAssignedResources();
					const assignedResourcesCap: number = cityResources.getAssignedResourcesCap();
					const emptySlotsNeeded: number = assignedResourcesCap - currentResources.length;
					let settlementTypeString: string = "City";
					let settlementAdditionalInfo: string = "";
					let hasFactory: boolean = false;
					let hasFactorySlot: boolean = false;
					let hasTreasureResources: boolean = false;
					let countTreasureResources: number = cityResources.getNumTreasureFleetResources();
					const iGlobalTurnsUntilTreasureGenerated: number = cityResources.getGlobalTurnsUntilTreasureGenerated();
					const iTurnsUntilTreasureGenerated: number = cityResources.getTurnsUntilTreasureGenerated();
					const iAutoTreasureFleetValue: number = cityResources.getAutoTreasureFleetValue();
					if (iAutoTreasureFleetValue > 0) {
						countTreasureResources = iAutoTreasureFleetValue;
						hasTreasureResources = true;
					}
					let uiCurrentAge = Game.age;
					// ANTIQUITY
					if (uiCurrentAge == Game.getHash("AGE_ANTIQUITY")) {

						if (city.isCapital) {
							settlementTypeString = "Capital";
						}
						else if (city.isTown) {
							settlementTypeString = "Town";
						}
					}
					// EXPLORATION
					// *** EFB: temporary.  For now just append TreasureInfo on to "settlementAdditionalInfo". Very kludgy!
					else if (uiCurrentAge == Game.getHash("AGE_EXPLORATION")) {
						const bTreasureTechPrereqMet: boolean = cityResources.isTreasureProgressionTreeNodePrereqMet();
						const bTreasureConstructiblePrereqMet: boolean = cityResources.isTreasureConstructiblePrereqMet();
						if (city.isCapital) {
							settlementTypeString = "Capital";
						}
						else if (city.isTown) {
							settlementTypeString = "Town";
						}
						if (city.isDistantLands) {
							if (!bTreasureTechPrereqMet) {
								settlementAdditionalInfo = settlementAdditionalInfo + "_Needs_Shipbuilding";
							} else if (!bTreasureConstructiblePrereqMet) {
								settlementAdditionalInfo = settlementAdditionalInfo + "_Needs_FishingQuay";

								// This Settlement meets the requirements.
							} else if (countTreasureResources > 0) {
								settlementAdditionalInfo = settlementAdditionalInfo + "_" + countTreasureResources.toString() + "_VP_" + iTurnsUntilTreasureGenerated.toString() + "_Turns";
								hasTreasureResources = true;
								// Populate the Treasure Resources Array
								// Find the Treasure Resources within the Local Resources
								cityResources.getLocalResources().forEach((localResource: UniqueResourceValue) => {
									const localResourceDefinition: ResourceDefinition | null = GameInfo.Resources.lookup(localResource.uniqueResource.resource);
									if (localResourceDefinition) {

										const tooltipText = Locale.stylize("{1_Name: upper}[N]{2_Class}[N]{3_Tooltip}[N]{4_Origin}",
											localResourceDefinition.Name,
											Locale.compose("LOC_RESOURCECLASS_TOOLTIP_NAME", Locale.compose("LOC_" + localResourceDefinition.ResourceClassType + "_NAME")),
											localResourceDefinition.Tooltip,
											Locale.compose("LOC_UI_RESOURCE_ORIGIN", city.name)
										);

										if (localResourceDefinition.ResourceClassType === "RESOURCECLASS_TREASURE") {
											treasureResources.push({
												selected: false,

												disabled: !!this.selectedResourceClass && localResource.value != this.selectedResource,
												queued: false,
												bonusResourceSlots: 0,
												type: localResourceDefinition.ResourceType,
												name: localResourceDefinition.Name,
												classType: "RESOURCECLASS_TREASURE",
												classTypeIcon: UI.getIcon("RESOURCECLASS_TREASURE"),
												origin: city.name,
												bonus: tooltipText,
												value: localResource.value,
												count: 1,
												isInTradeNetwork: true,
												isBeingRazed: city.isBeingRazed,
												canSpawnTreasureFleet: false
											})
										}
									}
								})
							}
						}
					}
					// MODERN
					// *** EFB: temporary.  For now just append RR and Factory info on to "settlementAdditionalInfo". Very kludgy!
					else if (uiCurrentAge == Game.getHash("AGE_MODERN")) {
						if (city.isCapital) {
							settlementTypeString = "Capital";
						}
						else if (city.isTown) {
							settlementTypeString = "Town";
						}
						const bTreasureConstructiblePrereqMet: boolean = cityResources.isTreasureConstructiblePrereqMet();
						const countFactoryResources: number = cityResources.getNumFactoryResources();
						const factoryResourceType: ResourceType = cityResources.getFactoryResource();
						if (!bTreasureConstructiblePrereqMet) {
							settlementAdditionalInfo = settlementAdditionalInfo + "_No_Factory";
						}
						else if (countFactoryResources == 0) {
							settlementAdditionalInfo = settlementAdditionalInfo + "_Empty_Factory";
							hasFactory = true;
							if (emptySlotsNeeded > 0) {
								hasFactorySlot = true;
							}
						}
						else {
							let factoryTypeString: string = "_UnknownFactory_";
							const resourceInfo = GameInfo.Resources.lookup(factoryResourceType);
							if (resourceInfo != null) {
								factoryTypeString = "_" + Locale.compose(resourceInfo.Name) + "Factory_";
								hasFactory = true;
								hasFactorySlot = false;
							}
							settlementAdditionalInfo = settlementAdditionalInfo + factoryTypeString + countFactoryResources.toString() + "_VP";
						}
					}

					// Keep an array of empty slots useful for data binding
					// TODO 'tooltip' isn't used right now but intended to show information like warnings or details about the slot type
					const emptySlots: EmptySlot[] = [];
					for (let i = 0; i < emptySlotsNeeded; i++) {
						emptySlots.push({
							tooltip: "",
							id: city.id
						})
					}

					let settlementIconString: string = "";
					let settlementTypeName: string = "";
					switch (settlementTypeString) {
						case 'Capital':
							settlementIconString = 'res_capital';
							settlementTypeName = "LOC_CAPITAL_SELECT_PROMOTION_" + settlementTypeString.toUpperCase();
							break;

						case 'City':
							settlementIconString = 'Yield_Cities';
							settlementTypeName = "LOC_CAPITAL_SELECT_PROMOTION_" + settlementTypeString.toUpperCase();
							break;

						case 'Town':
							settlementIconString = 'Yield_Towns';
							settlementTypeName = "LOC_CAPITAL_SELECT_PROMOTION_NONE"
							break;

						default:
							settlementIconString = 'Yield_Cities';
							settlementTypeName = "LOC_CAPITAL_SELECT_PROMOTION_NONE"
							break;
					}

					const yields = CityYields.getCityYieldDetails(cityID);
					const isInTradeNetwork = this.inNetwork(localPlayerID, city);

					const newCityEntry: CityEntry = {
						name: city.name,
						id: city.id,
						currentResources: currentResources,
						visibleResources: visibleResources,
						treasureResources: treasureResources,
						factoryResources: factoryResources,
						queuedResources: [],
						emptySlots: emptySlots,
						settlementType: settlementTypeString,
						settlementIcon: settlementIconString,
						settlementTypeName: settlementTypeName,
						settlementAdditionalInfo: settlementAdditionalInfo,
						allocatedResources: countAssignedResources,
						resourceCap: assignedResourcesCap,
						hasTreasureResources: hasTreasureResources,
						treasureVictoryPoints: countTreasureResources,
						globalTurnsUntilTreasureGenerated: iGlobalTurnsUntilTreasureGenerated,
						turnsUntilTreasureGenerated: Locale.compose("LOC_UI_RESOURCE_TREASURE_TURNS_LEFT", iTurnsUntilTreasureGenerated),
						hasFactory: hasFactory,
						hasFactorySlot: hasFactorySlot,
						yields: yields,
						isInTradeNetwork: isInTradeNetwork,
						isBeingRazed: city.isBeingRazed
					};

					if (settlementTypeString == 'Capital') {
						this._availableCities.unshift(newCityEntry);
					}
					else {
						this._availableCities.push(newCityEntry);
					}
				}
			}
		});

		this.allResources.forEach((resourceDefinition: ResourceDefinition, resourceValue: number) => {
			// Only show resources that haven't been assigned
			for (let i: number = 0; i < this._availableCities.length; i++) {
				const cityEntry: CityEntry = this._availableCities[i];

				// Find resources that have already been assigned.
				for (let j: number = 0; j < cityEntry.currentResources.length; j++) {
					if (cityEntry.currentResources[j].value == resourceValue) {
						// This resource is already assigned to a city
						return;
					}
				}
			}

			const originCityID = Game.Resources.getOriginCity(resourceValue);
			const originCity = Cities.get(originCityID);
			let isInTradeNetwork = false;
			let isBeingRazed = false;
			if (originCity) {
				isInTradeNetwork = this.inNetwork(localPlayerID, originCity);
				isBeingRazed = originCity.isBeingRazed;
			}

			let tooltipText = "";

			if (originCity?.name) {
				tooltipText = Locale.stylize("{1_Name: upper}[N]{2_Class}[N]{3_Tooltip}[N]{4_Origin}[N][STYLE: text-negative][/STYLE]",
					resourceDefinition.Name,
					Locale.compose("LOC_RESOURCECLASS_TOOLTIP_NAME", Locale.compose("LOC_" + resourceDefinition.ResourceClassType + "_NAME")),
					resourceDefinition.Tooltip,
					Locale.compose("LOC_UI_RESOURCE_ORIGIN", originCity?.name));
			} else {
				tooltipText = Locale.stylize("{1_Name: upper}[N]{2_Class}[N]{3_Tooltip}",
					resourceDefinition.Name,
					Locale.compose("LOC_RESOURCECLASS_TOOLTIP_NAME", Locale.compose("LOC_" + resourceDefinition.ResourceClassType + "_NAME")),
					resourceDefinition.Tooltip);
			}

			const isEmpireResource: boolean = resourceDefinition.ResourceClassType == "RESOURCECLASS_EMPIRE";
			const isFactoryResource: boolean = resourceDefinition.ResourceClassType == "RESOURCECLASS_FACTORY";
			const isTreasureResource: boolean = resourceDefinition.ResourceClassType == "RESOURCECLASS_TREASURE";
			const isBonusResource: boolean = resourceDefinition.ResourceClassType == "RESOURCECLASS_BONUS";

			if (!isEmpireResource && !isTreasureResource) {
				let unassignedYieldsTooltip = "";
				GameInfo.Yields.forEach(yieldDefinition => {
					const unassignedBonus = playerResources.getUnassignedResourceYieldBonus(Database.makeHash(yieldDefinition.YieldType));
					if (unassignedBonus > 0) {
						unassignedYieldsTooltip += '[N]' + Locale.compose("LOC_BUILDING_PLACEMENT_YIELD_WITH_ICON", unassignedBonus, yieldDefinition.IconString, yieldDefinition.Name);
					}
				});

				if (unassignedYieldsTooltip != "") {
					unassignedYieldsTooltip = Locale.compose("LOC_RESOURCE_UNASSIGNED_BONUSES") + unassignedYieldsTooltip;
					tooltipText = tooltipText + Locale.stylize("[N]" + unassignedYieldsTooltip);
				}
			}

			const location = GameplayMap.getLocationFromIndex(resourceValue);
			const isDistantAndTreasure = isTreasureResource && localPlayer.isDistantLands(location)
			if (isDistantAndTreasure) {
				tooltipText = tooltipText + Locale.stylize("[N]" + Locale.compose("LOC_CAN_CREATE_TREASURE_FLEET"));
			}

			const resourceEntry: ResourceEntry = {
				selected:
					resourceValue == this._selectedResource
					&& isInTradeNetwork
					&& !this._isResourceAssignmentLocked
					&& !isBeingRazed,
				disabled: !!this.selectedResourceClass && resourceValue != this.selectedResource,
				queued: false,
				bonusResourceSlots: resourceDefinition.BonusResourceSlots,
				type: resourceDefinition.ResourceType,
				name: resourceDefinition.Name,
				classType: resourceDefinition.ResourceClassType,
				classTypeIcon: isDistantAndTreasure ? UI.getIcon('RESOURCECLASS_TREASURE_FLEET') : UI.getIcon(resourceDefinition.ResourceClassType),
				origin: originCity?.name ?? "",
				bonus: tooltipText,
				value: resourceValue,
				count: 0,
				isInTradeNetwork: isInTradeNetwork,
				isBeingRazed: isBeingRazed,
				canSpawnTreasureFleet: isDistantAndTreasure
			};

			// Array used to determine available resource selection.
			if (!isEmpireResource) {
				this._allAvailableResources.push(resourceEntry);
			}

			// Populate the Empire Resources
			if (isEmpireResource) {
				this._empireResources.push(resourceEntry);
			} else if (isFactoryResource && Game.age == Game.getHash("AGE_MODERN")) {
				this._availableFactoryResources.push(resourceEntry);
			} else if (isTreasureResource) {
				this._treasureResources.push(resourceEntry);
			} else if (isBonusResource) {
				this._availableBonusResources.push(resourceEntry);
			}
			else {
				this._availableResources.push(resourceEntry);
			}
		});

		this.setResourceCount(this._empireResources);
		this._uniqueEmpireResources = this.createUniqueResourceArray(this._empireResources);

		this.setResourceCount(this._treasureResources);
		this._uniqueTreasureResources = this.createUniqueResourceArray(this._treasureResources);

		if (this.shouldShowSelectedCityResources && ComponentID.isValid(this.selectedCityID)) {
			const cityEntry: CityEntry | undefined = this._availableCities.find(entry => ComponentID.isMatch(entry.id, this.selectedCityID));
			if (cityEntry) {
				this._selectedCityResources = cityEntry;
			} else {
				console.error(`model-resource-allocation: Failed to find CityEntry for selectedCityResources from ${ComponentID.toString(this.selectedCityID)}`);
			}
		}

		this.determineShowAvailableResources();

		if (this.onUpdate) {
			this.onUpdate(this);
		}
	}

	private setResourceCount(resourceArray: ResourceEntry[]) {
		for (const resource of resourceArray) {
			const count = resourceArray.filter((resourceToCount) => resourceToCount.type === resource.type && resourceToCount.canSpawnTreasureFleet === resource.canSpawnTreasureFleet);
			resource.count = count.length;
		}
	}

	private createUniqueResourceArray(resourceArray: ResourceEntry[]) {
		const uniqueResourceArray: ResourceEntry[] = [];

		for (const resource of resourceArray) {
			if (!uniqueResourceArray.find(resourceToFind => resourceToFind.type === resource.type && resourceToFind.canSpawnTreasureFleet === resource.canSpawnTreasureFleet)) {
				uniqueResourceArray.push(resource);
			}
		}
		return uniqueResourceArray;
	}

	private determineShowAvailableResources() {
		this.shouldShowAvailableResources =
			this.availableResources.length +
			this.availableBonusResources.length +
			this.availableFactoryResources.length
			> 0
			|| this._selectedResource != -1;
	}

	clearSelectedResource() {
		this._selectedResource = -1;
		this._hasSelectedAssignedResource = false;
		this._selectedResourceClass = null;
		this.determineShowAvailableResources();
		this.updateGate.call('clearResource');
	}

	selectAvailableResource(selectedResourceValue: number, selectedResourceClass: string) {
		// Check if we have an assigned resource already selected and
		// we want to move it back to the available pool
		const returnToPool: boolean = this.selectedResource != -1 && !this._allAvailableResources.some((availableResource: ResourceEntry) => {
			return this.selectedResource == availableResource.value;
		})
		if (returnToPool) {
			this.unassignResource(this._selectedResource);
		} else {
			this.selectResource(selectedResourceValue, selectedResourceClass);
		}
	}

	selectAssignedResource(selectedResourceValue: number, selectedResourceClass: string) {
		this._hasSelectedAssignedResource = true;
		this.selectResource(selectedResourceValue, selectedResourceClass);
	}

	private selectResource(selectedResourceValue: number, selectedResourceClass: string) {
		if (this._selectedResource == selectedResourceValue) {
			// If we select the same resource then deselect it
			this.clearSelectedResource();
		} else {
			this._selectedResource = selectedResourceValue;
			this._selectedResourceClass = selectedResourceClass;
		}

		this.updateGate.call('selectResource');
	}

	focusCity(selectedCityID: number) {
		const localPlayerID: PlayerId = GameContext.localPlayerID;
		const localPlayer: PlayerLibrary | null = Players.get(localPlayerID);
		if (!localPlayer) {
			console.error(`model-resource-allocation: Failed to retrieve PlayerLibrary for Player ${localPlayerID} when selecting a city.`);
			return;
		}

		const playerCities: PlayerCities | undefined = localPlayer.Cities;
		if (!playerCities) {
			console.error(`model-resource-allocation: Failed to retrieve Cities for Player ${localPlayerID} when selecting a city.`);
			return;
		}

		const cityID: ComponentID | undefined = playerCities.getCityIds().find(cityComponentID => cityComponentID.id == selectedCityID);
		if (!cityID) {
			console.error(`model-resource-allocation: Failed to find city ${selectedCityID} in playerCities.getCityIds()`);
			return;
		}

		this.selectedCityID = cityID;
		UI.Player.lookAtID(cityID);
	}

	selectCity(selectedCityID: number) {
		const localPlayerID: PlayerId = GameContext.localPlayerID;
		const localPlayer: PlayerLibrary | null = Players.get(localPlayerID);
		if (!localPlayer) {
			console.error(`model-resource-allocation: Failed to retrieve PlayerLibrary for Player ${localPlayerID} when selecting a city.`);
			return;
		}

		const playerCities: PlayerCities | undefined = localPlayer.Cities;
		if (!playerCities) {
			console.error(`model-resource-allocation: Failed to retrieve Cities for Player ${localPlayerID} when selecting a city.`);
			return;
		}

		const cityID: ComponentID | undefined = playerCities.getCityIds().find(cityComponentID => cityComponentID.id == selectedCityID);
		if (!cityID) {
			console.error(`model-resource-allocation: Failed to find city ${selectedCityID} in playerCities.getCityIds()`);
			return;
		}

		this.selectedCityID = cityID;
		UI.Player.lookAtID(cityID);

		if (this.hasSelectedResource()) {
			const location: float2 = GameplayMap.getLocationFromIndex(this._selectedResource);
			const args: Object = { Location: location, City: cityID.id };
			const result: OperationResult = Game.PlayerOperations.canStart(GameContext.localPlayerID, PlayerOperationTypes.ASSIGN_RESOURCE, args, false);
			if (result.Success) {
				Game.PlayerOperations.sendRequest(GameContext.localPlayerID, PlayerOperationTypes.ASSIGN_RESOURCE, args);
			}

			this.clearSelectedResource();
		}

		this.updateGate.call('selectCity');
	}

	updateResources() {
		this.updateGate.call('updateResources');
	}

	toggleMoreInfo() {
		this.shouldShowSelectedCityResources = !this.shouldShowSelectedCityResources;

		if (this.onUpdate) {
			this.onUpdate(this);
		}
	}

	toggleEmpireResourceDetails() {
		this.shouldShowEmpireResourcesDetailed = !this.shouldShowEmpireResourcesDetailed;

		if (this.onUpdate) {
			this.onUpdate(this);
		}
	}

	canMakeResourceAssignmentRequest(cityIdData: number) {
		const cityEntry: CityEntry | undefined = this._availableCities.find(entry => entry.id.id == cityIdData);

		if (this.hasSelectedResource()) {
			const location: float2 = GameplayMap.getLocationFromIndex(this._selectedResource);
			const args: Object = { Location: location, City: cityEntry?.id.id };
			const result: OperationResult = Game.PlayerOperations.canStart(GameContext.localPlayerID, PlayerOperationTypes.ASSIGN_RESOURCE, args, false);
			return result.Success;
		}
		return false;
	}

	unassignResource(selectedResourceValue: number) {
		const localPlayerID: PlayerId = GameContext.localPlayerID;
		const localPlayer: PlayerLibrary | null = Players.get(localPlayerID);
		if (!localPlayer) {
			console.error(`model-resource-allocation: Failed to retrieve PlayerLibrary for Player ${localPlayerID} when unassigning a resource.`);
			return;
		}

		// Find the location of the resource
		const location: float2 = GameplayMap.getLocationFromIndex(selectedResourceValue);

		// Find the city that this resource is currently assigned to
		let cityID: ComponentID = ComponentID.getInvalidID();
		this.availableCities.forEach((cityEntry: CityEntry) => {
			cityEntry.currentResources.forEach((resourceEntry: ResourceEntry) => {
				if (resourceEntry.value == selectedResourceValue) {
					cityID = cityEntry.id;
				}
			})
		})

		if (ComponentID.isInvalid(cityID)) {
			console.error(`model-resource-allocation: Failed to retrieve City for from location of an assigned resource when unassigning a resource.`);
			return;
		}

		const args: object = { Location: location, City: cityID.id, Action: PlayerOperationParameters.Deactivate };
		const result: OperationResult = Game.PlayerOperations.canStart(localPlayer.id, PlayerOperationTypes.ASSIGN_RESOURCE, args, false);
		if (result.Success) {
			Game.PlayerOperations.sendRequest(localPlayer.id, PlayerOperationTypes.ASSIGN_RESOURCE, args);
		}

		this.clearSelectedResource();
	}

	private isEntrySupportSelectingResource(entry: CityEntry) {
		switch (this._selectedResourceClass) {
			case "RESOURCECLASS_FACTORY":
				return entry.hasFactory;
			case "RESOURCECLASS_CITY":
				return entry.settlementType != "Town";
			default:
				return true;
		}
	}

	isCityEntryDisabled(entryEntryId: number) {
		const cityEntry: CityEntry | undefined = this._availableCities.find(entry => entry.id.id == entryEntryId);

		if (!cityEntry) { return true; }

		const isSelectedResourceAlreadyAssignedToCity: boolean = cityEntry.currentResources.some(({ value }) => value == this._selectedResource);
		const isAllocatedRessourcesFull: boolean = cityEntry.emptySlots.length == 0;

		return this.hasSelectedResource() && (isSelectedResourceAlreadyAssignedToCity || isAllocatedRessourcesFull || !this.isEntrySupportSelectingResource(cityEntry));
	}

	private onResourceAssigned(_event: ResourceAssigned_EventData) {
		this.updateGate.call('onResourceAssigned');
	}

	private onResourceUnassigned(_event: ResourceUnassigned_EventData) {
		this.updateGate.call('onResourceUnassigned');
	}

	private onResourceCapChanged() {
		this.updateGate.call('onResourceCapChanged');
	}

	private onTradeRouteAddedToMap() {
		this.updateGate.call('onTradeRouteAddedToMap');
	}

	private inNetwork(playerID: PlayerId, city: City) {
		// If this is a foreign player, we have a trade route going to them, so automatically considered in network
		if (playerID != city.owner) {
			return true;
		}
		if (city.Trade) {
			return city.Trade.isInTradeNetwork();
		}
		return false;
	}
}

const ResourceAllocation = new ResourceAllocationModel();
engine.whenReady.then(() => {

	const updateModel = () => {
		engine.updateWholeModel(ResourceAllocation);
	}

	engine.createJSModel('g_ResourceAllocationModel', ResourceAllocation);
	ResourceAllocation.updateCallback = updateModel;
});

export { ResourceAllocation as default };
let ESX = null;
emit("esx:getSharedObject", (obj) => ESX = obj);

import Logger from "../utils/logger"
import Config from "../config.json";
import {Item, Weapon} from "./item";


let dropInventories = {};
let stashInventories = {};
let sharedStashes = {};
let viewedInventories = {};
let inventoriesStored = {};

Main();

async function Main() {
    await InitializeItemData();
    Logger.LogInfo("Items initialized.");
    InitializeWeaponEvents();
    InitializeShopInventories();
    Logger.LogInfo("Shops initialized.")
    await InitializeSharedStashInventories();
    Logger.LogInfo("Stashes initialized.");
}

export function IsItAWeapon(itemName : string) {
    if (itemName.includes(Config.weaponPrefix)) {
        return true;
    } else {
        return false;
    }
}

async function TradeItems(currentInventory, currentSlot, targetInventory, targetSlot, itemCountToTrade) {

    if (!(currentInventory.type == "shop" || targetInventory.type == "shop")) {

        if (JSON.stringify(currentInventory) === JSON.stringify(targetInventory)) {
            let firstRequestedItem = currentInventory.GetItemBySlot(targetSlot);
            let secondRequestedItem = currentInventory.GetItemBySlot(currentSlot);

            if (IsItAWeapon(secondRequestedItem.itemName)) {
                currentInventory.items[currentSlot] = firstRequestedItem;
            
                currentInventory.items[targetSlot] = secondRequestedItem;  
        
                
                if (currentInventory.items[currentSlot] == null) {
                    delete currentInventory.items[currentSlot];
                }
                
                if (currentInventory.items[targetSlot] == null) {
                    delete currentInventory.items[targetSlot];
                }
            } else {
                if (firstRequestedItem == null) {
                    if (itemCountToTrade == 0) {
                        currentInventory.items[currentSlot] = firstRequestedItem;
                
                        currentInventory.items[targetSlot] = secondRequestedItem;  
                
                        
                        if (currentInventory.items[currentSlot] == null) {
                            delete currentInventory.items[currentSlot];
                        }
                        
                        if (currentInventory.items[targetSlot] == null) {
                            delete currentInventory.items[targetSlot];
                        }
                    } else {
                        let itemToCopy = currentInventory.items[currentSlot];
                        if (parseInt(secondRequestedItem.itemCount) > itemCountToTrade) {
                            currentInventory.items[currentSlot].itemCount -= itemCountToTrade;
                            currentInventory.items[targetSlot] = new Item(itemToCopy.itemName, itemToCopy.itemLabel, itemCountToTrade);
                        } else if (secondRequestedItem.itemCount == itemCountToTrade) {
                            delete currentInventory.items[currentSlot];
                            currentInventory.items[targetSlot] = new Item(itemToCopy.itemName, itemToCopy.itemLabel, itemCountToTrade);
                        }
                    }
                } else {
                    if (IsItAWeapon(firstRequestedItem.itemName)) {
                        currentInventory.items[currentSlot] = firstRequestedItem;
            
                        currentInventory.items[targetSlot] = secondRequestedItem;  
                
                        
                        if (currentInventory.items[currentSlot] == null) {
                            delete currentInventory.items[currentSlot];
                        }
                        
                        if (currentInventory.items[targetSlot] == null) {
                            delete currentInventory.items[targetSlot];
                        }
                    } else {
                        if (firstRequestedItem.itemName == secondRequestedItem.itemName) {
                            if (itemCountToTrade == 0) {
                                currentInventory.items[currentSlot] = null;
        
                                let itemToReturn = secondRequestedItem;
                                secondRequestedItem.itemCount = parseInt(firstRequestedItem.itemCount) + parseInt(secondRequestedItem.itemCount);
                        
                                currentInventory.items[targetSlot] = itemToReturn;  
                        
                                
                                if (currentInventory.items[currentSlot] == null) {
                                    delete currentInventory.items[currentSlot];
                                }
                                
                                if (currentInventory.items[targetSlot] == null) {
                                    delete currentInventory.items[targetSlot];
                                }
                            } else {
                                if (parseInt(secondRequestedItem.itemCount) > itemCountToTrade) {
                                    currentInventory.items[currentSlot].itemCount -= itemCountToTrade;
                                    currentInventory.items[targetSlot].itemCount = parseInt(itemCountToTrade) + parseInt(currentInventory.items[targetSlot].itemCount);
                                } else if (secondRequestedItem.itemCount == itemCountToTrade) {
                                    delete currentInventory.items[currentSlot];
                                    currentInventory.items[targetSlot].itemCount = parseInt(itemCountToTrade) + parseInt(currentInventory.items[targetSlot].itemCount);
                                }
                            }
                        } else {
                            currentInventory.items[currentSlot] = firstRequestedItem;
                    
                            currentInventory.items[targetSlot] = secondRequestedItem;  
                    
                            
                            if (currentInventory.items[currentSlot] == null) {
                                delete currentInventory.items[currentSlot];
                            }
                            
                            if (currentInventory.items[targetSlot] == null) {
                                delete currentInventory.items[targetSlot];
                            }
                        }
                    }
                } 
            }

            if (currentInventory.type == "stash" || targetInventory.type == "stash") {
                await currentInventory.UpdateDatabase(() => { 
                    currentInventory.Refresh();
                    targetInventory.Refresh(); 
                });
            } else {
                currentInventory.Refresh();
                targetInventory.Refresh(); 
                await currentInventory.UpdateDatabase(() => {});
            }
            
            currentInventory.Refresh();
            targetInventory.Refresh(); 
            await currentInventory.UpdateDatabase(() => {});
        } else {
            let firstRequestedItem = targetInventory.GetItemBySlot(targetSlot);
            let secondRequestedItem = currentInventory.GetItemBySlot(currentSlot);

            if (IsTransactionValid(targetInventory, secondRequestedItem, currentInventory, firstRequestedItem)) {
                if (IsItAWeapon(secondRequestedItem.itemName)) {
                    currentInventory.items[currentSlot] = firstRequestedItem;
                
                    targetInventory.items[targetSlot] = secondRequestedItem;  
            
                    
                    if (currentInventory.items[currentSlot] == null) {
                        delete currentInventory.items[currentSlot];
                    }
                    
                    if (targetInventory.items[targetSlot] == null) {
                        delete targetInventory.items[targetSlot];
                    }
                } else {
                    if (firstRequestedItem == null) {
                        if (itemCountToTrade == 0) {
                            currentInventory.items[currentSlot] = firstRequestedItem;
                    
                            targetInventory.items[targetSlot] = secondRequestedItem;  
                    
                            
                            if (currentInventory.items[currentSlot] == null) {
                                delete currentInventory.items[currentSlot];
                            }
                            
                            if (targetInventory.items[targetSlot] == null) {
                                delete targetInventory.items[targetSlot];
                            }
                        } else {
                            let itemToCopy = currentInventory.items[currentSlot];
                            if (parseInt(secondRequestedItem.itemCount) > itemCountToTrade) {
                                currentInventory.items[currentSlot].itemCount -= itemCountToTrade;
                                targetInventory.items[targetSlot] = new Item(itemToCopy.itemName, itemToCopy.itemLabel, itemCountToTrade);
                            } else if (secondRequestedItem.itemCount == itemCountToTrade) {
                                delete currentInventory.items[currentSlot];
                                targetInventory.items[targetSlot] = new Item(itemToCopy.itemName, itemToCopy.itemLabel, itemCountToTrade);
                            }
                        }
                    } else {
                        if (IsItAWeapon(firstRequestedItem.itemName)) {
                            currentInventory.items[currentSlot] = firstRequestedItem;
                
                            targetInventory.items[targetSlot] = secondRequestedItem;  
                    
                            
                            if (currentInventory.items[currentSlot] == null) {
                                delete currentInventory.items[currentSlot];
                            }
                            
                            if (targetInventory.items[targetSlot] == null) {
                                delete targetInventory.items[targetSlot];
                            }
                        } else {
                            if (firstRequestedItem.itemName == secondRequestedItem.itemName) {
                                if (itemCountToTrade == 0) {
                                    currentInventory.items[currentSlot] = null;
            
                                    let itemToReturn = secondRequestedItem;
                                    secondRequestedItem.itemCount = parseInt(firstRequestedItem.itemCount) + parseInt(secondRequestedItem.itemCount);
                            
                                    targetInventory.items[targetSlot] = itemToReturn;  
                            
                                    
                                    if (currentInventory.items[currentSlot] == null) {
                                        delete currentInventory.items[currentSlot];
                                    }
                                    
                                    if (targetInventory.items[targetSlot] == null) {
                                        delete targetInventory.items[targetSlot];
                                    }
                                } else {
                                    if (parseInt(secondRequestedItem.itemCount) > itemCountToTrade) {
                                        currentInventory.items[currentSlot].itemCount -= itemCountToTrade;
                                        targetInventory.items[targetSlot].itemCount = parseInt(itemCountToTrade) + parseInt(targetInventory.items[targetSlot].itemCount);
                                    } else if (secondRequestedItem.itemCount == itemCountToTrade) {
                                        delete currentInventory.items[currentSlot];
                                        targetInventory.items[targetSlot].itemCount = parseInt(itemCountToTrade) + parseInt(targetInventory.items[targetSlot].itemCount);
                                    }
                                }
                            } else {
                                currentInventory.items[currentSlot] = firstRequestedItem;
                        
                                targetInventory.items[targetSlot] = secondRequestedItem;  
                        
                                
                                if (currentInventory.items[currentSlot] == null) {
                                    delete currentInventory.items[currentSlot];
                                }
                                
                                if (targetInventory.items[targetSlot] == null) {
                                    delete targetInventory.items[targetSlot];
                                }
                            }
                        }
                    } 
                }
    
                if (currentInventory.type == "stash" || targetInventory.type == "stash") {
                    await currentInventory.UpdateDatabase(() => {});
                    await targetInventory.UpdateDatabase(() => {
                        currentInventory.Refresh();
                        targetInventory.Refresh();
                    });
                } else {
                    currentInventory.Refresh();
                    targetInventory.Refresh();
                    await currentInventory.UpdateDatabase(() => {});
                    await targetInventory.UpdateDatabase(() => {});
                }   
            } else {
                console.log("taşıyamadın amk");
            }
        }
    } else {
        if (itemCountToTrade == null || itemCountToTrade == 0) {
            itemCountToTrade = 1;
        }
        // Shop transaction request potential

        if (targetInventory.type == "player") {
            // Shop transaction request 
            let itemBought = currentInventory.GetItemBySlot(currentSlot);

            if (targetInventory.CanCarryItem(itemBought.itemName, itemCountToTrade)) {
                if (targetInventory.HasEnoughOfItem("cash", currentInventory.items[currentSlot].itemCount * itemCountToTrade)) {
                    await targetInventory.RemoveItem("cash", currentInventory.items[currentSlot].itemCount * itemCountToTrade)
                    IsItAWeapon(itemBought.itemName) ? await currentInventory.AddWeapon(itemBought.itemName) : await currentInventory.AddItem(itemBought.itemName, itemCountToTrade);
                } else {
                    console.log("Not enough money!");
                }
            } else {
                Logger.LogError("Player couldn't carry given items!")
            }
        }
    }

    targetInventory.weight = targetInventory.CalculateInventoryWeight();
    currentInventory.weight = currentInventory.CalculateInventoryWeight();
}

function IsTransactionValid(targetInventory, item2, currentInventory, item1) {
    
    if (!targetInventory.CanCarryItem(item2.itemName, item2.itemCount || 1)) return false;

    if (item1 == null) return true;

    if (!currentInventory.CanCarryItem(item1.itemName, item1.itemCount || 1)) return false;

    return true;
}

function GetDropInventory(coords) {
    if (coords in dropInventories) {
        return dropInventories[coords];
    } else {
        let newEmptyDropInventory = new DropInventory(coords, {});
        dropInventories[coords] = newEmptyDropInventory;
        return newEmptyDropInventory;
    }
}

function GetShopInventory(shopName) {
    return inventoriesStored[shopName];
}

function GetStashInventory(stashName, identifier) {
    return stashInventories[stashName][identifier]
}

function GetPlayerInventory(identifier) {
    return inventoriesStored[identifier];
}

function GetInventory(inventoryType, identifier, stashName) {
		
    if (inventoryType == "drop") {
        return GetDropInventory(identifier);
    } else if (inventoryType == "shop") {
        return GetShopInventory(identifier);
    } else if (inventoryType == "player") {
        return GetPlayerInventory(identifier); 
    } else if (inventoryType == "stash") {
        return GetStashInventory(stashName, identifier);
    } else {
        if (identifier in inventoriesStored) {
            return inventoriesStored[identifier];
        } else {
            return new Promise((resolve) => {
                exports.ghmattimysql.execute(`SELECT inventory FROM generous_inv_${inventoryType} WHERE identifier = @identifier`, { 
                    identifier: identifier 
                }, (data)  => {
                    if (data[0] == undefined) {
                        exports.ghmattimysql.execute(`INSERT INTO generous_inv_${inventoryType} (identifier, inventory) VALUES (?, ?)`,
                            [identifier, JSON.stringify({})], (result) => { 
                                exports.ghmattimysql.execute(`SELECT inventory FROM generous_inv_${inventoryType} WHERE identifier = @identifier`, { 
                                    identifier: identifier 
                                }, (data)  => {
                                    let inventory = new Inventory(inventoryType, identifier, (JSON.parse(data[0].inventory)));
                                    inventoriesStored[identifier] = inventory;
                                    return resolve(inventory);
                                });
                            }
                        );
                    } else {
                        let inventory = new Inventory(inventoryType, identifier, (JSON.parse(data[0].inventory)));

                        inventoriesStored[identifier] = inventory;
                        return resolve(inventory);
                    }
                });
            });
        }
    }

}

function lockInventory(source, setLocked) {
    let xPlayer = ESX.GetPlayerFromId(source);
    let playerInventory = GetInventory("player", xPlayer.getIdentifier());
    playerInventory.Locked = setLocked;   
}

function ParseGenerousItemsToESXItem(inventory, items) {

    let sampleItem = items[Object.keys(items)[0]];
    let itemCommonData = Items[sampleItem.itemName];

    let returnedItem = {
        name: toString(sampleItem.itemName),
        count: inventory.GetItemCountInventoryHas(sampleItem.itemName),
        label: toString(sampleItem.itemLabel),
        weight: parseInt(itemCommonData.weight),
        canRemove: parseInt(itemCommonData.canRemove)
    }

    return returnedItem;
}

function InitializeWeaponEvents() {
    Object.keys(Items).forEach((itemName) => {
        if (IsItAWeapon(itemName)) {
            ESX.RegisterUsableItem(itemName, function(source) {
                emitNet('generous_inventory:client:useWeapon', source, itemName)
            });
        } 
    
    });   
}     


async function InitializePlayerInventory(identifier) {
    exports.ghmattimysql.execute(`SELECT inventory FROM generous_inv_player WHERE identifier = @identifier`, { 
        identifier: identifier 
    }, (data)  => {
        if (data[0] == undefined) {
            exports.ghmattimysql.execute(`INSERT INTO generous_inv_player (identifier, inventory) VALUES (?, ?)`,
                [identifier, JSON.stringify({})], (result) => { 
                    let playerInventory = new Inventory("player", identifier, {});
                    inventoriesStored[identifier] = playerInventory;
                }
            );
        } else {
            let playerInventory = new Inventory("player", identifier, (JSON.parse(data[0].inventory)));
            inventoriesStored[identifier] = playerInventory;
        }
    });
}

async function InitializeSharedStashInventories() {
    Logger.LogInfo("Initializing shared/job stashes from database.");
    for (const [stashName, stash] of Object.entries(Config.Stashes)) {
        if (stash.job != "all") {
            exports.ghmattimysql.execute(`SELECT inventory FROM generous_inv_stashes WHERE stashname = @stashname AND identifier = @identifier`, { 
                stashname: stashName,
                identifier: stash.job
            }, (data)  => {
                if (data[0] == undefined) {
                    exports.ghmattimysql.execute(`INSERT INTO generous_inv_stashes (stashname, identifier, inventory) VALUES (?, ?, ?)`,
                        [stashName, stash.job, JSON.stringify({})], (result) => { 
                            let stashInventory = new StashInventory(stashName, stash.job, {});
                            stashInventories[stashName] = stashInventory;
                        }
                    );
                } else {
                    let stashInventory = new StashInventory(stashName, stash.job, (JSON.parse(data[0].inventory)));
                    stashInventories[stashName] = stashInventory;
                }
            });
        }

    }
}

async function InitializePersonalStashInventories(source) {
    let playerIdentifier = GetPlayerIdentifier(source, 0);
    for (const [stashName, stash] of Object.entries(Config.Stashes)) {
        if (stash.job == "all") {
            exports.ghmattimysql.execute(`SELECT inventory FROM generous_inv_stashes WHERE stashname = @stashname AND identifier = @identifier`, { 
                stashname: stashName,
                identifier: playerIdentifier
            }, (data)  => {
                if (data[0] == undefined) {
                    exports.ghmattimysql.execute(`INSERT INTO generous_inv_stashes (stashname, identifier, inventory) VALUES (?, ?, ?)`,
                        [stashName, playerIdentifier, JSON.stringify({})], (result) => { 
                            let stashInventory = new StashInventory(stashName, playerIdentifier, {});
                            stashInventories[stashName] = stashInventory;
                        }
                    );
                } else {
                    let stashInventory = new StashInventory(stashName, stash.job, (JSON.parse(data[0].inventory)));
                    stashInventories[stashName] = stashInventory;
                }
            });
        }
    }
}

function InitializeShopInventories() {
    for (const [name, market] of Object.entries(Config.MarketList)) {
        let shopInventory = new ShopInventory(name, {});
        for (let index = 0; index < market.items.length; index++) {
            let item = market.items[index];
            IsItAWeapon(item.name) ? shopInventory.AddWeapon(item.name) : shopInventory.AddItem(item.name, item.price);
            inventoriesStored[name] = shopInventory;
        }
    }
    
}

function GetInventoryItemESX(identifier, itemName) {
    let inventory = GetInventory("player", identifier);
    return inventory.GetItem(itemName);
}
































on("playerDropped", () => {
    let src = global.source;
    let playerIdentifier = GetPlayerIdentifier(src, 0);
    delete inventoriesStored[playerIdentifier];
    Object.values(stashInventories).forEach(stash => {
        if (stash.identifier == playerIdentifier)
            delete stashInventories[stash];    
    });
});


exports("GetInventoryItemType", (itemName, id) => {
    let inventory = GetPlayerInventory(id);
    if (inventory.GetItemCountInventoryHas(itemName) > 0) {
        return ParseGenerousItemsToESXItem(inventory, inventory.GetItem(itemName));
    } else {
        let itemCommonData = Items[itemName];
    
        let returnedItem = {
            name: itemName,
            count: 0,
            label: itemCommonData.itemLabel,
            weight: itemCommonData.weight,
            canRemove: itemCommonData.canRemove
        }
    
        return returnedItem;
    }
});


exports("CanPlayerCarryItem", (itemName, count, id) => {
    let inventory = GetInventory("player", id);

    return inventory.CanCarryItem(itemName, count);
});

ESX.RegisterServerCallback('generous_inventory:server:getAmmoCount', function(source, cb, hash, weaponSlot) {
    let player = ESX.GetPlayerFromId(source)
    let inventory = GetInventory("player", player.getIdentifier())

    let item =  inventory.GetItemBySlot(weaponSlot);


    if (item == null) return;

    let itemData = item.itemData;
    let ammoCount = itemData.ammoCount;

    if (ammoCount == null) return;

    cb(ammoCount, 0, 0, 0, 0, 0, 0)
});

ESX.RegisterServerCallback('generous_inventory:server:getPlayerIdentifier', function(source, cb, targetSource) {
    let player = ESX.GetPlayerFromId(targetSource);
    cb(player.getIdentifier());
});

ESX.RegisterServerCallback('generous_inventory:server:getPlayerIdentifierOwn', function(source, cb) {
    let player = ESX.GetPlayerFromId(source);
    cb(player.getIdentifier());
});

onNet("client-actionbar-request", async (slot) => {
    let src = source
    let player = ESX.GetPlayerFromId(src)
    let playerInventory = await GetInventory("player", player.getIdentifier());
    let item = playerInventory.GetItemBySlot(slot);
    if (item == null) return;
    emitNet('client-use-item', src, item.itemName, slot)
});

onNet("client-inventory-update-request", async (currentSlot, targetSlot, currentIdentifier, targetIdentifier, itemAmount) => {
    let src = source
    let currentInventory = await GetInventory(currentIdentifier.type, currentIdentifier.owner);
    let targetInventory = await GetInventory(targetIdentifier.type, targetIdentifier.owner);

    let item = currentInventory.GetItemBySlot(currentSlot)

    if (item != null) {
        if (IsItAWeapon(item.itemName)) {
            emitNet('server-remove-removed-weapon', src, targetSlot, targetInventory, currentSlot);
        }
    }


    await TradeItems(currentInventory, currentSlot, targetInventory, targetSlot, itemAmount, currentIdentifier.base, targetIdentifier.base);
});

// data format { type: "trunk", owner: "ABC 123" } { type: "drop", owner: "[x, y, z]" } { type: "glovebox", owner: "ABC 123" }
onNet('client-request-open-player', async (data) => {
    let dataParsed = JSON.parse(data);
    let src = source

    if (dataParsed == null) {
        Logger.LogError("Passed data was null!");
        return;
    }

    let identifier = dataParsed.owner;

    let targetPlayerInventory = GetPlayerInventory(identifier);
    targetPlayerInventory.Locked = true;

    let playerIdentifier = GetPlayerIdentifier(src, 0);
    let playerInventory = GetPlayerInventory(playerIdentifier);

    if (playerInventory.Locked) {
        Logger.LogInfo("Player tried to open inventory while locked! Source: " + src);
        return;
    }

    viewedInventories[src] = { primary: { type: "player", owner: playerIdentifier }, secondary: dataParsed };
    emitNet("server-open-inventory", src, playerInventory, targetPlayerInventory);
});

onNet('client-request-open-drop', async (data) => {
    let dataParsed = JSON.parse(data);
    let src = source

    if (dataParsed == null) {
        Logger.LogError("Passed data was null!");
        return;
    }
    
    let coords = dataParsed.owner;

    let dropInventory = GetDropInventory(coords);

    let playerIdentifier = GetPlayerIdentifier(src, 0);
    let playerInventory = GetPlayerInventory(playerIdentifier);

    if (playerInventory.Locked) {
        Logger.LogInfo("Player tried to open inventory while locked! Source: " + src);
        return;
    }

    viewedInventories[src] = { primary: { type: "player", owner: playerIdentifier }, secondary: dataParsed };
    emitNet("server-open-inventory", src, playerInventory, dropInventory);
});

onNet('client-request-open-stash', async (data) => {
    let dataParsed = JSON.parse(data);
    let src = source

    if (dataParsed == null) {
        Logger.LogError("Passed data was null!");
        return;
    }
    
    let stashName = dataParsed.stashName;
    let identifier = dataParsed.owner;

    let stashInventory = GetStashInventory(stashName, identifier)

    let playerIdentifier = GetPlayerIdentifier(src, 0);
    let playerInventory = GetPlayerInventory(playerIdentifier);

    if (playerInventory.Locked) {
        Logger.LogInfo("Player tried to open inventory while locked! Source: " + src);
        return;
    }

    viewedInventories[src] = { primary: { type: "player", owner: playerIdentifier }, secondary: dataParsed };
    emitNet("server-open-inventory", src, playerInventory, stashInventory);
});

onNet('client-inventory-set-busy-request', async (inventoryType, inventoryOwner, itemSlot, isBusy) => {
    let inventoryToCompare = { type:inventoryType, owner: inventoryOwner };
    let playersToSetBusy = GetKeyByValue(viewedInventories, inventoryToCompare);
    for (let index = 0; index < playersToSetBusy.length; index++) {
        let player = playersToSetBusy[index];
        emitNet('client-set-inventory-item-busy', player, inventoryType, inventoryOwner, itemSlot, isBusy, inventoryToCompare.inventoryID)
    }
});

onNet('client-inventory-give-item-request', async (currentSlot, currentIdentifier, itemAmount, focusedPedId) => {
    let src = source
    let xPlayer = ESX.GetPlayerFromId(focusedPedId);

    let currentInventory = await GetInventory(currentIdentifier.type, currentIdentifier.owner);
    let targetInventory = await GetInventory("player", xPlayer.getIdentifier());

    let targetSlot = targetInventory.GetFirstAvailableSlot();
    let currentSlotItem = currentInventory.GetItemBySlot(currentSlot);
    if (currentSlotItem != null) {
        if (IsItAWeapon(currentSlot.itemName)) {
            emitNet('server-remove-removed-weapon', src, targetSlot, targetInventory, currentSlot);
        }
    }


    await TradeItems(currentInventory, currentSlot, targetInventory, targetSlot, itemAmount, currentIdentifier.base, "secondaryInventory");
});

onNet("client-request-close-inv", async (data) => {
    let src = source
    if (data != null) {
        // secondary inventory was a player inventory
        let parsedData = JSON.parse(data);
        lockInventory(parsedData.owner, false);
    }

    delete viewedInventories[src];
});

function InitializeItemData() {
    Logger.LogInfo("Initializing items from database.");
    return new Promise((resolve) => {
        exports.ghmattimysql.execute("SELECT * FROM items", { 
        }, (data)  => {
            // Looping through all items
            for (let key in data) {
                let value = data[key];
                // Checking if it's a weapon 
                if (IsItAWeapon(value.name)) {
                    Items[value.name] = 
                    {
                        name: value.name,
                        label: value.label,
                        weight: value.weight,
                        canStacked: false,
                        canRemove: true,
                        price: value.price
                    };
                } else {
                    Items[value.name] = {
                        name: value.name,
                        label: value.label,
                        weight: value.weight,
                        canStacked: value.can_stacked,
                        canRemove: value.can_remove,
                        price: value.price
                    };
                }

            }

            return resolve(Items);
        });
    });
}

onNet('generous_inventory:server:updateAmmoCount', async (hash, ammoCount, weaponSlotID, inventory) => {
    let player = ESX.GetPlayerFromId(source);

    let inventoryToUse;

    if (inventory == null) {
        inventoryToUse = await GetInventory("player", player.getIdentifier());
    } else {
        inventoryToUse = inventory;
    }

    let weapon = inventoryToUse.items[weaponSlotID];

    if (weapon != null) {
        let weaponItemData = weapon.itemData;
        if (weaponItemData != null) {
            weaponItemData.ammoCount = ammoCount;
            await inventoryToUse.UpdateDatabase(() => {});
        }
    }
});

onNet('new-client-connected', async () => {
    let src = global.source
    await InitializePlayerInventory(GetPlayerIdentifier(src, 0))
    await InitializePersonalStashInventories(src)
});

onNet("esx:onAddInventoryItem", async (source, item, count) => {
    let xPlayer = ESX.GetPlayerFromId(source);
    let playerInventory = await GetInventory("player", xPlayer.getIdentifier());
    if (playerInventory.CanCarryItem(item, count)) {
        IsItAWeapon(item) ? await playerInventory.AddWeapon(item) : await playerInventory.AddItem(item, count);
        emitNet("server-update-inventory-primary-data", source, playerInventory); 
    }
});

onNet("esx:onRemoveInventoryItem", async (source, item, count) => {
    let xPlayer = ESX.GetPlayerFromId(source);
    let playerInventory = await GetInventory("player", xPlayer.getIdentifier());
    await playerInventory.RemoveItem(item, count);
    emitNet("server-update-inventory-primary-data", source, playerInventory); 
});

onNet('generous_inventory:resetInventory', async (identifier) => {
    let inventory = GetInventory("player", identifier);
    inventory.items = {};
    inventory.UpdateDatabase(() => {
        inventory.Refresh();
    });
});
function Wait(ms) {
    return new Promise((res) => {
        setTimeout(res, ms)
    })
}

export function isEmpty(obj) {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
}

export function IsItAWeapon(itemName) {
    if (item.includes(Config.weaponPrefix)) {
        return true;
    } else {
        return false;
    }
}

function IsValidItem(item) {
    if (item.itemName in Generous.Items && item.itemCount >= 0 && (typeof(item.itemData) == "object" || item.itemData == null)) {
        return true;
    } else {
        return false;
    }
}

function IsValidWeapon(weapon) {
    if (weapon.weaponName in Generous.Items && typeof(weapon.weaponData) == "object") {
        return true;
    } else {
        return false;
    }
}

function GetKeyByValue(object, value) {   
    return Object.keys(object).filter((key) =>  { 
        if (JSON.stringify(object[key].primary) === JSON.stringify(value)) {
            value.inventoryID = 1;
            return true;
        } else if (JSON.stringify(object[key].secondary) === JSON.stringify(value)) {
            value.inventoryID = 2;
            return true
        } else {
            return false;
        }
    });
}
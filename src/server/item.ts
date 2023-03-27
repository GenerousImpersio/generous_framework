import Config from "../config.json";

class Item {
    itemName: string;
    itemLabel: string;
    itemCount: number;
    itemData: Object;
    constructor (itemName: string, itemLabel: string, itemCount: number, itemData?: object) {
        this.itemName = itemName;
        this.itemLabel = itemLabel;
        this.itemCount = itemCount;

        if (itemData == undefined)
            this.itemData = {};
        else
            this.itemData = itemData;
    }
}

class Weapon extends Item {
    weaponName: string;
    weaponLabel: string;
    weaponData: IWeaponData;
    
    constructor(weaponName: string, weaponLabel: string, weaponData?: IWeaponData) {
        super(weaponName, weaponLabel, 1, weaponData);
    }

    private GenerateNewWeaponData() {
        let weaponLicense = this.GenerateWeaponLicenseKey();
        return { license: weaponLicense, durability: Config.defaultWeaponDurability, ammoCount: 0 };
    }

    private GenerateWeaponLicenseKey() {
        let randomLicenseKey = "";
    
        for (let index = 0; index < Config.licenseNumberCount; index++) {
            let randomNumber = Math.floor(Math.random() * 10);
            randomLicenseKey += randomNumber; 
        }
    
        return Config.licensePrefix + randomLicenseKey;
    }
}

interface IWeaponData {
    license: string;
    durability: number;
    ammoCount: number;
}

export { Item, Weapon }
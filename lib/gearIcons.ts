import type { ShopItem } from '../types';

export const GEAR_ICON_BY_ID: Record<string, string> = {
    helm_rogue: '/gear/rogue-helmet.png',
    armor_rogue: '/gear/rogue-armor.png',
    gloves_rogue: '/gear/rogue-gloves.png',
    boots_rogue: '/gear/rogue-boots.png',
    helm_iron: '/gear/iron-helmet.png',
    armor_iron: '/gear/iron-armor.png',
    gloves_iron: '/gear/iron-gloves.png',
    boots_iron: '/gear/iron-boots.png',
    helm_shadow: '/gear/shadow-helmet.png',
    armor_shadow: '/gear/shadow-armor.png',
    gloves_shadow: '/gear/shadow-gloves.png',
    boots_shadow: '/gear/shadow-boots.png',
    gear_shadow: '/gear/shadow-weapon.png',
    helm_light: '/gear/light-helmet.png',
    armor_light: '/gear/light-armor.png',
    gloves_light: '/gear/light-gloves.png',
    boots_light: '/gear/light-boots.png',
    gear_light: '/gear/light-weapon.png',
    gear_dragon_slayer: '/gear/dragon-slayer.png',
    armor_berserker: '/gear/berserker-armor.png',
};

export const getGearIcon = (item?: ShopItem | null) => {
    if (!item || item.type !== 'Gear') return null;
    return GEAR_ICON_BY_ID[item.id] || null;
};

export const getGearFullImage = (item?: ShopItem | null) => {
    const icon = getGearIcon(item);
    if (!icon) return null;
    return icon.replace('/gear/', '/gear/full/');
};

import { MATERIALS } from '../constants';

export const MATERIAL_ICON_PATHS: Record<string, string> = {
    [MATERIALS.COPPER]: '/materials/copper.png',
    [MATERIALS.IRON]: '/materials/iron.png',
    [MATERIALS.ALUMINIUM]: '/materials/aluminium.png',
    [MATERIALS.FANG]: '/materials/beast-fang.png',
    [MATERIALS.DIAMOND]: '/materials/diamond.png',
    [MATERIALS.SHARD]: '/materials/brilliant-light-shard.png',
    [MATERIALS.BLOODSTONE]: '/materials/bloodstone.png',
};

export const getMaterialIcon = (materialId?: string | null): string | null => {
    if (!materialId) return null;
    return MATERIAL_ICON_PATHS[materialId] || null;
};

export const getMaterialName = (materialId: string): string => {
    return materialId.replace('mat_', '').replace(/_/g, ' ').toUpperCase();
};

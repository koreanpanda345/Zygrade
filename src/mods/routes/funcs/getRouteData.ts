import BaseFunc from '../../../base/BaseFunc';

export default class GetRouteData extends BaseFunc {
    constructor() {
        super('get-route-data');
    }

    public async invoke(name: string) {
        const json = await import(`./../data/${name.replaceAll(' ', '_').toLowerCase().trim()}.json`);

        if (!json) return false;

        return json;
    }
}

export type RouteData = {
    name: string;
    rates: {
        encounter: string;
        items: string;
    };
    levels: [number, number];
    trainers: {
        name: string;
        team: {
            species: string;
            level: number;
            ability: string;
            moves: string[];
        }[];
    }[];
    encounters: { species: string; rarity: string }[];
    items: { item: string; rarity: string }[];
};

import { discordClient } from '../../../..';
import BaseFunc from '../../../base/BaseFunc';
import type { RouteData } from './getRouteData';

export default class Probability extends BaseFunc {
    constructor() {
        super('probability');
    }

    public async invoke(routeName: string) {
        const route = (await discordClient.mods.get('routes')?.func.invoke(routeName)) as RouteData;

        const rateWheel = [];
        switch (route.rates.encounter) {
            case 'very common':
                for (let i = 5; i > 0; i--) rateWheel.push('encounter');
                break;
            case 'common':
                for (let i = 4; i > 0; i--) rateWheel.push('encounter');
                break;
            case 'uncommon':
                for (let i = 3; i > 0; i--) rateWheel.push('encounter');
                break;
            case 'rare':
                for (let i = 2; i > 0; i--) rateWheel.push('encounter');
                break;
            case 'very rare':
                for (let i = 1; i > 0; i--) rateWheel.push('encounter');
        }
        switch (route.rates.items) {
            case 'very common':
                for (let i = 5; i > 0; i--) rateWheel.push('item');
                break;
            case 'common':
                for (let i = 4; i > 0; i--) rateWheel.push('item');
                break;
            case 'uncommon':
                for (let i = 3; i > 0; i--) rateWheel.push('item');
                break;
            case 'rare':
                for (let i = 2; i > 0; i--) rateWheel.push('item');
                break;
            case 'very rare':
                for (let i = 1; i > 0; i--) rateWheel.push('item');
        }

        const rateTotal = rateWheel.length - 1;
        const rateRng = Math.floor(Math.random() * rateTotal);

        if (rateWheel[rateRng] === 'encounter') {
            // Very Common = 6
            // Common = 5
            // Uncommon = 4
            // Rare = 3
            // Very Rare = 2
            // Mythical = 1
            // Legendary = 1
            const encounterWheel = [];
            for (const encounter of route.encounters) {
                switch (encounter.rarity) {
                    case 'very common':
                        for (let i = 6; i > 0; i--) encounterWheel.push(encounter.species);
                        break;
                    case 'common':
                        for (let i = 5; i > 0; i--) encounterWheel.push(encounter.species);
                        break;
                    case 'uncommon':
                        for (let i = 4; i > 0; i--) encounterWheel.push(encounter.species);
                        break;
                    case 'rare':
                        for (let i = 3; i > 0; i--) encounterWheel.push(encounter.species);
                        break;
                    case 'very rare':
                        for (let i = 2; i > 0; i--) encounterWheel.push(encounter.species);
                        break;
                    case 'mythical':
                    case 'legendary':
                        for (let i = 1; i > 0; i--) encounterWheel.push(encounter.species);
                        break;
                }
            }

			const encounterTotal = encounterWheel.length - 1;
			const encounterRng = Math.floor(Math.random() * encounterTotal);
			
			return {
				rateRng,
				rateResult: rateWheel[rateRng],
				encounterRng,
				encounterResult: encounterWheel[encounterRng],
			};
        } else if (rateWheel[rateRng] === 'item') {
        }
    }
}


export type ProbabilityData = {
	rateRng: number,
	rateResult: string,
	encounterRng?: number,
	encounterResult?: string,
	itemRng?: number,
	itemResult?: string,
};
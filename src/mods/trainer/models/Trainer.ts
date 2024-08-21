import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const trainerSchema = new Schema({
    discordUserId: String, // Discord user id
    money: Number, // Money
    team: [Number], // The trainer's team. Can have up to 6 pokemon in a team.
	routes: [String], // The routes that the trainer can explore
	quests: [{
		questId: String,
		progress: [{
			action: String,
			required: Number,
			current: { type: Number, default: false},
			completed: { type: Boolean, default: false},
		}], // The quest the trainer is doing and have done.
	}],
    pokemon: [ // The trainer's pokemon that have been caught
        {
            species: String,
            shiny: { type: Boolean, default: false },
            level: { type: Number, default: 1 },
            exp: { type: Number, default: 0 },
            ability: String,
            moves: [String],
            nature: { type: String, default: 'Serious' },
            ivs: {
                hp: { type: Number, default: 0 },
                atk: { type: Number, default: 0 },
                def: { type: Number, default: 0 },
                spa: { type: Number, default: 0 },
                spd: { type: Number, default: 0 },
                spe: { type: Number, default: 0 },
            },
            evs: {
                hp: { type: Number, default: 0 },
                atk: { type: Number, default: 0 },
                def: { type: Number, default: 0 },
                spa: { type: Number, default: 0 },
                spd: { type: Number, default: 0 },
                spe: { type: Number, default: 0 },
            },
        },
    ],
});

export type Trainer = InferSchemaType<typeof trainerSchema>;
export const Trainer = mongoose.model('Trainers', trainerSchema);
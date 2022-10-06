const { string, number } = require('joi');
const mongoose = require('mongoose');

const roundOneSchema = mongoose.Schema(
    {
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teams",
        },

        mapChoice: {
            type: String,
        },

        finalmapChoice: {
            type: String,
        },

        roundoneScore: {
            type: Number,
        },

        roundtwoScore: {
            type: Number,
        },

        roundthreeScore: {
            type: Number,
        },

        roundthreeItems: [
            {
                type: String
            }
        ],

        roundthreeBalance: {
            type: Number
        },

        roundthreeDone: {
            type: Boolean
        },

        totalScore: {
            type: Number,
        },

        startTime: {
            type: Date,
        }

    },

    { collection: "RoundOneModel" }
);

module.exports = mongoose.model("RoundOneModel", roundOneSchema);

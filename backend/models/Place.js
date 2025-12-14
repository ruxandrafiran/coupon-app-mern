import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
    {
        placeId: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        address: {
            type: String,
        },
        types: [
            {
                type: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Place = mongoose.model("Place", placeSchema);
export default Place;

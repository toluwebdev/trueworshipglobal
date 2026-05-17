import mongoose from "mongoose";
const mailingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },

    
}, {timestamps: true});
const Mailing = mongoose.model("Mailing", mailingSchema);
export default Mailing;
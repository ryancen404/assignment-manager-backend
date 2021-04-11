/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    avator: String,
    class: [{
        type: mongoose.Types.ObjectId,
        ref: "Classs"
    }],
    assignments:[{
        type: mongoose.Types.ObjectId,
        ref: "Assignment"
    }]
});

teacherSchema.set('toJSON', {
    transfrom: (_document: any, returnObject: any) => {
        returnObject.tid = returnObject._id.toString();
        delete returnObject._id;
        delete returnObject.__v;
    }
});

export default mongoose.model("Teacher", teacherSchema);
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import mongoose from "mongoose";

const classsSchema = new mongoose.Schema({
    className: {
        type: String,
        required: true
    },
    classNumber: {
        type: String,
        required: true,
    },
    students: [{
        type: mongoose.Types.ObjectId,
        ref: "Student"
    }]
});

classsSchema.set('toJSON', {
    transfrom: (_document: any, returnObject: any) => {
        returnObject.classId = returnObject._id.toString();
        delete returnObject._id;
        delete returnObject.__v;
    }
});

export default mongoose.model("Classs", classsSchema);
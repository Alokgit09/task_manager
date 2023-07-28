const mongoose = require("mongoose");


const TaskSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true,
      },
    name: {
        type: String,
        require: [true, "must provide name"],
        trim: true,
        maxlenght: [20, 'name can not be more then 20 characters'],
    },
    status: {
        type: Boolean,
        default: false,
    },

});

const Task = new mongoose.model('Task', TaskSchema);

module.exports = Task;


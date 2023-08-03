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
        type: String,
        enum: ['completed', 'process', 'panding'],
        default: 'panding', // You can set a default value if needed
        required: true, // You can also make the status field required
    },

});

const Task = new mongoose.model('Task', TaskSchema);

module.exports = Task;


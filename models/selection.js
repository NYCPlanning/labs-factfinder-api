const mongoose = require('mongoose');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const connection = mongoose.createConnection(process.env.MONGO_URI);

const SelectionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['blocks', 'tracts', 'ntas', 'pumas'],
  },
  geoids: {
    type: [{
      type: String,
      minlength: 4,
      maxlength: 12,
    }],
    required: true,
  },
  hash: {
    type: String,
    length: 40,
    required: true,
  },
});

SelectionSchema.plugin(autoIncrement, 'Selection');

const Selection = connection.model('Selection', SelectionSchema);

module.exports = Selection;

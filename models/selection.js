const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

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

SelectionSchema.plugin(autoIncrement.plugin, 'Selection');

const Selection = mongoose.model('Selection', SelectionSchema);

module.exports = Selection;

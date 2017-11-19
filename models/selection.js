const mongoose = require('mongoose');

const SelectionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['block', 'tract', 'nta', 'puma'],
  },
  geoids: {
    type: [{
      type: String,
      minlength: 4,
      maxlength: 7,
    }],
    required: true,
  },
  hash: {
    type: String,
    length: 6,
    required: true,
  },
});

const Selection = mongoose.model('Selection', SelectionSchema);

module.exports = Selection;

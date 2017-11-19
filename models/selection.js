const mongoose = require('mongoose');

const SelectionSchema = new mongoose.Schema({
  type: String,
  geoids: Array,
});

const Selection = mongoose.model('Selection', SelectionSchema);

module.exports = Selection;

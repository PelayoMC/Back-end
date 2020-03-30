var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var ingredienteSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, 'Nombre obligatorio'] },
    creador: { type: Schema.Types.ObjectId, ref: 'Usuario' }
}, { collection: 'ingredientes' });

ingredienteSchema.plugin(uniqueValidator, { message: '[{PATH}] debe ser único' });

module.exports = mongoose.model('Ingrediente', ingredienteSchema);
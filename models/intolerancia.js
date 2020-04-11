var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var intoleranciaSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, 'Nombre obligatorio'] },
    imagen: { type: String, required: false, default: null },
    descripcion: { type: String, required: [true, 'Descripción obligatoria'] },
    noApto: { type: [String], required: [true, 'Etiquetas no-apto obligatoria'] },
}, { collection: 'intolerancias' });

intoleranciaSchema.plugin(uniqueValidator, { message: '[{PATH}] debe ser único' });

module.exports = mongoose.model('Intolerancia', intoleranciaSchema);
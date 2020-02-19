var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var intoleranciaSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, 'Nombre obligatorio'] },
    ingredientes: {
        type: [{
            id: { type: Schema.Types.ObjectId, ref: 'Ingrediente' }
        }],
        required: [true, 'Ingredientes intolerantes obligatorios']
    },
}, { collection: 'intolerancias' });

intoleranciaSchema.plugin(uniqueValidator, { message: '[{PATH}] debe ser único' });

module.exports = mongoose.model('Intolerancia', intoleranciaSchema);
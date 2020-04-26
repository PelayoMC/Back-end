var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var dietaSchema = new Schema({
    dieta: {
        type: [{
            id: { type: Schema.Types.ObjectId, ref: 'Receta' },
            comentario: { type: String }
        }],
    },
    admin: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
}, { collection: 'dietas' });

dietaSchema.plugin(uniqueValidator, { message: '[{PATH}] debe ser único' });

module.exports = mongoose.model('Dieta', dietaSchema);
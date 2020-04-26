var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var votacionSchema = new Schema({
    total: { type: Number, required: [true, 'Cantidad obligatoria'] },
    puntos: { type: Number, required: [true, 'Cantidad obligatoria'] },
    receta: { type: Schema.Types.ObjectId, ref: 'Receta' },
    usuarios: { type: [Schema.Types.ObjectId], ref: 'Usuario' }
}, { collection: 'votaciones' });

votacionSchema.plugin(uniqueValidator, { message: '[{PATH}] debe ser único' });

module.exports = mongoose.model('Votacion', votacionSchema);
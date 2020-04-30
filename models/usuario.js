var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN', 'USER'],
    message: '{VALUE} no es un rol permitido'
}

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'Nombre obligatorio'] },
    email: { type: String, unique: true, required: [true, 'Email obligatorio'] },
    contraseña: { type: String, required: [true, 'Contraseña obligatoria'] },
    imagen: { type: String, required: false, default: null },
    rol: { type: String, required: true, default: "USER", enum: rolesValidos },
    google: { type: Boolean, default: false },
    dieta: { type: Schema.Types.ObjectId, ref: 'Dieta' },
    recetasFavoritas: { type: [Schema.Types.ObjectId], ref: 'Receta' },
    misIntolerancias: { type: [Schema.Types.ObjectId], ref: 'Intolerancia' },
    edad: { type: Number, min: 0, max: 100 },
    altura: { type: Number, min: 0, max: 2.4 },
    peso: { type: Number, min: 0, max: 180 },
});

usuarioSchema.plugin(uniqueValidator, { message: '[{PATH}] debe ser único' });

module.exports = mongoose.model('Usuario', usuarioSchema);
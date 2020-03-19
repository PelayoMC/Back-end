var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var NivelesValidos = {
    values: ['Muy facil', 'Facil', 'Intermedio', 'Dificil', 'Muy dificil'],
    message: '{VALUE} no es un nivel permitido'
};

var recetaSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, 'Nombre obligatorio'] },
    descripcion: { type: String, required: [true, 'Descripción obligatoria'] },
    ingredientes: {
        type: [{
            id: { type: Schema.Types.ObjectId, ref: 'Ingrediente' },
            nombre: { type: String, required: [true, 'Nombre obligatorio'] },
            cantidad: { type: Number, required: [true, 'Cantidad de ingrediente obligatoria'] },
            unidades: { type: String, required: [true, 'Unidades obligatorias'] },
            tipo: { type: String, required: [true, 'Nombre obligatorio'] }
        }],
        required: [true, 'Ingredientes obligatorios']
    },
    imagen: { type: String, required: false, default: null },
    pasos: { type: [String], required: [true, 'Pasos obligatorios'] },
    calorias: {
        type: {
            cantidad: { type: Number, required: [true, 'Cantidad obligatoria'] },
            unidades: { type: String, required: [true, 'Unidades obligatorias'] },
        },
        required: [true, 'Pasos obligatorios']
    },
    nivel: { type: String, required: [true, 'Nivel obligatorio'], enum: NivelesValidos },
    creador: { type: Schema.Types.ObjectId, ref: 'Usuario' }
}, { collection: 'recetas' });

recetaSchema.plugin(uniqueValidator, { message: '[{PATH}] debe ser único' });

module.exports = mongoose.model('Receta', recetaSchema);
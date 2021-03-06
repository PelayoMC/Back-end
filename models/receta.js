var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var NivelesValidos = {
    values: ['Facil', 'Medio', 'Dificil'],
    message: '{VALUE} no es un nivel permitido'
};

var recetaSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, 'Nombre obligatorio'] },
    descripcion: { type: String, required: [true, 'Descripción obligatoria'] },
    tipoRe: { type: String, required: [true, 'Tipo de la receta obligatorio'] },
    ingredientes: {
        type: [{
            id: { type: Schema.Types.ObjectId, ref: 'Ingrediente' },
            nombre: { type: String, required: [true, 'Nombre obligatorio'] },
            cantidad: { type: Number, required: [false] },
            unidades: { type: String, required: [true, 'Unidades obligatorias'] },
            tipo: { type: String, required: [true, 'Nombre obligatorio'] },
            ingredienteSustituible: { type: Schema.Types.ObjectId, ref: 'Ingrediente', required: false },
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
    puntuacion: { type: Number, required: false, default: 0 },
    creador: { type: Schema.Types.ObjectId, ref: 'Usuario' }
}, { collection: 'recetas' });

recetaSchema.plugin(uniqueValidator, { message: '[{PATH}] debe ser único' });

module.exports = mongoose.model('Receta', recetaSchema);
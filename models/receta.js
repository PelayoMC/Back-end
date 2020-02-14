var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;


var UnidadesValidas = {
    values: ['cal', 'kcal', 'g', 'kg', 'ml', 'l', 'Al gusto', ''],
    message: '{VALUE} no es una unidad permitida'
};

var NivelesValidos = {
    values: ['Muy facil', 'Facil', 'Intermedio', 'Dificil', 'Muy dificil'],
    message: '{VALUE} no es un nivel permitido'
};

var recetaSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, 'Nombre obligatorio'] },
    descripcion: { type: String, required: [true, 'Descripción obligatoria'] },
    ingredientes: {
        type: [{
            nombre: { type: String, required: [true, 'Nombre de ingrediente obligatorio'] },
            cantidad: { type: Number, required: [true, 'Cantidad de ingrediente obligatoria'] },
            unidades: { type: String, required: [true, 'Unidades obligatorias'], enum: UnidadesValidas },
        }],
        required: [true, 'Ingredientes obligatorios']
    },
    imagen: { type: String, required: false, default: null },
    pasos: { type: [String], required: [true, 'Pasos obligatorios'] },
    calorias: {
        type: {
            cantidad: { type: Number, required: [true, 'Cantidad obligatoria'] },
            unidades: { type: String, required: [true, 'Unidades obligatorias'], enum: UnidadesValidas },
        },
        required: [true, 'Pasos obligatorios']
    },
    nivel: { type: String, required: [true, 'Nivel obligatorio'], enum: NivelesValidos },
}, { collection: 'recetas' });

recetaSchema.plugin(uniqueValidator, { message: '[{PATH}] debe ser único' });

module.exports = mongoose.model('Receta', recetaSchema);
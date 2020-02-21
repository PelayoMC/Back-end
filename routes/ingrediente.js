var express = require('express');
var middleware = require('../middlewares/autenticacion');
var app = express();

var Ingrediente = require('../models/ingrediente');

app.get('/', (req, res, next) => {
    Ingrediente.find({}, (err, ingredientes) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando ingredientes',
                errors: err
            });
        } else {
            res.status(200).json({
                ok: true,
                mensaje: 'Ingredientes',
                ingredientes: ingredientes
            });
        }
    });
});

// Modificar
app.put('/:id', middleware.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Ingrediente.findById(id, (err, ingredienteEncontrado) => {
        if (!ingredienteEncontrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El ingrediente con el id: [' + id + '] no existe',
                errors: { message: 'No existe un ingrediente con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar el ingrediente',
                errors: err
            });
        }

        ingredienteEncontrado.nombre = body.nombre;
        ingredienteEncontrado.tipo = body.tipo;
        IngredienteEncontrado.ingredienteSustituible = body.ingredienteSustituible;

        IngredienteEncontrado.save((err, ingredienteGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el ingrediente',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                mensaje: 'Ingrediente actualizado correctamente',
                ingrediente: ingredienteGuardado
            });
        });
    });
});

// Añadir
app.post('/', (req, res) => {
    var body = req.body;

    var ingrediente = new Ingrediente({
        nombre: body.nombre,
        tipo: body.tipo,
        ingredienteSustituible: body.ingredienteSustituible
    });

    ingrediente.save((err, ingredienteGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el ingrediente',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            mensaje: 'Ingrediente guardado',
            ingrediente: ingredienteGuardado,
            usuarioToken: req.usuario
        });
    });
});


app.delete('/:id', middleware.verificaToken, (req, res) => {
    var id = req.params.id;

    Ingrediente.findByIdAndRemove(id, { useFindAndModify: false }, (err, ingredienteBorrado) => {
        if (!IngredienteBorrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El ingrediente con el id: [' + id + '] no existe',
                errors: { message: 'No existe un ingrediente con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el ingrediente',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'Ingrediente borrado',
            ingrediente: ingredienteBorrado
        });
    });
});


module.exports = app;
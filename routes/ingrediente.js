var express = require('express');
var middleware = require('../middlewares/autenticacion');
var app = express();

var Ingrediente = require('../models/ingrediente');

app.get('/', (req, res, next) => {
    var desde = req.query.from || 0;
    desde = Number(desde);

    Ingrediente.find({})
        .skip(desde)
        .limit(5)
        .exec((err, ingredientes) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando ingredientes',
                    errors: err
                });
            } else {
                Ingrediente.count({}, (err, total) => {
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Ingredientes',
                        ingredientes: ingredientes,
                        total
                    });
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

        Ingrediente.findById(body.ingredienteSustituible, (err, ingredienteRelEncontrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al encontrar el ingrediente',
                    errors: err
                });
            }
            if (!ingredienteRelEncontrado) {
                ingredienteEncontrado.ingredienteSustituible = null;
            } else {
                ingredienteEncontrado.ingredienteSustituible = ingredienteRelEncontrado;
            }
        });

        ingredienteEncontrado.creador = req.usuario;
        ingredienteEncontrado.save((err, ingredienteGuardado) => {
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
app.post('/', middleware.verificaToken, (req, res) => {
    var body = req.body;

    var ingrediente = new Ingrediente({
        nombre: body.nombre,
        tipo: body.tipo,
        ingredienteSustituible: body.ingredienteSustituible,
        creador: req.usuario
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
            usuario: req.usuario.email
        });
    });
});


app.delete('/:id', middleware.verificaToken, (req, res) => {
    var id = req.params.id;

    Ingrediente.findByIdAndRemove(id, { useFindAndModify: false }, (err, ingredienteBorrado) => {
        if (!ingredienteBorrado) {
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
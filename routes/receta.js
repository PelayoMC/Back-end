var express = require('express');
var middleware = require('../middlewares/autenticacion');
var mongoose = require('mongoose');
var app = express();

var Receta = require('../models/receta');
var Ingrediente = require('../models/ingrediente');

app.get('/', (req, res, next) => {
    var desde = req.query.from || 0;
    desde = Number(desde);

    Receta.find({})
        .skip(desde)
        .limit(5)
        .exec((err, recetas) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando recetas',
                    errors: err
                });
            } else {
                Receta.count({}, (err, total) => {
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Recetas',
                        recetas: recetas,
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

    Receta.findById(id, (err, recetaEncontrada) => {
        if (!recetaEncontrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La receta con el id: [' + id + '] no existe',
                errors: { message: 'No existe una receta con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar la receta',
                errors: err
            });
        }

        recetaEncontrada.nombre = body.nombre;
        recetaEncontrada.descripcion = body.descripcion;
        recetaEncontrada.ingredientes = body.ingredientes;
        recetaEncontrada.imagen = body.imagen;
        recetaEncontrada.pasos = body.pasos;
        recetaEncontrada.calorias = body.calorias;
        recetaEncontrada.nivel = body.nivel;
        recetaEncontrada.creador = req.usuario;

        recetaEncontrado.save((err, recetaGuardada) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar la receta',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                mensaje: 'Receta actualizada correctamente',
                receta: recetaGuardada
            });
        });
    });
});

// Añadir
app.post('/', middleware.verificaToken, (req, res) => {
    var body = req.body;
    var ids = req.body.ingredientes;

    obtenerIngredientes(ids).then(ings => {
        var ingredientes = [];
        for (let i = 0; i < ings.length; i++) {
            var ing = {
                "ingrediente": ings[i],
                "cantidad": ids[i].cantidad,
                "unidades": ids[i].unidades
            };
            ingredientes.push(ing);
        }
        var receta = new Receta({
            nombre: body.nombre,
            descripcion: body.descripcion,
            ingredientes: ingredientes,
            imagen: body.imagen,
            pasos: body.pasos,
            calorias: body.calorias,
            nivel: body.nivel,
            creador: req.usuario
        });

        receta.save((err, recetaGuardada) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear la receta',
                    errors: err
                });
            }
            res.status(201).json({
                ok: true,
                mensaje: 'Receta guardada',
                receta: recetaGuardada,
                usuario: req.usuario.email
            });
        });
    });
});

function obtenerIngredientes(ids) {
    return new Promise((resolve, reject) => {
        Ingrediente.find({
            '_id': { $in: ids }
        }).exec((err, ingredientesInt) => {
            if (err) {
                reject('Error cargando los ingredientes', err);
            }
            resolve(ingredientesInt);
        });
    });
}


app.delete('/:id', middleware.verificaToken, (req, res) => {
    var id = req.params.id;

    Receta.findByIdAndRemove(id, { useFindAndModify: false }, (err, recetaBorrada) => {
        if (!recetaBorrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La receta con el id: [' + id + '] no existe',
                errors: { message: 'No existe una receta con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar la receta',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'Receta borrada',
            receta: recetaBorrada
        });
    });
});


module.exports = app;
var express = require('express');
var middleware = require('../middlewares/autenticacion');
var mongoose = require('mongoose');
var app = express();

var Etiqueta = require('../models/etiqueta');

app.get('/', (req, res, next) => {

    Etiqueta.find({})
        .sort('nombre')
        .exec((err, etiquetas) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando etiquetas',
                    errors: err
                });
            } else {
                Etiqueta.countDocuments({}, (err, total) => {
                    res.status(200).json({
                        ok: true,
                        mensaje: 'etiquetas',
                        etiquetas: etiquetas,
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

    Etiqueta.findById(id, (err, etiquetaEncontrada) => {
        if (!etiquetaEncontrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La etiqueta con el id: [' + id + '] no existe',
                errors: { message: 'No existe una etiqueta con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar la etiqueta',
                errors: err
            });
        }

        etiquetaEncontrada.nombre = body.nombre;

        etiquetaEncontrada.save((err, etiquetaGuardada) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar la etiqueta',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                mensaje: 'etiqueta actualizada correctamente',
                etiqueta: etiquetaGuardada
            });
        });
    });
});

// Añadir
app.post('/', middleware.verificaToken, (req, res) => {
    var body = req.body;
    var etiquetas = [];
    for (let item of body.etiquetas) {
        var etiqueta = {
            nombre: item
        }
        etiquetas.push(etiqueta);
    }
    Etiqueta.create(etiquetas, (err, etiquetasGuardada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear las etiquetas',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            mensaje: 'etiquetas guardada',
            etiquetas: etiquetasGuardada
        });
    });

});

app.delete('/:id', middleware.verificaToken, (req, res) => {
    var id = req.params.id;

    Etiqueta.findByIdAndRemove(id, { useFindAndModify: false }, (err, etiquetaBorrada) => {
        if (!etiquetaBorrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La etiqueta con el id: [' + id + '] no existe',
                errors: { message: 'No existe una etiqueta con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar la etiqueta',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'etiqueta borrada',
            etiqueta: etiquetaBorrada
        });
    });
});


module.exports = app;
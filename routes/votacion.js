var express = require('express');
var middleware = require('../middlewares/autenticacion');
var mongoose = require('mongoose');
var app = express();

var Votacion = require('../models/votacion');

app.get('/receta/:id', (req, res, next) => {
    var id = req.params.id;

    Votacion.find({ receta: id }, (err, votacion) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando votacion',
                errors: err
            });
        } else {
            res.status(200).json({
                ok: true,
                mensaje: 'Votacion',
                votacion
            });
        }
    });
});


app.get('/usuario/:id', (req, res, next) => {
    var id = req.params.id;

    Votacion.find({ usuarios: id }, (err, votacion) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando votacion',
                errors: err
            });
        } else {
            res.status(200).json({
                ok: true,
                mensaje: 'Votacion',
                votacion
            });
        }
    });
});

// Modificar
app.put('/:id', middleware.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Votacion.findById(id, (err, votacionEncontrada) => {
        if (!votacionEncontrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La votacion con el id no existe',
                errors: { message: 'No existe una votacion con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar la votacion',
                errors: err
            });
        }

        votacionEncontrada.total = body.total;
        votacionEncontrada.puntos = body.puntos;
        votacionEncontrada.receta = body.receta;
        votacionEncontrada.usuarios = body.usuarios;

        votacionEncontrada.save((err, votacionGuardada) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar la votacion',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                mensaje: 'Votacion actualizada correctamente',
                votacion: votacionGuardada
            });
        });
    });
});


// Añadir
app.post('/', middleware.verificaToken, (req, res) => {
    var body = req.body;
    var votacion = new Votacion({
        total: 0,
        puntos: 0,
        receta: body.id == null ? null : mongoose.Types.ObjectId(body.id),
        usuarios: []
    });
    votacion.save((err, votacionGuardada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear la votacion',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            mensaje: 'Votacion guardada',
            votacoin: votacionGuardada,
            usuarioToken: req.usuario.email
        });
    });
});

// Borrar por id de receta
app.delete('/:id', middleware.verificaToken, (req, res) => {
    var id = req.params.id;

    Votacion.deleteOne({ receta: id }, { justiOne: true }, (err, votacionBorrada) => {
        if (!votacionBorrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La votacion no existe',
                errors: { message: 'No existe una intolerancia con una receta con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar la votacion',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'Votacion borrada',
            votacion: votacionBorrada
        });
    });
});


module.exports = app;
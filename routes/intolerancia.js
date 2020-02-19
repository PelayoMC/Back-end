var express = require('express');
var middleware = require('../middlewares/autenticacion');
var app = express();

var Intolerancia = require('../models/intolerancia');

app.get('/', (req, res, next) => {
    Intolerancia.find({}, (err, intolerancias) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando intolerancias',
                errors: err
            });
        } else {
            res.status(200).json({
                ok: true,
                mensaje: 'Intolerancias',
                intolerancias: intolerancias
            });
        }
    });
});

// Modificar
app.put('/:id', middleware.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Intolerancia.findById(id, (err, intoleranciaEncontrada) => {
        if (!intoleranciaEncontrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La intolerancia con el id: [' + id + '] no existe',
                errors: { message: 'No existe una intolerancia con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar la intolerancia',
                errors: err
            });
        }

        intoleranciaEncontrada.nombre = body.nombre;
        intoleranciaEncontrada.ingredientes = body.ingredientes;

        IntoleranciaEncontrada.save((err, intoleranciaGuardada) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar la intolerancia',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                mensaje: 'Intolerancia actualizada correctamente',
                intolerancia: intoleranciaGuardada
            });
        });
    });
});

// Añadir
app.post('/', middleware.verificaToken, (req, res) => {
    var body = req.body;

    var Intolerancia = new Intolerancia({
        nombre: body.nombre,
        ingredientes: body.ingredientes
    });

    Intolerancia.save((err, intoleranciaGuardada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear la intolerancia',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            mensaje: 'Intolerancia guardada',
            intolerancia: intoleranciaGuardada,
            usuarioToken: req.usuario
        });
    });
});


app.delete('/:id', middleware.verificaToken, (req, res) => {
    var id = req.params.id;

    Intolerancia.findByIdAndRemove(id, { useFindAndModify: false }, (err, intoleranciaBorrada) => {
        if (!intoleranciaBorrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La intolerancia con el id: [' + id + '] no existe',
                errors: { message: 'No existe una intolerancia con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar la intolerancia',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'Intolerancia borrada',
            intolerancia: intoleranciaBorrada
        });
    });
});


module.exports = app;
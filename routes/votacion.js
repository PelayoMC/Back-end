var express = require('express');
var middleware = require('../middlewares/autenticacion');
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

    Votacion.findById(id, (err, intoleranciaEncontrada) => {
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
        intoleranciaEncontrada.descripcion = body.descripcion;
        intoleranciaEncontrada.noApto = body.noApto;

        intoleranciaEncontrada.save((err, intoleranciaGuardada) => {
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


app.post('/nombre', (req, res, next) => {
    var names = req.body.nombres;

    Votacion.find({ 'nombre': { '$in': names } })
        .exec((err, intolerancias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando las intolerancias',
                    errors: err
                });
            } else {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Intolerancias',
                    intolerancias
                });
            }
        });
});


// Añadir
app.post('/', middleware.verificaToken, (req, res) => {
    var body = req.body;
    var intolerancia = new Intolerancia({
        nombre: body.nombre,
        descripcion: body.descripcion,
        noApto: body.noApto
    });
    intolerancia.save((err, intoleranciaGuardada) => {
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
            usuarioToken: req.usuario.email
        });
    });
});


app.delete('/:id', middleware.verificaToken, (req, res) => {
    var id = req.params.id;

    Votacion.findByIdAndRemove(id, { useFindAndModify: false }, (err, intoleranciaBorrada) => {
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
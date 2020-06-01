var express = require('express');
var middleware = require('../middlewares/autenticacion');
var fs = require('fs');
var app = express();

var Intolerancia = require('../models/intolerancia');

app.get('/', (req, res, next) => {
    var desde = req.query.from || 0;
    var limit = req.query.limit || 12;
    desde = Number(desde);
    limit = Number(limit);

    Intolerancia.find({})
        .skip(desde)
        .limit(limit)
        .sort('nombre')
        .exec((err, intolerancias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando intolerancias',
                    errors: err
                });
            } else {
                Intolerancia.countDocuments({}, (err, total) => {
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Intolerancias',
                        intolerancias: intolerancias,
                        total
                    });
                });
            }
        });
});


app.get('/:id', (req, res, next) => {
    var id = req.params.id;

    Intolerancia.find({ '_id': id })
        .exec((err, intolerancia) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando la intolerancia',
                    errors: err
                });
            } else {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Intolerancia',
                    intolerancia
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

    Intolerancia.find({ 'nombre': { '$in': names } })
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
        var antiguoPath = './uploads/intolerancias/' + intoleranciaBorrada.imagen;

        if (fs.existsSync(antiguoPath)) {
            fs.unlink(antiguoPath, (err) => {
                if (err) {
                    console.log(err);
                }
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
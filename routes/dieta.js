var express = require('express');
var middleware = require('../middlewares/autenticacion');
var app = express();

var Dieta = require('../models/dieta');
var Receta = require('../models/receta');

app.get('/asignar', (req, res, next) => {
    var desde = req.query.from || 0;
    var limit = req.query.limit || 9;
    desde = Number(desde);
    limit = Number(limit);

    Dieta.find({ admin: null })
        .skip(desde)
        .limit(limit)
        .exec((err, dietas) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando dieta',
                    errors: err
                });
            } else {
                Dieta.countDocuments({ admin: null })
                    .exec((err, total) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error cargando dieta',
                                errors: err
                            });
                        } else {
                            res.status(200).json({
                                ok: true,
                                mensaje: 'Dieta',
                                dietas,
                                total
                            });
                        }
                    });
            }
        });
});

app.get('/comentarios/:id', (req, res, next) => {
    var desde = req.query.from || 0;
    var limit = req.query.limit || 9;
    desde = Number(desde);
    limit = Number(limit);
    var id = req.params.id;

    Dieta.find({ admin: id })
        .skip(desde)
        .limit(limit)
        .exec((err, dietas) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando dieta',
                    errors: err
                });
            } else {
                let respuesta = dietas.filter(el => el.dieta.some(el => el.comentario !== null));
                Dieta.find({ admin: id })
                    .exec((err, total) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error cargando dieta',
                                errors: err
                            });
                        } else {
                            let respuestaCount = dietas.filter(el => el.dieta.some(el => el.comentario !== null));
                            res.status(200).json({
                                ok: true,
                                mensaje: 'Dieta',
                                dietas: respuesta,
                                total: respuestaCount.length
                            });
                        }
                    });
            }
        });
});

app.get('/recetas/:id', (req, res, next) => {
    var id = req.params.id;

    Dieta.findById(id, (err, dieta) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando dieta',
                errors: err
            });
        } else {
            let ar = dieta.dieta;
            Receta.find({ _id: ar.map(el => el.receta) }, (err, recetas) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando dieta',
                        errors: err
                    });
                } else {
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Recetas',
                        recetas
                    });
                }
            });
        }
    });
});

app.get('/admin/:id', (req, res, next) => {
    var id = req.params.id;

    Dieta.find({ admin: id }, (err, dieta) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando dieta',
                errors: err
            });
        } else {
            res.status(200).json({
                ok: true,
                mensaje: 'Dieta',
                dieta
            });
        }
    });
});


app.get('/usuario/:id', (req, res, next) => {
    var id = req.params.id;

    Dieta.find({ usuario: id }, (err, dieta) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando dieta',
                errors: err
            });
        } else {
            res.status(200).json({
                ok: true,
                mensaje: 'Dieta',
                dieta
            });
        }
    });
});


app.get('/:id', (req, res, next) => {
    var id = req.params.id;

    Dieta.find({ _id: id }, (err, dieta) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando dieta',
                errors: err
            });
        } else {
            res.status(200).json({
                ok: true,
                mensaje: 'Dieta',
                dieta
            });
        }
    });
});

// modificar solo el feedback
app.put('/feedback/:id', middleware.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Dieta.findById(id, (err, dietaEncontrada) => {
        if (!dietaEncontrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La dieta con el id: [' + id + '] no existe',
                errors: { message: 'No existe una dieta con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar la dieta',
                errors: err
            });
        }
        dietaEncontrada.dieta.forEach(el => el.comentario = null);
        dietaEncontrada.feedback = body.feedback;

        dietaEncontrada.save((err, dietaGuardada) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar la dieta',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                mensaje: 'Dieta actualizada correctamente',
                dieta: dietaGuardada
            });
        });
    });
});

// Modificar
app.put('/:id', middleware.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body.dieta;

    Dieta.findById(id, (err, dietaEncontrada) => {
        if (!dietaEncontrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La dieta con el id: [' + id + '] no existe',
                errors: { message: 'No existe una dieta con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar la dieta',
                errors: err
            });
        }

        dietaEncontrada.dieta = body.dieta;
        dietaEncontrada.admin = body.admin;
        dietaEncontrada.usuario = body.usuario;
        dietaEncontrada.feedback = body.feedback;

        dietaEncontrada.save((err, dietaGuardada) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar la dieta',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                mensaje: 'Dieta actualizada correctamente',
                dieta: dietaGuardada
            });
        });
    });
});

// Añadir
app.post('/', middleware.verificaToken, (req, res) => {
    var body = req.body;
    var dieta = new Dieta({
        dieta: null,
        admin: null,
        usuario: body.usuario
    });
    dieta.save((err, dietaGuardada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear la dieta',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            mensaje: 'dieta guardada',
            dieta: dietaGuardada,
            usuarioToken: req.usuario.email
        });
    });
});


app.delete('/:id', middleware.verificaToken, (req, res) => {
    var id = req.params.id;

    Dieta.findByIdAndRemove(id, { useFindAndModify: false }, (err, dietaBorrada) => {
        if (!dietaBorrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La dieta con el id: [' + id + '] no existe',
                errors: { message: 'No existe una dieta con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar la dieta',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'dieta borrada',
            dieta: dietaBorrada
        });
    });
});


module.exports = app;
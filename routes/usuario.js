var express = require('express');
var bcrypt = require('bcryptjs');
var middleware = require('../middlewares/autenticacion');
var fs = require('fs');
var app = express();


var Usuario = require('../models/usuario');
var Receta = require('../models/receta');
var Intolerancia = require('../models/intolerancia');

// ================================================
// (GET) Obtener listado de usuarios
// ================================================
app.get('/', (req, res, next) => {

    var desde = req.query.from || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email imagen rol google recetasFavoritas misIntolerancias notificaciones dieta edad altura peso observaciones')
        .sort('email') // -email para asc
        .skip(desde)
        .limit(7)
        .exec(
            (err, users) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                } else {
                    Usuario.countDocuments({}, (err, total) => {
                        res.status(200).json({
                            ok: true,
                            mensaje: 'Usuarios',
                            usuarios: users,
                            total
                        });
                    });
                }
            });
});


app.get('/recetas/:id', (req, res, next) => {

    var id = req.params.id;
    var desde = req.query.from || 0;
    var limit = req.query.limit || 7;
    desde = Number(desde);
    limit = Number(limit);

    Usuario.find({ _id: id }, 'nombre email imagen rol google recetasFavoritas misIntolerancias notificaciones dieta edad altura peso observaciones')
        .exec((err, user) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                });
            } else {
                const ar = user[0].recetasFavoritas;
                Receta.find({ _id: { '$in': ar } })
                    .skip(desde)
                    .limit(limit)
                    .exec((err, recetas) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error cargando recetas',
                                errors: err
                            });
                        } else {
                            Receta.countDocuments({ _id: { '$in': ar } })
                                .exec((err, total) => {
                                    if (err) {
                                        return res.status(500).json({
                                            ok: false,
                                            mensaje: 'Error contando recetas',
                                            errors: err
                                        });
                                    } else {
                                        res.status(200).json({
                                            ok: true,
                                            mensaje: 'Recetas',
                                            recetas,
                                            total
                                        });
                                    }
                                });
                        }
                    });
            }
        });
});

app.get('/intolerancias/:id', (req, res, next) => {

    var id = req.params.id;
    var desde = req.query.from || 0;
    var limit = req.query.limit || 7;
    desde = Number(desde);
    limit = Number(limit);

    Usuario.find({ _id: id }, 'nombre email imagen rol google recetasFavoritas misIntolerancias notificaciones dieta edad altura peso observaciones')
        .exec((err, user) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                });
            } else {
                const ar = user[0].misIntolerancias;
                Intolerancia.find({ _id: { '$in': ar } })
                    .skip(desde)
                    .limit(limit)
                    .exec((err, intolerancias) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error cargando intolerancias',
                                errors: err
                            });
                        } else {
                            Intolerancia.countDocuments({ _id: { '$in': ar } })
                                .exec((err, total) => {
                                    if (err) {
                                        return res.status(500).json({
                                            ok: false,
                                            mensaje: 'Error contando intolerancias',
                                            errors: err
                                        });
                                    } else {
                                        res.status(200).json({
                                            ok: true,
                                            mensaje: 'Intolerancias',
                                            intolerancias,
                                            total
                                        });
                                    }
                                });
                        }
                    });
            }
        });
});


app.get('/:id', (req, res, next) => {

    var id = req.params.id;

    Usuario.findOne({ _id: id }, 'nombre email imagen rol google recetasFavoritas misIntolerancias notificaciones dieta edad altura peso observaciones')
        .exec(
            (err, user) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario',
                        errors: err
                    });
                } else {
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Usuario',
                        usuario: user
                    });
                }
            });
});

// ================================================
// (PUT) Actualizar usuario existente
// ================================================
app.put('/:id', middleware.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuarioEncontrado) => {
        if (!usuarioEncontrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id: [' + id + '] no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar el usuario',
                errors: err
            });
        }

        usuarioEncontrado.nombre = body.nombre;
        usuarioEncontrado.email = body.email;
        usuarioEncontrado.rol = body.rol;
        usuarioEncontrado.dieta = body.dieta;
        usuarioEncontrado.recetasFavoritas = body.recetasFavoritas;
        usuarioEncontrado.misIntolerancias = body.misIntolerancias;
        usuarioEncontrado.edad = body.edad;
        usuarioEncontrado.altura = body.altura;
        usuarioEncontrado.peso = body.peso;
        usuarioEncontrado.observaciones = body.observaciones;
        usuarioEncontrado.notificaciones = body.notificaciones;

        usuarioEncontrado.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                mensaje: 'Usuario actualizado correctamente',
                usuario: usuarioGuardado
            });
        });
    });
});


// ================================================
// (POST) Añadir nuevo usuario
// ================================================
app.post('/', (req, res) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        contraseña: bcrypt.hashSync(body.contraseña, 10),
        imagen: body.imagen,
        rol: body.rol,
        dieta: null,
        recetasFavoritas: [],
        misIntolerancias: [],
        notificaciones: []
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Usuario ya existente',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            mensaje: 'Usuario guardado',
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });
});


// ================================================
// (Delete) Borrar usuario existente
// ================================================
app.delete('/:id', middleware.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, { useFindAndModify: false }, (err, usuarioBorrado) => {
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id: [' + id + '] no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }
        var antiguoPath = './uploads/usuarios/' + usuarioBorrado.imagen;

        if (fs.existsSync(antiguoPath)) {
            fs.unlink(antiguoPath, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'Usuario borrado',
            usuario: usuarioBorrado
        });
    });
});


module.exports = app;
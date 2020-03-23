var express = require('express');
var bcrypt = require('bcryptjs');
var middleware = require('../middlewares/autenticacion');
var app = express();


var Usuario = require('../models/usuario');

// ================================================
// (GET) Obtener listado de usuarios
// ================================================
app.get('/', (req, res, next) => {
    var desde = req.query.from || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email imagen rol google recetasFavoritas')
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
                    Usuario.count({}, (err, total) => {
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
        usuarioEncontrado.recetasFavoritas = body.recetasFavoritas;

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
        recetasFavoritas: body.recetasFavoritas
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
        res.status(200).json({
            ok: true,
            mensaje: 'Usuario borrado',
            usuario: usuarioBorrado
        });
    });
});


module.exports = app;
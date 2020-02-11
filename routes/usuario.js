var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');

var Usuario = require('../models/usuario');

// ================================================
// (GET) Obtener listado de usuarios
// ================================================
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email imagen rol').exec(
        (err, users) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                });
            } else {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Usuarios',
                    usuarios: users
                });
            }
        })
});

// ================================================
// (PUT) Actualizar usuario existente
// ================================================
app.put('/:id', (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuarioEncontrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar el usuario',
                errors: err
            });
        }
        if (!usuarioEncontrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id:' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuarioEncontrado.nombre = body.nombre;
        usuarioEncontrado.email = body.email;
        usuarioEncontrado.rol = body.rol;

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
        rol: body.rol
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            mensaje: 'Usuario guardado',
            usuario: usuarioGuardado
        });
    });
});
module.exports = app;
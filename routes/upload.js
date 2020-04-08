var express = require('express');
var fileupload = require('express-fileupload');
var fs = require('fs');
var app = express();

app.use(fileupload());

var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
var coleccionesValidas = ['usuarios', 'recetas'];
var Usuario = require('../models/usuario');
var Receta = require('../models/receta');

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Colecciones validas
    if (coleccionesValidas.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Colección no válida',
            errors: { message: 'Las colecciones validas son ' + coleccionesValidas.join(', ') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    var archivo = req.files.imagen;
    // Separar en trozos donde el ultimo es la extension (por si tiene puntos el nombre)
    var nombreCortado = archivo.name.split('.');
    var extension = nombreCortado[nombreCortado.length - 1];

    // Extensiones aceptadas
    if (extensionesValidas.indexOf(extension.toLowerCase()) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Las extensiones validas son ' + extensionesValidas.join(', ') }
        });
    }

    // Personalizar nombre random
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    path = `./uploads/${ tipo }/${ nombreArchivo }`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        uploadTipo(tipo, id, nombreArchivo, res);

    });
});

function uploadTipo(collecion, id, nombreArchivo, res) {
    switch (collecion) {
        case 'usuarios':
            Usuario.findById(id, (err, usuarioEncontrado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al encontrar al usuario',
                        errors: err
                    });
                }
                var antiguoPath = './uploads/usuarios/' + usuarioEncontrado.imagen;
                // Si existe una imagen previamente, la elimina
                if (fs.existsSync(antiguoPath)) {
                    fs.unlink(antiguoPath, (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
                usuarioEncontrado.imagen = nombreArchivo;
                usuarioEncontrado.save((err, usuarioActualizado) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al actualizar la imagen al usuario',
                            errors: err
                        });
                    }
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',
                        usuario: usuarioActualizado
                    });
                });
            });
            break;
        case 'recetas':
            Receta.findById(id, (err, recetaEncontrada) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al encontrar la receta',
                        errors: err
                    });
                }
                var antiguoPath = './uploads/recetas/' + recetaEncontrada.imagen;
                if (fs.existsSync(antiguoPath) && recetaEncontrada.imagen.length > 3) {
                    fs.unlink(antiguoPath, (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
                recetaEncontrada.imagen = nombreArchivo;
                recetaEncontrada.save((err, recetaActualizada) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al actualizar la imagen de la receta',
                            errors: err
                        });
                    }
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',
                        receta: recetaActualizada
                    });
                });
            });
            break;
    }
}

module.exports = app;
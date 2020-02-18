var express = require('express');
var fileupload = require('express-fileupload');
var app = express();

app.use(fileupload());

var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
var coleccionesValidas = ['usuarios', 'recetas', 'ingredientes', 'intolerancias'];

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
    if (extensionesValidas.indexOf(extension) < 0) {
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
        res.status(200).json({
            ok: true,
            mensaje: 'Archivo subido al servidor',
            filePath: path,
            extension: extension
        });
    });
});

module.exports = app;
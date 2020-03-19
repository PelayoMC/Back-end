var express = require('express');
var app = express();

const path = require('path');
const fs = require('fs');

app.get('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    var pathImg = path.resolve(__dirname, `../uploads/${tipo}/${id}`);
    if (fs.existsSync(pathImg)) {
        // Se encuentra imagen
        res.sendFile(pathImg);
    } else {
        // Se envia imagen por defecto
        var pathNoImg = path.resolve(__dirname, `../assets/no-img.jpg`);
        res.sendFile(pathNoImg);
    }
});

module.exports = app;
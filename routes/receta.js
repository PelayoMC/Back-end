var express = require('express');
var middleware = require('../middlewares/autenticacion');
var mongoose = require('mongoose');
var fs = require('fs');
var app = express();

var Receta = require('../models/receta');
var Ingrediente = require('../models/ingrediente');

app.get('/', (req, res, next) => {
    var desde = req.query.from || 0;
    var limit = req.query.limit || 12;
    desde = Number(desde);
    limit = Number(limit);

    Receta.find({})
        .skip(desde)
        .limit(limit)
        .collation({ locale: "en" })
        .sort('nombre')
        .exec((err, recetas) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando recetas',
                    errors: err
                });
            } else {
                Receta.countDocuments({}, (err, total) => {
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Recetas',
                        recetas: recetas,
                        total
                    });
                });
            }
        });
});

app.get('/:id', (req, res, next) => {
    let id = req.params.id;
    Receta.find({ _id: id })
        .exec((err, receta) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando la receta',
                    errors: err
                });
            } else {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Receta',
                    receta: receta
                });
            }
        });
});

app.put('/addIngs/:id', middleware.verificaToken, (req, res) => {
    var id = req.params.id;
    var ings = req.body.ingredients;
    for (let ing of ings) {
        if (ing.ingredienteSustituible !== null) {
            ing.ingredienteSustituible = mongoose.Types.ObjectId(ing.ingredienteSustituible);
        }
    }
    Receta.findById(id, (err, recetaEncontrada) => {
        if (!recetaEncontrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La receta con el id: [' + id + '] no existe',
                errors: { message: 'No existe una receta con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar la receta',
                errors: err
            });
        }
        recetaEncontrada.ingredientes = ings;
        recetaEncontrada.save((err, recetaGuardada) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar la receta',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                mensaje: 'Receta actualizada correctamente',
                receta: recetaGuardada
            });
        });
    });
});

// Modificar
app.put('/:id', middleware.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Receta.findById(id, (err, recetaEncontrada) => {
        if (!recetaEncontrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La receta con el id: [' + id + '] no existe',
                errors: { message: 'No existe una receta con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar la receta',
                errors: err
            });
        }

        recetaEncontrada.nombre = body.nombre;
        recetaEncontrada.descripcion = body.descripcion;
        recetaEncontrada.tipoRe = body.tipoRe;
        recetaEncontrada.ingredientes = body.ingredientes;
        recetaEncontrada.imagen = body.imagen;
        recetaEncontrada.pasos = body.pasos;
        recetaEncontrada.calorias = body.calorias;
        recetaEncontrada.nivel = body.nivel;
        recetaEncontrada.ingredienteSustituible = body.ingredienteSustituible;
        recetaEncontrada.creador = req.usuario;

        recetaEncontrada.save((err, recetaGuardada) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar la receta',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                mensaje: 'Receta actualizada correctamente',
                receta: recetaGuardada
            });
        });
    });
});

app.put('/votes/:id', (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Receta.findById(id, (err, recetaEncontrada) => {
        if (!recetaEncontrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La receta con el id: [' + id + '] no existe',
                errors: { message: 'No existe una receta con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar la receta',
                errors: err
            });
        }

        recetaEncontrada.puntuacion = body.puntuacion;

        recetaEncontrada.save((err, recetaGuardada) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar la receta',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                mensaje: 'Receta actualizada correctamente',
                receta: recetaGuardada
            });
        });
    });
});

app.post('/ids', async(req, res, next) => {
    let ids = req.body.ids;

    respuesta = [];
    for (let id of ids) {
        let r = await obtenerReceta(id);
        respuesta.push(r);
    }
    res.status(200).json({
        ok: true,
        mensaje: 'Recetas',
        recetas: respuesta
    });
});

async function obtenerReceta(id) {
    return new Promise((resolve, reject) => {
        Receta.findOne({ _id: id })
            .exec((err, receta) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(receta);
                }
            });
    })
}

// Añadir
app.post('/', middleware.verificaToken, (req, res) => {
    var body = req.body;
    var ids = req.body.ingredientes;

    obtenerIngredientes(ids).then(ings => {
        var ingredientes = [];
        for (let i = 0; i < ings.length; i++) {
            var ing = {
                "_id": ings[i]._id,
                "nombre": ids[i].nombre,
                "cantidad": ids[i].cantidad,
                "unidades": ids[i].unidades,
                "tipo": ids[i].tipo
            };
            ingredientes.push(ing);
        }
        var receta = new Receta({
            nombre: body.nombre,
            descripcion: body.descripcion,
            tipoRe: body.tipoRe,
            ingredientes: ingredientes,
            imagen: body.imagen,
            pasos: body.pasos,
            calorias: body.calorias,
            nivel: body.nivel,
            creador: req.usuario
        });
        receta.save((err, recetaGuardada) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear la receta',
                    errors: err
                });
            }
            res.status(201).json({
                ok: true,
                mensaje: 'Receta guardada',
                receta: recetaGuardada,
                usuario: req.usuario.email
            });
        });
    });
});

function obtenerIngredientes(ids) {
    ids = ids.map(el => el._id);
    return new Promise((resolve, reject) => {
        Ingrediente.find({
            '_id': { $in: ids }
        }).sort('nombre').exec((err, ingredientesInt) => {
            if (err) {
                reject('Error cargando los ingredientes', err);
            }
            resolve(ingredientesInt);
        });
    });
}

app.delete('/:id', middleware.verificaToken, (req, res) => {
    var id = req.params.id;

    Receta.findByIdAndRemove(id, { useFindAndModify: false }, (err, recetaBorrada) => {
        if (!recetaBorrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La receta con el id: [' + id + '] no existe',
                errors: { message: 'No existe una receta con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar la receta',
                errors: err
            });
        }
        var antiguoPath = './uploads/recetas/' + recetaBorrada.imagen;
        if (fs.existsSync(antiguoPath)) {
            fs.unlink(antiguoPath, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Receta borrada',
            receta: recetaBorrada
        });
    });
});


app.delete('/', middleware.verificaToken, (req, res) => {
    var recetas = req.query;
    ids = recetas.ids;

    Receta.deleteMany({ '_id': { $in: ids } }, (err, recetasBorrada) => {
        if (!recetasBorrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La recetas con los ids: [' + ids + '] no existen',
                errors: { message: 'No existen las recetas con esos ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar las recetas',
                errors: err
            });
        }
        var antiguoPath = './uploads/recetas/' + recetasBorrada.imagen;
        if (fs.existsSync(antiguoPath)) {
            fs.unlink(antiguoPath, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Recetas borradas',
            recetas: recetasBorrada
        });
    });
});




module.exports = app;
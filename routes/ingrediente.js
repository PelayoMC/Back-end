var express = require('express');
var middleware = require('../middlewares/autenticacion');
var app = express();

var Ingrediente = require('../models/ingrediente');

app.get('/', (req, res, next) => {
    var desde = req.query.from || 0;
    desde = Number(desde);

    Ingrediente.find({})
        .skip(desde)
        .limit(5)
        .exec((err, ingredientes) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando ingredientes',
                    errors: err
                });
            } else {
                Ingrediente.count({}, (err, total) => {
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Ingredientes',
                        ingredientes: ingredientes,
                        total
                    });
                });
            }
        });
});

// Modificar
app.put('/:id', middleware.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Ingrediente.findById(id, (err, ingredienteEncontrado) => {
        if (!ingredienteEncontrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El ingrediente con el id: [' + id + '] no existe',
                errors: { message: 'No existe un ingrediente con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar el ingrediente',
                errors: err
            });
        }

        ingredienteEncontrado.nombre = body.nombre;
        ingredienteEncontrado.tipo = body.tipo;

        Ingrediente.findById(body.ingredienteSustituible, (err, ingredienteRelEncontrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al encontrar el ingrediente',
                    errors: err
                });
            }
            if (!ingredienteRelEncontrado) {
                ingredienteEncontrado.ingredienteSustituible = null;
            } else {
                ingredienteEncontrado.ingredienteSustituible = ingredienteRelEncontrado;
            }
        });

        ingredienteEncontrado.creador = req.usuario;
        ingredienteEncontrado.save((err, ingredienteGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el ingrediente',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                mensaje: 'Ingrediente actualizado correctamente',
                ingrediente: ingredienteGuardado
            });
        });
    });
});

// Añadir
app.post('/', middleware.verificaToken, (req, res) => {
    var body = req.body;

    var ingrediente = new Ingrediente({
        nombre: body.nombre,
        tipo: body.tipo,
        ingredienteSustituible: body.ingredienteSustituible,
        creador: req.usuario
    });

    ingrediente.save((err, ingredienteGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el ingrediente',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            mensaje: 'Ingrediente guardado',
            ingrediente: ingredienteGuardado,
            usuario: req.usuario.email
        });
    });
});


app.delete('/:id', middleware.verificaToken, (req, res) => {
    var id = req.params.id;

    Ingrediente.findByIdAndRemove(id, { useFindAndModify: false }, (err, ingredienteBorrado) => {
        if (!ingredienteBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El ingrediente con el id: [' + id + '] no existe',
                errors: { message: 'No existe un ingrediente con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el ingrediente',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'Ingrediente borrado',
            ingrediente: ingredienteBorrado
        });
    });
});


app.post('/obtenerIds', middleware.verificaToken, async(req, res) => {
    let ings = req.body.ingredientes;
    let namesE = ings.map(el => el.nombre);
    let arrayE = await buscarIngrediente(namesE);
    let namesB = arrayE.map(el => el.nombre);
    let arrayB = ings.filter(element => !namesB.includes(element.nombre));
    if (ings.length === arrayE.length) {
        res.status(200).json({
            ok: true,
            mensaje: 'Ingredientes encontrados',
            ingredientesE: arrayE.map(el => el._id)
        });
    } else {
        for (i = 0; i < arrayB.length; i++) {
            var ingrediente = new Ingrediente({
                nombre: arrayB[i].nombre,
                tipo: arrayB[i].tipo,
                ingredienteSustituible: arrayB[i].ingredienteSustituible,
                creador: req.usuario
            });
            arrayB[i] = ingrediente;
        }
        let arr = await crearIngredientes(arrayB);
        let response = arr.filter(el => el._id);
        for (let ing of arrayE) {
            response.push(ing);
        }

        res.status(404).json({
            ok: true,
            mensaje: 'Ings encontrados/creados',
            ings: response.map(el => el._id)
        });
    }



    // if (ings.length === ingArray.length) {
    //     res.status(200).json({
    //         ok: true,
    //         mensaje: 'Ingredientes encontrados',
    //         ingredientes: ingArray
    //     });
    // } else {
    //     res.status(200).json({
    //         ok: true,
    //         mensaje: 'Ingredientes encontrados',
    //         ingredientesE: ingArray,
    //         ingredientesC: ingArrayCrear
    //     });
    // }
});

async function buscarIngrediente(array) {
    return new Promise((resolve, reject) => {
        Ingrediente.find({ nombre: { $in: array } })
            .exec((err, ingredientes) => {
                if (err) {
                    reject(err);
                }
                if (ingredientes.length === 0) {
                    resolve([]);
                } else {
                    resolve(ingredientes);
                }
            });
    });
}

async function crearIngredientes(array) {
    return new Promise((resolve, reject) => {
        Ingrediente.insertMany(array, (err, ingredientes) => {
            if (err) {
                reject(err);
            } else {
                resolve(ingredientes);
            }
        });
    });
}


module.exports = app;
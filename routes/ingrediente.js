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
                Ingrediente.countDocuments({}, (err, total) => {
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
app.post('/', middleware.verificaToken, async(req, res) => {
    var body = req.body.nombres;
    let names = body.filter(el => el != '');
    let ings = [];
    arrayE = await buscarIngredientes(names);
    if (arrayE.length == names.length) {
        res.status(201).json({
            ok: true,
            mensaje: 'Ingredientes guardados',
            ingredientes: arrayE,
            usuario: req.usuario.email
        });
    } else {
        if (arrayE.length == 0) {
            ings = await crearIngredientesNames(names, req.usuario);
            res.status(201).json({
                ok: true,
                mensaje: 'Ingredientes guardados',
                ingredientes: ings,
                usuario: req.usuario.email
            });
        } else {
            for (let ing of arrayE) {
                ings.push(ing);
            }
            namesE = ings.map(el => el.nombre);
            namesB = names.filter(el => !namesE.includes(el));
            arrayB = await crearIngredientesNames(namesB, req.usuario);
            for (let ing of arrayB) {
                ings.push(ing);
            }
            res.status(201).json({
                ok: true,
                mensaje: 'Ingredientes guardados',
                ingredientes: ings,
                usuario: req.usuario.email
            });
        }
    }
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
    let arrayE = await buscarIngredientes(namesE);
    let namesB = arrayE.map(el => el.nombre);
    let arrayB = ings.filter(element => !namesB.includes(element.nombre));
    if (ings.length === arrayE.length) {
        arrIngEn(ings, arrayE);
        res.status(200).json({
            ok: true,
            mensaje: 'Ingredientes encontrados',
            ings: ings
        });
    } else {
        for (i = 0; i < arrayB.length; i++) {
            var ingrediente = new Ingrediente({
                nombre: arrayB[i].nombre,
                creador: req.usuario
            });
            arrayB[i] = ingrediente;
        }
        let arr = await crearIngredientes(arrayB);
        arrIngEn(ings, arrayE);
        arrIngBs(ings, arr, arrayE.length);
        res.status(200).json({
            ok: true,
            mensaje: 'Ingredientes encontrados/creados',
            ings: ings
        });
    }
});

function arrIngEn(array, ar) {
    for (i = 0; i < array.length; i++) {
        if (ar[i]) {
            array[i] = crearIngReceta(ar[i]._id, array[i].nombre, array[i].cantidad, array[i].unidades, array[i].tipo);
        }
    }
}

function arrIngBs(array, ar, pos) {
    for (i = 0; i < ar.length; i++) {
        array[i + pos] = crearIngReceta(ar[i]._id, array[i + pos].nombre, array[i + pos].cantidad, array[i + pos].unidades, array[i + pos].tipo);
    }
}

function crearIngReceta(_id, nombre, cantidad, unidades, tipo) {
    var ingRec = {
        _id,
        nombre,
        cantidad,
        unidades,
        tipo
    };
    return ingRec;
}

async function buscarIngredientes(array) {
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

async function crearIngredientesNames(array, user) {
    let ings = [];
    for (let name of array) {
        var ingrediente = new Ingrediente({
            nombre: name,
            creador: user
        });
        ings.push(ingrediente);
    }
    return new Promise((resolve, reject) => {
        Ingrediente.insertMany(ings, (err, ingredientes) => {
            if (err) {
                reject(err);
            } else {
                resolve(ingredientes);
            }
        });
    });
}


module.exports = app;
import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";

const agregarTarea = async (req, res) => {
  const { proyecto } = req.body;
  let existeProyecto = null;
  try {
    existeProyecto = await Proyecto.findById(proyecto);
  } catch (err) {
    const error = new Error("El proyecyo no existe");
    return res.status(404).json({ msj: error.message });
  }
  if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("No tienes los permisos para añadir tareas");
    return res.status(403).json({ msj: error.message });
  }

  try {
    const tareaAlmacenada = await Tarea.create(req.body);
    //Almacenar el ID en el proyecto
    existeProyecto.tareas.push(tareaAlmacenada._id);
    await existeProyecto.save();
    res.json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }
};
const obtenerTarea = async (req, res) => {
  const { id } = req.params;

  let tarea = null;
  try {
    tarea = await Tarea.findById(id).populate("proyecto"); //Populate funciona para traer los datos relacionados con la tarea en este caso proyectos relacionados
  } catch (err) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msj: error.message });
  }
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(403).json({ msj: error.message });
  }
  res.json(tarea);
};
const actualizarTarea = async (req, res) => {
  const { id } = req.params;

  let tarea = null;
  try {
    tarea = await Tarea.findById(id).populate("proyecto"); //Populate funciona para traer los datos relacionados con la tarea en este caso proyectos relacionados
  } catch (err) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msj: error.message });
  }
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(403).json({ msj: error.message });
  }

  tarea.nombre = req.body.nombre || tarea.nombre;
  tarea.descripcion = req.body.descripcion || tarea.descripcion;
  tarea.prioridad = req.body.prioridad || tarea.prioridad;
  tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

  try {
    const tareaAlmacenada = await tarea.save();
    res.json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }
};
const eliminarTarea = async (req, res) => {
  const { id } = req.params;

  let tarea = null;
  try {
    tarea = await Tarea.findById(id).populate("proyecto"); //Populate funciona para traer los datos relacionados con la tarea en este caso proyectos relacionados
  } catch (err) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msj: error.message });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(403).json({ msj: error.message });
  }

  tarea.nombre = req.body.nombre || tarea.nombre;
  tarea.descripcion = req.body.descripcion || tarea.descripcion;
  tarea.prioridad = req.body.prioridad || tarea.prioridad;
  tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

  try {
    const proyecto = await Proyecto.findById(tarea.proyecto);
    proyecto.tareas.pull(tarea._id);
    await Promise.allSettled([
      await await proyecto.save(),
      await tarea.deleteOne(),
    ]);

    res.json({ msg: "La Tarea se eliminó" });
  } catch (error) {
    console.log(error);
  }
};
const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("proyecto");
  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msj: error.message });
  }
  if (
    tarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
    !tarea.proyecto.colaboradores.some(
      (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error("Acción no válida");
    return res.status(403).json({ msj: error.message });
  }
  tarea.estado = !tarea.estado;
  tarea.completado = req.usuario._id;
  await tarea.save();
  const tareaAlmacenada = await Tarea.findById(id)
    .populate("proyecto")
    .populate("completado");
  res.json(tareaAlmacenada);
};

export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstado,
};

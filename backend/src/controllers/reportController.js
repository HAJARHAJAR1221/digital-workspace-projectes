import PDFDocument from "pdfkit";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";

export const generateProjectPdf = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId).populate("managerId", "name").populate("members", "name role");
    if (!project) {
      return res.status(404).json({ message: "Projet non trouvé" });
    }

    const tasks = await Task.find({ projectId });
    const members = await User.find({ _id: { $in: project.members } });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="rapport-${project._id}.pdf"`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(20).text(`Rapport de projet`, { align: "center" });
    doc.moveDown();
    doc.fontSize(16).text(project.name, { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(project.description || "", { align: "left" });
    doc.moveDown();

    doc.fontSize(12).text(`Statut : ${project.status}`);
    doc.text(`Priorité : ${project.priority}`);
    if (project.deadline) {
      doc.text(`Deadline : ${new Date(project.deadline).toLocaleDateString("fr-FR")}`);
    }
    doc.text(`Progression : ${project.progress}%`);
    doc.moveDown();

    doc.fontSize(14).text("Tâches", { underline: true });
    doc.moveDown(0.5);
    tasks.forEach(t => {
      doc.fontSize(12).text(`- ${t.title}`, { continued: true }).fontSize(11).text(`  (${t.status}, ${t.progress}%)`);
    });
    doc.moveDown();

    doc.fontSize(14).text("Équipe", { underline: true });
    doc.moveDown(0.5);
    members.forEach(m => {
      doc.fontSize(12).text(`- ${m.name} (${m.role})`);
    });

    doc.end();
  } catch (err) {
    return next(err);
  }
};


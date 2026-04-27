import React, { useState, useRef } from "react";
import { useGlobalChampions } from "../context/ChampionContext";

function ChampionAdmin() {
  const { addChampion, editChampion, deleteChampion, error } = useGlobalChampions();

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  
  const fileInputRef = useRef(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await addChampion({
        id: id.trim() || name.trim().toLowerCase().replace(/\s+/g, ""),
        name,
        title,
        tags: tags.split(",").map((t) => t.trim()),
        image,
      });
      setStatusMessage("Campeón agregado exitosamente.");
      clearForm();
    } catch (err) {
      setStatusMessage("Error al agregar campeón: " + err.message);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!id.trim()) {
      setStatusMessage("Se requiere el ID para editar.");
      return;
    }
    try {
      await editChampion(id, {
        name,
        title,
        tags: tags.split(",").map((t) => t.trim()),
        image,
      });
      setStatusMessage("Campeón editado exitosamente.");
      clearForm();
    } catch (err) {
      setStatusMessage("Error al editar campeón: " + err.message);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!id.trim()) {
      setStatusMessage("Se requiere el ID para eliminar.");
      return;
    }
    try {
      await deleteChampion(id);
      setStatusMessage("Campeón eliminado exitosamente.");
      clearForm();
    } catch (err) {
      setStatusMessage("Error al eliminar campeón: " + err.message);
    }
  };

  const clearForm = () => {
    setId("");
    setName("");
    setTitle("");
    setTags("");
    setImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="panel">
      <h2 className="section-title">Administrar Campeones (Global State)</h2>
      <p>Agrega, edita o elimina campeones del sistema.</p>
      <form className="modal-form">
        <input
          className="search-input"
          placeholder="ID del campeón (Ej: aatrox)"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <input
          className="search-input"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="search-input"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="search-input"
          placeholder="Etiquetas (separadas por coma, Ej: Fighter, Tank)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
          <label style={{ fontSize: "0.9rem", fontWeight: "bold" }}>Imagen del Campeón:</label>
          <input
            className="search-input"
            placeholder="URL de la imagen"
            value={image.startsWith("data:image") ? "" : image}
            onChange={(e) => setImage(e.target.value)}
            disabled={image.startsWith("data:image")}
          />
          <span style={{ fontSize: "0.85rem", color: "#666" }}>O selecciona un archivo local:</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
          />
          {image && image.startsWith("data:image") && (
            <button 
              type="button" 
              onClick={() => {
                setImage("");
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              style={{ alignSelf: "flex-start", padding: "0.2rem 0.5rem", fontSize: "0.8rem", marginTop: "0.2rem" }}
            >
              Quitar imagen local
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <button type="button" onClick={handleAdd}>Agregar</button>
          <button type="button" onClick={handleEdit}>Editar</button>
          <button type="button" onClick={handleDelete}>Eliminar</button>
        </div>
      </form>
      {(statusMessage || error) && (
        <p className="status-message">{statusMessage || error}</p>
      )}
    </section>
  );
}

export default ChampionAdmin;

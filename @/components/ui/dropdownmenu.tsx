import React, { useState } from 'react';

function DropdownMenu(props) {
  const [selectedOption, setSelectedOption] = useState('');

  const handleOptionChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedOption(selectedValue);
    props.onChange(selectedValue); // Llama a la función onChange pasada como prop
  };
  
  return (
    <div>
      <label>Selecciona una Categoría:</label>
      <select value={selectedOption} onChange={handleOptionChange}>
        {props.opciones.map((opcion) => (
          <option key={opcion.id} value={opcion.id}>
            {opcion.name}
          </option>
        ))}
      </select>
      <p>Has seleccionado: {selectedOption}</p>
    </div>
  );
}

export default DropdownMenu;
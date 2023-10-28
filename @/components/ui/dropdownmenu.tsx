import React, { useState } from 'react';

function DropdownMenu(props:any) {
  const [selectedOption, setSelectedOption] = useState('');

  const handleOptionChange = (e:any) => {
    const selectedValue = e.target.value;
    setSelectedOption(selectedValue);
    props.onChange(selectedValue); // Llama a la función onChange pasada como prop
  };
  
  return (
    <div>
      <label>Selecciona una Categoría:</label>
      <select value={selectedOption} onChange={handleOptionChange}>
        {props.opciones.map((opcion:any) => (
          <option key={opcion.id} value={opcion.id}>
            {opcion.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default DropdownMenu;
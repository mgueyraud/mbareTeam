import React, { useState } from 'react';

function DropdownMenu(props: any) {
  const [selectedOption, setSelectedOption] = useState('');

  const handleOptionChange = (e:any) => {
    const selectedValue = e.target.value;
    setSelectedOption(selectedValue);
    props.onChange(selectedValue); // Llama a la función onChange pasada como prop
  };
  
  return (
    <div>
      <label>{props.title}</label>
      <select value={selectedOption} onChange={handleOptionChange} name={props.name} required={props.required ? true : false}>
        <option value=""> -- Selecciona un valor -- </option>
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
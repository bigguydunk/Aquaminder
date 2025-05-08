import React from 'react';

interface FormComponentProps {
  type: 'login' | 'register';
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const FormComponent: React.FC<FormComponentProps> = ({ type, onSubmit }) => {
  return (
    <form className="form active" onSubmit={onSubmit}>
      {type === 'register' && (
        <>
          <input name="name" type="text" placeholder="Nama Lengkap" required />
        </>
      )}
      <input name="email" type="email" placeholder="Masukkan Email" required />
      <input name="password" type="password" placeholder="Masukkan Password" required />
      {type === 'register' && (
        <input name="confirmPassword" type="password" placeholder="Ulangi Password" required />
      )}
      <button type="submit" className="btn">
        {type === 'login' ? 'Login' : 'Register'}
      </button>
    </form>
  );
};

export default FormComponent;
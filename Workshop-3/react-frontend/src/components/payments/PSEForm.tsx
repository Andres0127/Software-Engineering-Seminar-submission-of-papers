import React, { useState, useEffect } from 'react';
import { Building2, Lock, User, FileText } from 'lucide-react';
import paymentService, { PSEData, Bank } from '../../services/paymentService';
import './PSEForm.css';

interface PSEFormProps {
  onSubmit: (data: PSEData) => void;
  onBack: () => void;
  isProcessing: boolean;
  orderAmount: number;
}

const PSEForm: React.FC<PSEFormProps> = ({
  onSubmit,
  onBack,
  isProcessing,
  orderAmount,
}) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [pseData, setPseData] = useState<PSEData>({
    bank_code: '',
    bank_name: '',
    person_type: 'natural',
    document_type: 'CC',
    document_number: '',
    payer_name: '',
    payer_email: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    try {
      const data = await paymentService.getPSEBanks();
      setBanks(data);
    } catch (error) {
      console.error('Error loading banks:', error);
    } finally {
      setLoadingBanks(false);
    }
  };

  const handleBankChange = (code: string) => {
    const selectedBank = banks.find((b) => b.code === code);
    setPseData({
      ...pseData,
      bank_code: code,
      bank_name: selectedBank?.name || '',
    });
    if (errors.bank_code) {
      setErrors({ ...errors, bank_code: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!pseData.bank_code) {
      newErrors.bank_code = 'Selecciona un banco';
    }

    if (!pseData.document_number || pseData.document_number.length < 5) {
      newErrors.document_number = 'Número de documento inválido';
    }

    if (!pseData.payer_name || pseData.payer_name.length < 3) {
      newErrors.payer_name = 'Nombre completo requerido';
    }

    if (!pseData.payer_email || !/\S+@\S+\.\S+/.test(pseData.payer_email)) {
      newErrors.payer_email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(pseData);
    }
  };

  const handleChange = (field: keyof PSEData, value: any) => {
    setPseData({ ...pseData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const documentTypes = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'NIT', label: 'NIT' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'PP', label: 'Pasaporte' },
  ];

  return (
    <div className="pse-form-container">
      <button className="back-button" onClick={onBack} disabled={isProcessing}>
        ← Volver a métodos de pago
      </button>

      <div className="pse-form-header">
        <Building2 className="header-icon" />
        <div>
          <h2>Pago con PSE</h2>
          <p className="header-subtitle">
            Transferencia bancaria segura desde tu banco
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="pse-form">
        {/* Tipo de persona */}
        <div className="form-group">
          <label className="form-label">
            <User size={18} />
            Tipo de persona
          </label>
          <div className="person-type-selector">
            <button
              type="button"
              className={`person-type-btn ${
                pseData.person_type === 'natural' ? 'active' : ''
              }`}
              onClick={() => handleChange('person_type', 'natural')}
            >
              👤 Persona Natural
            </button>
            <button
              type="button"
              className={`person-type-btn ${
                pseData.person_type === 'juridica' ? 'active' : ''
              }`}
              onClick={() => handleChange('person_type', 'juridica')}
            >
              🏢 Persona Jurídica
            </button>
          </div>
        </div>

        {/* Selección de banco */}
        <div className="form-group">
          <label className="form-label">
            <Building2 size={18} />
            Selecciona tu banco
          </label>
          {loadingBanks ? (
            <div className="loading-banks">
              <div className="spinner-small"></div>
              Cargando bancos...
            </div>
          ) : (
            <select
              className={`form-select ${errors.bank_code ? 'error' : ''}`}
              value={pseData.bank_code}
              onChange={(e) => handleBankChange(e.target.value)}
              disabled={isProcessing}
            >
              <option value="">Selecciona un banco</option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
          )}
          {errors.bank_code && (
            <span className="error-message">{errors.bank_code}</span>
          )}
        </div>

        {/* Tipo de documento */}
        <div className="form-group">
          <label className="form-label">
            <FileText size={18} />
            Tipo de documento
          </label>
          <select
            className="form-select"
            value={pseData.document_type}
            onChange={(e) => handleChange('document_type', e.target.value)}
            disabled={isProcessing}
          >
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Número de documento */}
        <div className="form-group">
          <label className="form-label">Número de documento</label>
          <input
            type="text"
            className={`form-input ${errors.document_number ? 'error' : ''}`}
            placeholder="Ingresa tu número de documento"
            value={pseData.document_number}
            onChange={(e) =>
              handleChange('document_number', e.target.value.replace(/\D/g, ''))
            }
            disabled={isProcessing}
          />
          {errors.document_number && (
            <span className="error-message">{errors.document_number}</span>
          )}
        </div>

        {/* Nombre completo */}
        <div className="form-group">
          <label className="form-label">Nombre completo</label>
          <input
            type="text"
            className={`form-input ${errors.payer_name ? 'error' : ''}`}
            placeholder="Como aparece en tu documento"
            value={pseData.payer_name}
            onChange={(e) => handleChange('payer_name', e.target.value)}
            disabled={isProcessing}
          />
          {errors.payer_name && (
            <span className="error-message">{errors.payer_name}</span>
          )}
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Correo electrónico</label>
          <input
            type="email"
            className={`form-input ${errors.payer_email ? 'error' : ''}`}
            placeholder="tu@email.com"
            value={pseData.payer_email}
            onChange={(e) => handleChange('payer_email', e.target.value)}
            disabled={isProcessing}
          />
          {errors.payer_email && (
            <span className="error-message">{errors.payer_email}</span>
          )}
        </div>

        {/* Total */}
        <div className="payment-summary">
          <div className="summary-row">
            <span>Total a pagar:</span>
            <span className="summary-amount">
              ${orderAmount.toLocaleString('es-CO')} COP
            </span>
          </div>
        </div>

        {/* Info de PSE */}
        <div className="pse-info-box">
          <h4>📋 Cómo funciona PSE:</h4>
          <ol>
            <li>Selecciona tu banco y completa tus datos</li>
            <li>Serás redirigido al sitio de tu banco</li>
            <li>Ingresa tus credenciales bancarias</li>
            <li>Confirma el pago y recibirás tu comprobante</li>
          </ol>
        </div>

        {/* Botón de pago */}
        <button
          type="submit"
          className="submit-button"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="spinner-small"></div>
              Procesando...
            </>
          ) : (
            <>
              <Lock size={20} />
              Continuar al banco
            </>
          )}
        </button>

        {/* Seguridad */}
        <div className="security-info">
          <Lock size={16} />
          <span>
            Conexión segura certificada. Tus datos bancarios están protegidos
          </span>
        </div>
      </form>
    </div>
  );
};

export default PSEForm;

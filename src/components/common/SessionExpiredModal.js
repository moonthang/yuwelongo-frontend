import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

export default function SessionExpiredModal({ show, onClose }) {
    const navigate = useNavigate();

    const handleRedirect = () => {
        onClose();
        navigate('/login');
    };

    return (
        <Modal show={show} onHide={handleRedirect} backdrop="static" keyboard={false} centered>
            <Modal.Header>
                <Modal.Title><i className="bi bi-clock-history me-2"></i>Sesión Expirada</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Tu sesión ha finalizado. Por favor, inicia sesión de nuevo para continuar.
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleRedirect}>
                    Ir a Login
                </Button>
            </Modal.Footer>
        </Modal>
    );
}


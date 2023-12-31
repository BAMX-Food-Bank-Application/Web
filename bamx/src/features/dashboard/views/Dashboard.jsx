import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../../config/FirebaseConnection";

//ALERT
import DefaultAlert from "../../Global/components/DefaultAlert";

import {
  collection,
  onSnapshot,
  query,
  limit,
  doc,
  updateDoc
} from "firebase/firestore";



import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Modal from "react-modal";

import "../styles/Dashboard.css";
import "../styles/Modal.css";
import Sidebar from "../components/Sidebar";
import app from "../../../config/FirebaseConnection";
import { useNavigate } from "react-router-dom";

const auth = getAuth(app);


const Dashboard = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [firstContacts, setFirstContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(null); // Estado de filtrado
  const [showAlert, setShowAlert] = useState(false);
  const [alertContent, setAlertContent] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  
  function closeAlert(){
    setShowAlert(false);
  }

  function newAlert(title, content){
    setAlertTitle(title);
    setAlertContent(content);
    setShowAlert(true);
}


  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        return;
      } else {
        navigate("/");
      }
    });
  }, [navigate]);

  useEffect(() => {
    const getPedidos = async () => {
      try {
        const userQuerySnapshot = collection(db, "userData");
        const docs = [];
        const unsubscribe = onSnapshot(userQuerySnapshot, (snapshot) => {
          snapshot.forEach((doc) => {

            const requestsQuerySnapshot = query(
              collection(db, "userData", doc.id, "requestsHistory"),
              limit(50)
            );
            onSnapshot(requestsQuerySnapshot, (snapshot2) => {
              snapshot2.docChanges().forEach((change) => {
                if (change.type === "added") {
                  docs.push({
                    ...change.doc.data(),
                    id: change.doc.id,
                    nameCorp: doc.data()["nameCorp"],
                    name: doc.data()["name"],
                    phone: doc.data()["phoneNumber"],
                    uid: doc.id,
                  });
                }
              });
              setPedidos(docs);
            });
          });
        });
        return unsubscribe;
      } catch (error) {
        newAlert("Error inesperado", "Intente más tarde")
      }
    };
    getPedidos();


    const getFirstContacts = async () => {
      try {
        const userQuerySnapshot = collection(db, "firstContact");
        const docs = [];
        const unsubscribe = onSnapshot(userQuerySnapshot, (snapshot) => {
          snapshot.forEach((doc) => {
            docs.push({...doc.data(), docId: doc.id});
          });
          setFirstContacts(docs);
        });
        return unsubscribe;
      } catch (error) {
        newAlert("Error inesperado", "Intente más tarde");
      }
    };
    getFirstContacts();
  }, [filter]);

  


  const filteredPedidos = pedidos.filter((pedido) =>
    pedido.id.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPedidosByStatus = isFilterActive
    ? filteredPedidos.filter((pedido) => pedido.status === filter)
    : filteredPedidos;

  const firstElevenPedidos = filteredPedidosByStatus.slice(0, 13);

  const toggleFilter = (selectedFilter) => {
    if (filter === selectedFilter && isFilterActive) {
      setFilter(null);
      setIsFilterActive(false);
    } else {
      setFilter(selectedFilter);
      setIsFilterActive(true);
    }
  };

  const openModal = (pedido) => {
    if(pedido.status === "En camino"){
      setSelectedPedido(pedido);
      setIsModalOpen2(true);
    }else{
      setSelectedPedido(pedido);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeModal2 = () => {
    setIsModalOpen2(false);
  };

  const updateStatus = async (targetStatus, targetId, userId) => {
    if (userId){
      const docRef = doc(db, "userData", userId, "requestsHistory", targetId);
  
      await updateDoc(docRef, {
        status: targetStatus})
      .then (() => {
        closeModal2();
      })
    }
  };

  const pedidosNotChecked = pedidos.filter((pedido) => pedido.notificationChecked === false);
  const firstContactsNotChecked = firstContacts.filter((contact) => contact.notificationChecked === false);

  return (
    <section className="container">
      <Modal isOpen={showAlert} onRequestClose={closeAlert} ariaHideApp={false} style={{
          overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.75)'
          },
          content: {
            position: '',
            margin: '12.5% 25%',
            border: '0',
            background: 'rgba(255, 255, 255, 0)',
            WebkitOverflowScrolling: 'touch',
            borderRadius: '4px',
            outline: 'none',
            padding: '20px',
            overflow: 'hidden'
          }
  }}>
      <DefaultAlert alertTitle={alertTitle} alertContent={alertContent} closeAlert={closeAlert}></DefaultAlert>
      </Modal>
      <section className="main">
        <section className="header">
          <section className="header-top">
            <img
              alt="bamx logo"
              width="125"
              height="102"
              src={require("../../../global assets/favicon.png")}
            />
            <Form>
              <InputGroup>
                <Form.Control
                  className="search"
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por ID de pedido"
                />
              </InputGroup>
            </Form>
          </section>
          <section className="header-bottom">
            <section className="header-bottom_tittle">
              <p> Solicitudes </p>
            </section>
            <section className="header-bottom_navbar">
              <section className="header-bottom_buttons">
                <button
                  className={`btn1 ${filter === "Entregado" ? "active" : ""}`}
                  onClick={() => toggleFilter("Entregado")}
                >
                  Entregado
                </button>
                <button
                  className={`btn2 ${filter === "Pendiente" ? "active" : ""}`}
                  onClick={() => toggleFilter("Pendiente")}
                >
                  Pendiente
                </button>
                <button
                  className={`btn3 ${filter === "Cancelado" ? "active" : ""}`}
                  onClick={() => toggleFilter("Cancelado")}
                >
                  Cancelado
                </button>
                <button
                  className={`btn4 ${filter === "En camino" ? "active" : ""}`}
                  onClick={() => toggleFilter("En camino")}
                >
                  En camino
                </button>
              </section>
            </section>
          </section>
        </section>
        <table className="styled-table">
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>Id del cargamento</th>
              <th style={{ textAlign: "center" }}>Nombre de la empresa</th>
              <th style={{ textAlign: "center" }}>Estado del pedido</th>
              <th style={{ textAlign: "center" }}>Fecha de creación</th>
            </tr>
          </thead>
          <tbody>
            {firstElevenPedidos.map((pedido) => (
              <tr
                className="data"
                key={pedido.id}
                onClick={() => openModal(pedido)}
              >
                <td style={{ textAlign: "center" }}>{`${pedido.id}`}</td>
                <td style={{ textAlign: "center" }}>{pedido.nameCorp}</td>
                <td style={{ textAlign: "center" }}>{pedido.status}</td>
                <td style={{ textAlign: "center" }}>{pedido.creationDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="side-bar">
        <Sidebar notifications={pedidosNotChecked} firstContacts={firstContactsNotChecked}></Sidebar>
      </section>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={{
          overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
          },
          content: {
            position: "",
            margin: "12.5% 25%",
            background: "rgba(255, 255, 255)",
            WebkitOverflowScrolling: "touch",
            borderRadius: "20px",
            outline: "none",
            padding: "20px",
            overflow: "hidden",
          },
        }}
      >
        {selectedPedido && (
          <div>
            <h2>Detalles del Pedido: {selectedPedido.id}</h2>
            <p className="tittle-name">
              {" "}
              Nombre del cliente: {selectedPedido.name}
            </p>
            <p className="tittle-phone"> Contacto: {selectedPedido.phone}</p>
            <p className="tittle-cargo"> Contenido del cargamento: {selectedPedido.productName.join(", ")}</p>
            <p className="tittle-cargo"> Peso: {selectedPedido.weight.join(", ")}</p>
            <p className="tittle-cargo"> Unidad: {selectedPedido.unit.join(", ")}</p>

            <button className="btn-modal" onClick={closeModal}>
              Cerrar
            </button>
          </div>
        )}
      </Modal>
      <Modal
        isOpen={isModalOpen2}
        onRequestClose={closeModal2}
        style={{
          overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
          },
          content: {
            position: "",
            margin: "12.5% 25%",
            background: "rgba(255, 255, 255)",
            WebkitOverflowScrolling: "touch",
            borderRadius: "20px",
            outline: "none",
            padding: "20px",
            overflow: "hidden",
          },
        }}
      >
        {selectedPedido && (
          <div>
            <h2>Detalles del Pedido: {selectedPedido.id}</h2>
            <p className="tittle-name">
              {" "}
              Nombre del cliente: {selectedPedido.name}
            </p>
            <p className="tittle-phone"> Contacto: {selectedPedido.phone}</p>
            <p className="tittle-cargo"> Contenido del cargamento: {selectedPedido.productName.join(", ")}</p>
            <p className="tittle-cargo"> Peso: {selectedPedido.weight.join(", ")}</p>
            <p className="tittle-cargo"> Unidad: {selectedPedido.unit.join(", ")}</p>

            <button className="btn-modal" onClick={closeModal2}>
              Cerrar
            </button>
            <button className="btn-modal" onClick={() => {updateStatus("Entregado", selectedPedido.id, selectedPedido.uid)}}>
              Recibir
            </button>
          </div>
        )}
      </Modal>
    </section>
  );
};

export default Dashboard;

import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import app from "../../../config/FirebaseConnection";
import {useAuthState} from "react-firebase-hooks/auth";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import { Navigate } from "react-router-dom";
import { db } from "../../../config/FirebaseConnection";
import { collection, getDocs } from "firebase/firestore";

const auth = getAuth(app);  


const Dashboard = () => {
  const [pedidos, setPedidos] = useState([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        const uid = user.uid;
        console.log(uid);
      } else {
        // User is signed out
      }
    });
  }, []);

  useEffect(() => {
    const getPedidos = async () => {
      try {
        const userQuerySnapshot = await getDocs(collection(db, "userData"));
        const docs = [];
        userQuerySnapshot.forEach(async (doc) => {
          try{
            const requestsQuerySnapshot = await getDocs(collection(db, "userData", doc.id, "requestsHistory"));
            console.log(requestsQuerySnapshot);
            requestsQuerySnapshot.forEach((request) => {
                docs.push({...request.data(), id: request.id, requestNumber: request.data()["requestID"], nameCorp: doc.data()["nameCorp"]});
                setPedidos(docs);
            });
          } catch (e) {
            console.log(e.message);
          }
        });
      } catch (error) {
        console.log("Error: ", error);
      }
    };
    getPedidos();
  }, []);
  
  if (!user) {
    //redirect to login page
    return <Navigate replace to = "/login" />
  } else {
  return (
    <section className="container">
      <section className="main">
        <Header></Header>
        <table className="styled-table">
          <thead>
              <tr>
                <th style={{ textAlign: "center" }}> Id</th>
                <th style={{ textAlign: "center" }}> Nombre de la empresa </th>
                <th style={{ textAlign: "center" }}> Estado del pedido </th>
                <th style={{ textAlign: "center" }}> Fecha de creación </th>
              </tr>
            {pedidos.map((pedido) => (
              <tr className="data" key={pedido.id}>
                <td style={{ textAlign: "center" }}>{`${pedido.requestNumber}` + pedido.id}</td>
                <td style={{ textAlign: "center" }}>{pedido.nameCorp}</td>
                <td style={{ textAlign: "center" }}>{pedido.status}</td>
                <td style={{ textAlign: "center" }}>{pedido.creationDate}</td>
              </tr>
            ))}
          </thead>
        </table>
      </section>

      <section className="side-bar">
        <Sidebar></Sidebar>
      </section>
    </section>
  );
}
};

export default Dashboard;
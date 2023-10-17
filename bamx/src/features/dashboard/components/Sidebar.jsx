import React from "react";
import "../styles/Sidebar.css";

const Sidebar = ({signOut, notifications}) => {

  console.log("notificaciones", notifications)


  return (
    <section className="side-bar_profile">
      <div>
        <div style={{ borderRadius: 50 }}>
          <img
            src="https://firebasestorage.googleapis.com/v0/b/bamx-cc64f.appspot.com/o/Web%2Fmahdi.jpg?alt=media&token=3086b1d2-3025-45b1-b568-0611820a77d6&_gl=1*1fki8bz*_ga*MjQ1OTk0NTYzLjE2OTIxOTcxOTI.*_ga_CW55HF8NVT*MTY5NzUxMDQyMy4xNTkuMS4xNjk3NTEwNzM1LjU3LjAuMA.."
            alt="Profile Picture"
            style={{ width: 106, borderRadius: "50%" }}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <div>{"Diego"}</div>
          <div>{"Fernández"}</div>
        </div>
        <div style={{ marginTop: 40, backgroundColor: '#E1E1E1', height: 400, marginInline: 40, borderRadius: 24 }}>
          <div></div>
        </div>
        <button onClick={signOut} className="btn btn-danger" style={{ marginBlock: 40, backgroundColor: 'transparent', borderWidth: 0, fontFamily: 'Poppins', fontSize: 24, fontWeight: 'regular' }}>
          Salir
        </button>
      </div>
    </section>
  );
};

export default Sidebar;
